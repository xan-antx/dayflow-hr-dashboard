from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user, hash_password, require_hr
from ..database import get_db
from ..models import Employee, User
from ..services.id_generator import (
    generate_employee_code,
    generate_initial_password,
)

router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_employee(
    employee_data: dict,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    first_name = employee_data.get("first_name")
    last_name = employee_data.get("last_name")
    email = employee_data.get("email")
    joining_year = employee_data.get("joining_year")

    if not first_name or not last_name or not email or not joining_year:
        raise HTTPException(
            status_code=400,
            detail="first_name, last_name, email and joining_year are required",
        )

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    employee_count = db.query(Employee).count()

    serial = employee_count + 1

    employee_code = generate_employee_code(
        company_initials="OI",
        first_name=first_name,
        last_name=last_name,
        joining_year=joining_year,
        serial=serial,
    )

    initial_password = generate_initial_password()

    employee = Employee(
        employee_code=employee_code,
        name=f"{first_name} {last_name}",
        email=email,
        phone=employee_data.get("phone"),
        address=employee_data.get("address"),
        department=employee_data.get("department"),
        job_position=employee_data.get("job_position"),
        manager=employee_data.get("manager"),
        location=employee_data.get("location"),
        joining_date=date.fromisoformat(
            employee_data.get("joining_date")
        ),
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
    db.refresh(user)

    return {
        "message": "Employee created successfully",
        "employee_id": employee.id,
        "employee_code": employee.employee_code,
        "initial_password": initial_password,
    }