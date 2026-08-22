from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_hr
from ..database import get_db
from ..models import Employee, User
from ..services.salary_calc import compute_salary


router = APIRouter(
    prefix="/salary",
    tags=["Salary & Payroll"],
)


# =========================================================
# EMPLOYEE — VIEW OWN SALARY
# =========================================================

@router.get("/me")
def get_my_salary(
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

    salary = compute_salary(employee.wage or 0)

    return {
        "employee": {
            "id": employee.id,
            "employee_code": employee.employee_code,
            "name": employee.name,
            "email": employee.email,
            "department": employee.department,
            "job_position": employee.job_position,
        },
        "salary": salary,
    }


# =========================================================
# HR — VIEW ALL SALARIES
# =========================================================

@router.get("/")
def get_all_salaries(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    employees = (
        db.query(Employee)
        .order_by(Employee.id)
        .all()
    )

    result = []

    for employee in employees:
        salary = compute_salary(employee.wage or 0)

        result.append(
            {
                "employee_id": employee.id,
                "employee_code": employee.employee_code,
                "employee_name": employee.name,
                "department": employee.department,
                "job_position": employee.job_position,
                "salary": salary,
            }
        )

    return {
        "items": result
    }


# =========================================================
# HR — VIEW ONE EMPLOYEE SALARY
# =========================================================

@router.get("/{employee_id}")
def get_employee_salary(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "hr" and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="You can only view your own salary")
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    salary = compute_salary(employee.wage or 0)

    return {
        "employee": {
            "id": employee.id,
            "employee_code": employee.employee_code,
            "name": employee.name,
            "email": employee.email,
            "department": employee.department,
            "job_position": employee.job_position,
        },
        "salary": salary,
    }


# =========================================================
# HR — UPDATE EMPLOYEE WAGE
# =========================================================

@router.put("/{employee_id}")
def update_employee_salary(
    employee_id: int,
    salary_data: dict,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    wage = salary_data.get("wage")

    if wage is None:
        raise HTTPException(
            status_code=400,
            detail="wage is required",
        )

    try:
        wage = float(wage)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="wage must be a number",
        )

    if wage < 0:
        raise HTTPException(
            status_code=400,
            detail="wage cannot be negative",
        )

    employee.wage = wage

    db.commit()
    db.refresh(employee)

    return {
        "message": "Employee salary updated successfully",
        "employee_id": employee.id,
        "employee_code": employee.employee_code,
        "wage": employee.wage,
        "salary": compute_salary(employee.wage or 0),
    }