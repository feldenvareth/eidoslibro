from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
import pandas as pd
from indicators import detect_rsi_divergence
from config import BLOCK_WEIGHTS, MIN_CONFLUENCE_RATIO, MIN_WEIGHTED_RATIO, WATCHLIST_RATIO

State = str
Item = Tuple[str, State]

@dataclass
class SignalEvaluation:
    ticker: str
    direction: Optional[str]
    signal_type: Optional[str]
    blocks: Dict[str, List[Item]] = field(default_factory=dict)
    total: int = 0
    favor: int = 0
    neutral: int = 0
    against: int = 0
    raw_ratio: float = 0.0
    weighted_ratio: float = 0.0
    daily_bias: Optional[str] = None
    hourly_confirmation: bool = False
    market_context: str = "neutral"
    sector_context: str = "no disponible"
    passed_filter: bool = False
    watchlist: bool = False


def add(blocks, block, text, state):
    blocks.setdefault(block, []).append((text, state))


def latest(df: pd.DataFrame):
    if df is None or df.empty:
        return None
    return df.iloc[-1]


def _safe(val, default=float("nan")):
    """Devuelve val si no es NaN/NA, si no default."""
    try:
        if pd.isna(val):
            return default
    except (TypeError, ValueError):
        pass
    return val


def _state_for_direction(condition_bull, condition_bear, direction: str):
    """Evalúa condiciones que pueden ser NaN/NA de forma segura."""
    try:
        bull = bool(condition_bull) if pd.notna(condition_bull) else False
        bear = bool(condition_bear) if pd.notna(condition_bear) else False
    except (TypeError, ValueError):
        return "neutral"
    if direction == "compra":
        if bull: return "favor"
        if bear: return "contra"
    else:
        if bear: return "favor"
        if bull: return "contra"
    return "neutral"


def determine_daily_bias(row) -> Optional[str]:
    bull = 0
    bear = 0
    checks = [
        (row.close > row.ema_20, row.close < row.ema_20),
        (row.ema_10 > row.ema_20, row.ema_10 < row.ema_20),
        (row.ema_20 > row.ema_50, row.ema_20 < row.ema_50),
        (row.ema20_slope > 0, row.ema20_slope < 0),
        (row.macd > row.macd_signal, row.macd < row.macd_signal),
        (bool(row.ha_bullish), not bool(row.ha_bullish)),
    ]
    for b, s in checks:
        if bool(b): bull += 1
        elif bool(s): bear += 1
    if bull >= 4:
        return "compra"
    if bear >= 4:
        return "venta"
    return None


def _ratio_context(ticker_row, sector_row, direction: str):
    if ticker_row is None or sector_row is None:
        return "no disponible", "neutral"
    try:
        ticker_strength = (ticker_row.close / ticker_row.ema_20) - 1
        sector_strength = (sector_row.close / sector_row.ema_20) - 1
        rel = ticker_strength - sector_strength
        sector_bull = sector_row.close > sector_row.ema_20 and sector_row.ema20_slope > 0
        sector_bear = sector_row.close < sector_row.ema_20 and sector_row.ema20_slope < 0
        if direction == "compra":
            if rel > 0.005 and sector_bull:
                return "lidera sector alcista", "favor"
            if rel < -0.01 or sector_bear:
                return "débil frente a sector", "contra"
        else:
            if rel < -0.005 and sector_bear:
                return "debilidad relativa sectorial", "favor"
            if rel > 0.01 or sector_bull:
                return "fortaleza relativa contra venta", "contra"
        return "relación sectorial neutra", "neutral"
    except Exception:
        return "no disponible", "neutral"


