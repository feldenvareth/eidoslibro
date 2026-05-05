import os
import csv
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd

from config import (
    DAILY_PERIOD, DAILY_INTERVAL, HOURLY_PERIOD, HOURLY_INTERVAL, BACKTEST_PERIOD,
    MIN_DAILY_ROWS, MIN_HOURLY_ROWS, BENCHMARKS, MAX_WORKERS,
    BLOCK_WEAK_HISTORY, MIN_PRO_BACKTEST_CASES
)
from tickers import get_tickers, get_sector_etf
from logger_utils import setup_logger
from data_loader import download_ohlcv
from indicators import add_indicators
from strategy import evaluate_ticker, add_history_quality_block, add_canslim_block
from backtest import run_backtest
from trade_plan import build_trade_plan
from fundamentals import get_fundamentals
from canslim import evaluate_canslim
from state import load_state, save_state, signal_status
from explain import build_signal_report, build_daily_summary
from notifier import send_telegram
from tracker import (
    load_tracking, save_tracking, register_signal,
    resolve_pending, build_accuracy_badge,
)

DATA_DIR = "data"
LOG_DIR = "logs"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)


def write_csv(path, rows, fieldnames):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)


def infer_market_from_time():
    hour = datetime.utcnow().hour
    if 14 <= hour <= 18:
        return "IBEX35"
    if 20 <= hour <= 23:
        return "NASDAQ100"
    return "ALL"


def prepare_benchmark(market, logger):
    benchmark_ticker = BENCHMARKS.get(market, "SPY")
    try:
        bench_raw = download_ohlcv(benchmark_ticker, DAILY_PERIOD, DAILY_INTERVAL, logger)
        bench = add_indicators(bench_raw, intraday=False)
        return bench.dropna(subset=["close", "ema_20"])
    except Exception as exc:
        logger.warning(f"Benchmark no disponible {benchmark_ticker}: {exc}")
        return pd.DataFrame()


def prepare_sector_cache(tickers, logger):
    cache = {}
    ticker_to_etf = {t: get_sector_etf(t) for t in tickers}

    for etf in sorted(set(ticker_to_etf.values())):
        try:
            raw = download_ohlcv(etf, DAILY_PERIOD, DAILY_INTERVAL, logger)
            sec = add_indicators(raw, intraday=False)
            cache[etf] = sec.dropna(subset=["close", "ema_20"])
            logger.info(f"ETF sectorial cargado {etf}")
        except Exception as exc:
            logger.warning(f"ETF sectorial no disponible {etf}: {exc}")
            cache[etf] = pd.DataFrame()

    return ticker_to_etf, cache


def _clean_for_signal(df: pd.DataFrame, required_cols: list[str], label: str, ticker: str) -> pd.DataFrame:
    """
    Limpieza robusta:
    - Verifica que las columnas requeridas existan.
    - Solo comprueba que la ÚLTIMA FILA (la que se usa para la señal) tenga valores válidos.
    - No hace dropna masivo: los NaNs del calentamiento de indicadores en filas antiguas son normales.
    - Sí elimina filas sin 'close' para que los backtests y rolling no trabajen con precios nulos.
    """
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise RuntimeError(f"{ticker}: faltan columnas {label}: {missing}")

    # Eliminar solo filas sin precio de cierre (datos corruptos reales)
    cleaned = df.dropna(subset=["close"])
    if cleaned.empty:
        raise RuntimeError(f"{ticker}: sin datos de cierre en {label}")

    # Comprobar que la última fila (la que usará strategy.py) tiene los mínimos
    last = cleaned.iloc[-1]
    nan_in_last = [c for c in required_cols if pd.isna(last[c])]
    if nan_in_last:
        raise RuntimeError(
            f"{ticker}: última fila de {label} tiene NaN en columnas clave: {nan_in_last}. "
            f"Filas totales: {len(cleaned)}. Puede que la serie sea demasiado corta para el calentamiento."
        )

    return cleaned


