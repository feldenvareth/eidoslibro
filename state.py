import json
import os
from datetime import datetime, timezone, timedelta

STATE_FILE = "data/state.json"
STATE_TTL_DAYS = 30  # señales más antiguas se consideran caducadas


def _is_expired(entry: dict) -> bool:
    """Devuelve True si la señal tiene más de STATE_TTL_DAYS días."""
    try:
        updated = entry.get("updated_at", "")
        if not updated:
            return True
        dt = datetime.fromisoformat(updated.replace("Z", "+00:00"))
        return (datetime.now(timezone.utc) - dt) > timedelta(days=STATE_TTL_DAYS)
    except Exception:
        return True


def load_state():
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(STATE_FILE):
        return {}
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            raw = json.load(f)
        # Purgar entradas caducadas al cargar
        return {k: v for k, v in raw.items() if not _is_expired(v)}
    except Exception:
        # No se destruye el histórico si el JSON queda dañado: se devuelve vacío,
        # pero el archivo corrupto se conserva para revisión manual.
        return {}


def save_state(state):
    """Escritura atómica para evitar state.json corrupto si el proceso se corta."""
    os.makedirs("data", exist_ok=True)
    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, STATE_FILE)


def signal_status(state, ticker, direction, weighted_ratio):
    key = ticker
    prev = state.get(key)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    # prev puede ser None si no existía o si fue purgado por TTL
    if not prev:
        status = "Nueva"
    elif prev.get("direction") != direction:
        status = "Cambio de dirección"
    else:
        old_ratio = prev.get("weighted_ratio", 0)
        if weighted_ratio > old_ratio + 0.05:
            status = "Reforzada"
        elif weighted_ratio < old_ratio - 0.05:
            status = "Debilitada"
        else:
            status = "Repetida"
    state[key] = {"direction": direction, "weighted_ratio": weighted_ratio, "updated_at": now}
    return status
