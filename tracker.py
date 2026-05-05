"""
tracker.py — Sistema de seguimiento de aciertos en señales emitidas.

Flujo:
1. Cuando se emite una señal, se registra con precio de entrada y niveles TP/stop.
2. En cada ejecución posterior se comprueban las señales pendientes:
   - Si han pasado >= TRACKING_DAYS días hábiles, se descarga el histórico desde la señal.
   - Se evalúa si llegó a TP3, TP2, TP1 en cualquier momento.
   - También se anota si el stop loss fue tocado y si ocurrió antes de TP1.
   - El análisis NO se cierra al tocar stop: sigue midiendo los objetivos alcanzados.
3. El resultado se acumula en el historial global y en el CSV de tracking.
4. Al construir el informe de una señal nueva se añade el badge de precisión histórica.
"""

import json
import os
import csv
from datetime import datetime, timezone, timedelta
from typing import Optional

import yfinance as yf

TRACKING_FILE = "data/tracking.json"
TRACKING_CSV  = "data/tracking_history.csv"
TRACKING_DAYS = 3        # días hábiles de look-ahead antes de evaluar
MAX_PENDING_AGE = 60     # días máximos que se mantiene una señal pendiente


# ── Outcomes ────────────────────────────────────────────────────────────────
TP3_HIT   = "tp3"
TP2_HIT   = "tp2"
TP1_HIT   = "tp1"
NEUTRAL   = "neutral"
FAIL      = "fallo"

OUTCOME_LABEL = {
    TP3_HIT : "✅✅✅ TP3",
    TP2_HIT : "✅✅ TP2",
    TP1_HIT : "✅ TP1",
    NEUTRAL : "➖ Neutro",
    FAIL    : "❌ Fallo",
}

OUTCOME_WEIGHT = {
    TP3_HIT : 3,
    TP2_HIT : 2,
    TP1_HIT : 1,
    NEUTRAL : 0,
    FAIL    : -1,
}


# ── Persistencia ─────────────────────────────────────────────────────────────

def _default_stats_block() -> dict:
    """Bloque de estadísticas reutilizable (global o por ticker)."""
    return {
        "total": 0,
        "tp1": 0, "tp2": 0, "tp3": 0,
        "neutral": 0, "fallo": 0,
        "compra_total": 0, "compra_ok": 0,
        "venta_total":  0, "venta_ok":  0,
        "stop_before_tp1_count": 0,
    }


def _default_store() -> dict:
    return {
        "pending": {},           # ticker+date → signal record
        "history": [],           # list of resolved records
        "stats": _default_stats_block(),
        "stats_by_ticker": {},   # ticker → mismo esquema que stats
    }


