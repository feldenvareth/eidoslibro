from config import CAPITAL_EUR, RISK_PCT_PER_TRADE, ATR_STOP_MULTIPLIER, TP1_R_MULTIPLIER, TP2_R_MULTIPLIER, TP3_R_MULTIPLIER


def build_trade_plan(row, direction: str):
    price = float(row.close)
    atr = float(row.atr_14) if row.atr_14 == row.atr_14 and row.atr_14 > 0 else price * 0.03
    risk_per_share = atr * ATR_STOP_MULTIPLIER

    if direction == "compra":
        entry = price
        stop = price - risk_per_share
        tp1 = price + risk_per_share * TP1_R_MULTIPLIER
        tp2 = price + risk_per_share * TP2_R_MULTIPLIER
        tp3 = price + risk_per_share * TP3_R_MULTIPLIER
    else:
        entry = price
        stop = price + risk_per_share
        tp1 = price - risk_per_share * TP1_R_MULTIPLIER
        tp2 = price - risk_per_share * TP2_R_MULTIPLIER
        tp3 = price - risk_per_share * TP3_R_MULTIPLIER

    money_risk = CAPITAL_EUR * RISK_PCT_PER_TRADE
    size = int(money_risk / risk_per_share) if risk_per_share > 0 else 0
    approx_value = size * price
    if approx_value > CAPITAL_EUR:
        size = int(CAPITAL_EUR / price) if price > 0 else 0

    return {
        "precio_actual": price,
        "entrada_sugerida": entry,
        "stop_loss": stop,
        "tp1": tp1,
        "tp2": tp2,
        "tp3": tp3,
        "riesgo_por_accion": risk_per_share,
        "rr_tp1": TP1_R_MULTIPLIER,
        "tamano_aproximado": size,
    }
