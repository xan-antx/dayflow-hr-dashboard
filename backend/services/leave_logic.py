"""Leave lifecycle logic. Pure functions - no DB, no HTTP.

Types (PDF §3.5): Paid | Sick | Unpaid.  Paid/Sick draw from a balance,
Unpaid does not. balances dict shape: {"paid": float, "sick": float}.
"""
from datetime import date

LEAVE_TYPES = ("Paid", "Sick", "Unpaid")
_BALANCE_KEY = {"Paid": "paid", "Sick": "sick"}


def days_requested(start_date: date, end_date: date) -> int:
    """Inclusive day count. Raises on invalid range."""
    if end_date < start_date:
        raise ValueError("end_date cannot be before start_date")
    return (end_date - start_date).days + 1


def validate_request(leave_type: str, start_date: date, end_date: date,
                     balances: dict) -> dict:
    """-> {"ok": True, "days": n} or {"ok": False, "error": msg}"""
    if leave_type not in LEAVE_TYPES:
        return {"ok": False, "error": f"invalid leave type: {leave_type}"}
    try:
        days = days_requested(start_date, end_date)
    except ValueError as e:
        return {"ok": False, "error": str(e)}
    key = _BALANCE_KEY.get(leave_type)
    if key and balances.get(key, 0) < days:
        return {"ok": False,
                "error": f"insufficient {leave_type.lower()} leave balance "
                         f"({balances.get(key, 0)} left, {days} requested)"}
    return {"ok": True, "days": days}


def apply_approval(leave_type: str, days: int, balances: dict) -> dict:
    """New balances after HR approval. Unpaid deducts nothing."""
    new = dict(balances)
    key = _BALANCE_KEY.get(leave_type)
    if key:
        if new.get(key, 0) < days:
            raise ValueError("insufficient balance at approval time")
        new[key] = new[key] - days
    return new