def process_ticker(ticker, bench, sector_df, logger):
    logger.info(f"Analizando {ticker}")

    daily_raw = download_ohlcv(ticker, DAILY_PERIOD, DAILY_INTERVAL, logger)
    hourly_raw = download_ohlcv(ticker, HOURLY_PERIOD, HOURLY_INTERVAL, logger)

    if len(daily_raw) < MIN_DAILY_ROWS:
        raise RuntimeError(f"datos diarios insuficientes: {len(daily_raw)}")
    if len(hourly_raw) < MIN_HOURLY_ROWS:
        raise RuntimeError(f"datos 1h insuficientes: {len(hourly_raw)}")

    daily = add_indicators(daily_raw, intraday=False)
    hourly = add_indicators(hourly_raw, intraday=True)

    # No se descarta un ticker por VWAP ni por indicadores secundarios.
    # VWAP puede venir incompleto en datos 1h de Yahoo.
    if "vwap" in hourly.columns:
        hourly["vwap"] = hourly["vwap"].replace([float("inf"), float("-inf")], pd.NA).ffill()

    # Columnas mínimas para poder evaluar. Solo close y ema_20.
    # macd necesita 35 velas de calentamiento y puede ser NaN en la última fila
    # si yfinance devuelve pocos datos. Lo evaluamos pero no lo exigimos aquí.
    required_daily = ["close", "ema_20"]
    required_hourly = ["close", "ema_20"]

    daily = _clean_for_signal(daily, required_daily, "diarios", ticker)
    hourly = _clean_for_signal(hourly, required_hourly, "1h", ticker)

    evaluation = evaluate_ticker(ticker, daily, hourly, bench, sector_df)

    bt_raw = download_ohlcv(ticker, BACKTEST_PERIOD, DAILY_INTERVAL, logger)
    bt = run_backtest(bt_raw, evaluation.direction or "compra")
    evaluation = add_history_quality_block(evaluation, bt)

    last = daily.iloc[-1]
    return {
        "ticker": ticker,
        "daily": daily,
        "last": last,
        "evaluation": evaluation,
        "backtest": bt,
    }


