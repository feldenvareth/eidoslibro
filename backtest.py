from dataclasses import dataclass
import pandas as pd
from config import BACKTEST_LOOKAHEAD_DAYS, MIN_BACKTEST_CASES
from indicators import add_indicators

@dataclass
class BacktestResult:
    cases: int = 0
    favorable: int = 0
    reliability: float | None = None
    profit_factor: float | None = None
    avg_gain_pct: float | None = None
    avg_loss_pct: float | None = None
    reading: str = "Muestra insuficiente"


def _simple_setup(row, direction: str):
    """Setup causal de swing 1-3 meses.

    Solo usa datos disponibles en la propia fila: medias, MACD, ROC y OBV_slope.
    El precio futuro se consulta únicamente después para medir el resultado.
    """
    if direction == "compra":
        return (
            row.close > row.ema_20 and row.ema_10 > row.ema_20 and row.ema20_slope > 0 and
            row.macd > row.macd_signal and row.roc_10 > 0 and row.obv_slope > 0
        )
    return (
        row.close < row.ema_20 and row.ema_10 < row.ema_20 and row.ema20_slope < 0 and
        row.macd < row.macd_signal and row.roc_10 < 0 and row.obv_slope < 0
    )


def run_backtest(daily_raw: pd.DataFrame, direction: str, lookahead: int = BACKTEST_LOOKAHEAD_DAYS) -> BacktestResult:
    """Backtest causal aproximado de 6-9 meses.

    Importante: calcular indicadores sobre todo el histórico NO introduce por sí mismo
    look-ahead bias cuando los indicadores son causales: rolling, ewm, diff y cumsum
    usan valores hasta la fila actual, no posteriores. OBV y ADL son acumulativos hacia
    delante; en cada fila solo acumulan el pasado disponible hasta esa fecha.

    La única lectura futura es df.iloc[i + lookahead].close, utilizada exclusivamente
    como resultado para medir si la señal funcionó, no para crear la señal.
    """
    if daily_raw is None or daily_raw.empty:
        return BacktestResult()

    df = add_indicators(daily_raw, intraday=False).dropna(
        subset=["close", "ema_20", "ema_10", "ema20_slope", "macd", "macd_signal", "roc_10", "obv_slope"]
    )
    if len(df) < lookahead + 30:
        return BacktestResult()

    cases = 0
    favorable = 0
    gross_gain = 0.0
    gross_loss = 0.0
    gains = []
    losses = []

    for i in range(20, len(df) - lookahead):
        row = df.iloc[i]
        if not _simple_setup(row, direction):
            continue
        entry = float(row.close)
        future = float(df.iloc[i + lookahead].close)
        if entry <= 0:
            continue

        raw_move = (future - entry) / entry
        directional_move = raw_move if direction == "compra" else -raw_move
        cases += 1

        if directional_move > 0:
            favorable += 1
            gross_gain += directional_move
            gains.append(directional_move)
        else:
            gross_loss += abs(directional_move)
            losses.append(abs(directional_move))

    if cases == 0:
        return BacktestResult()

    reliability = favorable / cases
    profit_factor = None if gross_loss == 0 else gross_gain / gross_loss
    avg_gain = sum(gains) / len(gains) if gains else None
    avg_loss = sum(losses) / len(losses) if losses else None

    if cases < MIN_BACKTEST_CASES:
        reading = "Muestra insuficiente; dato orientativo"
    elif reliability >= 0.65 and (profit_factor is None or profit_factor >= 1.30):
        reading = "Histórico favorable por fiabilidad y profit factor"
    elif reliability >= 0.60 or (profit_factor is not None and profit_factor >= 1.30):
        reading = "Histórico razonable, revisar tamaño de muestra"
    else:
        reading = "Histórico débil o irregular"
    return BacktestResult(cases, favorable, reliability, profit_factor, avg_gain, avg_loss, reading)
