# DAYFLOW — DATA MODEL

Version: 1.0

Database: SQLite  
Database File: `dayflow.db`

---


## 1. Purpose

This document defines the canonical data model for Dayflow.

The database consists of **5 tables**:

1. `users`
2. `employees`
3. `attendance`
4. `leave_requests`
5. `salary_config`

The model is designed around the core Dayflow workflow:

```text
HR creates employee
        ↓
Employee record + User account created
        ↓
Employee logs in
        ↓
Attendance / Leave
        ↓
HR approval
        ↓
Records update
        ↓
Salary calculated from wage

## SQLAlchemy Models

### User

```python
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
        nullable=True
    )

### 2. Explicit relationship/cardinality table

Architecture shows the relationships conceptually, but make them extremely explicit:

```md
## Relationships

| Relationship | Cardinality | Foreign Key |
|---|---|---|
| User → Employee | 0..1 : 1 | users.employee_id |
| Employee → Attendance | 1 : N | attendance.employee_id |
| Employee → Leave Requests | 1 : N | leave_requests.employee_id |
| Salary Config → Employees | 1 : N logically | Global configuration |

### User → Employee

A User may have zero or one associated Employee.

- HR users may have `employee_id = NULL`
- Employee users must reference an employee

## Stored vs Derived Data

### Stored

The database stores:

- Employee wage
- Leave balances
- Check-in/check-out timestamps
- Attendance status
- Leave request status
- Employee profile information

### Derived

The following values are calculated rather than independently stored:

- Work hours
- Extra hours
- Salary components
- Gross salary
- Net salary
- Leave request duration
- Employee today's attendance status
- Employee activity feed

do not create:

employees.basic_salary
employees.hra
employees.net_salary

because salary comes from wage + salary_config.

## Data Invariants

The following conditions must always hold:

1. `users.email` is unique.
2. `employees.employee_code` is unique.
3. An employee can have at most one attendance record per date.
4. `users.role` is either `hr` or `employee`.
5. `leave_requests.leave_type` is `Paid`, `Sick`, or `Unpaid`.
6. `leave_requests.status` is `Pending`, `Approved`, or `Rejected`.
7. `attendance.status` is `Present`, `Absent`, `Half-day`, or `Leave`.
8. Paid leave balance cannot become negative.
9. Sick leave balance cannot become negative.
10. `end_date` cannot be earlier than `start_date`.
11. Salary components are never persisted independently.
12. `salary_config` contains exactly one active configuration row.
13. Employee passwords are never stored in plaintext.
14. An employee can only reference their own employee record.
15. Attendance and leave records must reference an existing employee.


## Delete / Update Rules

### Employee

Employees should not be hard-deleted during normal application usage.

Employee records should remain available because historical:

- attendance
- leave
- payroll/salary information

may reference them.

### User

Deleting a user must not automatically delete the associated employee record.

### Attendance

Attendance records are historical records and should not be deleted
through normal HR operations.

### Leave Requests

Leave requests should remain after approval/rejection for history.

### Salary Configuration

Only the current configuration is required for the MVP.


## Field Validation

### User

email:
- Required
- Unique
- Valid email format

password:
- Minimum 8 characters
- At least 1 uppercase character
- At least 1 digit

role:
- `hr`
- `employee`

### Employee

name:
- Required

email:
- Required

wage:
- Numeric
- Must not be negative

joining_date:
- Valid date

### Leave Request

start_date:
- Required

end_date:
- Required
- Must be >= start_date

leave_type:
- Paid / Sick / Unpaid


## Field Validation

### User

email:
- Required
- Unique
- Valid email format

password:
- Minimum 8 characters
- At least 1 uppercase character
- At least 1 digit

role:
- `hr`
- `employee`

### Employee

name:
- Required

email:
- Required

wage:
- Numeric
- Must not be negative

joining_date:
- Valid date

### Leave Request

start_date:
- Required

end_date:
- Required
- Must be >= start_date

leave_type:
- Paid / Sick / Unpaid



## Recommended Indexes

SQLite indexes should be considered for:

- `users.email`
- `employees.employee_code`
- `employees.email`
- `attendance.employee_id`
- `attendance.date`
- `leave_requests.employee_id`
- `leave_requests.status`


## Data → UI Mapping

### Employee Dashboard

Uses:

- employees.name
- employees.profile_picture
- attendance
- leave_requests
- paid_leave_balance
- sick_leave_balance

### HR Employee Grid

Uses:

- employees.employee_code
- employees.name
- employees.job_position
- employees.department
- employees.profile_picture
- today's attendance status

### HR Leave Approval

Uses:

- leave_requests
- employees.name
- leave_requests.leave_type
- leave_requests.start_date
- leave_requests.end_date
- leave_requests.remarks
- leave_requests.status
- leave_requests.admin_comment

### HR Salary View

Uses:

- employees.wage
- salary_config
- computed salary response


