import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from ..auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from ..database import get_db
from ..models import User
from ..schemas import (
    SignupRequest,
    VerifyRequest,
    LoginRequest,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

security = HTTPBearer()


def validate_password(password: str) -> bool:
    if len(password) < 8:
        return False

    if not any(char.isupper() for char in password):
        return False

    if not any(char.isdigit() for char in password):
        return False

    return True


@router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
)
def signup(
    request: SignupRequest,
    db: Session = Depends(get_db),
):
    if request.role not in ["employee", "hr"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be employee or hr",
        )

    if not validate_password(request.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters with 1 uppercase letter and 1 digit",
        )

    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    verify_token = secrets.token_urlsafe(32)

    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role,
        is_verified=False,
        verify_token=verify_token,
        employee_id=None,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "verify_token": verify_token,
    }


@router.post("/verify")
def verify_email(
    request: VerifyRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.verify_token == request.verify_token)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token",
        )

    user.is_verified = True
    user.verify_token = None

    db.commit()

    return {
        "message": "verified"
    }


@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user or not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Email not verified",
        )

    token = create_access_token(
        {
            "user_id": user.id,
            "role": user.role,
            "employee_id": user.employee_id,
        }
    )

    employee_name = None

    if user.employee_id:
        from ..models import Employee

        employee = (
            db.query(Employee)
            .filter(Employee.id == user.employee_id)
            .first()
        )

        if employee:
            employee_name = employee.name

    return {
        "token": token,
        "role": user.role,
        "employee_id": user.employee_id,
        "name": employee_name,
    }


@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(credentials.credentials)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    employee_name = None

    if user.employee_id:
        from ..models import Employee

        employee = (
            db.query(Employee)
            .filter(Employee.id == user.employee_id)
            .first()
        )

        if employee:
            employee_name = employee.name

    return {
        "user_id": user.id,
        "role": user.role,
        "employee_id": user.employee_id,
        "name": employee_name,
        "email": user.email,
    }