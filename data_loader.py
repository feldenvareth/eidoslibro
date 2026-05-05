import time
import pandas as pd
import yfinance as yf
from config import YF_MAX_RETRIES, YF_BACKOFF_SECONDS


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame()
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]
    df = df.rename(columns={c: str(c).lower().replace(" ", "_") for c in df.columns})
    needed = ["open", "high", "low", "close", "volume"]
    if "adj_close" in df.columns and "close" not in df.columns:
        df["close"] = df["adj_close"]
    for col in needed:
        if col not in df.columns:
            df[col] = pd.NA
    df = df[needed].copy()
    df = df.dropna(subset=["open", "high", "low", "close"])
    df["volume"] = df["volume"].fillna(0)
    return df


def download_ohlcv(ticker: str, period: str, interval: str, logger=None) -> pd.DataFrame:
    last_error = None
    for attempt in range(1, YF_MAX_RETRIES + 1):
        try:
            df = yf.download(ticker, period=period, interval=interval, progress=False, auto_adjust=False, threads=False)
            df = _normalize_columns(df)
            if not df.empty:
                return df
            last_error = RuntimeError("datos vacíos")
        except Exception as exc:
            last_error = exc
        if logger:
            logger.warning(f"{ticker}: intento {attempt}/{YF_MAX_RETRIES} fallido para {interval}: {last_error}")
        time.sleep(YF_BACKOFF_SECONDS * attempt)
    raise RuntimeError(f"No se pudieron descargar datos de {ticker} {period}/{interval}: {last_error}")


def get_info(ticker: str) -> dict:
    try:
        return yf.Ticker(ticker).info or {}
    except Exception:
        return {}
