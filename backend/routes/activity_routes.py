from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_hr
from ..database import get_db
from ..models import Attendance, Employee, LeaveRequest, User


router = APIRouter(
    prefix="/activity",
    tags=["Activity"],
)


# =========================================================
# EMPLOYEE — MY ACTIVITY
# =========================================================

@router.get("/me")
def get_my_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403,
            detail="Employee access required",
        )

    if not current_user.employee_id:
        raise HTTPException(
            status_code=400,
            detail="Employee profile not linked",
        )

    activities = []

    # -------------------------
    # Leave activities
    # -------------------------
    leaves = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == current_user.employee_id
        )
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    for leave in leaves:
        activities.append(
            {
                "type": "leave",
                "title": f"{leave.leave_type} leave request",
                "description": (
                    f"{leave.start_date} to {leave.end_date}"
                ),
                "status": leave.status,
                "comment": leave.admin_comment,
                "date": leave.created_at,
            }
        )

    # -------------------------
    # Attendance activities
    # -------------------------
    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id
        )
        .order_by(Attendance.date.desc())
        .all()
    )

    for record in attendance:
        activities.append(
            {
                "type": "attendance",
                "title": "Attendance",
                "description": f"Attendance for {record.date}",
                "status": record.status,
                "check_in": record.check_in,
                "check_out": record.check_out,
                "work_hours": record.work_hours,
                "extra_hours": record.extra_hours,
                "date": record.date,
            }
        )

    # Latest activity first
    activities.sort(
        key=lambda x: str(x.get("date") or ""),
        reverse=True,
    )

    return {
        "items": activities
    }


# =========================================================
# HR — VIEW ALL ACTIVITIES
# =========================================================

@router.get("/")
def get_all_activity(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    activities = []

    # -------------------------
    # Leave activities
    # -------------------------
    leaves = (
        db.query(LeaveRequest)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    for leave in leaves:
        employee = (
            db.query(Employee)
            .filter(Employee.id == leave.employee_id)
            .first()
        )

        activities.append(
            {
                "type": "leave",
                "employee_id": leave.employee_id,
                "employee_code": (
                    employee.employee_code
                    if employee
                    else None
                ),
                "employee_name": (
                    employee.name
                    if employee
                    else None
                ),
                "title": f"{leave.leave_type} leave request",
                "description": (
                    f"{leave.start_date} to {leave.end_date}"
                ),
                "status": leave.status,
                "comment": leave.admin_comment,
                "date": leave.created_at,
            }
        )

    # -------------------------
    # Attendance activities
    # -------------------------
    attendance = (
        db.query(Attendance)
        .order_by(Attendance.date.desc())
        .all()
    )

    for record in attendance:
        employee = (
            db.query(Employee)
            .filter(Employee.id == record.employee_id)
            .first()
        )

        activities.append(
            {
                "type": "attendance",
                "employee_id": record.employee_id,
                "employee_code": (
                    employee.employee_code
                    if employee
                    else None
                ),
                "employee_name": (
                    employee.name
                    if employee
                    else None
                ),
                "title": "Attendance",
                "description": (
                    f"Attendance for {record.date}"
                ),
                "status": record.status,
                "check_in": record.check_in,
                "check_out": record.check_out,
                "work_hours": record.work_hours,
                "extra_hours": record.extra_hours,
                "date": record.date,
            }
        )

    activities.sort(
        key=lambda x: str(x.get("date") or ""),
        reverse=True,
    )

    return {
        "items": activities
    }
