# Stock Alert Bot V15 PRO

Sistema automático de alertas bursátiles por Telegram para GitHub Actions.

## Qué hace

- Analiza IBEX 35, Nasdaq-100 o tickers personalizados.
- Usa horizonte swing de 1 a 3 meses.
- Separa sesgo diario y confirmación 1h.
- Genera fichas por valor con señal de compra o señal de venta.
- Agrupa indicadores en favor, neutros y en contra.
- Envía resumen final del día aunque no haya señales.
- Guarda CSVs en `data/` y logs en `logs/`.

## Bloques V14 PRO

1. Tendencia diaria: EMA20 slope, precio vs EMA50, EMA20 vs EMA50.
2. Estructura de mercado: HH/HL, LH/LL, BOS, retesteo y Donchian.
3. Momentum: MACD, histograma MACD, ROC 10, ADX + DI.
4. Osciladores: RSI, divergencia RSI, CCI, Estocástico, Williams %R.
5. Volumen institucional: VWAP diario rolling, Volume Profile aproximado y acumulación/distribución.
6. Flujo de dinero: OBV, MFI, Chaikin Money Flow y ADL.
7. Volatilidad: BB width percentil, ATR ratio y compresión/expansión.
8. Confirmación 1h: EMA20, MACD, Heikin Ashi y VWAP 1h.
9. Contexto mercado/sector: benchmark y ETF sectorial aproximado.
10. Calidad histórica: fiabilidad, profit factor y muestra disponible.

## Secrets necesarios

En GitHub:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Ejecución manual

GitHub → Actions → Run workflow → MARKET:

- `ALL`
- `IBEX35`
- `NASDAQ100`
- `CUSTOM`

## Aviso

Este sistema es una herramienta de análisis técnico automatizado. No constituye asesoramiento financiero. Los datos proceden de Yahoo Finance vía `yfinance` y pueden fallar o estar retrasados.
