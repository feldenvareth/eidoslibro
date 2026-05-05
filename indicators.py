import numpy as np
import pandas as pd


def _volume_profile_zone(df: pd.DataFrame, bins: int = 24) -> tuple[float, float, float]:
    w = df.dropna(subset=["close", "volume"]).tail(80)
    if len(w) < 20 or w["close"].max() <= w["close"].min():
        return np.nan, np.nan, np.nan

    counts, edges = np.histogram(
        w["close"],
        bins=bins,
        weights=w["volume"].fillna(0)
    )

    if len(counts) == 0 or np.nanmax(counts) <= 0:
        return np.nan, np.nan, np.nan

    idx = int(np.nanargmax(counts))
    low = float(edges[idx])
    high = float(edges[idx + 1])
    poc = (low + high) / 2
    return poc, low, high


def detect_rsi_divergence(df: pd.DataFrame, lookback: int = 30) -> str | None:
    if df is None or len(df) < max(lookback, 20) or "rsi14" not in df.columns:
        return None

    w = df.tail(lookback).dropna(subset=["close", "rsi14"])
    if len(w) < 16:
        return None

    half = len(w) // 2
    first = w.iloc[:half]
    second = w.iloc[half:]

    p_low_1 = first["close"].min()
    p_low_2 = second["close"].min()
    r_low_1 = first.loc[first["close"].idxmin(), "rsi14"]
    r_low_2 = second.loc[second["close"].idxmin(), "rsi14"]

    p_high_1 = first["close"].max()
    p_high_2 = second["close"].max()
    r_high_1 = first.loc[first["close"].idxmax(), "rsi14"]
    r_high_2 = second.loc[second["close"].idxmax(), "rsi14"]

    if p_low_2 < p_low_1 and r_low_2 > r_low_1:
        return "bullish"

    if p_high_2 > p_high_1 and r_high_2 < r_high_1:
        return "bearish"

    return None


def _session_keys_from_index(index: pd.Index) -> pd.Series:
    """
    Devuelve claves de sesión robustas para datos intradía.
    Funciona tanto con índices con timezone como sin timezone.
    """
    dt = pd.to_datetime(index, errors="coerce")

    if isinstance(dt, pd.DatetimeIndex):
        if dt.tz is None:
            dt = dt.tz_localize("UTC")
        else:
            dt = dt.tz_convert("UTC")
        return pd.Series(dt.floor("D"), index=index)

    return pd.Series(pd.RangeIndex(len(index)), index=index)


def _compute_vwap(df: pd.DataFrame, typical: pd.Series, volume: pd.Series, intraday: bool) -> pd.Series:
    pv = typical * volume

    if intraday:
        day = _session_keys_from_index(df.index)
        vol_cum = volume.groupby(day).cumsum().replace(0, np.nan)
        vwap = pv.groupby(day).cumsum() / vol_cum
        return vwap.replace([np.inf, -np.inf], np.nan).ffill()

    vol_sum = volume.rolling(20, min_periods=10).sum().replace(0, np.nan)
    return (pv.rolling(20, min_periods=10).sum() / vol_sum).replace([np.inf, -np.inf], np.nan)


