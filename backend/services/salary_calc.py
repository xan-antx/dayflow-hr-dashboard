"""Salary calculation from wage + configurable rates. Pure - no DB, no HTTP.

Excalidraw spec: components auto-derive from wage; rates configurable,
never hard-coded to the 50,000 example.
  basic  = wage * basic_pct_of_wage
  hra    = basic * hra_pct_of_basic
  standard_allowance = flat amount, capped at what remains of the wage
  fixed_allowance    = remainder, so components always total the wage
  pf     = basic * pf_pct_of_basic (deduction)
  net    = wage - pf - professional_tax
"""

DEFAULT_CONFIG = {
    "basic_pct_of_wage": 0.50,
    "hra_pct_of_basic": 0.50,
    "std_allowance_flat": 4167,
    "perf_bonus_pct_of_wage": 0.0833,
    "lta_pct_of_wage": 0.0833,
    "pf_pct_of_basic": 0.12,
    "professional_tax_flat": 200,
}


def compute_salary(wage: float, config: dict = None) -> dict:
    if wage < 0:
        raise ValueError("wage cannot be negative")
    cfg = {**DEFAULT_CONFIG, **(config or {})}
    r = lambda x: round(x, 2)

    basic = wage * cfg["basic_pct_of_wage"]
    hra = basic * cfg["hra_pct_of_basic"]
    bonus = wage * cfg["perf_bonus_pct_of_wage"]
    lta = wage * cfg["lta_pct_of_wage"]

    # flat allowance is capped by what's left of the wage, so components
    # always sum exactly to the wage at every wage level
    remaining = max(0, wage - (basic + hra + bonus + lta))
    std = min(cfg["std_allowance_flat"], remaining)
    fixed = remaining - std

    pf = basic * cfg["pf_pct_of_basic"]
    ptax = min(cfg["professional_tax_flat"], wage)  # tax never exceeds tiny wages

    return {
        "wage": r(wage),
        "components": {
            "basic": r(basic), "hra": r(hra), "standard_allowance": r(std),
            "performance_bonus": r(bonus), "lta": r(lta),
            "fixed_allowance": r(fixed),
        },
        "deductions": {"pf_employee": r(pf), "professional_tax": r(ptax)},
        "gross": r(wage),
        "net": r(wage - pf - ptax),
    }