def evaluate_direction(ticker: str, daily: pd.DataFrame, hourly: pd.DataFrame, benchmark: pd.DataFrame, sector: pd.DataFrame, direction: str) -> SignalEvaluation:
    d = latest(daily)
    h = latest(hourly)
    b = latest(benchmark) if benchmark is not None and not benchmark.empty else None
    sec = latest(sector) if sector is not None and not sector.empty else None
    blocks = {}

    # 1. Tendencia estructural: pocas señales limpias, menos redundancia.
    add(blocks, "tendencia_diaria", "Pendiente EMA20 diaria alineada", _state_for_direction(d.ema20_slope > 0, d.ema20_slope < 0, direction))
    add(blocks, "tendencia_diaria", "Precio respecto a EMA50 diaria", _state_for_direction(d.close > d.ema_50, d.close < d.ema_50, direction))
    add(blocks, "tendencia_diaria", "EMA20 respecto a EMA50 diaria", _state_for_direction(d.ema_20 > d.ema_50, d.ema_20 < d.ema_50, direction))

    # 2. Estructura de mercado: HH/HL, BOS y retesteo.
    add(blocks, "estructura_mercado", "Secuencia HH/HL o LH/LL real", _state_for_direction(bool(d.higher_high) and bool(d.higher_low), bool(d.lower_high) and bool(d.lower_low), direction))
    add(blocks, "estructura_mercado", "BOS: ruptura de estructura", _state_for_direction(bool(getattr(d, "bos_bullish", False)), bool(getattr(d, "bos_bearish", False)), direction))
    add(blocks, "estructura_mercado", "Retesteo de nivel roto", _state_for_direction(bool(getattr(d, "retest_bullish", False)), bool(getattr(d, "retest_bearish", False)), direction))
    add(blocks, "estructura_mercado", "Donchian 20 acompaña estructura", _state_for_direction(d.close >= d.donchian_high_20 * 0.98, d.close <= d.donchian_low_20 * 1.02, direction))

    # 3. Momentum de precio.
    add(blocks, "momentum", "MACD sobre/señal", _state_for_direction(d.macd > d.macd_signal, d.macd < d.macd_signal, direction))
    add(blocks, "momentum", "Histograma MACD con pendiente alineada", _state_for_direction(d.macd_hist_slope > 0, d.macd_hist_slope < 0, direction))
    add(blocks, "momentum", "ROC 10 positivo/negativo", _state_for_direction(d.roc_10 > 0, d.roc_10 < 0, direction))
    add(blocks, "momentum", "ADX con DI dominante", _state_for_direction(d.adx > 18 and d.plus_di > d.minus_di, d.adx > 18 and d.minus_di > d.plus_di, direction))

    # 4. Osciladores / agotamiento. Se mantienen los típicos, pero pesan menos.
    if direction == "compra":
        rsi = _safe(d.rsi14, 50.0)
        stoch_k = _safe(d.stoch_k, 50.0)
        stoch_d = _safe(d.stoch_d, 50.0)
        wr = _safe(d.williams_r, -50.0)
        cci = _safe(d.cci_20, 0.0)
        rsi_state = "favor" if 42 <= rsi <= 68 else ("contra" if rsi < 35 or rsi > 78 else "neutral")
        stoch_state = "favor" if stoch_k > stoch_d and stoch_k < 88 else ("contra" if stoch_k < stoch_d and stoch_k < 45 else "neutral")
        will_state = "favor" if -80 < wr < -10 else ("contra" if wr <= -88 else "neutral")
        cci_state = "favor" if cci > -100 and cci < 180 else ("contra" if cci < -150 else "neutral")
    else:
        rsi = _safe(d.rsi14, 50.0)
        stoch_k = _safe(d.stoch_k, 50.0)
        stoch_d = _safe(d.stoch_d, 50.0)
        wr = _safe(d.williams_r, -50.0)
        cci = _safe(d.cci_20, 0.0)
        rsi_state = "favor" if 32 <= rsi <= 58 else ("contra" if rsi > 68 or rsi < 22 else "neutral")
        stoch_state = "favor" if stoch_k < stoch_d and stoch_k > 12 else ("contra" if stoch_k > stoch_d and stoch_k > 55 else "neutral")
        will_state = "favor" if -90 < wr < -20 else ("contra" if wr >= -8 else "neutral")
        cci_state = "favor" if cci < 100 and cci > -180 else ("contra" if cci > 150 else "neutral")
    add(blocks, "osciladores", f"RSI 14 en zona útil ({rsi:.1f})", rsi_state)
    add(blocks, "osciladores", "Estocástico confirma dirección", stoch_state)
    add(blocks, "osciladores", "Williams %R confirma dirección", will_state)
    add(blocks, "osciladores", "CCI 20 no contradice el movimiento", cci_state)

    div = detect_rsi_divergence(daily)
    if div == "bullish":
        add(blocks, "osciladores", "Divergencia RSI alcista detectada", "favor" if direction == "compra" else "contra")
    elif div == "bearish":
        add(blocks, "osciladores", "Divergencia RSI bajista detectada", "favor" if direction == "venta" else "contra")
    else:
        add(blocks, "osciladores", "Divergencia RSI no detectada", "neutral")

    # 5. Volumen institucional: VWAP diario, profile y acumulación/distribución.
    add(blocks, "volumen_institucional", "Precio respecto a VWAP diario rolling", _state_for_direction(d.close > d.vwap, d.close < d.vwap, direction))
    add(blocks, "volumen_institucional", "Precio respecto al POC aproximado de Volume Profile", _state_for_direction(bool(getattr(d, "above_volume_profile_poc", False)), not bool(getattr(d, "above_volume_profile_poc", False)), direction))
    add(blocks, "volumen_institucional", "Días de acumulación frente a distribución", _state_for_direction(d.accumulation_days_20 > d.distribution_days_20, d.distribution_days_20 > d.accumulation_days_20, direction))

    # 6. Flujo de dinero.
    add(blocks, "flujo_dinero", "OBV acompaña", _state_for_direction(d.obv_slope > 0, d.obv_slope < 0, direction))
    add(blocks, "flujo_dinero", "MFI coherente", _state_for_direction(d.mfi > 50 and d.mfi < 85, d.mfi < 50 and d.mfi > 15, direction))
    add(blocks, "flujo_dinero", "Chaikin Money Flow acompaña", _state_for_direction(d.cmf_20 > 0.03, d.cmf_20 < -0.03, direction))
    add(blocks, "flujo_dinero", "ADL acompaña", _state_for_direction(d.adl_slope > 0, d.adl_slope < 0, direction))

    # 7. Volatilidad / régimen.
    bb_pct = getattr(d, "bb_width_percentile_50", float("nan"))
    bb_slope = getattr(d, "bb_width_slope", float("nan"))
    atr_ratio = getattr(d, "atr_ratio_50", float("nan"))
    if pd.notna(bb_pct) and bb_pct <= 0.25:
        add(blocks, "volatilidad", f"BB width en compresión ({bb_pct*100:.0f}º percentil)", "favor")
    elif pd.notna(bb_pct) and bb_pct >= 0.80:
        add(blocks, "volatilidad", f"BB width muy expandido ({bb_pct*100:.0f}º percentil)", "neutral")
    else:
        add(blocks, "volatilidad", "BB width en régimen medio", "neutral")
    if pd.notna(atr_ratio) and pd.notna(bb_slope) and atr_ratio > 1.05 and bb_slope > 0:
        add(blocks, "volatilidad", f"Volatilidad empieza a expandirse (ATR ratio {atr_ratio:.2f})", "favor")
    elif pd.notna(atr_ratio) and atr_ratio > 1.40:
        add(blocks, "volatilidad", f"Volatilidad muy elevada (ATR ratio {atr_ratio:.2f})", "neutral")
    else:
        add(blocks, "volatilidad", "Expansión de volatilidad no clara", "neutral")
    add(blocks, "volatilidad", "ATR disponible para stop", "favor" if pd.notna(d.atr_14) and d.atr_14 > 0 else "neutral")

    # 8. Confirmación 1h.
    add(blocks, "confirmacion_1h", "Precio sobre/bajo EMA20 1h", _state_for_direction(h.close > h.ema_20, h.close < h.ema_20, direction))
    add(blocks, "confirmacion_1h", "EMA10 sobre/bajo EMA20 1h", _state_for_direction(h.ema_10 > h.ema_20, h.ema_10 < h.ema_20, direction))
    add(blocks, "confirmacion_1h", "MACD 1h confirma", _state_for_direction(h.macd > h.macd_signal, h.macd < h.macd_signal, direction))
    add(blocks, "confirmacion_1h", "Heikin Ashi 1h confirma", _state_for_direction(bool(h.ha_bullish), not bool(h.ha_bullish), direction))
    add(blocks, "confirmacion_1h", "Precio respecto a VWAP 1h", _state_for_direction(h.close > h.vwap, h.close < h.vwap, direction))
    hourly_favor = sum(1 for _, s in blocks["confirmacion_1h"] if s == "favor")
    hourly_confirmation = hourly_favor >= 3

    # 9. Mercado general.
    market_context = "neutral"
    if b is not None:
        bull_market = b.close > b.ema_20 and b.ema_20 > b.ema_50 and b.ema20_slope > 0
        bear_market = b.close < b.ema_20 and b.ema_20 < b.ema_50 and b.ema20_slope < 0
        market_context = "alcista" if bull_market else "bajista" if bear_market else "neutral"
        add(blocks, "mercado_general", "Benchmark alineado con la señal", _state_for_direction(bull_market, bear_market, direction))
    else:
        add(blocks, "mercado_general", "Benchmark no disponible", "neutral")

    # 10. Contexto sector / liderazgo relativo.
    sector_context, sector_state = _ratio_context(d, sec, direction)
    add(blocks, "contexto_sector", f"Ticker frente a ETF sectorial: {sector_context}", sector_state)

    favor = neutral = against = 0
    weighted_favor = weighted_total = 0.0
    total = 0
    for block, items in blocks.items():
        weight = BLOCK_WEIGHTS.get(block, 1.0)
        for _, state in items:
            total += 1
            weighted_total += weight
            if state == "favor":
                favor += 1
                weighted_favor += weight
            elif state == "contra":
                against += 1
            else:
                neutral += 1

    raw_ratio = favor / total if total else 0.0
    weighted_ratio = weighted_favor / weighted_total if weighted_total else 0.0
    daily_bias = determine_daily_bias(d)
    bias_ok = daily_bias == direction
    passed = bias_ok and hourly_confirmation and raw_ratio >= MIN_CONFLUENCE_RATIO and weighted_ratio >= MIN_WEIGHTED_RATIO
    watch = (not passed) and bias_ok and raw_ratio >= WATCHLIST_RATIO

    signal_type = None
    if passed:
        signal_type = "SEÑAL DE COMPRA" if direction == "compra" else "SEÑAL DE VENTA"
    elif watch:
        signal_type = "VIGILANCIA COMPRA" if direction == "compra" else "VIGILANCIA VENTA"

    return SignalEvaluation(ticker, direction if (passed or watch) else None, signal_type, blocks, total, favor, neutral, against, raw_ratio, weighted_ratio, daily_bias, hourly_confirmation, market_context, sector_context, passed, watch)


