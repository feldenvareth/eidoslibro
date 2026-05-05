from data_loader import get_info


def _fmt(v):
    if v is None or v == "":
        return "N/D"
    if isinstance(v, (int, float)):
        if abs(v) >= 1_000_000_000:
            return f"{v/1_000_000_000:.2f} B"
        if abs(v) >= 1_000_000:
            return f"{v/1_000_000:.2f} M"
        return f"{v:.2f}"
    return str(v)


def get_fundamentals(ticker: str, price_used: float | None = None):
    info = get_info(ticker)
    current = price_used or info.get("currentPrice") or info.get("regularMarketPrice")
    target = info.get("targetMeanPrice")
    potential = None
    try:
        if current and target:
            potential = (target - current) / current * 100
    except Exception:
        potential = None
    return {
        "capitalizacion": _fmt(info.get("marketCap")),
        "valor_empresa": _fmt(info.get("enterpriseValue")),
        "acciones_estimadas": _fmt(info.get("sharesOutstanding")),
        "precio_actual_usado": _fmt(current),
        "valor_contable_por_accion": _fmt(info.get("bookValue")),
        "precio_valor_contable": _fmt(info.get("priceToBook")),
        "per_actual": _fmt(info.get("trailingPE")),
        "per_futuro": _fmt(info.get("forwardPE")),
        "ebitda": _fmt(info.get("ebitda")),
        "ev_ebitda": _fmt(info.get("enterpriseToEbitda")),
        "precio_objetivo_medio": _fmt(target),
        "precio_objetivo_mediano": _fmt(info.get("targetMedianPrice")),
        "potencial_objetivo": "N/D" if potential is None else f"{potential:.2f}%",
        "rango_objetivo": f"{_fmt(info.get('targetLowPrice'))} - {_fmt(info.get('targetHighPrice'))}",
        "recomendacion_yahoo": _fmt(info.get("recommendationKey")),
        "num_analistas": _fmt(info.get("numberOfAnalystOpinions")),
        "raw": info,
    }
