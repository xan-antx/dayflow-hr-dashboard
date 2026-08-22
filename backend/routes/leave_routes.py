from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_hr
from ..database import get_db
from ..models import Employee, SalaryConfig, User


router = APIRouter(
    prefix="/salary",
    tags=["Salary & Payroll"],
)


# =========================================================
# HELPER — GET SALARY CONFIG
# =========================================================

def get_salary_config(db: Session):
    config = db.query(SalaryConfig).first()

    if not config:
        config = SalaryConfig(
            basic_pct_of_wage=0.50,
            hra_pct_of_basic=0.50,
            std_allowance_flat=4167,
            perf_bonus_pct_of_wage=0.0833,
            lta_pct_of_wage=0.0833,
            pf_pct_of_basic=0.12,
            professional_tax_flat=200,
        )

        db.add(config)
        db.commit()
        db.refresh(config)

    return config


# =========================================================
# HELPER — CALCULATE SALARY
# =========================================================

def calculate_salary(employee: Employee, config: SalaryConfig):

    wage = float(employee.wage or 0)

    # Earnings
    basic = wage * config.basic_pct_of_wage

    hra = basic * config.hra_pct_of_basic

    standard_allowance = float(
        config.std_allowance_flat or 0
    )

    performance_bonus = (
        wage * config.perf_bonus_pct_of_wage
    )

    lta = wage * config.lta_pct_of_wage

    gross_salary = (
        basic
        + hra
        + standard_allowance
        + performance_bonus
        + lta
    )

    # Deductions
    pf = basic * config.pf_pct_of_basic

    professional_tax = float(
        config.professional_tax_flat or 0
    )

    total_deductions = pf + professional_tax

    net_salary = gross_salary - total_deductions

    return {
        "wage": round(wage, 2),

        "earnings": {
            "basic": round(basic, 2),
            "hra": round(hra, 2),
            "standard_allowance": round(
                standard_allowance, 2
            ),
            "performance_bonus": round(
                performance_bonus, 2
            ),
            "lta": round(lta, 2),
        },

        "gross_salary": round(
            gross_salary, 2
        ),

        "deductions": {
            "pf": round(pf, 2),
            "professional_tax": round(
                professional_tax, 2
            ),
        },

        "total_deductions": round(
            total_deductions, 2
        ),

        "net_salary": round(
            net_salary, 2
        ),
    }


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
        .filter(
            Employee.id == current_user.employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    config = get_salary_config(db)

    salary = calculate_salary(
        employee,
        config,
    )

    return {
        "employee": {
            "id": employee.id,
            "employee_code": employee.employee_code,
            "name": employee.name,
            "department": employee.department,
            "job_position": employee.job_position,
        },
        "salary": salary,
    }


# =========================================================
# HR — VIEW ALL EMPLOYEE SALARIES
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

    config = get_salary_config(db)

    result = []

    for employee in employees:

        salary = calculate_salary(
            employee,
            config,
        )

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
# HR — VIEW SALARY OF ONE EMPLOYEE
# =========================================================

@router.get("/employee/{employee_id}")
def get_employee_salary(
    employee_id: int,
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

    config = get_salary_config(db)

    salary = calculate_salary(
        employee,
        config,
    )

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
# HR — VIEW PAYROLL CONFIG
# =========================================================

@router.get("/config")
def get_payroll_config(
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):

    config = get_salary_config(db)

    return {
        "id": config.id,
        "basic_pct_of_wage": config.basic_pct_of_wage,
        "hra_pct_of_basic": config.hra_pct_of_basic,
        "std_allowance_flat": config.std_allowance_flat,
        "perf_bonus_pct_of_wage": config.perf_bonus_pct_of_wage,
        "lta_pct_of_wage": config.lta_pct_of_wage,
        "pf_pct_of_basic": config.pf_pct_of_basic,
        "professional_tax_flat": config.professional_tax_flat,
    }


# =========================================================
# HR — UPDATE PAYROLL CONFIG
# =========================================================

@router.patch("/config")
def update_payroll_config(
    data: dict,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db),
):

    config = get_salary_config(db)

    allowed_fields = [
        "basic_pct_of_wage",
        "hra_pct_of_basic",
        "std_allowance_flat",
        "perf_bonus_pct_of_wage",
        "lta_pct_of_wage",
        "pf_pct_of_basic",
        "professional_tax_flat",
    ]

    for field in allowed_fields:

        if field in data:
            value = data[field]

            try:
                value = float(value)
            except (TypeError, ValueError):
                raise HTTPException(
                    status_code=400,
                    detail=f"{field} must be a number",
                )

            if value < 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"{field} cannot be negative",
                )

            setattr(config, field, value)

    db.commit()
    db.refresh(config)

    return {
        "message": "Payroll configuration updated successfully",
        "config": {
            "id": config.id,
            "basic_pct_of_wage": config.basic_pct_of_wage,
            "hra_pct_of_basic": config.hra_pct_of_basic,
            "std_allowance_flat": config.std_allowance_flat,
            "perf_bonus_pct_of_wage": config.perf_bonus_pct_of_wage,
            "lta_pct_of_wage": config.lta_pct_of_wage,
            "pf_pct_of_basic": config.pf_pct_of_basic,
            "professional_tax_flat": config.professional_tax_flat,
        },
    }