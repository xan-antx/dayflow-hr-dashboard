# DAYFLOW — API CONTRACT

Version: 1.0

Backend: FastAPI
Database: SQLite
API Style: REST
Base URL: `/api`

---

## 1. Purpose

This document defines the contract between the Dayflow frontend and
backend.

It specifies:

- Available API endpoints
- HTTP methods
- Request parameters
- Request bodies
- Response structures
- Authentication requirements
- Role-based access
- Error responses
- Core data formats

The frontend and backend should follow this contract when communicating.

If an implementation detail changes, update this document before changing
the corresponding frontend/backend integration.

---

# 2. API CONVENTIONS

## Base URL

```text
/api
