# P4 → P1: Integration Snippets

Paste-ready wiring for each route. Services are on main in `backend/services/`.
Rule from ARCHITECTURE: routes stay yours (P1) — these snippets are the only
lines that touch my services. Catch `ValueError` from any service → HTTP 400.

---

## 1. POST /api/employees  (create employee)

```python
from services.id_generator import generate_employee_code, generate_initial_password

# serial = employees who joined the same year + 1
year = joining_date.year
serial = db.query(Employee).filter(
    Employee.joining_date >= date(year, 1, 1),
    Employee.joining_date <= date(year, 12, 31)
).count() + 1

code = generate_employee_code("OI", first_name, last_name, year, serial)
raw_password = generate_initial_password()
# store hash(raw_password) in users.password_hash; user is_verified=True
# response: {"employee_id": emp.id, "employee_code": code, "initial_password": raw_password}
```
Note: split `name` on first space for first/last (`parts = name.split(" ", 1)`;
single-word names → last_name = "" and the generator pads with X).

## 2. POST /api/attendance/check-out

```python
from services.attendance_calc import calc_attendance

try:
    result = calc_attendance(record.check_in, datetime.now())
except ValueError as e:
    raise HTTPException(400, str(e))
record.check_out = datetime.now()
record.work_hours = result["work_hours"]
record.extra_hours = result["extra_hours"]
record.status = result["status"]
```
Check-in route needs no service — just create the row with status "Present".

## 3. Attendance for days with no check-in (seed / daily views)

```python
from services.attendance_calc import status_for_missing_day
status = status_for_missing_day(has_approved_leave)  # -> "Leave" or "Absent"
```

## 4. POST /api/leaves  (apply)

```python
from services.leave_logic import validate_request

balances = {"paid": emp.paid_leave_balance, "sick": emp.sick_leave_balance}
v = validate_request(body.leave_type, body.start_date, body.end_date, balances)
if not v["ok"]:
    raise HTTPException(400, v["error"])
# create request with status="Pending"; response includes days_requested=v["days"]
```

## 5. PUT /api/leaves/{id}/decision

```python
from services.leave_logic import days_requested, apply_approval

if body.decision == "Approved":
    days = days_requested(req.start_date, req.end_date)
    balances = {"paid": emp.paid_leave_balance, "sick": emp.sick_leave_balance}
    try:
        new_bal = apply_approval(req.leave_type, days, balances)
    except ValueError as e:
        raise HTTPException(400, str(e))
    emp.paid_leave_balance = new_bal["paid"]
    emp.sick_leave_balance = new_bal["sick"]
    # mark attendance status="Leave" for each date in range (upsert per date)
req.status = body.decision          # "Approved" or "Rejected"
req.admin_comment = body.admin_comment
```
Rejection touches nothing but status + comment.

## 6. GET/PUT /api/salary/{employee_id}

```python
from services.salary_calc import compute_salary

try:
    return compute_salary(emp.wage)          # matches API_CONTRACT shape exactly
except ValueError as e:
    raise HTTPException(400, str(e))         # e.g. wage too small for flat allowance
```
PUT: set `emp.wage = body.wage`, commit, return `compute_salary(emp.wage)`.
Never store components — computed live (DATA_MODEL invariant 11).

## 7. GET /api/employees today_status (card dots)

```python
# per employee, for today:
att = today's attendance row
if att and att.check_in:            status = "present"
elif has approved leave for today:  status = "leave"
else:                               status = "absent"
```
(lowercase — contract distinguishes dot status from the Capitalized attendance statuses)

---

Verify wiring: `python services/test_services.py` must pass, and
`GET /api/salary/{id}` for a 50,000-wage employee must return net 46800.
Ping me (P4) when the first route is up — I'll run the end-to-end trace.
