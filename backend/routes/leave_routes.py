import os
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_hr
from ..database import get_db
from ..models import Attendance, Employee, LeaveRequest, User
from ..services.leave_logic import apply_approval, days_requested, validate_request

router = APIRouter(
    prefix="/leaves",
    tags=["Leave Management"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


# =========================================================
# EMPLOYEE — APPLY FOR LEAVE  (JSON or multipart w/ attachment)
# =========================================================

@router.post("/", status_code=status.HTTP_201_CREATED)
async def apply_leave(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can apply for leave")
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="Employee profile not linked")

    attachment_path = None
    content_type = request.headers.get("content-type", "")
    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        leave_type = form.get("leave_type")
        start_date = form.get("start_date")
        end_date = form.get("end_date")
        remarks = form.get("remarks")
        upload = form.get("attachment")
        if upload is not None and getattr(upload, "filename", None):
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            safe_name = f"leave_{current_user.employee_id}_{upload.filename}"
            with open(os.path.join(UPLOAD_DIR, safe_name), "wb") as f:
                f.write(await upload.read())
            attachment_path = f"/uploads/{safe_name}"
    else:
        body = await request.json()
        leave_type = body.get("leave_type")
        start_date = body.get("start_date")
        end_date = body.get("end_date")
        remarks = body.get("remarks")

    if not leave_type or not start_date or not end_date:
        raise HTTPException(status_code=400, detail="leave_type, start_date and end_date are required")

    try:
        start = date.fromisoformat(str(start_date))
        end = date.fromisoformat(str(end_date))
    except ValueError:
        raise HTTPException(status_code=400, detail="Dates must be in YYYY-MM-DD format")

    employee = db.query(Employee).filter(Employee.id == current_user.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # services/leave_logic: validates type (Paid|Sick|Unpaid), range, and balance
    balances = {"paid": employee.paid_leave_balance, "sick": employee.sick_leave_balance}
    result = validate_request(leave_type, start, end, balances)
    if not result["ok"]:
        raise HTTPException(status_code=400, detail=result["error"])

    leave_request = LeaveRequest(
        employee_id=current_user.employee_id,
        leave_type=leave_type,
        start_date=start,
        end_date=end,
        remarks=remarks,
        attachment=attachment_path,
        status="Pending",
    )
    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)

    return {
        "id": leave_request.id,
        "status": leave_request.status,
        "days_requested": result["days"],
        "leave_type": leave_request.leave_type,
        "start_date": leave_request.start_date,
        "end_date": leave_request.end_date,
    }


# =========================================================
# EMPLOYEE — VIEW OWN LEAVES  (contract shape: balances + requests)
# =========================================================

@router.get("/me")
def get_my_leaves(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Employee access required")

    employee = db.query(Employee).filter(Employee.id == current_user.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    leaves = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.employee_id == current_user.employee_id)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    return {
        "balances": {
            "paid": employee.paid_leave_balance,
            "sick": employee.sick_leave_balance,
        },
        "requests": [
            {
                "id": leave.id,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "remarks": leave.remarks,
                "attachment": leave.attachment,
                "status": leave.status,
                "admin_comment": leave.admin_comment,
                "created_at": leave.created_at,
            }
            for leave in leaves
        ],
    }


# =========================================================
# HR — VIEW ALL LEAVES
# =========================================================

@router.get("/")
def get_all_leaves(
    status: str | None = None,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    query = db.query(LeaveRequest)
    if status:
        query = query.filter(LeaveRequest.status == status)
    leaves = query.order_by(LeaveRequest.created_at.desc()).all()

    result = []
    for leave in leaves:
        employee = db.query(Employee).filter(Employee.id == leave.employee_id).first()
        result.append(
            {
                "id": leave.id,
                "employee_id": leave.employee_id,
                "employee_code": employee.employee_code if employee else None,
                "employee_name": employee.name if employee else None,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "remarks": leave.remarks,
                "attachment": leave.attachment,
                "status": leave.status,
                "admin_comment": leave.admin_comment,
                "created_at": leave.created_at,
            }
        )
    return result


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
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    new_status = leave_data.get("status") or leave_data.get("decision")
    admin_comment = leave_data.get("admin_comment")

    if new_status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Status must be Approved or Rejected")
    if leave.status != "Pending":
        raise HTTPException(status_code=400, detail="Only pending leave requests can be updated")

    employee = db.query(Employee).filter(Employee.id == leave.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if new_status == "Approved":
        days = days_requested(leave.start_date, leave.end_date)
        balances = {"paid": employee.paid_leave_balance, "sick": employee.sick_leave_balance}
        try:
            # services/leave_logic: deducts Paid/Sick correctly, Unpaid untouched
            new_balances = apply_approval(leave.leave_type, days, balances)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        employee.paid_leave_balance = new_balances["paid"]
        employee.sick_leave_balance = new_balances["sick"]

        # mark attendance "Leave" for each day in the range (contract §3.5.2)
        current = leave.start_date
        while current <= leave.end_date:
            record = (
                db.query(Attendance)
                .filter(
                    Attendance.employee_id == employee.id,
                    Attendance.date == current,
                )
                .first()
            )
            if record:
                record.status = "Leave"
            else:
                db.add(
                    Attendance(
                        employee_id=employee.id,
                        date=current,
                        status="Leave",
                    )
                )
            current += timedelta(days=1)

    leave.status = new_status
    leave.admin_comment = admin_comment
    db.commit()
    db.refresh(leave)

    return {
        "id": leave.id,
        "status": leave.status,
        "admin_comment": leave.admin_comment,
    }


# =========================================================
# EMPLOYEE — VIEW LEAVE BALANCE (kept for compatibility)
# =========================================================

@router.get("/balance")
def get_leave_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Employee access required")
    if not current_user.employee_id:
        raise HTTPException(status_code=400, detail="Employee profile not linked")

    employee = db.query(Employee).filter(Employee.id == current_user.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {
        "employee_code": employee.employee_code,
        "employee_name": employee.name,
        "paid_leave_balance": employee.paid_leave_balance,
        "sick_leave_balance": employee.sick_leave_balance,
    }
