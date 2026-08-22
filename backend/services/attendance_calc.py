"""Attendance calculation. Pure functions - no DB, no HTTP.

Rules (ARCHITECTURE.md §9):
  work_hours  = check_out - check_in, hours, 2dp
  extra_hours = max(0, work_hours - 8)
  status      = Present if work_hours >= 4 else Half-day
Statuses used app-wide (PDF §3.4): Present | Absent | Half-day | Leave
"""
from datetime import datetime

STANDARD_DAY_HOURS = 8
HALF_DAY_THRESHOLD = 4


def calc_attendance(check_in: datetime, check_out: datetime) -> dict:
    if check_in is None:
        raise ValueError("check_in is required")
    if check_out is None:
        # Mid-day state: checked in, not yet out.
        return {"work_hours": None, "extra_hours": None, "status": "Present"}
    if check_out <= check_in:
        raise ValueError("check_out must be after check_in")

    hours = round((check_out - check_in).total_seconds() / 3600, 2)
    return {
        "work_hours": hours,
        "extra_hours": round(max(0, hours - STANDARD_DAY_HOURS), 2),
        "status": "Present" if hours >= HALF_DAY_THRESHOLD else "Half-day",
    }


def status_for_missing_day(has_approved_leave: bool) -> str:
    """Status for a day with no check-in at all."""
    return "Leave" if has_approved_leave else "Absent"