def main():
    logger = setup_logger()
    market = os.getenv("MARKET") or os.getenv("INPUT_MARKET") or infer_market_from_time()
    market = market.upper()

    logger.info(f"Inicio bot V15 PRO. MARKET={market}")

    tickers = get_tickers(market)

    if market == "CUSTOM" and not tickers:
        msg = "⚠️ CUSTOM_TICKERS está vacío en config.py. No hay valores personalizados que analizar."
        send_telegram(msg, logger)
        return

    expected = len(tickers)
    skipped_rows = []
    signal_rows = []
    ranking_rows = []
    debug_rows = []
    messages_sent = 0
    operational = []
    watchlist = []
    state = load_state()

    bench = prepare_benchmark(market, logger)
    ticker_to_etf, sector_cache = prepare_sector_cache(tickers, logger)

    # ── Tracking: cargar historial y resolver señales pendientes de días anteriores ──
    tracking_store = load_tracking()
    resolve_pending(tracking_store, logger=logger)
    accuracy_badge = build_accuracy_badge(tracking_store)

    results = []
    workers = max(1, min(MAX_WORKERS, len(tickers) or 1))
    logger.info(f"Procesando {len(tickers)} tickers con {workers} worker(s)")

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(
                process_ticker,
                ticker,
                bench,
                sector_cache.get(ticker_to_etf.get(ticker), pd.DataFrame()),
                logger
            ): ticker
            for ticker in tickers
        }

        for future in as_completed(futures):
            ticker = futures[future]
            try:
                results.append(future.result())
            except Exception as exc:
                logger.error(f"{ticker} omitido: {exc}")
                skipped_rows.append({"ticker": ticker, "reason": str(exc)})

    analyzed = len(results)
    results.sort(key=lambda r: r["ticker"])

    for result in results:
        ticker = result["ticker"]
        evaluation = result["evaluation"]
        bt = result["backtest"]
        last = result["last"]

        ranking_rows.append({
            "ticker": ticker,
            "direction": evaluation.direction or "N/D",
            "signal_type": evaluation.signal_type or "sin señal",
            "favor": evaluation.favor,
            "neutral": evaluation.neutral,
            "against": evaluation.against,
            "raw_ratio": round(evaluation.raw_ratio, 4),
            "weighted_ratio": round(evaluation.weighted_ratio, 4),
            "backtest_cases": bt.cases,
            "backtest_reliability": "" if bt.reliability is None else round(bt.reliability, 4),
            "profit_factor": "" if bt.profit_factor is None else round(bt.profit_factor, 4),
        })

        debug_rows.append({
            "ticker": ticker,
            "daily_bias": evaluation.daily_bias or "N/D",
            "hourly_confirmation": evaluation.hourly_confirmation,
            "market_context": evaluation.market_context,
            "sector_context": evaluation.sector_context,
            "total_indicators": evaluation.total,
            "favor": evaluation.favor,
            "neutral": evaluation.neutral,
            "against": evaluation.against,
            "raw_ratio": round(evaluation.raw_ratio, 4),
            "weighted_ratio": round(evaluation.weighted_ratio, 4),
            "passed_filter": evaluation.passed_filter,
            "watchlist": evaluation.watchlist,
        })

        item = {
            "ticker": ticker,
            "tipo": evaluation.signal_type or "sin señal",
            "confluencia": f"{evaluation.weighted_ratio * 100:.1f}%",
            "historico": "N/D" if bt.reliability is None else f"{bt.reliability * 100:.1f}%",
            "profit_factor": "N/D" if bt.profit_factor is None else f"{bt.profit_factor:.2f}",
        }

        if evaluation.passed_filter and BLOCK_WEAK_HISTORY and bt.cases >= MIN_PRO_BACKTEST_CASES:
            weak_reliability = bt.reliability is not None and bt.reliability < 0.55
            weak_pf = bt.profit_factor is not None and bt.profit_factor < 1.0

            if weak_reliability and weak_pf:
                evaluation.passed_filter = False
                evaluation.watchlist = True
                evaluation.signal_type = (
                    "VIGILANCIA COMPRA"
                    if evaluation.direction == "compra"
                    else "VIGILANCIA VENTA"
                )

        if evaluation.passed_filter or evaluation.watchlist:
            fundamentals = get_fundamentals(ticker, float(last.close))
            canslim = evaluate_canslim(fundamentals, evaluation, evaluation.market_context)
            # Integrar CAN SLIM en los bloques para que afecte al weighted_ratio real
            evaluation = add_canslim_block(evaluation, canslim)
            plan = build_trade_plan(last, evaluation.direction)
            status = signal_status(state, ticker, evaluation.direction, evaluation.weighted_ratio)

            # ── Tracking: registrar esta señal como pendiente de evaluación ──
            register_signal(
                tracking_store,
                ticker,
                evaluation.direction,
                evaluation.signal_type or "",
                plan,
            )

            ticker_badge = build_accuracy_badge(tracking_store, ticker=ticker)
            report = build_signal_report(ticker, evaluation, plan, fundamentals, canslim, bt, status, ticker_badge)

            if evaluation.passed_filter:
                send_telegram(report, logger)
                messages_sent += 1

                signal_rows.append({
                    "timestamp_utc": datetime.utcnow().isoformat(timespec="seconds"),
                    "ticker": ticker,
                    "signal_type": evaluation.signal_type,
                    "direction": evaluation.direction,
                    "status": status,
                    "favor": evaluation.favor,
                    "neutral": evaluation.neutral,
                    "against": evaluation.against,
                    "weighted_ratio": round(evaluation.weighted_ratio, 4),
                    "backtest_cases": bt.cases,
                    "backtest_reliability": "" if bt.reliability is None else round(bt.reliability, 4),
                    "profit_factor": "" if bt.profit_factor is None else round(bt.profit_factor, 4),
                })

                operational.append(item)
            else:
                watchlist.append(item)

    save_state(state)
    save_tracking(tracking_store)

    write_csv(
        os.path.join(DATA_DIR, "signals.csv"),
        signal_rows,
        [
            "timestamp_utc", "ticker", "signal_type", "direction", "status",
            "favor", "neutral", "against", "weighted_ratio",
            "backtest_cases", "backtest_reliability", "profit_factor"
        ]
    )

    write_csv(
        os.path.join(DATA_DIR, "ranking_latest.csv"),
        sorted(ranking_rows, key=lambda x: x["weighted_ratio"], reverse=True),
        [
            "ticker", "direction", "signal_type", "favor", "neutral",
            "against", "raw_ratio", "weighted_ratio",
            "backtest_cases", "backtest_reliability", "profit_factor"
        ]
    )

    write_csv(
        os.path.join(DATA_DIR, "debug_scores.csv"),
        debug_rows,
        [
            "ticker", "daily_bias", "hourly_confirmation", "market_context",
            "sector_context", "total_indicators", "favor", "neutral",
            "against", "raw_ratio", "weighted_ratio",
            "passed_filter", "watchlist"
        ]
    )

    write_csv(
        os.path.join(DATA_DIR, "skipped_tickers.csv"),
        skipped_rows,
        ["ticker", "reason"]
    )

    summary = build_daily_summary(
        market,
        expected,
        analyzed,
        len(skipped_rows),
        operational,
        watchlist
    )

    send_telegram(summary, logger)

    logger.info(
        f"Fin V15 PRO. analizados={analyzed}, omitidos={len(skipped_rows)}, "
        f"señales={len(operational)}, vigilancia={len(watchlist)}, "
        f"telegram_fichas={messages_sent}"
    )


if __name__ == "__main__":
    main()
