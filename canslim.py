def evaluate_canslim(fundamentals: dict, signal_eval=None, benchmark_context: str = "neutral"):
    info = fundamentals.get("raw", {}) if fundamentals else {}
    checks = []

    q_growth = info.get("earningsQuarterlyGrowth") or info.get("quarterlyEarningsGrowth")
    checks.append(("C", "Crecimiento trimestral de beneficios", q_growth is not None and q_growth > 0))

    annual = info.get("earningsGrowth") or info.get("revenueGrowth")
    checks.append(("A", "Crecimiento anual / ingresos", annual is not None and annual > 0))

    # N no se incluye en denominador si no hay API de noticias.
    n_status = "No evaluado sin API de noticias"

    s_ok = False
    if signal_eval:
        # El bloque se llama "volumen_institucional", no "volumen"
        vol_items = signal_eval.blocks.get("volumen_institucional", []) + signal_eval.blocks.get("flujo_dinero", [])
        s_ok = sum(1 for _, s in vol_items if s == "favor") >= 3
    checks.append(("S", "Oferta/demanda por volumen, OBV y MFI", s_ok))

    l_ok = signal_eval.weighted_ratio >= 0.70 if signal_eval else False
    checks.append(("L", "Liderazgo técnico relativo aproximado", l_ok))

    inst = info.get("heldPercentInstitutions")
    checks.append(("I", "Participación institucional", inst is not None and inst > 0.25))

    m_ok = benchmark_context == "alcista"
    checks.append(("M", "Mercado general favorable", m_ok))

    passed = sum(1 for _, _, ok in checks if ok)
    total = len(checks)
    if passed >= 5:
        rec = "RECOMENDADO"
    elif passed >= 3:
        rec = "RECOMENDADO CON CAUTELA"
    else:
        rec = "NO RECOMENDADO"
    return {"recommendation": rec, "score": f"{passed}/{total}", "checks": checks, "n_status": n_status}
