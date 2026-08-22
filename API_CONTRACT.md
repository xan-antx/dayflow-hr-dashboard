# DAYFLOW — API CONTRACT

Version: 1.1
Backend: FastAPI · Database: SQLite · Style: REST
Base URL: **`/api`** (every path below is prefixed with `/api`)

---

## Conventions

- All requests/responses are JSON unless noted (file uploads are `multipart/form-data`).
- Auth: JWT in header → `Authorization: Bearer <token>`. All endpoints except `/auth/signup`, `/auth/verify`, `/auth/login` require it.
- Errors: `{ "detail": "message" }` with status `400` (bad input), `401` (not logged in), `403` (wrong role / not your record), `404` (not found).
- Dates: `YYYY-MM-DD`. Datetimes: ISO 8601 (`2026-08-22T09:02:00`).
- Roles: `hr` | `employee`. Employee-role requests are always scoped server-side to their own `employee_id`.
- Statuses (exact strings, case-sensitive): attendance `Present | Absent | Half-day | Leave` · leave `Pending | Approved | Rejected` · leave types `Paid | Sick | Unpaid`.

---

## 1. Auth

### POST /api/auth/signup
Public sign-up (PDF §3.1.1). Password rules: min 8 chars, ≥1 uppercase, ≥1 digit → else `400`.
```json
// request
{ "name": "Priya Sharma", "email": "priya@x.com", "password": "Dayflow123", "role": "hr" }
// 201
{ "user_id": 1, "verify_token": "abc123..." }
```

### POST /api/auth/verify
Mock email verification — frontend calls this with the token from signup.
```json
// request
{ "verify_token": "abc123..." }
// 200
{ "message": "verified" }
```

### POST /api/auth/login
```json
// request
{ "email": "priya@x.com", "password": "Dayflow123" }
// 200
{ "token": "eyJ...", "role": "hr", "employee_id": null, "name": "Priya Sharma" }
// 401 → { "detail": "Invalid credentials" }
// 403 → { "detail": "Email not verified" }
```

### GET /api/auth/me
```json
// 200
{ "user_id": 1, "role": "hr", "employee_id": null, "name": "Priya Sharma", "email": "priya@x.com" }
```

---

## 2. Employees

### GET /api/employees — **HR only**
Employee grid. `today_status` drives the card status dot.
```json
// 200
[ { "id": 2, "employee_code": "OIJODO20260001", "name": "John Doe",
    "job_position": "Developer", "department": "Engineering",
    "profile_picture": "/uploads/2.jpg", "today_status": "present" } ]
// today_status: "present" | "leave" | "absent"
```

### POST /api/employees — **HR only** (the demo feature)
Creates employee + linked pre-verified user account. ID + password auto-generated.
```json
// request
{ "name": "John Doe", "email": "john@x.com", "phone": "98xxxxxx",
  "department": "Engineering", "job_position": "Developer",
  "manager": "Priya Sharma", "location": "Bengaluru",
  "joining_date": "2026-08-22", "wage": 50000 }
// 201
{ "employee_id": 2, "employee_code": "OIJODO20260001", "initial_password": "Xk4mQp2rTa" }
```

### GET /api/employees/{id}
HR: any employee. Employee: self only, else `403`.
```json
// 200 — all profile fields
{ "id": 2, "employee_code": "OIJODO20260001", "name": "John Doe",
  "email": "john@x.com", "phone": "98xxxxxx", "address": "…",
  "department": "Engineering", "job_position": "Developer",
  "manager": "Priya Sharma", "location": "Bengaluru",
  "joining_date": "2026-08-22", "profile_picture": "/uploads/2.jpg",
  "wage": 50000,
  "paid_leave_balance": 24, "sick_leave_balance": 7 }
```

### PUT /api/employees/{id}
Partial update. HR: any field. Employee: self + ONLY `address`, `phone`, `profile_picture` — any other field → `403`.
```json
// request (employee editing self)
{ "phone": "97xxxxxx", "address": "New address" }
// 200 → updated employee object (same shape as GET)
```

### POST /api/employees/{id}/photo
`multipart/form-data`, field `file`. → `200 { "profile_picture": "/uploads/2.jpg" }`

