import secrets
import string


def generate_employee_code(
    company_initials: str,
    first_name: str,
    last_name: str,
    joining_year: int,
    serial: int,
) -> str:

    if serial < 1 or serial > 9999:
        raise ValueError("serial must be 1-9999")

    part = lambda s: "".join(
        c for c in s.upper() if c.isalpha()
    )[:2].ljust(2, "X")

    return (
        f"{company_initials.upper()}"
        f"{part(first_name)}"
        f"{part(last_name)}"
        f"{joining_year}"
        f"{serial:04d}"
    )


def generate_initial_password(length: int = 10) -> str:

    alphabet = string.ascii_letters + string.digits

    while True:
        pw = "".join(
            secrets.choice(alphabet)
            for _ in range(length)
        )

        if (
            any(c.isupper() for c in pw)
            and any(c.isdigit() for c in pw)
        ):
            return pw