import os
import time
import requests
from config import TELEGRAM_PARSE_MODE

MAX_TELEGRAM_LEN = 3900
TELEGRAM_MAX_RETRIES = 4


def _post_with_retry(url: str, payload: dict, logger=None) -> bool:
    for attempt in range(1, TELEGRAM_MAX_RETRIES + 1):
        try:
            r = requests.post(url, json=payload, timeout=20)
            if r.ok:
                return True

            # Telegram puede devolver 429 con retry_after en JSON.
            retry_after = None
            if r.status_code == 429:
                try:
                    retry_after = int((r.json().get("parameters") or {}).get("retry_after", 0))
                except Exception:
                    retry_after = None

            if logger:
                logger.error(f"Telegram error {r.status_code} intento {attempt}/{TELEGRAM_MAX_RETRIES}: {r.text}")

            if attempt < TELEGRAM_MAX_RETRIES:
                wait = retry_after if retry_after else min(2 * attempt, 10)
                time.sleep(wait)
        except Exception as exc:
            if logger:
                logger.error(f"Telegram exception intento {attempt}/{TELEGRAM_MAX_RETRIES}: {exc}")
            if attempt < TELEGRAM_MAX_RETRIES:
                time.sleep(min(2 * attempt, 10))
    return False


def send_telegram(message: str, logger=None):
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        if logger:
            logger.warning("Telegram no configurado: faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    parts = [message[i:i+MAX_TELEGRAM_LEN] for i in range(0, len(message), MAX_TELEGRAM_LEN)] or [message]
    ok_all = True
    for part in parts:
        payload = {"chat_id": chat_id, "text": part, "disable_web_page_preview": True}
        if TELEGRAM_PARSE_MODE:
            payload["parse_mode"] = TELEGRAM_PARSE_MODE
        if not _post_with_retry(url, payload, logger):
            ok_all = False
    return ok_all
