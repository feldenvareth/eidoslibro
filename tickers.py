import pandas as pd
from config import CUSTOM_TICKERS, DEFAULT_SECTOR_ETF, IBEX_DEFAULT_SECTOR_ETF

IBEX35_TICKERS = [
    "ANA.MC", "ACX.MC", "ACS.MC", "AENA.MC", "AMS.MC", "MTS.MC", "SAB.MC",
    "SAN.MC", "BKT.MC", "BBVA.MC", "CABK.MC", "CLNX.MC", "ENG.MC", "ELE.MC",
    "FER.MC", "FDR.MC", "GRF.MC", "IAG.MC", "IBE.MC", "ITX.MC", "IDR.MC",
    "MAP.MC", "MEL.MC", "MRL.MC", "NTGY.MC", "RED.MC", "REP.MC", "ROVI.MC",
    "SCYR.MC", "SLR.MC", "TEF.MC", "UNI.MC", "LOG.MC", "COL.MC", "ANE.MC"
]

NASDAQ100_FALLBACK = [
    "AAPL", "MSFT", "NVDA", "AMZN", "META", "AVGO", "GOOGL", "GOOG", "TSLA", "COST",
    "NFLX", "AMD", "PEP", "ADBE", "CSCO", "TMUS", "INTU", "QCOM", "AMAT", "TXN",
    "AMGN", "ISRG", "BKNG", "HON", "LRCX", "VRTX", "MU", "PANW", "ADP", "GILD",
    "SBUX", "MELI", "ADI", "KLAC", "MDLZ", "REGN", "INTC", "CRWD", "CDNS", "SNPS",
    "MAR", "CEG", "ORLY", "PYPL", "NXPI", "ROP", "ABNB", "MNST", "CHTR", "AEP",
    "WDAY", "MRVL", "KDP", "FTNT", "DASH", "TEAM", "KHC", "PCAR", "ODFL", "ADSK",
    "ROST", "PAYX", "CPRT", "DDOG", "EA", "EXC", "CTAS", "FAST", "VRSK",
    "XEL", "BKR", "CSGP", "GEHC", "CCEP", "TTWO", "ZS", "IDXX", "MCHP", "ON",
    "BIIB", "CDW", "DXCM", "MDB", "ILMN", "MRNA", "WBD", "GFS", "ARM", "LIN",
    "SMCI", "TTD", "NTRA", "COIN", "PLTR",
]

# Mapa sectorial aproximado. No pretende ser perfecto, pero permite comparar ticker/sector.
NASDAQ_SECTOR_ETF = {
    # Tecnología / semiconductores / software
    "AAPL": "XLK", "MSFT": "XLK", "NVDA": "SMH", "AVGO": "SMH", "AMD": "SMH", "QCOM": "SMH",
    "AMAT": "SMH", "TXN": "SMH", "LRCX": "SMH", "MU": "SMH", "ADI": "SMH", "KLAC": "SMH",
    "INTC": "SMH", "MRVL": "SMH", "NXPI": "SMH", "MCHP": "SMH", "ON": "SMH", "GFS": "SMH",
    "ADBE": "XLK", "INTU": "XLK", "CDNS": "XLK", "SNPS": "XLK", "ADSK": "XLK", "DDOG": "XLK",
    "TEAM": "XLK", "FTNT": "XLK", "CRWD": "XLK", "ZS": "XLK", "PANW": "XLK", "MDB": "XLK",
    # Comunicación / internet
    "META": "XLC", "GOOGL": "XLC", "GOOG": "XLC", "NFLX": "XLC", "TMUS": "XLC", "CHTR": "XLC", "WBD": "XLC",
    # Consumo discrecional
    "AMZN": "XLY", "TSLA": "XLY", "BKNG": "XLY", "SBUX": "XLY", "MELI": "XLY", "MAR": "XLY", "ORLY": "XLY", "ABNB": "XLY", "DASH": "XLY", "ROST": "XLY",
    # Consumo básico
    "COST": "XLP", "PEP": "XLP", "MDLZ": "XLP", "MNST": "XLP", "KDP": "XLP", "KHC": "XLP", "CCEP": "XLP",
    # Salud
    "AMGN": "XLV", "ISRG": "XLV", "VRTX": "XLV", "GILD": "XLV", "REGN": "XLV", "IDXX": "XLV", "BIIB": "XLV", "DXCM": "XLV", "ILMN": "XLV", "MRNA": "XLV", "GEHC": "XLV",
    # Industriales / utilities / energía
    "HON": "XLI", "ADP": "XLI", "ROP": "XLI", "PCAR": "XLI", "ODFL": "XLI", "CTAS": "XLI", "FAST": "XLI", "CPRT": "XLI", "VRSK": "XLI", "CDW": "XLI",
    "AEP": "XLU", "EXC": "XLU", "XEL": "XLU", "CEG": "XLU",
    "BKR": "XLE",
    # Finanzas / pagos
    "PYPL": "XLF", "COIN": "XLF",
    # Nuevos miembros recientes
    "SMCI": "SMH", "TTD": "XLK", "NTRA": "XLV", "PLTR": "XLK",
}

IBEX_SECTOR_ETF = {
    "SAN.MC": "EXX1.DE", "BBVA.MC": "EXX1.DE", "CABK.MC": "EXX1.DE", "SAB.MC": "EXX1.DE", "BKT.MC": "EXX1.DE", "MAP.MC": "EXH1.DE",
    "IBE.MC": "EXH9.DE", "ELE.MC": "EXH9.DE", "ENG.MC": "EXH9.DE", "RED.MC": "EXH9.DE", "NTGY.MC": "EXH9.DE",
    "REP.MC": "EXH1.DE", "MTS.MC": "EXV6.DE", "ACX.MC": "EXV6.DE", "ANA.MC": "EXV6.DE",
    "ITX.MC": "EXH8.DE", "MEL.MC": "EXH8.DE", "IAG.MC": "EXV5.DE", "AENA.MC": "EXV5.DE",
    "TEF.MC": "EXV2.DE", "CLNX.MC": "EXV2.DE",
    "GRF.MC": "EXV4.DE", "ROVI.MC": "EXV4.DE",
    "ACS.MC": "EXV5.DE", "FER.MC": "EXV5.DE", "SCYR.MC": "EXV5.DE",
}

def get_nasdaq100_tickers():
    try:
        tables = pd.read_html("https://en.wikipedia.org/wiki/Nasdaq-100")
        for table in tables:
            if "Ticker" in table.columns:
                return sorted(set(str(x).strip().replace(".", "-") for x in table["Ticker"].dropna()))
            if "Symbol" in table.columns:
                return sorted(set(str(x).strip().replace(".", "-") for x in table["Symbol"].dropna()))
    except Exception:
        pass
    return NASDAQ100_FALLBACK

def get_tickers(market: str):
    market = (market or "ALL").upper()
    if market == "IBEX35":
        return IBEX35_TICKERS
    if market == "NASDAQ100":
        return get_nasdaq100_tickers()
    if market == "CUSTOM":
        return CUSTOM_TICKERS
    return IBEX35_TICKERS + get_nasdaq100_tickers() + CUSTOM_TICKERS

def get_sector_etf(ticker: str) -> str:
    if ticker.endswith(".MC"):
        return IBEX_SECTOR_ETF.get(ticker, IBEX_DEFAULT_SECTOR_ETF)
    return NASDAQ_SECTOR_ETF.get(ticker.replace("-", "."), DEFAULT_SECTOR_ETF)
