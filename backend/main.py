from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models
from .routes import (
    auth_routes,
    employee_routes,
    attendance_routes,
    leave_routes,
    salary_routes,
    activity_routes,
)
app = FastAPI(title="Dayflow HRMS")

Base.metadata.create_all(bind=engine)

from .database import SessionLocal
from .models import User as _User
_db = SessionLocal()
if not _db.query(_User).first():
    _db.close()
    from .seed import seed as _seed
    _seed()
else:
    _db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_routes.router,
    prefix="/api",
)

app.include_router(
    employee_routes.router,
    prefix="/api",
)

app.include_router(
    attendance_routes.router,
    prefix="/api",
)

app.include_router(
    leave_routes.router,
    prefix="/api",
)
app.include_router(
    salary_routes.router,
    prefix="/api",
)

app.include_router(
    activity_routes.router,
    prefix="/api",
)

@app.get("/")
def root():
    return {"message": "Dayflow backend is running"}
