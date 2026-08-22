from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Attendance, Employee, LeaveRequest, User

from .routes import (
    auth_routes,
    employee_routes,
    attendance_routes,
    leave_routes,
    salary_routes,
    activity_routes,
)
router = APIRouter(
    prefix="/activity",
    tags=["Activity"],
)


@router.get("/me")
def get_my_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        return {"items": []}

    if not current_user.employee_id:
        return {"items": []}

    employee = (
        db.query(Employee)
        .filter(Employee.id == current_user.employee_id)
        .first()
    )

    if not employee:
        return {"items": []}

    activities = []

    # -----------------------------
    # ATTENDANCE ACTIVITY
    # -----------------------------

    attendance_records = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == employee.id
        )
        .order_by(
            Attendance.date.desc()
        )
        .limit(10)
        .all()
    )

    for attendance in attendance_records:
        activities.append(
            {
                "type": "attendance",
                "date": attendance.date,
                "status": attendance.status,
                "work_hours": attendance.work_hours,
                "extra_hours": attendance.extra_hours,
            }
        )

    # -----------------------------
    # LEAVE ACTIVITY
    # -----------------------------

    leave_records = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == employee.id
        )
        .order_by(
            LeaveRequest.created_at.desc()
        )
        .limit(10)
        .all()
    )

    for leave in leave_records:
        activities.append(
            {
                "type": "leave",
                "id": leave.id,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "status": leave.status,
                "admin_comment": leave.admin_comment,
                "created_at": leave.created_at,
            }
        )

    # -----------------------------
    # SORT BY RECENT ACTIVITY
    # -----------------------------

    def activity_time(item):
        if item["type"] == "leave":
            return item["created_at"] or datetime.min

        if item["type"] == "attendance":
            return datetime.combine(
                item["date"],
                datetime.min.time(),
            )

        return datetime.min

    activities.sort(
        key=activity_time,
        reverse=True,
    )

    return {
        "employee": {
            "id": employee.id,
            "employee_code": employee.employee_code,
            "name": employee.name,
        },
        "items": activities[:20],
    }