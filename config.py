# Configuración principal del bot de alertas de bolsa V14 PRO

# Horizonte operativo: swing medio, aproximadamente 1 a 3 meses.
TIME_HORIZON_LABEL = "Swing 1-3 meses"

# Descarga de datos. No usamos 2 años porque el modelo no es de largo plazo.
DAILY_PERIOD = "6mo"
DAILY_INTERVAL = "1d"
HOURLY_PERIOD = "60d"
HOURLY_INTERVAL = "1h"
BACKTEST_PERIOD = "9mo"
BACKTEST_LOOKAHEAD_DAYS = 20

# Umbrales
MIN_DAILY_ROWS = 55
MIN_HOURLY_ROWS = 80
MIN_CONFLUENCE_RATIO = 0.72
MIN_WEIGHTED_RATIO = 0.70
WATCHLIST_RATIO = 0.62
MIN_BACKTEST_CASES = 5
PREFERRED_BACKTEST_RELIABILITY = 0.65
PREFERRED_PROFIT_FACTOR = 1.30
MIN_PRO_BACKTEST_CASES = 8
BLOCK_WEAK_HISTORY = True  # si hay muestra suficiente e histórico débil, baja señal a vigilancia

# Gestión del riesgo
CAPITAL_EUR = 10_000
RISK_PCT_PER_TRADE = 0.01
ATR_STOP_MULTIPLIER = 1.8
TP1_R_MULTIPLIER = 1.5
TP2_R_MULTIPLIER = 2.5
TP3_R_MULTIPLIER = 3.5

# Tickers personalizados. Ejemplo: ["AAPL", "MSFT", "SAN.MC"]
CUSTOM_TICKERS = []

# Pesos por bloque. No todos los indicadores valen lo mismo.
BLOCK_WEIGHTS = {
    "tendencia_diaria": 1.30,
    "estructura_mercado": 1.35,
    "momentum": 1.05,
    "osciladores": 0.85,
    "volumen_institucional": 1.25,
    "flujo_dinero": 1.15,
    "volatilidad": 1.05,
    "confirmacion_1h": 1.25,
    "mercado_general": 1.15,
    "contexto_sector": 1.10,
    "fundamentales_canslim": 0.70,
    "calidad_historica": 1.20,
}

# Ejecución
MAX_WORKERS = 5

# yfinance
YF_MAX_RETRIES = 3
YF_BACKOFF_SECONDS = 3

# Telegram
TELEGRAM_PARSE_MODE = None

# Benchmarks
BENCHMARKS = {
    "IBEX35": "^IBEX",
    "NASDAQ100": "QQQ",
    "CUSTOM": "SPY",
    "ALL": "SPY",
}

# ETFs sectoriales aproximados disponibles en Yahoo.
# Para Nasdaq usamos SPDR sectoriales USA. Para IBEX usamos proxies europeos cuando hay equivalentes líquidos.
DEFAULT_SECTOR_ETF = "SPY"
IBEX_DEFAULT_SECTOR_ETF = "EXV1.DE"  # proxy europeo amplio financiero/blue-chip si no hay sector claro