def add_indicators(df: pd.DataFrame, intraday: bool = False) -> pd.DataFrame:
    df = df.copy()

    required = {"open", "high", "low", "close", "volume"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Faltan columnas necesarias: {sorted(missing)}")

    close = df["close"].astype(float)
    high = df["high"].astype(float)
    low = df["low"].astype(float)
    volume = df["volume"].fillna(0).astype(float)

    for n in [10, 20, 50, 100, 200]:
        df[f"sma_{n}"] = close.rolling(n, min_periods=max(5, n // 2)).mean()

    for n in [9, 10, 20, 50]:
        df[f"ema_{n}"] = close.ewm(span=n, adjust=False, min_periods=max(5, n // 2)).mean()

    df["ema20_slope"] = df["ema_20"].diff(5)

    ema12 = close.ewm(span=12, adjust=False, min_periods=12).mean()
    ema26 = close.ewm(span=26, adjust=False, min_periods=26).mean()
    df["macd"] = ema12 - ema26
    df["macd_signal"] = df["macd"].ewm(span=9, adjust=False, min_periods=9).mean()
    df["macd_hist"] = df["macd"] - df["macd_signal"]
    df["macd_hist_slope"] = df["macd_hist"].diff(3)

    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14, min_periods=7).mean()
    loss = (-delta.clip(upper=0)).rolling(14, min_periods=7).mean()
    rs = gain / loss.replace(0, np.nan)
    df["rsi14"] = 100 - (100 / (1 + rs))
    df["rsi"] = df["rsi14"]

    lowest14 = low.rolling(14, min_periods=7).min()
    highest14 = high.rolling(14, min_periods=7).max()
    price_range14 = (highest14 - lowest14).replace(0, np.nan)

    df["stoch_k"] = 100 * (close - lowest14) / price_range14
    df["stoch_d"] = df["stoch_k"].rolling(3, min_periods=2).mean()
    df["williams_r"] = -100 * (highest14 - close) / price_range14
    df["roc_10"] = close.pct_change(10) * 100

    typical = (high + low + close) / 3
    cci_mean = typical.rolling(20, min_periods=10).mean()
    cci_mad = typical.rolling(20, min_periods=10).apply(
        lambda x: np.mean(np.abs(x - np.mean(x))),
        raw=True
    )
    df["cci_20"] = (typical - cci_mean) / (0.015 * cci_mad.replace(0, np.nan))

    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

    df["atr_14"] = tr.rolling(14, min_periods=7).mean()
    df["atr_ratio_50"] = df["atr_14"] / df["atr_14"].rolling(50, min_periods=20).mean().replace(0, np.nan)

    up_move = high.diff()
    down_move = -low.diff()

    plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
    minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)

    atr = df["atr_14"].replace(0, np.nan)
    plus_di = 100 * pd.Series(plus_dm, index=df.index).rolling(14, min_periods=7).sum() / atr
    minus_di = 100 * pd.Series(minus_dm, index=df.index).rolling(14, min_periods=7).sum() / atr

    dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di).replace(0, np.nan)
    df["adx"] = dx.rolling(14, min_periods=7).mean()
    df["plus_di"] = plus_di
    df["minus_di"] = minus_di

    obv = (np.sign(close.diff()).fillna(0) * volume).cumsum()
    df["obv"] = obv
    df["obv_slope"] = obv.diff(10)

    money_flow = typical * volume
    pos_mf = money_flow.where(typical.diff() > 0, 0).rolling(14, min_periods=7).sum()
    neg_mf = money_flow.where(typical.diff() < 0, 0).rolling(14, min_periods=7).sum()
    mfr = pos_mf / neg_mf.replace(0, np.nan)
    df["mfi"] = 100 - (100 / (1 + mfr))

    df["volume_rel"] = volume / volume.rolling(20, min_periods=10).mean().replace(0, np.nan)

    clv = ((close - low) - (high - close)) / (high - low).replace(0, np.nan)
    df["adl"] = (clv.fillna(0) * volume).cumsum()
    df["adl_slope"] = df["adl"].diff(10)
    df["cmf_20"] = (
        (clv.fillna(0) * volume).rolling(20, min_periods=10).sum()
        / volume.rolling(20, min_periods=10).sum().replace(0, np.nan)
    )

    vol_mean_20 = volume.rolling(20, min_periods=10).mean()
    up_day = close > close.shift(1)
    down_day = close < close.shift(1)
    active_vol = volume > vol_mean_20

    df["accumulation_days_20"] = (up_day & active_vol).rolling(20, min_periods=10).sum()
    df["distribution_days_20"] = (down_day & active_vol).rolling(20, min_periods=10).sum()

    mid = close.rolling(20, min_periods=10).mean()
    std = close.rolling(20, min_periods=10).std()

    df["bb_mid"] = mid
    df["bb_upper"] = mid + 2 * std
    df["bb_lower"] = mid - 2 * std
    df["bb_width"] = (df["bb_upper"] - df["bb_lower"]) / mid.replace(0, np.nan)
    df["bb_width_slope"] = df["bb_width"].diff(3)

    def percentile_last(x):
        s = pd.Series(x).dropna()
        if len(s) < 2:
            return np.nan
        return float((s <= s.iloc[-1]).mean())

    df["bb_width_percentile_50"] = df["bb_width"].rolling(50, min_periods=20).apply(percentile_last, raw=False)

    df["donchian_high_20"] = high.rolling(20, min_periods=10).max()
    df["donchian_low_20"] = low.rolling(20, min_periods=10).min()

    k_mid = typical.ewm(span=20, adjust=False, min_periods=10).mean()
    df["keltner_mid"] = k_mid
    df["keltner_upper"] = k_mid + 2 * df["atr_14"]
    df["keltner_lower"] = k_mid - 2 * df["atr_14"]

    ha_close = (df["open"] + high + low + close) / 4

    if len(df) > 0:
        initial_ha_open = (df["open"].iloc[0] + close.iloc[0]) / 2
        ha_input = ha_close.shift(1)
        ha_input.iloc[0] = initial_ha_open
        ha_open = ha_input.ewm(alpha=0.5, adjust=False).mean()
    else:
        ha_open = ha_close.copy()

    df["ha_close"] = ha_close
    df["ha_open"] = ha_open
    df["ha_bullish"] = ha_close > ha_open

    conv = (high.rolling(9, min_periods=5).max() + low.rolling(9, min_periods=5).min()) / 2
    base = (high.rolling(26, min_periods=13).max() + low.rolling(26, min_periods=13).min()) / 2
    span_a = (conv + base) / 2
    span_b = (high.rolling(52, min_periods=26).max() + low.rolling(52, min_periods=26).min()) / 2

    df["ichimoku_conv"] = conv
    df["ichimoku_base"] = base
    df["ichimoku_span_a"] = span_a
    df["ichimoku_span_b"] = span_b

    df["vwap"] = _compute_vwap(df, typical, volume, intraday=intraday)

    df["recent_high_20"] = high.rolling(20, min_periods=10).max()
    df["recent_low_20"] = low.rolling(20, min_periods=10).min()

    prev_swing_high = high.rolling(20, min_periods=10).max().shift(1)
    prev_swing_low = low.rolling(20, min_periods=10).min().shift(1)

    prev_swing_high_older = high.rolling(20, min_periods=10).max().shift(10)
    prev_swing_low_older = low.rolling(20, min_periods=10).min().shift(10)

    df["higher_high"] = prev_swing_high > prev_swing_high_older
    df["higher_low"] = prev_swing_low > prev_swing_low_older
    df["lower_high"] = prev_swing_high < prev_swing_high_older
    df["lower_low"] = prev_swing_low < prev_swing_low_older

    df["bos_bullish"] = close > prev_swing_high
    df["bos_bearish"] = close < prev_swing_low

    df["broken_level_bullish"] = prev_swing_high.where(df["bos_bullish"]).ffill()
    df["broken_level_bearish"] = prev_swing_low.where(df["bos_bearish"]).ffill()

    atr_buf = df["atr_14"].fillna(0) * 0.35

    df["retest_bullish"] = (
        df["broken_level_bullish"].notna()
        & (low <= df["broken_level_bullish"] + atr_buf)
        & (close >= df["broken_level_bullish"])
    )

    df["retest_bearish"] = (
        df["broken_level_bearish"].notna()
        & (high >= df["broken_level_bearish"] - atr_buf)
        & (close <= df["broken_level_bearish"])
    )

    poc, zl, zh = _volume_profile_zone(df)
    df["vp_poc_approx"] = poc
    df["vp_value_low_approx"] = zl
    df["vp_value_high_approx"] = zh
    df["above_volume_profile_poc"] = close > poc if not pd.isna(poc) else False

    prev_low = close.rolling(20, min_periods=10).min().shift(10)
    prev_high = close.rolling(20, min_periods=10).max().shift(10)

    prev_rsi_low = df["rsi14"].rolling(20, min_periods=10).min().shift(10)
    prev_rsi_high = df["rsi14"].rolling(20, min_periods=10).max().shift(10)

    df["rsi_bullish_divergence"] = (close < prev_low) & (df["rsi14"] > prev_rsi_low)
    df["rsi_bearish_divergence"] = (close > prev_high) & (df["rsi14"] < prev_rsi_high)

    return df
