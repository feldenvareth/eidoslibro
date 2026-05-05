def pct(x):
    return f"{x*100:.1f}%"

def money(x):
    try:
        return f"{float(x):.2f}"
    except Exception:
        return "N/D"

BLOCK_NAMES = {
    "tendencia_diaria": "Tendencia diaria",
    "estructura_mercado": "Estructura de mercado",
    "estructura_precio": "Estructura de precio",
    "momentum": "Momentum",
    "osciladores": "Osciladores / agotamiento",
    "volumen_institucional": "Volumen institucional",
    "flujo_dinero": "Flujo de dinero",
    "volatilidad": "Volatilidad / régimen",
    "confirmacion_1h": "Confirmación 1h",
    "mercado_general": "Mercado general",
    "contexto_sector": "Contexto sectorial",
    "calidad_historica": "Calidad histórica",
    "fundamentales_canslim": "Fundamentales / CAN SLIM",
}


def _group_items(blocks, state):
    lines = []
    for block, items in blocks.items():
        selected = [text for text, s in items if s == state]
        if not selected:
            continue
        lines.append(f"\n{BLOCK_NAMES.get(block, block)}:")
        for text in selected:
            lines.append(f"- {text}")
    return "\n".join(lines).strip() or "- N/D"


def build_signal_report(ticker, evaluation, trade_plan, fundamentals, canslim, backtest, status, accuracy_badge: str = ""):
    title_icon = "📈" if evaluation.direction == "compra" else "📉"
    title = evaluation.signal_type or ("SEÑAL DE COMPRA" if evaluation.direction == "compra" else "SEÑAL DE VENTA")
    reliability = "N/D" if backtest.reliability is None else f"{backtest.reliability*100:.1f}%"
    profit_factor = "N/D" if getattr(backtest, "profit_factor", None) is None else f"{backtest.profit_factor:.2f}"
    avg_gain = "N/D" if getattr(backtest, "avg_gain_pct", None) is None else f"{backtest.avg_gain_pct*100:.2f}%"
    avg_loss = "N/D" if getattr(backtest, "avg_loss_pct", None) is None else f"{backtest.avg_loss_pct*100:.2f}%"
    confluence_reading = "Alta" if evaluation.raw_ratio >= 0.78 else "Media-alta" if evaluation.raw_ratio >= 0.70 else "Vigilancia"

    fav = _group_items(evaluation.blocks, "favor")
    neu = _group_items(evaluation.blocks, "neutral")
    con = _group_items(evaluation.blocks, "contra")

    badge_block = f"{accuracy_badge}\n" if accuracy_badge else ""
    report = f"""{badge_block}{title_icon} {title}

Valor: {ticker}
Ticker: {ticker}
Yahoo Finance: https://finance.yahoo.com/quote/{ticker}/
Estado de la señal: {status}
Horizonte: Swing 1-3 meses

📊 Resumen ejecutivo técnico
Indicadores analizados: {evaluation.total}
Indicadores a favor de esta señal: {evaluation.favor}
Indicadores neutros o dudosos: {evaluation.neutral}
Indicadores en contra: {evaluation.against}
Confluencia simple: {pct(evaluation.raw_ratio)}
Confluencia ponderada: {pct(evaluation.weighted_ratio)}
Lectura técnica: {confluence_reading} confluencia para {"compra" if evaluation.direction == "compra" else "venta"}
Sesgo diario: {evaluation.daily_bias or "no claro"}
Confirmación 1h: {"sí" if evaluation.hourly_confirmation else "no"}
Contexto de mercado: {evaluation.market_context}
Contexto sectorial: {evaluation.sector_context}

🧪 Validación histórica aproximada 6 meses
Configuraciones similares detectadas: {backtest.cases}
Veces que evolucionó a favor: {backtest.favorable}
Fiabilidad observada: {reliability}
Profit factor: {profit_factor}
Ganancia media favorable: {avg_gain}
Pérdida media desfavorable: {avg_loss}
Lectura histórica: {backtest.reading}
Nota: backtest orientativo sobre diario; la confirmación 1h actual mejora el timing, pero no se replica íntegramente en el histórico. En V14 PRO se añade profit factor y bloque de calidad histórica.

🎯 Plan operativo
Precio actual: {money(trade_plan.get('precio_actual'))}
Entrada sugerida: {money(trade_plan.get('entrada_sugerida'))}
Stop loss: {money(trade_plan.get('stop_loss'))}
TP1: {money(trade_plan.get('tp1'))}
TP2: {money(trade_plan.get('tp2'))}
TP3: {money(trade_plan.get('tp3'))}
Riesgo por acción: {money(trade_plan.get('riesgo_por_accion'))}
R/R TP1: {trade_plan.get('rr_tp1')}
Tamaño aproximado: {trade_plan.get('tamano_aproximado')} acciones

✅ Indicadores que apoyan la señal
{fav}

⚠️ Indicadores neutros o dudosos
{neu}

❌ Indicadores en contra
{con}

💰 Valoración / fundamentales
Yahoo Finance: https://finance.yahoo.com/quote/{ticker}/
Capitalización bursátil: {fundamentals.get('capitalizacion')}
Valor empresa: {fundamentals.get('valor_empresa')}
Acciones estimadas: {fundamentals.get('acciones_estimadas')}
Precio actual usado: {fundamentals.get('precio_actual_usado')}
Valor contable por acción: {fundamentals.get('valor_contable_por_accion')}
Precio / valor contable: {fundamentals.get('precio_valor_contable')}
PER actual: {fundamentals.get('per_actual')}
PER futuro: {fundamentals.get('per_futuro')}
EBITDA: {fundamentals.get('ebitda')}
EV / EBITDA: {fundamentals.get('ev_ebitda')}
Precio objetivo medio: {fundamentals.get('precio_objetivo_medio')}
Precio objetivo mediano: {fundamentals.get('precio_objetivo_mediano')}
Potencial objetivo: {fundamentals.get('potencial_objetivo')}
Rango objetivo: {fundamentals.get('rango_objetivo')}
Recomendación Yahoo: {fundamentals.get('recomendacion_yahoo')}
N.º analistas: {fundamentals.get('num_analistas')}
Lectura: datos fundamentales orientativos, no sustituyen análisis propio.
Nota: si Yahoo no ofrece un dato aparece como N/D.

🏗️ Bloques PRO añadidos
- Estructura de mercado: HH/HL, LH/LL, BOS y retesteo.
- Volumen institucional: VWAP diario rolling, Volume Profile aproximado y acumulación/distribución.
- Contexto sectorial: comparación del valor frente a ETF/proxy sectorial.
- Calidad histórica: fiabilidad + profit factor.

📘 Método CAN SLIM
Recomendación: {canslim.get('recommendation')}
Score CAN SLIM: {canslim.get('score')}
N: {canslim.get('n_status')}
"""
    return report


def build_daily_summary(market, expected, analyzed, skipped, signals, watchlist):
    lines = [
        f"📊 RESUMEN FINAL DEL DÍA",
        "",
        f"Mercado analizado: {market}",
        f"Valores previstos: {expected}",
        f"Valores analizados correctamente: {analyzed}",
        f"Valores omitidos: {skipped}",
        f"Señales operativas: {len(signals)}",
        f"Valores en vigilancia/ranking: {len(watchlist)}",
        "",
    ]
    if signals:
        lines.append("✅ Señales operativas:")
        for s in signals[:15]:
            lines.append(f"- {s['ticker']}: {s['tipo']} | confluencia {s['confluencia']} | histórico {s['historico']} | PF {s.get('profit_factor', 'N/D')}")
    else:
        lines.append("✅ Señales operativas: 0")
        lines.append("Lectura: no se detectaron oportunidades con suficiente confluencia hoy.")
    if watchlist:
        lines.append("\n👀 Vigilancia:")
        for s in watchlist[:15]:
            lines.append(f"- {s['ticker']}: {s['tipo']} | confluencia {s['confluencia']}")
    return "\n".join(lines)