def add_history_quality_block(evaluation: SignalEvaluation, backtest) -> SignalEvaluation:
    """Añade bloque de calidad histórica después de calcular backtest y recalcula ratios."""
    if evaluation is None:
        return evaluation
    if backtest.cases <= 0:
        add(evaluation.blocks, "calidad_historica", "Backtest sin casos suficientes", "neutral")
    else:
        pf_ok = backtest.profit_factor is not None and backtest.profit_factor >= 1.30
        rel_ok = backtest.reliability is not None and backtest.reliability >= 0.65
        weak = backtest.cases >= 8 and (backtest.reliability is not None and backtest.reliability < 0.55) and (backtest.profit_factor is not None and backtest.profit_factor < 1.0)
        if rel_ok and pf_ok:
            add(evaluation.blocks, "calidad_historica", "Histórico favorable por fiabilidad y profit factor", "favor")
        elif weak:
            add(evaluation.blocks, "calidad_historica", "Histórico débil: fiabilidad/PF insuficientes", "contra")
        else:
            add(evaluation.blocks, "calidad_historica", "Histórico orientativo o muestra limitada", "neutral")
    _recalculate(evaluation)
    return evaluation


def _recalculate(evaluation: SignalEvaluation) -> None:
    favor = neutral = against = total = 0
    weighted_favor = weighted_total = 0.0
    for block, items in evaluation.blocks.items():
        weight = BLOCK_WEIGHTS.get(block, 1.0)
        for _, state in items:
            total += 1
            weighted_total += weight
            if state == "favor":
                favor += 1
                weighted_favor += weight
            elif state == "contra":
                against += 1
            else:
                neutral += 1
    evaluation.total = total
    evaluation.favor = favor
    evaluation.neutral = neutral
    evaluation.against = against
    evaluation.raw_ratio = favor / total if total else 0.0
    evaluation.weighted_ratio = weighted_favor / weighted_total if weighted_total else 0.0


