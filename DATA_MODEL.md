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
