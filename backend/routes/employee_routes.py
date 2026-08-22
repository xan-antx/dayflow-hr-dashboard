import os
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..auth import get_current_user, hash_password, require_hr
from ..database import get_db
from ..models import Attendance, Employee, LeaveRequest, User
from ..services.id_generator import (
    generate_employee_code,
    generate_initial_password,
)

router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

EMPLOYEE_EDITABLE_FIELDS = {"address", "phone", "profile_picture"}
HR_EDITABLE_FIELDS = {
    "name", "email", "phone", "address", "department", "job_position",
    "manager", "location", "joining_date", "profile_picture", "wage",
    "paid_leave_balance", "sick_leave_balance",
}


def _employee_dict(employee: Employee) -> dict:
    return {
        "id": employee.id,
        "employee_code": employee.employee_code,
        "name": employee.name,
        "email": employee.email,
        "phone": employee.phone,
        "address": employee.address,
        "department": employee.department,
        "job_position": employee.job_position,
        "manager": employee.manager,
        "location": employee.location,
        "joining_date": employee.joining_date,
        "profile_picture": employee.profile_picture,
        "wage": employee.wage,
        "paid_leave_balance": employee.paid_leave_balance,
        "sick_leave_balance": employee.sick_leave_balance,
    }


def _today_status(db: Session, employee_id: int) -> str:
    """Card dot status: present | leave | absent (lowercase, per contract)."""
    today = date.today()
    record = (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee_id, Attendance.date == today)
        .first()
    )
    if record and record.check_in:
        return "present"
    if record and record.status == "Leave":
        return "leave"
    on_leave = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == employee_id,
            LeaveRequest.status == "Approved",
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today,
        )
        .first()
    )
    return "leave" if on_leave else "absent"


# =========================================================
# HR — CREATE EMPLOYEE
# =========================================================

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_employee(
    employee_data: dict,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    # accepts contract shape (name + joining_date) and split-field shape
    name = employee_data.get("name")
    first_name = employee_data.get("first_name")
    last_name = employee_data.get("last_name")
    if name and not first_name:
        parts = name.strip().split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""
    email = employee_data.get("email")

    raw_date = employee_data.get("joining_date")
    try:
        joining_date = date.fromisoformat(raw_date) if raw_date else date.today()
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="joining_date must be YYYY-MM-DD")
    joining_year = employee_data.get("joining_year") or joining_date.year

    if not first_name or not email:
        raise HTTPException(
            status_code=400,
            detail="name (or first_name + last_name) and email are required",
        )

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    serial = db.query(Employee).count() + 1

    employee_code = generate_employee_code(
        company_initials="OI",
        first_name=first_name,
        last_name=last_name or "X",
        joining_year=joining_year,
        serial=serial,
    )
    initial_password = generate_initial_password()

    employee = Employee(
        employee_code=employee_code,
        name=f"{first_name} {last_name}".strip(),
        email=email,
        phone=employee_data.get("phone"),
        address=employee_data.get("address"),
        department=employee_data.get("department"),
        job_position=employee_data.get("job_position"),
        manager=employee_data.get("manager"),
        location=employee_data.get("location"),
        joining_date=joining_date,
        wage=employee_data.get("wage", 0),
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)

    user = User(
        email=email,
        password_hash=hash_password(initial_password),
        role="employee",
        is_verified=True,
        employee_id=employee.id,
    )
    db.add(user)
    db.commit()

    return {
        "message": "Employee created successfully",
        "employee_id": employee.id,
        "employee_code": employee.employee_code,
        "initial_password": initial_password,
    }


# =========================================================
# HR — LIST EMPLOYEES (with today_status for card dots)
# =========================================================

@router.get("/")
def list_employees(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    employees = db.query(Employee).order_by(Employee.id).all()
    return [
        {
            "id": e.id,
            "employee_code": e.employee_code,
            "name": e.name,
            "email": e.email,
            "job_position": e.job_position,
            "department": e.department,
            "profile_picture": e.profile_picture,
            "wage": e.wage,
            "today_status": _today_status(db, e.id),
        }
        for e in employees
    ]


# =========================================================
# GET ONE — HR: any. Employee: self only.
# =========================================================

@router.get("/{employee_id}")
def get_employee(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "hr" and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="You can only view your own profile")

    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _employee_dict(employee)


# =========================================================
# UPDATE — HR: all fields. Employee: address/phone/picture only.
# =========================================================

@router.put("/{employee_id}")
def update_employee(
    employee_id: int,
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "hr" and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="You can only edit your own profile")

    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    allowed = HR_EDITABLE_FIELDS if current_user.role == "hr" else EMPLOYEE_EDITABLE_FIELDS
    forbidden = [k for k in updates if k not in allowed]
    if forbidden and current_user.role != "hr":
        raise HTTPException(
            status_code=403,
            detail=f"Employees can only edit: {', '.join(sorted(EMPLOYEE_EDITABLE_FIELDS))}",
        )

    for key, value in updates.items():
        if key not in allowed:
            continue
        if key == "joining_date" and value:
            try:
                value = date.fromisoformat(str(value))
            except ValueError:
                raise HTTPException(status_code=400, detail="joining_date must be YYYY-MM-DD")
        setattr(employee, key, value)

    db.commit()
    db.refresh(employee)
    return _employee_dict(employee)


# =========================================================
# PHOTO UPLOAD
# =========================================================

@router.post("/{employee_id}/photo")
async def upload_photo(
    employee_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "hr" and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="You can only update your own photo")

    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    form = await request.form()
    upload = form.get("file")
    if upload is None or not getattr(upload, "filename", None):
        raise HTTPException(status_code=400, detail="file is required")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    safe_name = f"emp_{employee_id}_{upload.filename}"
    with open(os.path.join(UPLOAD_DIR, safe_name), "wb") as f:
        f.write(await upload.read())

    employee.profile_picture = f"/uploads/{safe_name}"
    db.commit()
    return {"profile_picture": employee.profile_picture}
