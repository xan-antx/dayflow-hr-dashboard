from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_hr
from ..database import get_db
from ..models import Attendance, User, Employee
from ..services.attendance_calc import calc_attendance


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


# ---------------------------------------------------------
# EMPLOYEE: CHECK IN
# ---------------------------------------------------------

@router.post("/check-in", status_code=status.HTTP_201_CREATED)
def check_in(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403,
            detail="Only employees can check in",
        )

    if not current_user.employee_id:
        raise HTTPException(
            status_code=400,
            detail="Employee profile not linked",
        )

    today = date.today()

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id,
            Attendance.date == today,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already checked in today",
        )

    now = datetime.now()

    attendance = Attendance(
        employee_id=current_user.employee_id,
        date=today,
        check_in=now,
        check_out=None,
        work_hours=None,
        extra_hours=None,
        status="Present",
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return {
        "message": "Check-in recorded successfully",
        "attendance": {
            "id": attendance.id,
            "employee_id": attendance.employee_id,
            "date": attendance.date,
            "check_in": attendance.check_in,
            "check_out": attendance.check_out,
            "work_hours": attendance.work_hours,
            "extra_hours": attendance.extra_hours,
            "status": attendance.status,
        },
    }


# ---------------------------------------------------------
# EMPLOYEE: CHECK OUT
# ---------------------------------------------------------

@router.post("/check-out")
def check_out(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403,
            detail="Only employees can check out",
        )

    if not current_user.employee_id:
        raise HTTPException(
            status_code=400,
            detail="Employee profile not linked",
        )

    today = date.today()

    attendance = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id,
            Attendance.date == today,
        )
        .first()
    )

    if not attendance:
        raise HTTPException(
            status_code=400,
            detail="Check-in required before check-out",
        )

    if attendance.check_out:
        raise HTTPException(
            status_code=400,
            detail="Already checked out today",
        )

    now = datetime.now()

    result = calc_attendance(
        attendance.check_in,
        now,
    )

    attendance.check_out = now
    attendance.work_hours = result["work_hours"]
    attendance.extra_hours = result["extra_hours"]
    attendance.status = result["status"]

    db.commit()
    db.refresh(attendance)

    return {
        "message": "Check-out recorded successfully",
        "attendance": {
            "id": attendance.id,
            "employee_id": attendance.employee_id,
            "date": attendance.date,
            "check_in": attendance.check_in,
            "check_out": attendance.check_out,
            "work_hours": attendance.work_hours,
            "extra_hours": attendance.extra_hours,
            "status": attendance.status,
        },
    }


# ---------------------------------------------------------
# EMPLOYEE: OWN ATTENDANCE
# ---------------------------------------------------------

@router.get("/me")
def get_my_attendance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403,
            detail="Employee access required",
        )

    records = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_user.employee_id
        )
        .order_by(Attendance.date.desc())
        .all()
    )

    return {
        "items": [
            {
                "id": record.id,
                "date": record.date,
                "check_in": record.check_in,
                "check_out": record.check_out,
                "work_hours": record.work_hours,
                "extra_hours": record.extra_hours,
                "status": record.status,
            }
            for record in records
        ]
    }


# ---------------------------------------------------------
# HR: ALL ATTENDANCE
# ---------------------------------------------------------

@router.get("/")
def get_all_attendance(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    records = (
        db.query(Attendance)
        .order_by(Attendance.date.desc())
        .all()
    )

    result = []

    for record in records:
        employee = (
            db.query(Employee)
            .filter(Employee.id == record.employee_id)
            .first()
        )

        result.append(
            {
                "employee_id": employee.employee_code if employee else None,
                "employee_name": employee.name if employee else None,
                "date": record.date,
                "check_in": record.check_in,
                "check_out": record.check_out,
                "work_hours": record.work_hours,
                "extra_hours": record.extra_hours,
                "status": record.status,
            }
        )

    return {
        "items": result
    }