---

## 3. Attendance

### POST /api/attendance/check-in — employee, self
`400` if already checked in today.
```json
// 200
{ "date": "2026-08-22", "check_in": "2026-08-22T09:02:00", "status": "Present" }
```

### POST /api/attendance/check-out — employee, self
`400` if no check-in today.
```json
// 200
{ "date": "2026-08-22", "check_in": "2026-08-22T09:02:00",
  "check_out": "2026-08-22T18:30:00",
  "work_hours": 9.47, "extra_hours": 1.47, "status": "Present" }
```

### GET /api/attendance/me?range=daily|weekly — employee, own records
```json
// 200
[ { "date": "2026-08-22", "check_in": "2026-08-22T09:02:00",
    "check_out": "2026-08-22T18:30:00", "work_hours": 9.47,
    "extra_hours": 1.47, "status": "Present" } ]
```

### GET /api/attendance?date=2026-08-22&employee_id=2 — **HR only**
Both query params optional (filters).
```json
// 200
[ { "employee_name": "John Doe", "employee_code": "OIJODO20260001",
    "date": "2026-08-22", "check_in": "…", "check_out": "…",
    "work_hours": 9.47, "extra_hours": 1.47, "status": "Present" } ]
```

---

## 4. Leave

### POST /api/leaves — employee
Optional attachment: send as `multipart/form-data` with field `attachment`; otherwise JSON.
`400` if end < start or insufficient balance (Paid/Sick).
```json
// request
{ "leave_type": "Sick", "start_date": "2026-08-28",
  "end_date": "2026-08-29", "remarks": "Fever" }
// 201
{ "id": 7, "status": "Pending", "days_requested": 2 }
```

### GET /api/leaves/me — employee
```json
// 200
{ "balances": { "paid": 24, "sick": 7 },
  "requests": [ { "id": 7, "leave_type": "Sick", "start_date": "2026-08-28",
                  "end_date": "2026-08-29", "remarks": "Fever",
                  "attachment": null, "status": "Pending",
                  "admin_comment": null, "created_at": "2026-08-22T10:15:00" } ] }
```

### GET /api/leaves?status=Pending — **HR only**
`status` optional; omit for all.
```json
// 200
[ { "id": 7, "employee_id": 2, "employee_name": "John Doe",
    "leave_type": "Sick", "start_date": "2026-08-28", "end_date": "2026-08-29",
    "remarks": "Fever", "attachment": null, "status": "Pending",
    "admin_comment": null } ]
```

### PUT /api/leaves/{id}/decision — **HR only**
On `Approved`: deducts balance (Paid/Sick), marks attendance `Leave` for each date in range. Reflects immediately in employee views (PDF §3.5.2).
```json
// request
{ "decision": "Approved", "admin_comment": "Get well soon" }
// 200
{ "id": 7, "status": "Approved", "admin_comment": "Get well soon" }
```

---

## 5. Salary

### GET /api/salary/{employee_id}
HR: any. Employee: self only, else `403`. Computed live from wage — never stored per-component.
```json
// 200
{ "wage": 50000,
  "components": { "basic": 25000, "hra": 12500, "standard_allowance": 4167,
                  "performance_bonus": 4165, "lta": 4165,
                  "fixed_allowance": 3, "...": "components always sum to wage" },
  "deductions": { "pf_employee": 3000, "professional_tax": 200 },
  "gross": 50000, "net": 46800 }
```

### PUT /api/salary/{employee_id} — **HR only**
```json
// request
{ "wage": 60000 }
// 200 → same shape as GET, recomputed
```

---

## 6. Dashboard

### GET /api/activity/me — employee
Recent activity list (PDF §3.2.1). Derived from attendance + leave tables.
```json
// 200
[ { "text": "Checked in at 9:02 AM", "time": "2026-08-22T09:02:00" },
  { "text": "Sick leave 28–29 Aug approved", "time": "2026-08-22T11:40:00" } ]
```

---

## Change policy

This contract mirrors ARCHITECTURE.md §6. Any change: update ARCHITECTURE.md first, then this file, then announce in the group chat — before changing code on either side.
