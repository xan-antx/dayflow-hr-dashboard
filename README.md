# Dayflow — HRMS
Every workday, perfectly aligned.

HR management system built for NMIT Hacks 2026 (Odoo problem statement):
employee onboarding with auto-generated IDs, attendance check-in/out,
leave requests & approvals, and payroll visibility.

**Stack:** React (Vite) · FastAPI · SQLite

**Docs:** [Architecture](ARCHITECTURE.md) · [API Contract](API_CONTRACT.md) · [Data Model](DATA_MODEL.md) · [Design System](DESIGN_SYSTEM.md)

**Run:** _(added after setup)_
- Backend: `cd backend && pip install -r requirements.txt && python seed.py && uvicorn main:app --reload`
- Frontend: `cd frontend && npm i && npm run dev`

**Team:** P1 backend · P2 employee UI · P3 HR UI · P4 business logic
