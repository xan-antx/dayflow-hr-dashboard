# Dayflow — HRMS Architecture

> **Source of truth:** the problem statement PDF. On any clash between PDF and Excalidraw, **the PDF wins.** The Excalidraw fills in UI/UX details the PDF doesn't specify.
>
> **Paste the relevant sections of this file into every AI coding prompt.** Especially: the API Contract, your role's ownership rules, and the Data Model.

---

## 1. Product in one line

HR creates an employee → system generates their Employee ID + password → employee logs in, checks in/out, applies for leave → HR approves → records update immediately → HR views payroll built from wage.

---

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + plain CSS or Tailwind | Fast, AI tools know it best |
| Backend | FastAPI (Python) | Simple, auto docs at `/docs`, easy for beginners to read |
| Database | SQLite (single file `dayflow.db`) | Zero setup, one machine demo, seed script friendly |
| Auth | JWT (access token in `Authorization: Bearer <token>`) | Stateless, simple |
| File storage | Local `/uploads` folder (profile pics, leave attachments) | No cloud needed |

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- CORS: allow `http://localhost:5173` on the backend. **Do this in the first hour.**

> If the team prefers Node: swap FastAPI → Express + better-sqlite3. Everything else in this doc stays identical.

---

## 3. Repo layout

```
dayflow/
├── ARCHITECTURE.md          ← this file
├── CONTRACT.md              ← copy of §6 API contract (optional split)
├── backend/
│   ├── main.py              # app entry, CORS, router mounting     (P1)
│   ├── database.py          # engine/session, create tables        (P1)
│   ├── models.py            # SQLAlchemy models                    (P1 ONLY)
│   ├── auth.py              # JWT, password hashing, role guards   (P1)
│   ├── routes/
│   │   ├── auth_routes.py                                          (P1)
│   │   ├── employee_routes.py                                      (P1)
│   │   ├── attendance_routes.py                                    (P1)
│   │   ├── leave_routes.py                                         (P1)
│   │   └── salary_routes.py                                        (P1)
│   ├── services/            # PURE FUNCTIONS, no DB, no HTTP       (P4 ONLY)
│   │   ├── attendance_calc.py
│   │   ├── leave_logic.py
│   │   ├── salary_calc.py
│   │   └── id_generator.py
│   ├── seed.py              # demo data script                     (P1)
│   └── uploads/             # stored files
└── frontend/
    └── src/
        ├── api/client.js    # single fetch wrapper w/ token        (P2, first)
        ├── auth/            # login, signup, verify pages          (P2)
        ├── employee/        # employee-facing pages                (P2 ONLY)
        ├── hr/              # HR-facing pages                      (P3 ONLY)
        └── shared/          # navbar, cards, status dot, tables    (P2+P3, coordinate)
```

**Ownership rules (prevents merge hell):**
- `models.py` and `routes/` → **only P1 edits.**
- `services/` → **only P4 edits.** Pure functions: take values in, return values out. No DB imports, no FastAPI imports. P1's routes import and call them.
- `frontend/src/employee/` → only P2. `frontend/src/hr/` → only P3. `shared/` → announce in group chat before touching.
- Branches: `feature/backend-p1`, `feature/employee-ui-p2`, `feature/hr-ui-p3`, `feature/business-p4`. Merge to `main` at integration checkpoints, everyone commits/pushes hourly under their own GitHub identity.

---

## 4. Roles & access rules (PDF §2, §3.3, §3.4, §3.6)

Two roles only: `hr` and `employee`.

| Capability | Employee | HR/Admin |
|---|---|---|
| View own profile / attendance / leaves / salary | ✅ | ✅ |
| View **other** employees' data | ❌ | ✅ |
| Edit own profile | Only `address`, `phone`, `profile_picture` | — |
| Edit any employee, any field | ❌ | ✅ |
| Create employees | ❌ | ✅ |
| Approve/reject leave (+ comment) | ❌ | ✅ |
| Update salary structure / wage | ❌ (read-only view of own) | ✅ |
| Check in / check out | ✅ (self only) | — |

> **Enforce in the API, not just the UI.** Every employee-role request is scoped to their own `employee_id` server-side. An employee calling `PUT /employees/{other_id}` or editing salary fields gets `403`.

---

## 5. Data model (5 tables)

