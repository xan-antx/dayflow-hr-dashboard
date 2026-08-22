"""P4 self-check. Run: python test_services.py  -> prints ALL TESTS PASSED."""
from datetime import date, datetime

from id_generator import generate_employee_code, generate_initial_password
from attendance_calc import calc_attendance, status_for_missing_day
from leave_logic import days_requested, validate_request, apply_approval
from salary_calc import compute_salary

# ---- id_generator ----
assert generate_employee_code("OI", "John", "Doe", 2026, 1) == "OIJODO20260001"
assert generate_employee_code("oi", "john", "doe", 2026, 42) == "OIJODO20260042"
assert generate_employee_code("OI", "J", "Li", 2026, 1) == "OIJXLI20260001"  # short names padded
try:
    generate_employee_code("OI", "A", "B", 2026, 0); assert False
except ValueError:
    pass
pw = generate_initial_password()
assert len(pw) >= 8 and any(c.isupper() for c in pw) and any(c.isdigit() for c in pw)

# ---- attendance_calc ----
d = lambda h, m=0: datetime(2026, 8, 22, h, m)
full = calc_attendance(d(9), d(18, 30))
assert full == {"work_hours": 9.5, "extra_hours": 1.5, "status": "Present"}
half = calc_attendance(d(9), d(12))
assert half["status"] == "Half-day" and half["work_hours"] == 3.0
assert calc_attendance(d(9), None)["status"] == "Present"  # mid-day
try:
    calc_attendance(d(18), d(9)); assert False
except ValueError:
    pass
assert status_for_missing_day(True) == "Leave"
assert status_for_missing_day(False) == "Absent"

# ---- leave_logic ----
assert days_requested(date(2026, 8, 28), date(2026, 8, 29)) == 2
assert days_requested(date(2026, 8, 28), date(2026, 8, 28)) == 1
bal = {"paid": 24, "sick": 7}
assert validate_request("Paid", date(2026, 8, 28), date(2026, 8, 29), bal)["ok"]
bad = validate_request("Sick", date(2026, 8, 1), date(2026, 8, 20), bal)
assert not bad["ok"] and "insufficient" in bad["error"]
assert not validate_request("Paid", date(2026, 8, 29), date(2026, 8, 28), bal)["ok"]
assert not validate_request("Casual", date(2026, 8, 28), date(2026, 8, 29), bal)["ok"]
assert apply_approval("Paid", 2, bal) == {"paid": 22, "sick": 7}
assert apply_approval("Unpaid", 5, bal) == bal  # no deduction
assert bal == {"paid": 24, "sick": 7}  # input not mutated

# ---- salary_calc ----
s = compute_salary(50000)  # Excalidraw example
assert s["components"]["basic"] == 25000.0
assert s["components"]["hra"] == 12500.0
assert s["deductions"]["pf_employee"] == 3000.0
assert s["net"] == 50000 - 3000 - 200
total = sum(s["components"].values())
assert abs(total - 50000) < 0.01  # components always sum to wage
s_small = compute_salary(5000)  # small wages: flat allowance capped, never errors
assert abs(sum(s_small["components"].values()) - 5000) < 0.01
try:
    compute_salary(-1); assert False
except ValueError:
    pass

# ---- prompt-required additional cases ----
# attendance: exactly 8 hours -> Present, zero extra
e = calc_attendance(d(9), d(17))
assert e == {"work_hours": 8.0, "extra_hours": 0.0, "status": "Present"}

# employee ID: sequential serials, multiple employees
assert generate_employee_code("OI", "Amit", "Rao", 2026, 2) == "OIAMRA20260002"
assert generate_employee_code("OI", "Sara", "Khan", 2026, 3) == "OISAKH20260003"

# leave: sick-specific insufficient balance
sick_bad = validate_request("Sick", date(2026, 8, 1), date(2026, 8, 10), {"paid": 24, "sick": 2})
assert not sick_bad["ok"] and "sick" in sick_bad["error"]
# rejection effect: balances untouched (rejection never calls apply_approval)
assert apply_approval("Paid", 0, bal) == bal

# salary: wage change recomputes all components
s2 = compute_salary(60000)
assert s2["components"]["basic"] == 30000.0
assert s2["deductions"]["pf_employee"] == 3600.0
assert abs(sum(s2["components"].values()) - 60000) < 0.01

print("ALL TESTS PASSED")