def load_tracking() -> dict:
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(TRACKING_FILE):
        return _default_store()
    try:
        with open(TRACKING_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Asegurar claves por si el archivo es de versión anterior
        store = _default_store()
        store.update(data)
        if "stats" not in data:
            store["stats"] = _default_stats_block()
        if "stats_by_ticker" not in data:
            store["stats_by_ticker"] = {}
        return store
    except Exception:
        return _default_store()


def save_tracking(store: dict):
    os.makedirs("data", exist_ok=True)
    tmp = TRACKING_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(store, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, TRACKING_FILE)


def _append_csv(record: dict):
    os.makedirs("data", exist_ok=True)
    write_header = not os.path.exists(TRACKING_CSV)
    fields = [
        "signal_date", "eval_date", "ticker", "direction",
        "signal_type", "entry_price",
        "tp1", "tp2", "tp3", "stop_loss",
        "price_at_eval", "max_high", "min_low",
        "tp1_reached", "tp2_reached", "tp3_reached",
        "stop_touched", "stop_before_tp1",
        "outcome", "outcome_label",
    ]
    with open(TRACKING_CSV, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        if write_header:
            w.writeheader()
        w.writerow(record)


# ── Registro de señal nueva ───────────────────────────────────────────────────

def register_signal(store: dict, ticker: str, direction: str,
                    signal_type: str, trade_plan: dict, signal_date: Optional[str] = None):
    """
    Registra una señal recién emitida como pendiente de evaluación.
    Se usa la clave ticker+signal_date para evitar duplicados en el mismo día.
    """
    if signal_date is None:
        signal_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    key = f"{ticker}_{signal_date}"
    if key in store["pending"]:
        return  # ya registrada hoy, no sobreescribir

    store["pending"][key] = {
        "ticker"      : ticker,
        "direction"   : direction,
        "signal_type" : signal_type,
        "signal_date" : signal_date,
        "entry_price" : trade_plan.get("precio_actual"),
        "tp1"         : trade_plan.get("tp1"),
        "tp2"         : trade_plan.get("tp2"),
        "tp3"         : trade_plan.get("tp3"),
        "stop_loss"   : trade_plan.get("stop_loss"),
    }


# ── Evaluación de señales pendientes ─────────────────────────────────────────

def _business_days_since(date_str: str) -> int:
    """Días hábiles (L-V) transcurridos desde date_str hasta hoy."""
    try:
        start = datetime.strptime(date_str, "%Y-%m-%d").date()
        today = datetime.now(timezone.utc).date()
        if today <= start:
            return 0
        count = 0
        current = start + timedelta(days=1)
        while current <= today:
            if current.weekday() < 5:   # lunes=0 … viernes=4
                count += 1
            current += timedelta(days=1)
        return count
    except Exception:
        return 0


def _safe_float(value) -> Optional[float]:
    """Convierte escalares/series de pandas en float, evitando errores silenciosos."""
    try:
        if hasattr(value, "iloc"):
            value = value.iloc[0]
        if value is None:
            return None
        return float(value)
    except Exception:
        return None


def _flatten_yfinance_columns(data):
    """Normaliza columnas cuando yfinance devuelve MultiIndex."""
    if data is None or data.empty:
        return data
    try:
        if hasattr(data.columns, "nlevels") and data.columns.nlevels > 1:
            # Para una sola descarga, nos quedamos con el primer nivel: Close, High, Low...
            data = data.copy()
            data.columns = [c[0] if isinstance(c, tuple) else c for c in data.columns]
    except Exception:
        pass
    return data


def _fetch_tracking_prices(ticker: str, signal_date: str):
    """Descarga histórico diario desde la señal para evaluar recorrido completo."""
    try:
        start = datetime.strptime(signal_date, "%Y-%m-%d").date()
        end = datetime.now(timezone.utc).date() + timedelta(days=1)
        data = yf.download(
            ticker,
            start=start.strftime("%Y-%m-%d"),
            end=end.strftime("%Y-%m-%d"),
            interval="1d",
            progress=False,
            auto_adjust=True,
        )
        data = _flatten_yfinance_columns(data)
        if data is None or data.empty:
            return None
        needed = ["Close", "High", "Low"]
        if any(col not in data.columns for col in needed):
            return None
        data = data.dropna(subset=needed)
        if data.empty:
            return None
        return data
    except Exception:
        return None


def _evaluate_path(direction: str, data,
                   tp1: float, tp2: float, tp3: float, stop: float) -> dict:
    """
    Evalúa todo el recorrido diario.
    No cierra la operación al tocar stop: marca TP alcanzados y, aparte,
    si el stop se tocó antes de TP1.
    """
    high = data["High"]
    low = data["Low"]
    close = data["Close"].dropna()

    max_high = _safe_float(high.max())
    min_low = _safe_float(low.min())
    price_at_eval = _safe_float(close.iloc[-1]) if not close.empty else None

    tp1_reached = tp2_reached = tp3_reached = False
    stop_touched = False
    stop_before_tp1 = False
    tp1_seen = False

    if direction == "compra":
        tp1_reached = bool(max_high is not None and max_high >= tp1)
        tp2_reached = bool(max_high is not None and max_high >= tp2)
        tp3_reached = bool(max_high is not None and max_high >= tp3)
        stop_touched = bool(min_low is not None and min_low <= stop)

        for _, row in data.iterrows():
            day_high = _safe_float(row["High"])
            day_low = _safe_float(row["Low"])
            if day_low is not None and day_low <= stop and not tp1_seen:
                stop_before_tp1 = True
                break
            if day_high is not None and day_high >= tp1:
                tp1_seen = True
    else:  # venta
        tp1_reached = bool(min_low is not None and min_low <= tp1)
        tp2_reached = bool(min_low is not None and min_low <= tp2)
        tp3_reached = bool(min_low is not None and min_low <= tp3)
        stop_touched = bool(max_high is not None and max_high >= stop)

        for _, row in data.iterrows():
            day_high = _safe_float(row["High"])
            day_low = _safe_float(row["Low"])
            if day_high is not None and day_high >= stop and not tp1_seen:
                stop_before_tp1 = True
                break
            if day_low is not None and day_low <= tp1:
                tp1_seen = True

    if tp3_reached:
        outcome = TP3_HIT
    elif tp2_reached:
        outcome = TP2_HIT
    elif tp1_reached:
        outcome = TP1_HIT
    elif stop_touched:
        outcome = FAIL
    else:
        outcome = NEUTRAL

    return {
        "price_at_eval": price_at_eval,
        "max_high": max_high,
        "min_low": min_low,
        "tp1_reached": tp1_reached,
        "tp2_reached": tp2_reached,
        "tp3_reached": tp3_reached,
        "stop_touched": stop_touched,
        "stop_before_tp1": stop_before_tp1,
        "outcome": outcome,
    }


def _update_stats(store: dict, record: dict):
    outcome   = record["outcome"]
    direction = record["direction"]
    ticker    = record["ticker"]

    def _apply(s: dict):
        s["total"] = s.get("total", 0) + 1
        s[outcome] = s.get(outcome, 0) + 1
        if direction == "compra":
            s["compra_total"] = s.get("compra_total", 0) + 1
            if outcome in (TP1_HIT, TP2_HIT, TP3_HIT):
                s["compra_ok"] = s.get("compra_ok", 0) + 1
        else:
            s["venta_total"] = s.get("venta_total", 0) + 1
            if outcome in (TP1_HIT, TP2_HIT, TP3_HIT):
                s["venta_ok"] = s.get("venta_ok", 0) + 1
        if record.get("stop_before_tp1"):
            s["stop_before_tp1_count"] = s.get("stop_before_tp1_count", 0) + 1

    # Estadística global
    _apply(store["stats"])

    # Estadística por ticker
    if "stats_by_ticker" not in store:
        store["stats_by_ticker"] = {}
    if ticker not in store["stats_by_ticker"]:
        store["stats_by_ticker"][ticker] = _default_stats_block()
    _apply(store["stats_by_ticker"][ticker])


def resolve_pending(store: dict, logger=None):
    """
    Recorre las señales pendientes y resuelve las que ya han cumplido TRACKING_DAYS.
    Llama a yfinance para obtener el precio actual de cada una.
    """
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    to_delete = []

    for key, rec in list(store["pending"].items()):
        days_since = _business_days_since(rec["signal_date"])

        # ¿Demasiado antigua? Purgar sin evaluar.
        if days_since > MAX_PENDING_AGE:
            to_delete.append(key)
            continue

        # Aún no han pasado los días de look-ahead
        if days_since < TRACKING_DAYS:
            continue

        entry = rec.get("entry_price")
        tp1   = rec.get("tp1")
        tp2   = rec.get("tp2")
        tp3   = rec.get("tp3")
        stop  = rec.get("stop_loss")

        data = _fetch_tracking_prices(rec["ticker"], rec["signal_date"])
        if data is None:
            if logger:
                logger.warning(f"Tracker: no se pudo obtener histórico para {rec['ticker']}, se reintentará")
            continue

        # Si faltan niveles no podemos evaluar bien: marcar neutro, pero guardar precio.
        if any(v is None for v in [entry, tp1, tp2, tp3, stop]):
            price = _safe_float(data["Close"].dropna().iloc[-1]) if not data["Close"].dropna().empty else None
            path = {
                "price_at_eval": price,
                "max_high": _safe_float(data["High"].max()),
                "min_low": _safe_float(data["Low"].min()),
                "tp1_reached": False,
                "tp2_reached": False,
                "tp3_reached": False,
                "stop_touched": False,
                "stop_before_tp1": False,
                "outcome": NEUTRAL,
            }
        else:
            path = _evaluate_path(rec["direction"], data, tp1, tp2, tp3, stop)

        outcome = path["outcome"]

        resolved = {
            **rec,
            "eval_date"     : today_str,
            **path,
            "outcome_label" : OUTCOME_LABEL[outcome],
        }

        store["history"].append(resolved)
        _update_stats(store, resolved)
        _append_csv(resolved)
        to_delete.append(key)

        if logger:
            stop_note = " ⚠️ Stop tocado antes de TP1" if resolved.get("stop_before_tp1") else ""
            price_eval = resolved.get("price_at_eval")
            price_str = f"{price_eval:.2f}" if price_eval is not None else "N/D"
            logger.info(
                f"Tracker: {rec['ticker']} ({rec['direction']}) "
                f"señalado {rec['signal_date']} → {OUTCOME_LABEL[outcome]}{stop_note} "
                f"(entrada {entry:.2f}, precio eval {price_str})"
            )

    for key in to_delete:
        store["pending"].pop(key, None)


# ── Badge de precisión para el mensaje de Telegram ───────────────────────────




# ── Helpers internos de badge ────────────────────────────────────────────────

def _stats_block_to_lines(s: dict, label: str) -> list:
    """Convierte un bloque de stats en líneas de texto formateadas."""
    total = s.get("total", 0)
    if total == 0:
        return [f"{label}: sin datos aún"]

    tp1   = s.get("tp1",  0)
    tp2   = s.get("tp2",  0)
    tp3   = s.get("tp3",  0)
    neu   = s.get("neutral", 0)
    fallo = s.get("fallo",   0)
    hits  = tp1 + tp2 + tp3

    pct_hit      = hits  / total * 100
    stop_bp1     = s.get("stop_before_tp1_count", 0)
    pct_stop_bp1 = stop_bp1 / total * 100

    c_total = s.get("compra_total", 0)
    c_ok    = s.get("compra_ok",    0)
    v_total = s.get("venta_total",  0)
    v_ok    = s.get("venta_ok",     0)
    c_str = f"{c_ok/c_total*100:.0f}% ({c_ok}/{c_total})" if c_total else "sin datos"
    v_str = f"{v_ok/v_total*100:.0f}% ({v_ok}/{v_total})" if v_total else "sin datos"

    return [
        f"{label} ({total} señales)",
        f"  ✅✅✅ TP3 : {tp3/total*100:.1f}%  ({tp3})",
        f"  ✅✅ TP2  : {tp2/total*100:.1f}%  ({tp2})",
        f"  ✅ TP1   : {tp1/total*100:.1f}%  ({tp1})",
        f"  ➖ Neutro: {neu/total*100:.1f}%  ({neu})",
        f"  ❌ Fallo : {fallo/total*100:.1f}%  ({fallo})",
        f"  ── Con algún TP : {pct_hit:.1f}%",
        f"  ── Compras OK   : {c_str}",
        f"  ── Ventas OK    : {v_str}",
        f"  ⚠️ Stop antes TP1: {pct_stop_bp1:.1f}%  ({stop_bp1})",
    ]


def build_accuracy_badge(store: dict, ticker: str | None = None) -> str:
    """
    Genera el badge de precisión histórica para Telegram.

    Si se pasa `ticker`, muestra dos bloques comparativos:
      - Sistema global
      - Ese ticker en concreto
    Si no se pasa ticker (o no tiene historial), sólo muestra el global.
    """
    s_global = store["stats"]
    total_global = s_global.get("total", 0)

    if total_global == 0:
        return "📊 Precisión histórica del sistema: sin datos aún (< 3 días desde primer uso)\n"

    lines = ["📊 Precisión histórica"]
    lines += _stats_block_to_lines(s_global, "🌐 Sistema global")

    # Bloque por ticker si existe y tiene datos
    if ticker:
        s_ticker = store.get("stats_by_ticker", {}).get(ticker)
        if s_ticker and s_ticker.get("total", 0) > 0:
            lines.append("")
            ticker_hit  = (s_ticker.get("tp1",0)+s_ticker.get("tp2",0)+s_ticker.get("tp3",0))
            global_hit  = (s_global.get("tp1",0)+s_global.get("tp2",0)+s_global.get("tp3",0))
            ticker_pct  = ticker_hit / s_ticker["total"] * 100
            global_pct  = global_hit / total_global   * 100
            diff        = ticker_pct - global_pct
            arrow       = "📈" if diff > 0 else ("📉" if diff < 0 else "➡️")
            lines.append(f"{arrow} {ticker} vs. global: {ticker_pct:.1f}% vs {global_pct:.1f}% ({diff:+.1f}pp)")
            lines += _stats_block_to_lines(s_ticker, f"🔍 {ticker} específico")
        else:
            lines.append("")
            lines.append(f"🔍 {ticker}: sin historial evaluado aún")

    lines.append("")
    return "\n".join(lines)