def add_canslim_block(evaluation: SignalEvaluation, canslim: dict) -> SignalEvaluation:
    """Integra los resultados de CAN SLIM en el bloque de evaluación para que
    afecten realmente al weighted_ratio y no sean solo decorativos en el report."""
    if evaluation is None or not canslim:
        return evaluation

    checks = canslim.get("checks", [])
    for letter, desc, ok in checks:
        state = "favor" if ok else "neutral"
        add(evaluation.blocks, "fundamentales_canslim", f"[{letter}] {desc}", state)

    _recalculate(evaluation)
    return evaluation


def evaluate_ticker(ticker: str, daily: pd.DataFrame, hourly: pd.DataFrame, benchmark: pd.DataFrame, sector: pd.DataFrame = None) -> SignalEvaluation:
    buy = evaluate_direction(ticker, daily, hourly, benchmark, sector, "compra")
    sell = evaluate_direction(ticker, daily, hourly, benchmark, sector, "venta")
    candidates = [x for x in [buy, sell] if x.passed_filter or x.watchlist]
    if candidates:
        return sorted(candidates, key=lambda x: (x.passed_filter, x.weighted_ratio, x.raw_ratio), reverse=True)[0]
    return buy if buy.weighted_ratio >= sell.weighted_ratio else sell
