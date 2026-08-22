from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_hr
from ..database import get_db
from ..models import Employee, LeaveRequest, User


router = APIRouter(
    prefix="/leaves",
    tags=["Leave Management"],
)


# =========================================================
# EMPLOYEE — APPLY FOR LEAVE
# =========================================================

@router.post("/", status_code=status.HTTP_201_CREATED)
def apply_leave(
    leave_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403,
            detail="Only employees can apply for leave",
        )

    if not current_user.employee_id:
        raise HTTPException(
            status_code=400,
            detail="Employee profile not linked",
        )

    leave_type = leave_data.get("leave_type")
    start_date = leave_data.get("start_date")
    end_date = leave_data.get("end_date")
    remarks = leave_data.get("remarks")

    if not leave_type or not start_date or not end_date:
        raise HTTPException(
            status_code=400,
            detail="leave_type, start_date and end_date are required",
        )

    if leave_type not in ["Paid", "Sick"]:
        raise HTTPException(
            status_code=400,
            detail="leave_type must be Paid or Sick",
        )

    try:
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Dates must be in YYYY-MM-DD format",
        )

    if end < start:
        raise HTTPException(
            status_code=400,
            detail="end_date cannot be before start_date",
        )

    leave_days = (end - start).days + 1

    employee = (
        db.query(Employee)
        .filter(Employee.id == current_user.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    if leave_type == "Paid":
        if employee.paid_leave_balance < leave_days:
            raise HTTPException(
                status_code=400,
                detail="Insufficient paid leave balance",
            )

    if leave_type == "Sick":
        if employee.sick_leave_balance < leave_days:
            raise HTTPException(
                status_code=400,
                detail="Insufficient sick leave balance",
            )

    leave_request = LeaveRequest(
        employee_id=current_user.employee_id,
        leave_type=leave_type,
        start_date=start,
        end_date=end,
        remarks=remarks,
        status="Pending",
    )

    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)

    return {
        "message": "Leave request submitted successfully",
        "leave_id": leave_request.id,
        "leave_type": leave_request.leave_type,
        "start_date": leave_request.start_date,
        "end_date": leave_request.end_date,
        "status": leave_request.status,
    }


# =========================================================
# EMPLOYEE — VIEW OWN LEAVES
# =========================================================

@router.get("/me")
def get_my_leaves(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403,
            detail="Employee access required",
        )

    leaves = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == current_user.employee_id
        )
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    return {
        "items": [
            {
                "id": leave.id,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "remarks": leave.remarks,
                "status": leave.status,
                "admin_comment": leave.admin_comment,
                "created_at": leave.created_at,
            }
            for leave in leaves
        ]
    }


# =========================================================
# HR — VIEW ALL LEAVES
# =========================================================

@router.get("/")
def get_all_leaves(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    leaves = (
        db.query(LeaveRequest)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    result = []

    for leave in leaves:
        employee = (
            db.query(Employee)
            .filter(Employee.id == leave.employee_id)
            .first()
        )

        result.append(
            {
                "id": leave.id,
                "employee_id": employee.employee_code
                if employee
                else None,
                "employee_name": employee.name
                if employee
                else None,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "remarks": leave.remarks,
                "status": leave.status,
                "admin_comment": leave.admin_comment,
                "created_at": leave.created_at,
            }
        )

    return {
        "items": result
    }


# =========================================================
# HR — APPROVE / REJECT LEAVE
# =========================================================

@router.patch("/{leave_id}")
def update_leave_status(
    leave_id: int,
    leave_data: dict,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    leave = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.id == leave_id)
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found",
        )

    new_status = leave_data.get("status")
    admin_comment = leave_data.get("admin_comment")

    if new_status not in ["Approved", "Rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be Approved or Rejected",
        )

    if leave.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending leave requests can be updated",
        )

    employee = (
        db.query(Employee)
        .filter(Employee.id == leave.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    leave_days = (
        leave.end_date - leave.start_date
    ).days + 1

    if new_status == "Approved":

        if leave.leave_type == "Paid":

            if employee.paid_leave_balance < leave_days:
                raise HTTPException(
                    status_code=400,
                    detail="Insufficient paid leave balance",
                )

            employee.paid_leave_balance -= leave_days

        elif leave.leave_type == "Sick":

            if employee.sick_leave_balance < leave_days:
                raise HTTPException(
                    status_code=400,
                    detail="Insufficient sick leave balance",
                )

    leave.status = new_status
    leave.admin_comment = admin_comment

    db.commit()
    db.refresh(leave)

    return {
        "message": f"Leave request {new_status.lower()} successfully",
        "leave_id": leave.id,
        "status": leave.status,
        "admin_comment": leave.admin_comment,
    }

# =========================================================
# EMPLOYEE — VIEW LEAVE BALANCE
# =========================================================

@router.get("/balance")
def get_leave_balance(
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

    employee = (
        db.query(Employee)
        .filter(Employee.id == current_user.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return {
        "employee_id": employee.employee_code,
        "employee_name": employee.name,
        "paid_leave_balance": employee.paid_leave_balance,
        "sick_leave_balance": employee.sick_leave_balance,
    }