```
users
├── id            INTEGER PK
├── email         TEXT UNIQUE NOT NULL
├── password_hash TEXT NOT NULL
├── role          TEXT ('hr' | 'employee')
├── is_verified   BOOLEAN default false      -- PDF: email verification required
├── verify_token  TEXT nullable              -- mock verification (see §8)
└── employee_id   INTEGER FK → employees.id  (nullable for pure-HR accounts)

employees
├── id              INTEGER PK
├── employee_code   TEXT UNIQUE      -- auto-generated, see §7 (e.g. OIJODO20260001)
├── name            TEXT NOT NULL
├── email           TEXT NOT NULL
├── phone           TEXT
├── address         TEXT
├── department      TEXT
├── job_position    TEXT
├── manager         TEXT
├── location        TEXT
├── joining_date    DATE
├── profile_picture TEXT (file path)
├── wage            REAL default 0    -- monthly wage; salary derives from this
├── paid_leave_balance REAL default 24
├── sick_leave_balance REAL default 7
└── (unpaid leave has no balance)

attendance
├── id           INTEGER PK
├── employee_id  INTEGER FK
├── date         DATE
├── check_in     DATETIME nullable
├── check_out    DATETIME nullable
├── work_hours   REAL nullable       -- computed by P4 fn on check-out
├── extra_hours  REAL nullable
├── status       TEXT ('Present'|'Absent'|'Half-day'|'Leave')   -- PDF's 4 statuses
└── UNIQUE(employee_id, date)

leave_requests
├── id           INTEGER PK
├── employee_id  INTEGER FK
├── leave_type   TEXT ('Paid'|'Sick'|'Unpaid')
├── start_date   DATE
├── end_date     DATE
├── remarks      TEXT
├── attachment   TEXT nullable (file path; sick certificates)
├── status       TEXT ('Pending'|'Approved'|'Rejected') default 'Pending'
├── admin_comment TEXT nullable
└── created_at   DATETIME

salary_config   (single row; global component rates — configurable, not hard-coded)
├── basic_pct_of_wage        REAL default 0.50
├── hra_pct_of_basic         REAL default 0.50
├── std_allowance_flat       REAL default 4167
├── perf_bonus_pct_of_wage   REAL default 0.0833
├── lta_pct_of_wage          REAL default 0.0833
├── pf_pct_of_basic          REAL default 0.12
└── professional_tax_flat    REAL default 200
```

Salary is **not stored per component** — it's computed on request from `wage` + `salary_config` (see §9). Changing wage automatically changes every component (Excalidraw requirement).

---

## 6. API contract

All responses JSON. Errors: `{ "detail": "message" }` with proper status codes (400/401/403/404). Protected routes require `Authorization: Bearer <token>`.

### Auth (PDF §3.1)
```
POST /auth/signup
  body: { name, email, password, role }        # role: 'employee' | 'hr'
  → 201 { user_id, verify_token }              # PDF requires signup; token = mock email verification
  password rules (PDF): min 8 chars, ≥1 uppercase, ≥1 digit → else 400

POST /auth/verify
  body: { verify_token }
  → 200 { message: "verified" }

POST /auth/login
  body: { email, password }
  → 200 { token, role, employee_id, name }
  → 401 { detail: "Invalid credentials" }      # PDF requires error messages
  → 403 { detail: "Email not verified" }

GET /auth/me
  → 200 { user_id, role, employee_id, name, email }
```

### Employees (PDF §3.3; Excalidraw create-flow)
```
GET  /employees                          # HR only
  → 200 [ { id, employee_code, name, job_position, department,
            profile_picture, today_status } ]
  # today_status: 'present'|'leave'|'absent' → drives green/yellow/red card dots

POST /employees                          # HR only — THE demo feature
  body: { name, email, phone, department, job_position, manager,
          location, joining_date, wage }
  → 201 { employee_code, initial_password, employee_id }
  # code from services/id_generator.py (§7); password auto-generated;
  # also creates linked users row (pre-verified — HR-created accounts skip mock verification)

GET  /employees/{id}                     # HR: any. Employee: self only, else 403
  → 200 { ...all profile fields, wage }

PUT  /employees/{id}                     # HR: all fields. Employee: self + ONLY
  body: partial fields                   # address/phone/profile_picture, else 403
  → 200 updated object

POST /employees/{id}/photo               # multipart upload → { profile_picture }
```

