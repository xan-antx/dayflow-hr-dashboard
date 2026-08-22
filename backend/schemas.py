from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class VerifyRequest(BaseModel):
    verify_token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str