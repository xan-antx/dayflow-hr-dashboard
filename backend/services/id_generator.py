"""Employee ID + initial password generation (Excalidraw spec).

Format: COMPANY_INITIALS + first 2 of first name + first 2 of last name
        + joining year + 4-digit serial
Example: OI + JO + DO + 2026 + 0001 -> OIJODO20260001
"""
import secrets
import string


def generate_employee_code(company_initials: str, first_name: str,
                           last_name: str, joining_year: int, serial: int) -> str:
    if serial < 1 or serial > 9999:
        raise ValueError("serial must be 1-9999")
    part = lambda s: "".join(c for c in s.upper() if c.isalpha())[:2].ljust(2, "X")
    return f"{company_initials.upper()}{part(first_name)}{part(last_name)}{joining_year}{serial:04d}"


def generate_initial_password(length: int = 10) -> str:
    """Random password satisfying PDF rules: >=8 chars, >=1 upper, >=1 digit."""
    alphabet = string.ascii_letters + string.digits
    while True:
        pw = "".join(secrets.choice(alphabet) for _ in range(length))
        if any(c.isupper() for c in pw) and any(c.isdigit() for c in pw):
            return pw