### Attendance (PDF §3.4)
```
POST /attendance/check-in                # employee, self; 400 if already checked in today
  → 200 { date, check_in, status: 'Present' }

POST /attendance/check-out               # employee, self; 400 if no check-in
  → 200 { date, check_in, check_out, work_hours, extra_hours, status }
  # calls services/attendance_calc.py

GET  /attendance/me?range=daily|weekly   # employee: own records (PDF: daily/weekly views)
  → 200 [ { date, check_in, check_out, work_hours, extra_hours, status } ]

GET  /attendance?date=&employee_id=      # HR only: all employees, filterable
  → 200 [ { employee_name, employee_code, date, check_in, check_out,
            work_hours, extra_hours, status } ]
```

### Leave (PDF §3.5)
```
POST /leaves                             # employee
  body: { leave_type, start_date, end_date, remarks }  (+ optional attachment upload)
  → 201 { id, status: 'Pending', days_requested }
  → 400 if end < start, or insufficient balance for Paid/Sick

GET  /leaves/me                          # employee: own requests + balances
  → 200 { balances: { paid, sick }, requests: [ ... ] }

GET  /leaves?status=Pending              # HR: all requests, filterable
  → 200 [ { id, employee_name, leave_type, start_date, end_date,
            remarks, attachment, status, admin_comment } ]

PUT  /leaves/{id}/decision               # HR only
  body: { decision: 'Approved'|'Rejected', admin_comment }
  → 200 updated request
  # On Approved (services/leave_logic.py):
  #   - deduct balance (Paid/Sick)
  #   - mark attendance status='Leave' for each date in range
  #   - change reflects immediately in employee views (PDF §3.5.2)
```

### Salary (PDF §3.6)
```
GET /salary/{employee_id}                # HR: any. Employee: self only.
  → 200 { wage, components: { basic, hra, standard_allowance,
          performance_bonus, lta, fixed_allowance },
          deductions: { pf_employee, professional_tax },
          gross, net }                   # computed live via services/salary_calc.py

PUT /salary/{employee_id}                # HR only
  body: { wage }                         # components auto-recompute
  → 200 same shape as GET
```

### Dashboard (PDF §3.2.1 "recent activity or alerts")
```
GET /activity/me                         # employee
  → 200 [ { text: "Checked in at 9:02 AM", time }, 
          { text: "Paid leave 28–29 Aug approved", time } ]
  # derived from attendance + leave tables; no notification system
```

---

## 7. Employee ID generation (Excalidraw spec) — `services/id_generator.py`

Format: `[COMPANY_INITIALS][FIRST 2 of first name][FIRST 2 of last name][JOINING_YEAR][4-digit serial]`

Example from spec: **OI** (Odoo India) + **JO** (John) + **DO** (Doe) + **2026** + **0001** → `OIJODO20260001`

```
generate_employee_code(company_initials, first_name, last_name, joining_year, serial)
  → uppercase; serial = (count of employees joined that year) + 1, zero-padded to 4
```

Initial password: random 10 chars meeting the password rules; returned **once** in the create response, stored only as a hash.

---

## 8. Email verification (PDF requires it — mocked, no SMTP)

