from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    verify_token = Column(String, nullable=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True,
    )


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True)
    employee_code = Column(String, unique=True, nullable=True)

    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    department = Column(String, nullable=True)
    job_position = Column(String, nullable=True)
    manager = Column(String, nullable=True)
    location = Column(String, nullable=True)

    joining_date = Column(Date, nullable=True)
    profile_picture = Column(String, nullable=True)

    wage = Column(Float, default=0)

    paid_leave_balance = Column(Float, default=24)
    sick_leave_balance = Column(Float, default=7)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    date = Column(Date, nullable=False)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)

    work_hours = Column(Float, nullable=True)
    extra_hours = Column(Float, nullable=True)

    status = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            "date",
            name="uq_attendance_employee_date",
        ),
    )


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    leave_type = Column(String, nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    remarks = Column(String, nullable=True)
    attachment = Column(String, nullable=True)

    status = Column(
        String,
        nullable=False,
        default="Pending",
    )

    admin_comment = Column(String, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


class SalaryConfig(Base):
    __tablename__ = "salary_config"

    id = Column(Integer, primary_key=True)

    basic_pct_of_wage = Column(Float, default=0.50)
    hra_pct_of_basic = Column(Float, default=0.50)

    std_allowance_flat = Column(
        Float,
        default=4167,
    )

    perf_bonus_pct_of_wage = Column(
        Float,
        default=0.0833,
    )

    lta_pct_of_wage = Column(
        Float,
        default=0.0833,
    )

    pf_pct_of_basic = Column(
        Float,
        default=0.12,
    )

    professional_tax_flat = Column(
        Float,
        default=200,
    )