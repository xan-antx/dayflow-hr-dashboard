# Dayflow — HRMS

### Every workday, perfectly aligned.

Dayflow is a role-based Human Resource Management System built to bring
employee management, attendance, leave, and payroll workflows into one
connected platform.

The system provides two experiences:

- **Employee** — self-service access to personal information, attendance,
  leave, and salary information.
- **HR / Admin** — organization-level management of employees, attendance,
  leave approvals, payroll, and reporting.

Both experiences operate on the same underlying system and data.

**Built for:** NMIT Hacks 2026 · Odoo Problem Statement

**Stack:** React (Vite) · FastAPI · SQLite

**Docs:** [Architecture](./ARCHITECTURE.md) · [API Contract](./API_CONTRACT.md) ·
[Data Model](./DATA_MODEL.md) · [Design System](./DESIGN_SYSTEM.md)

---

## Features

### Authentication & Role-Based Access

- Employee and HR/Admin roles
- Secure sign-in and registration
- Role-based dashboard routing
- Role-based access to employee data and actions

### Employee Management

- Employee onboarding
- Auto-generated employee IDs
- Employee profiles
- Personal and job information
- Profile picture
- Employee search and management
- Controlled profile editing

### Attendance

- Employee check-in / check-out
- Daily attendance
- Weekly attendance
- Attendance status tracking
- HR/Admin attendance monitoring

Supported states:

`Present` · `Absents` · `Half-day` · `Leave`

### Leave Management

- Leave application
- Leave type and date selection
- Date-range selection
- Remarks
- Leave request tracking
- HR/Admin approval and rejection
- Approval status synchronization

Supported states:

`Pending` · `Approved` · `Rejected`

### Payroll

- Employee salary visibility
- HR/Admin payroll management
- Salary structure information
- Role-based payroll access

### Dashboards

**Employee Dashboard**

- Personal overview
- Attendance
- Leave
- Salary
- Recent activity

**HR/Admin Dashboard**

- Employee overview
- Attendance overview
- Pending leave requests
- Employee management
- Payroll
- Reports and analytics
- Quick actions

---

## Architecture

Dayflow is built as one integrated system rather than separate
employee and HR applications.

```text
                         DAYFLOW
                            │
                     Authentication
                            │
                    Role-based Access
                            │
              ┌─────────────┴─────────────┐
              │                           │
         Employee UI                 HR / Admin UI
              │                           │
              └─────────────┬─────────────┘
                            │
                     Shared Backend
                            │
                     Shared Data Layer
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
      Employees         Attendance          Leave
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                         Payroll