- Signup creates the user with `is_verified=false` and a `verify_token`, returned in the response.
- Frontend shows: *"Verification email sent — [Verify now]"* button that calls `POST /auth/verify` with the token (simulates clicking the email link).
- Login before verification → 403 "Email not verified".
- **HR-created employee accounts are created pre-verified** (onboarding flow shouldn't require a fake inbox).

This satisfies the PDF's state machine (registered → verified → can log in) with zero email infrastructure.

---

## 9. Business rules — `services/` (P4, pure functions)

### `attendance_calc.py`
```
calc_attendance(check_in, check_out) → { work_hours, extra_hours, status }
```
- `work_hours = check_out − check_in` in hours (round 2dp)
- Standard day = 8h. `extra_hours = max(0, work_hours − 8)`
- Status: `work_hours ≥ 4` → `Present`; `0 < work_hours < 4` → `Half-day`
- No check-in that day: approved leave covering the date → `Leave`, else `Absent`
- Missing check-out at day end: treat as 0 extra, status from check-in existence (keep it simple)

### `leave_logic.py`
```
days_requested(start, end) → inclusive day count
validate_request(type, days, balances) → ok | error("insufficient balance") | error("invalid dates")
apply_approval(type, days, balances) → new balances   # Paid/Sick deduct; Unpaid doesn't
```
- Unpaid leave days reduce payable days (used by salary view if time permits — Excalidraw note; not MVP-blocking).

### `salary_calc.py`
```
compute_salary(wage, config) → { components..., deductions..., gross, net }
```
- basic = wage × basic_pct
- hra = basic × hra_pct
- standard_allowance = flat
- performance_bonus = wage × pct; lta = wage × pct
- fixed_allowance = wage − (basic + hra + std + bonus + lta)  ← remainder; **floor at 0, validate components ≤ wage**
- pf_employee = basic × pf_pct; professional_tax = flat
- gross = wage; net = gross − pf_employee − professional_tax
- Rates always read from config — **never hard-code the ₹50,000 example.**

---

## 10. Frontend pages

**Shared:** login, signup (+ mock verify step), top navbar (logo | Employees/Attendance/Time Off tabs | avatar menu: My Profile, Log Out — per Excalidraw).

**Employee (P2):**
- Dashboard: quick-access cards (Profile, Attendance, Leave Requests, Logout) + recent activity list (PDF §3.2.1)
- Profile: view all incl. read-only salary; edit address/phone/picture only
- Attendance: **Check In / Check Out buttons**, current status, daily/weekly table (Date, Check In, Check Out, Work Hours, Extra Hours)
- Time Off: balances (Paid/Sick), request form (type, date range, remarks, attachment), my requests with live status

**HR (P3):**
- Employee grid: cards (photo, name, position, dept) with **status dot — green=Present, yellow=Leave, red=Absent** (from `today_status`). Cards clickable → read-only profile view (Excalidraw). Search bar.
- **+ New Employee** form → success modal showing generated **Employee ID + initial password** (the demo moment)
- Attendance: all-employee table with date/employee filters
- Leave approvals: pending list → Approve/Reject + comment
- Employee detail: tabs Resume / Private Info / **Salary Info (HR-only tab)** with wage input → components recompute live

**Design tokens:** bg `#F8FAFC` · nav `#0F172A` · primary `#0EA5E9` · cards `#FFFFFF` border `#E2E8F0` · text `#0F172A`/`#64748B` · status `#22C55E`/`#EAB308`/`#EF4444`.

---

## 11. Seed data (`backend/seed.py`, P1, by hour 3)

- 1 HR account (verified): `hr@dayflow.com` / `Dayflow@123`
- 6–8 employees across 2–3 departments, wages set, generated codes
- 5 days of attendance history each (mix of Present/Half-day/Absent/Leave)
- 2 pending + 1 approved + 1 rejected leave request
- Today: 3–4 employees pre-checked-in → the HR grid shows mixed dot colors immediately

Run: `python seed.py` (drops & recreates `dayflow.db`).

---

## 12. Timeline & integration checkpoints

| Time | Milestone |
|---|---|
| 8:30–9:10 | No code. Read this doc together, agree contract, create branches |
| **10:30** | **Micro-integration #1:** P1 login endpoint live, wired into P2 & P3 shells on ONE machine. CORS/token issues die here, cheap |
| 12:00–1:30 | Full integration: create-employee → login → check-in → leave → approve loop working end-to-end |
| ~3:00 | Seeded demo environment on the demo machine; polish |
| **~hour 7** | **Record backup screen-recording of the full demo flow** |
| Last hour | Rehearse. **No new features.** |

**Demo script (3 min):** HR logs in → grid with colored dots → creates "John Doe" → shows auto-ID + password → John logs in (new tab/incognito) → dashboard greeting + activity → Check In (dot flips green on HR grid) → applies Sick leave w/ attachment → HR approves w/ comment → John's status = Approved, balance dropped → HR opens John's Salary tab, edits wage, components recompute live.

---

## 13. Cut list (do NOT build)

Real emails/SMTP · analytics & report dashboards · salary-slip PDF export · skills/certifications/resume sections beyond static placeholders · bank/PAN/UAN fields · multi-company support · password reset flow · notifications system · advanced attendance filters · animations. (PDF itself marks alerts + analytics/reports as Future Enhancements.)

If ahead of schedule, the ONLY stretch goals worth it, in order: (1) attendance % + leave breakdown mini-charts on HR dashboard, (2) salary-slip view styled nicely, (3) payable-days calc from unpaid leave.
