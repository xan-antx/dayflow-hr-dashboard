"""Seed demo data for Dayflow.

Run from repo root:  python -m backend.seed
Drops and recreates dayflow.db with:
  - 1 verified HR account            hr@dayflow.com / Dayflow@123
  - 6 employees (codes via services.id_generator), password Dayflow@123
  - 5 working days of attendance history each (via services.attendance_calc)
  - today: mixed check-ins so the HR grid shows all three status dots
  - leave requests: 2 Pending, 1 Approved (balance deducted), 1 Rejected
"""
import os
import random
from datetime import date, datetime, time, timedelta

from .auth import hash_password
from .database import Base, SessionLocal, engine
from .models import Attendance, Employee, LeaveRequest, SalaryConfig, User
from .services.attendance_calc import calc_attendance
from .services.id_generator import generate_employee_code
from .services.leave_logic import apply_approval, days_requested

PASSWORD = "Dayflow@123"
COMPANY = "OI"

EMPLOYEES = [
    ("John", "Doe", "Engineering", "Developer", "Priya Sharma", "Bengaluru", 50000),
    ("Riya", "Nair", "Engineering", "Frontend Engineer", "Priya Sharma", "Bengaluru", 48000),
    ("Amit", "Shah", "Finance", "Accountant", "Karan Mehta", "Mumbai", 55000),
    ("Sara", "Khan", "Design", "UX Designer", "Rhea Jain", "Pune", 47000),
    ("Arjun", "Singh", "Engineering", "Backend Engineer", "Priya Sharma", "Bengaluru", 52000),
    ("Meera", "Das", "People", "HR Associate", "Priya Sharma", "Hyderabad", 40000),
]


def working_days_back(n):
    days, cursor = [], date.today() - timedelta(days=1)
    while len(days) < n:
        if cursor.weekday() < 5:
            days.append(cursor)
        cursor -= timedelta(days=1)
    return list(reversed(days))


def seed():
    here = os.path.dirname(__file__)
    for candidate in ("dayflow.db", os.path.join(here, "..", "dayflow.db"), os.path.join(here, "dayflow.db")):
        if os.path.exists(candidate):
            os.remove(candidate)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    random.seed(42)  # same demo data every run

    db.add(SalaryConfig())

    db.add(User(
        email="hr@dayflow.com",
        password_hash=hash_password(PASSWORD),
        role="hr",
        is_verified=True,
    ))

    year = date.today().year
    employees = []
    for serial, (first, last, dept, position, manager, location, wage) in enumerate(EMPLOYEES, start=1):
        emp = Employee(
            employee_code=generate_employee_code(COMPANY, first, last, year, serial),
            name=f"{first} {last}",
            email=f"{first.lower()}@dayflow.com",
            phone=f"98{random.randint(10000000, 99999999)}",
            address=f"{random.randint(1, 99)} MG Road, {location}",
            department=dept,
            job_position=position,
            manager=manager,
            location=location,
            joining_date=date(year, 1, random.randint(2, 28)),
            wage=wage,
        )
        db.add(emp)
        db.flush()
        db.add(User(
            email=emp.email,
            password_hash=hash_password(PASSWORD),
            role="employee",
            is_verified=True,
            employee_id=emp.id,
        ))
        employees.append(emp)

    for emp in employees:
        for day in working_days_back(5):
            roll = random.random()
            if roll < 0.75:
                check_in = datetime.combine(day, time(9, random.randint(0, 45)))
                check_out = datetime.combine(day, time(random.choice([17, 18]), random.randint(0, 59)))
            elif roll < 0.87:
                check_in = datetime.combine(day, time(9, random.randint(0, 30)))
                check_out = check_in + timedelta(hours=3, minutes=random.randint(0, 40))
            else:
                db.add(Attendance(employee_id=emp.id, date=day, status="Absent"))
                continue
            result = calc_attendance(check_in, check_out)
            db.add(Attendance(
                employee_id=emp.id, date=day,
                check_in=check_in, check_out=check_out,
                work_hours=result["work_hours"],
                extra_hours=result["extra_hours"],
                status=result["status"],
            ))

    today = date.today()
    for emp in employees[:3]:
        db.add(Attendance(
            employee_id=emp.id, date=today,
            check_in=datetime.combine(today, time(9, random.randint(0, 20))),
            status="Present",
        ))

    john, riya, _, sara, arjun, _ = employees

    sick_days = days_requested(today, today + timedelta(days=1))
    new_bal = apply_approval("Sick", sick_days, {"paid": sara.paid_leave_balance, "sick": sara.sick_leave_balance})
    sara.paid_leave_balance, sara.sick_leave_balance = new_bal["paid"], new_bal["sick"]
    db.add(LeaveRequest(
        employee_id=sara.id, leave_type="Sick",
        start_date=today, end_date=today + timedelta(days=1),
        remarks="Fever, doctor advised rest", status="Approved",
        admin_comment="Get well soon!",
    ))
    for offset in range(sick_days):
        db.add(Attendance(employee_id=sara.id, date=today + timedelta(days=offset), status="Leave"))

    db.add(LeaveRequest(
        employee_id=john.id, leave_type="Paid",
        start_date=today + timedelta(days=6), end_date=today + timedelta(days=7),
        remarks="Family function", status="Pending",
    ))
    db.add(LeaveRequest(
        employee_id=riya.id, leave_type="Unpaid",
        start_date=today + timedelta(days=10), end_date=today + timedelta(days=10),
        remarks="Personal errand", status="Pending",
    ))
    db.add(LeaveRequest(
        employee_id=arjun.id, leave_type="Paid",
        start_date=today - timedelta(days=4), end_date=today - timedelta(days=3),
        remarks="Short trip", status="Rejected",
        admin_comment="Sprint deadline that week - please reschedule",
    ))

    db.commit()
    codes = [e.employee_code for e in employees]
    db.close()

    print("Seeded dayflow.db")
    print(f"  HR login:        hr@dayflow.com / {PASSWORD}")
    print("  Employee logins: john@dayflow.com, riya@, amit@, sara@, arjun@, meera@dayflow.com  / " + PASSWORD)
    print("  Employee codes:  " + ", ".join(codes))


if __name__ == "__main__":
    seed()
