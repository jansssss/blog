"""
금융 계산 엔진 + 결과 렌더러 + 글 검증기

원칙:
- 금융 수치는 LLM이 문장으로 추정하지 않는다. 이 모듈의 순수 함수가 산출한 값만 본문에 주입한다.
- 계산 가정 표 / 계산 과정 표 / 시나리오 비교표 / 상단 핵심 답변은 모두 이 모듈이 생성한다.
- LLM은 서사(해석 문단, 행동 가이드, FAQ, 출처)만 담당한다.

지원 계산 유형:
- "dsr_capacity" : 소득·DSR·기존부채(자동차 할부·신용대출 등) → 주담대 환산 한도 및 감소폭
- "refinancing"  : 대환대출 손익 (금리차 절감 vs 중도상환수수료)

계산 유형이 없거나 미지원이면 calc_result=None → 검증기는 "계산 없음"으로 처리한다.
"""
from __future__ import annotations

import html as _html
import re
from dataclasses import dataclass, field
from typing import Any


# ───────────────────────────────────────────
# 순수 계산 함수 (금리는 소수, 예: 4.5% = 0.045)
# ───────────────────────────────────────────

def annual_debt_capacity(annual_income: float, dsr_limit: float) -> float:
    """DSR 상한상 연간 원리금 상환 가능액 = 연소득 × DSR 한도"""
    return annual_income * dsr_limit


def existing_annual_debt_payment(existing_monthly_payment: float) -> float:
    """기존부채 연간 상환액 = 월상환액 × 12"""
    return existing_monthly_payment * 12


def loan_principal_by_monthly_payment(monthly_payment: float, annual_rate: float, years: int) -> float:
    """원리금균등 현재가치 공식으로 월 상환액 → 대출 원금(환산 한도) 산출.

    principal = monthlyPayment * (1 - (1 + monthlyRate)^(-months)) / monthlyRate
    """
    if monthly_payment <= 0:
        return 0.0
    monthly_rate = annual_rate / 12
    months = years * 12
    if monthly_rate == 0:
        return monthly_payment * months
    return monthly_payment * (1 - (1 + monthly_rate) ** (-months)) / monthly_rate


# ───────────────────────────────────────────
# 금액 포맷 (원 → 만 원 / 억 원)
# ───────────────────────────────────────────

def format_krw_short(won: float, approx: bool = True) -> str:
    """원 단위 금액을 '약 X.XX억 원' 또는 '약 X,XXX만 원'으로 반올림 표기."""
    prefix = "약 " if approx else ""
    won = round(won)
    if won == 0:
        return "0원"
    sign = "-" if won < 0 else ""
    won = abs(won)
    if won >= 100_000_000:  # 1억 이상
        eok = won / 100_000_000
        return f"{prefix}{sign}{eok:.2f}억 원"
    man = round(won / 10_000)
    return f"{prefix}{sign}{man:,}만 원"


def format_man_1dp(won: float, approx: bool = True) -> str:
    """월 상환액처럼 만 원 단위 소수 첫째자리까지 표기: '약 166.7만 원'."""
    prefix = "약 " if approx else ""
    man = won / 10_000
    sign = "-" if man < 0 else ""
    return f"{prefix}{sign}{abs(man):.1f}만 원"


def format_pct(rate: float) -> str:
    """0.045 → '4.5%'"""
    return f"{rate * 100:g}%"


# ───────────────────────────────────────────
# 계산 결과 자료구조
# ───────────────────────────────────────────

@dataclass
class CalcResult:
    calc_type: str
    as_of: str                       # 기준일 (예: "2026.07" 또는 "2026.07.08")
    answer_box: str                  # 상단 핵심 답변 (300자 이내)
    assumption_rows: list[tuple[str, str]]           # 계산 가정 표 (라벨, 값)
    calc_process_headers: list[str]                  # 계산 과정 표 헤더
    calc_process_rows: list[list[str]]               # 계산 과정 표 행
    scenario_headers: list[str]                      # 시나리오 비교표 헤더
    scenario_rows: list[list[str]]                   # 시나리오 비교표 행
    raw: dict = field(default_factory=dict)          # 검증용 원시 수치


# ───────────────────────────────────────────
# dsr_capacity: 기존부채 → 주담대 환산 한도 감소
# ───────────────────────────────────────────

def compute_dsr_capacity(calc: dict) -> CalcResult:
    """
    필요 입력 (calc dict):
      annual_income            연소득 (원)
      dsr_limit                DSR 한도 (소수, 예: 0.40)
      existing_monthly_payment 기본 사례의 기존부채 월상환액 (원)
      mortgage_rate            주담대 금리 (소수, 예: 0.045)
      years                    대출기간 (년)
      repayment_type           상환방식 (문자열, 기본 '원리금균등')
      as_of                    기준일 (문자열)
      existing_label           기존부채 항목명 (예: '자동차 할부') — 선택
      scenarios                비교할 기존부채 월상환액 리스트 (원) — 선택
    """
    income = float(calc["annual_income"])
    dsr = float(calc["dsr_limit"])
    base_monthly = float(calc["existing_monthly_payment"])
    rate = float(calc["mortgage_rate"])
    years = int(calc["years"])
    repay = calc.get("repayment_type", "원리금균등")
    as_of = str(calc.get("as_of", "")).strip()
    debt_label = calc.get("existing_label", "기존부채")

    cap = annual_debt_capacity(income, dsr)          # 연간 상환 가능액
    cap_monthly = cap / 12

    def principal_for(monthly_debt: float) -> dict:
        ea = existing_annual_debt_payment(monthly_debt)
        ma = cap - ea
        mm = ma / 12
        p = loan_principal_by_monthly_payment(mm, rate, years) if mm > 0 else 0.0
        return {"monthly_debt": monthly_debt, "existing_annual": ea,
                "mortgage_annual": ma, "mortgage_monthly": mm, "principal": p}

    no_debt = principal_for(0.0)
    base = principal_for(base_monthly)
    decrease = no_debt["principal"] - base["principal"]

    # ── 상단 핵심 답변 (숫자는 전부 계산값) ──
    answer_box = (
        f"연소득 {format_krw_short(income, approx=False)}, DSR {format_pct(dsr)}, "
        f"주담대 금리 {format_pct(rate)}, {years}년 {repay} 기준으로 "
        f"{debt_label}가 없으면 주담대 환산 한도는 {format_krw_short(no_debt['principal'])}입니다. "
        f"{debt_label} 월 {format_krw_short(base_monthly, approx=False)}이 있으면 한도는 "
        f"{format_krw_short(base['principal'])}으로 줄어들며, 감소폭은 "
        f"{format_krw_short(decrease)}입니다."
    )

    # ── 계산 가정 표 ──
    assumption_rows = [
        ("연소득", format_krw_short(income, approx=False)),
        ("DSR 한도", format_pct(dsr)),
        ("연간 원리금 상환 가능액", format_krw_short(cap, approx=False)),
        (debt_label, f"월 {format_krw_short(base_monthly, approx=False)}"),
        (f"{debt_label} 연간 상환액", format_krw_short(existing_annual_debt_payment(base_monthly), approx=False)),
        ("주담대 금리", f"연 {format_pct(rate)}"),
        ("상환 방식", f"{years}년 {repay}"),
        ("기준일", as_of or "본문 참조"),
    ]

    # ── 계산 과정 표 ──
    calc_process_headers = [
        "구분", "DSR상 연간 상환 가능액", f"{debt_label} 연간 상환액",
        "주담대 연간 상환 여력", "월 상환 가능액", "주담대 환산 한도",
    ]
    calc_process_rows = [
        [f"{debt_label} 없음",
         format_krw_short(cap, approx=False), "0원",
         format_krw_short(no_debt["mortgage_annual"], approx=False),
         format_man_1dp(no_debt["mortgage_monthly"]),
         format_krw_short(no_debt["principal"])],
        [f"{debt_label} 월 {format_krw_short(base_monthly, approx=False)}",
         format_krw_short(cap, approx=False),
         format_krw_short(base["existing_annual"], approx=False),
         format_krw_short(base["mortgage_annual"], approx=False),
         format_man_1dp(base["mortgage_monthly"]),
         format_krw_short(base["principal"])],
        ["차이", "-",
         f"-{format_krw_short(base['existing_annual'], approx=False)}",
         f"-{format_krw_short(no_debt['mortgage_annual'] - base['mortgage_annual'], approx=False)}",
         format_man_1dp(base["mortgage_monthly"] - no_debt["mortgage_monthly"]),
         format_krw_short(-decrease)],
    ]

    # ── 시나리오 비교표 ──
    scenarios = calc.get("scenarios")
    if not scenarios:
        scenarios = [0, 300_000, 500_000, 800_000]
    # 기본 사례 월상환액이 시나리오에 없으면 추가
    if base_monthly not in scenarios:
        scenarios = sorted(set(list(scenarios) + [base_monthly]))
    scenario_headers = [
        f"{debt_label} 월 납입액", f"{debt_label} 연간 반영액",
        "주담대 연간 상환 여력", "주담대 환산 한도", "할부 없음 대비 감소폭",
    ]
    scenario_rows = []
    for mp in scenarios:
        r = principal_for(float(mp))
        dec = no_debt["principal"] - r["principal"]
        label = "없음" if mp == 0 else f"월 {format_krw_short(mp, approx=False)}"
        scenario_rows.append([
            label,
            format_krw_short(r["existing_annual"], approx=False),
            format_krw_short(r["mortgage_annual"], approx=False),
            format_krw_short(r["principal"]),
            "-" if mp == 0 else format_krw_short(-dec),
        ])

    return CalcResult(
        calc_type="dsr_capacity",
        as_of=as_of,
        answer_box=answer_box,
        assumption_rows=assumption_rows,
        calc_process_headers=calc_process_headers,
        calc_process_rows=calc_process_rows,
        scenario_headers=scenario_headers,
        scenario_rows=scenario_rows,
        raw={
            "annual_capacity": cap,
            "no_debt_principal": no_debt["principal"],
            "base_principal": base["principal"],
            "decrease": decrease,
            "scenarios": scenarios,
        },
    )


# ───────────────────────────────────────────
# refinancing: 대환대출 손익 (금리차 절감 vs 중도상환수수료)
# ───────────────────────────────────────────

def compute_refinancing(calc: dict) -> CalcResult:
    """
    필요 입력:
      balance             현재 대출 잔액 (원)
      current_rate        현재 금리 (소수)
      new_rate            신규 금리 (소수)
      remaining_years     잔여기간 (년)
      prepayment_fee_rate 중도상환수수료율 (소수, 예: 0.012)
      as_of               기준일
    간이 모델: 연간 이자 절감 = 잔액 × (현재금리 - 신규금리)
    중도상환수수료 = 잔액 × 수수료율
    손익분기 개월 = 수수료 / (월 이자 절감액)
    """
    bal = float(calc["balance"])
    cur = float(calc["current_rate"])
    new = float(calc["new_rate"])
    years = int(calc.get("remaining_years", 0))
    fee_rate = float(calc.get("prepayment_fee_rate", 0))
    as_of = str(calc.get("as_of", "")).strip()

    annual_saving = bal * (cur - new)
    monthly_saving = annual_saving / 12
    fee = bal * fee_rate
    breakeven_months = (fee / monthly_saving) if monthly_saving > 0 else float("inf")
    total_saving = annual_saving * years - fee

    be_txt = "즉시 손익 없음" if monthly_saving <= 0 else (
        f"약 {breakeven_months:.1f}개월" if breakeven_months != float("inf") else "-")
    net_txt = format_krw_short(total_saving)

    answer_box = (
        f"현재 잔액 {format_krw_short(bal, approx=False)}, 금리 {format_pct(cur)}→{format_pct(new)}, "
        f"잔여 {years}년, 중도상환수수료율 {format_pct(fee_rate)} 기준으로 "
        f"연간 이자 절감액은 {format_krw_short(annual_saving)}입니다. "
        f"중도상환수수료 {format_krw_short(fee)}을 회수하는 손익분기점은 {be_txt}이며, "
        f"잔여기간 전체 순손익은 {net_txt}입니다."
    )

    assumption_rows = [
        ("현재 대출 잔액", format_krw_short(bal, approx=False)),
        ("현재 금리", f"연 {format_pct(cur)}"),
        ("신규 금리", f"연 {format_pct(new)}"),
        ("잔여기간", f"{years}년"),
        ("중도상환수수료율", format_pct(fee_rate)),
        ("기준일", as_of or "본문 참조"),
    ]
    calc_process_headers = ["구분", "금액"]
    calc_process_rows = [
        ["연간 이자 절감액", format_krw_short(annual_saving)],
        ["월 이자 절감액", format_man_1dp(monthly_saving)],
        ["중도상환수수료", format_krw_short(fee, approx=False)],
        ["손익분기점", be_txt],
        ["잔여기간 순손익", net_txt],
    ]
    # 금리차 시나리오 비교
    scenario_headers = ["신규 금리", "연간 절감액", "손익분기점", "잔여기간 순손익"]
    scenario_rows = []
    for nr in sorted({new, round(cur - 0.005, 4), round(cur - 0.010, 4), round(cur - 0.015, 4)}):
        if nr >= cur:
            continue
        a_sav = bal * (cur - nr)
        m_sav = a_sav / 12
        be = (fee / m_sav) if m_sav > 0 else float("inf")
        net = a_sav * years - fee
        scenario_rows.append([
            f"연 {format_pct(nr)}",
            format_krw_short(a_sav),
            f"약 {be:.1f}개월" if be != float("inf") else "-",
            format_krw_short(net),
        ])

    return CalcResult(
        calc_type="refinancing",
        as_of=as_of,
        answer_box=answer_box,
        assumption_rows=assumption_rows,
        calc_process_headers=calc_process_headers,
        calc_process_rows=calc_process_rows,
        scenario_headers=scenario_headers,
        scenario_rows=scenario_rows,
        raw={"annual_saving": annual_saving, "fee": fee,
             "breakeven_months": breakeven_months, "total_saving": total_saving},
    )


# ───────────────────────────────────────────
# 원리금균등 / 원금균등 상환 공식 (프론트 계산기와 동일)
#   원리금균등 월납입 = P·r(1+r)^n / ((1+r)^n − 1)
#   원금균등 첫 달   = 원금/개월 + 잔액×월이자 (잔액 체감으로 매월 감소)
# ───────────────────────────────────────────

def epi_monthly_payment(principal: float, annual_rate: float, months: int) -> float:
    """원리금균등 월 납입액 (매월 동일)."""
    if principal <= 0 or months <= 0:
        return 0.0
    r = annual_rate / 12
    if r == 0:
        return principal / months
    return principal * (r * (1 + r) ** months) / ((1 + r) ** months - 1)


def epi_total_interest(principal: float, annual_rate: float, months: int) -> float:
    """원리금균등 총이자 = 월납입액 × 개월 − 원금."""
    return epi_monthly_payment(principal, annual_rate, months) * months - principal


def ep_first_monthly_payment(principal: float, annual_rate: float, months: int) -> float:
    """원금균등 첫 달 납입액 = 원금/개월 + 원금×월이자."""
    if principal <= 0 or months <= 0:
        return 0.0
    return principal / months + principal * (annual_rate / 12)


def ep_total_interest(principal: float, annual_rate: float, months: int) -> float:
    """원금균등 총이자 = 매월 잔액×월이자 누적."""
    if principal <= 0 or months <= 0:
        return 0.0
    r = annual_rate / 12
    princ = principal / months
    balance = principal
    total = 0.0
    for _ in range(months):
        total += balance * r
        balance -= princ
    return total


# ───────────────────────────────────────────
# amortization: 대출 원금·금리·기간 → 월 납입액·총이자 (보금자리론·주담대 월납입)
# ───────────────────────────────────────────

def compute_amortization(calc: dict) -> CalcResult:
    """
    필요 입력:
      principal        대출 원금 (원)
      mortgage_rate    금리 (소수, 예: 0.049)   ← annual_rate 로도 허용
      years            대출기간 (년)
      repayment_type   상환방식 (기본 '원리금균등')
      as_of            기준일
      rate_scenarios   비교할 금리 리스트 (소수) — 선택. 없으면 기간 민감도로 대체
    """
    principal = float(calc["principal"])
    rate = float(calc.get("mortgage_rate", calc.get("annual_rate")))
    years = int(calc["years"])
    repay = calc.get("repayment_type", "원리금균등")
    as_of = str(calc.get("as_of", "")).strip()
    months = years * 12

    epi_m = epi_monthly_payment(principal, rate, months)
    epi_int = epi_total_interest(principal, rate, months)
    ep_m = ep_first_monthly_payment(principal, rate, months)
    ep_int = ep_total_interest(principal, rate, months)

    answer_box = (
        f"대출 원금 {format_krw_short(principal, approx=False)}, 금리 연 {format_pct(rate)}, "
        f"{years}년 원리금균등 기준으로 월 납입액은 {format_man_1dp(epi_m)}, "
        f"총이자는 {format_krw_short(epi_int)}, 총상환액은 {format_krw_short(principal + epi_int)}입니다. "
        f"원금균등으로 상환하면 첫 달 {format_man_1dp(ep_m)}로 시작해 매월 줄어들고, "
        f"총이자는 {format_krw_short(ep_int)}로 원리금균등보다 "
        f"{format_krw_short(epi_int - ep_int)} 적습니다."
    )

    assumption_rows = [
        ("대출 원금", format_krw_short(principal, approx=False)),
        ("금리", f"연 {format_pct(rate)}"),
        ("대출기간", f"{years}년 ({months}개월)"),
        ("상환 방식", repay),
        ("기준일", as_of or "본문 참조"),
    ]

    calc_process_headers = ["상환 방식", "월 납입액", "총이자", "총상환액"]
    calc_process_rows = [
        ["원리금균등", format_man_1dp(epi_m),
         format_krw_short(epi_int), format_krw_short(principal + epi_int)],
        ["원금균등(첫 달)", format_man_1dp(ep_m),
         format_krw_short(ep_int), format_krw_short(principal + ep_int)],
        ["차이", format_man_1dp(ep_m - epi_m),
         format_krw_short(ep_int - epi_int), format_krw_short(ep_int - epi_int)],
    ]

    # 시나리오: 금리 리스트가 있으면 금리 민감도, 없으면 기간 민감도(사실 기반)
    rate_scenarios = calc.get("rate_scenarios")
    if rate_scenarios:
        scenario_headers = ["적용 금리", "월 납입액(원리금균등)", "총이자", "총상환액"]
        scenario_rows = []
        for rr in sorted({round(float(x), 5) for x in rate_scenarios} | {rate}):
            m = epi_monthly_payment(principal, rr, months)
            it = epi_total_interest(principal, rr, months)
            scenario_rows.append([
                f"연 {format_pct(rr)}", format_man_1dp(m),
                format_krw_short(it), format_krw_short(principal + it),
            ])
    else:
        term_set = sorted({max(10, years - 10), years, years + 10})
        scenario_headers = ["대출기간", "월 납입액(원리금균등)", "총이자", "총상환액"]
        scenario_rows = []
        for yy in term_set:
            mm = yy * 12
            m = epi_monthly_payment(principal, rate, mm)
            it = epi_total_interest(principal, rate, mm)
            scenario_rows.append([
                f"{yy}년", format_man_1dp(m),
                format_krw_short(it), format_krw_short(principal + it),
            ])

    return CalcResult(
        calc_type="amortization",
        as_of=as_of,
        answer_box=answer_box,
        assumption_rows=assumption_rows,
        calc_process_headers=calc_process_headers,
        calc_process_rows=calc_process_rows,
        scenario_headers=scenario_headers,
        scenario_rows=scenario_rows,
        raw={"epi_monthly": epi_m, "epi_interest": epi_int,
             "ep_first_monthly": ep_m, "ep_interest": ep_int,
             "principal": principal},
    )


# ───────────────────────────────────────────
# repayment_compare: 동일 원금·금리, 기간별(30년 vs 40년) 월납입·총이자 비교
# ───────────────────────────────────────────

def compute_repayment_compare(calc: dict) -> CalcResult:
    """
    필요 입력:
      principal      대출 원금 (원)
      mortgage_rate  금리 (소수)   ← annual_rate 허용
      years_list     비교할 기간 리스트 (년). 예: [30, 40]
      as_of          기준일
    """
    principal = float(calc["principal"])
    rate = float(calc.get("mortgage_rate", calc.get("annual_rate")))
    years_list = calc.get("years_list") or [30, 40]
    years_list = sorted({int(y) for y in years_list})
    as_of = str(calc.get("as_of", "")).strip()

    shortest = years_list[0]
    base_m = epi_monthly_payment(principal, rate, shortest * 12)
    base_int = epi_total_interest(principal, rate, shortest * 12)
    longest = years_list[-1]
    long_m = epi_monthly_payment(principal, rate, longest * 12)
    long_int = epi_total_interest(principal, rate, longest * 12)

    answer_box = (
        f"대출 원금 {format_krw_short(principal, approx=False)}, 금리 연 {format_pct(rate)} "
        f"원리금균등 기준으로 {shortest}년은 월 {format_man_1dp(base_m)}·총이자 {format_krw_short(base_int)}, "
        f"{longest}년은 월 {format_man_1dp(long_m)}·총이자 {format_krw_short(long_int)}입니다. "
        f"{longest}년으로 늘리면 월 납입은 {format_man_1dp(base_m - long_m)} 줄지만 "
        f"총이자는 {format_krw_short(long_int - base_int)} 더 냅니다."
    )

    assumption_rows = [
        ("대출 원금", format_krw_short(principal, approx=False)),
        ("금리", f"연 {format_pct(rate)}"),
        ("비교 기간", " vs ".join(f"{y}년" for y in years_list)),
        ("상환 방식", "원리금균등"),
        ("기준일", as_of or "본문 참조"),
    ]

    calc_process_headers = ["대출기간", "월 납입액", "총이자", "총상환액"]
    calc_process_rows = []
    for y in years_list:
        m = epi_monthly_payment(principal, rate, y * 12)
        it = epi_total_interest(principal, rate, y * 12)
        calc_process_rows.append([
            f"{y}년", format_man_1dp(m),
            format_krw_short(it), format_krw_short(principal + it),
        ])

    # 시나리오: 기간별 원금균등 방식 대조
    scenario_headers = ["대출기간", "원금균등 첫 달", "원금균등 총이자", "원리금 대비 이자 절감"]
    scenario_rows = []
    for y in years_list:
        mm = y * 12
        ep_m = ep_first_monthly_payment(principal, rate, mm)
        ep_int = ep_total_interest(principal, rate, mm)
        epi_int = epi_total_interest(principal, rate, mm)
        scenario_rows.append([
            f"{y}년", format_man_1dp(ep_m),
            format_krw_short(ep_int), format_krw_short(epi_int - ep_int),
        ])

    return CalcResult(
        calc_type="repayment_compare",
        as_of=as_of,
        answer_box=answer_box,
        assumption_rows=assumption_rows,
        calc_process_headers=calc_process_headers,
        calc_process_rows=calc_process_rows,
        scenario_headers=scenario_headers,
        scenario_rows=scenario_rows,
        raw={"base_years": shortest, "base_monthly": base_m, "base_interest": base_int,
             "long_years": longest, "long_monthly": long_m, "long_interest": long_int},
    )


# ───────────────────────────────────────────
# loan_limit: 소득·DSR(·LTV) → 주담대 한도 (단독 vs 부부합산 비교)
# ───────────────────────────────────────────

def compute_loan_limit(calc: dict) -> CalcResult:
    """
    필요 입력:
      annual_income            연소득 (원)
      dsr_limit                DSR 한도 (소수)
      mortgage_rate            금리 (소수)
      years                    대출기간 (년)
      existing_monthly_payment 기존부채 월상환액 (원) — 선택(기본 0)
      home_price               주택가격 (원) — 선택(있으면 LTV 상한 반영)
      ltv_limit                LTV 한도 (소수) — 선택
      income_scenarios         비교할 연소득 리스트 (원) — 선택(단독 vs 합산)
      as_of                    기준일
    """
    income = float(calc["annual_income"])
    dsr = float(calc["dsr_limit"])
    rate = float(calc["mortgage_rate"])
    years = int(calc["years"])
    existing_monthly = float(calc.get("existing_monthly_payment", 0) or 0)
    home_price = calc.get("home_price")
    ltv_limit = calc.get("ltv_limit")
    as_of = str(calc.get("as_of", "")).strip()

    ltv_cap = (float(home_price) * float(ltv_limit)) if home_price and ltv_limit else None

    def limit_for(inc: float) -> dict:
        cap_monthly = inc * dsr / 12 - existing_monthly
        dsr_principal = loan_principal_by_monthly_payment(cap_monthly, rate, years) if cap_monthly > 0 else 0.0
        final = min(dsr_principal, ltv_cap) if ltv_cap is not None else dsr_principal
        bound = "LTV" if (ltv_cap is not None and ltv_cap < dsr_principal) else "DSR"
        return {"income": inc, "dsr_principal": dsr_principal, "final": final, "bound": bound}

    base = limit_for(income)

    ltv_note = (
        f", LTV {format_pct(float(ltv_limit))} 한도 {format_krw_short(ltv_cap)}"
        if ltv_cap is not None else ""
    )
    answer_box = (
        f"연소득 {format_krw_short(income, approx=False)}, DSR {format_pct(dsr)}, "
        f"금리 연 {format_pct(rate)}, {years}년 원리금균등 기준 주담대 환산 한도는 "
        f"{format_krw_short(base['final'])}입니다{ltv_note}. "
        f"실제 한도는 DSR·LTV 중 낮은 값({base['bound']} 기준)으로 결정됩니다."
    )

    assumption_rows = [
        ("연소득", format_krw_short(income, approx=False)),
        ("DSR 한도", format_pct(dsr)),
        ("주담대 금리", f"연 {format_pct(rate)}"),
        ("상환 방식", f"{years}년 원리금균등"),
    ]
    if existing_monthly > 0:
        assumption_rows.append(("기존부채 월상환액", format_krw_short(existing_monthly, approx=False)))
    if ltv_cap is not None:
        assumption_rows.append(("주택가격", format_krw_short(float(home_price), approx=False)))
        assumption_rows.append(("LTV 한도", format_pct(float(ltv_limit))))
    assumption_rows.append(("기준일", as_of or "본문 참조"))

    calc_process_headers = ["구분", "DSR상 연간 상환 가능액", "DSR 환산 한도"]
    if ltv_cap is not None:
        calc_process_headers.append("LTV 한도")
    calc_process_headers.append("최종 한도")
    row = [
        "기준 사례",
        format_krw_short(income * dsr, approx=False),
        format_krw_short(base["dsr_principal"]),
    ]
    if ltv_cap is not None:
        row.append(format_krw_short(ltv_cap))
    row.append(format_krw_short(base["final"]))
    calc_process_rows = [row]

    # 시나리오: 소득별(단독 vs 부부합산) 한도 비교
    income_scenarios = calc.get("income_scenarios") or [income, round(income * 1.6)]
    income_scenarios = sorted({float(x) for x in income_scenarios} | {income})
    scenario_headers = ["연소득", "DSR 환산 한도", "최종 한도(DSR·LTV 중 낮은 값)", "기준 대비 증감"]
    scenario_rows = []
    for inc in income_scenarios:
        r = limit_for(inc)
        diff = r["final"] - base["final"]
        scenario_rows.append([
            format_krw_short(inc, approx=False),
            format_krw_short(r["dsr_principal"]),
            f"{format_krw_short(r['final'])} ({r['bound']})",
            "기준" if inc == income else format_krw_short(diff),
        ])

    return CalcResult(
        calc_type="loan_limit",
        as_of=as_of,
        answer_box=answer_box,
        assumption_rows=assumption_rows,
        calc_process_headers=calc_process_headers,
        calc_process_rows=calc_process_rows,
        scenario_headers=scenario_headers,
        scenario_rows=scenario_rows,
        raw={"final_limit": base["final"], "dsr_principal": base["dsr_principal"],
             "ltv_cap": ltv_cap, "bound": base["bound"]},
    )


# ───────────────────────────────────────────
# purchase_cash: 주택가격·LTV·취득세·부대비용 → 필요 자기자금
# ───────────────────────────────────────────

def compute_purchase_cash(calc: dict) -> CalcResult:
    """
    필요 입력:
      home_price            주택가격 (원)
      ltv_limit             LTV 한도 (소수, 예: 0.70)
      acquisition_tax_rate  취득세율 (소수, 예: 0.011) — 리서치 근거값
      other_costs           기타 부대비용 (원) — 선택(중개보수·법무비 등)
      as_of                 기준일
      ltv_scenarios         비교할 LTV 리스트 (소수) — 선택
    """
    price = float(calc["home_price"])
    ltv = float(calc["ltv_limit"])
    tax_rate = float(calc.get("acquisition_tax_rate", 0) or 0)
    other = float(calc.get("other_costs", 0) or 0)
    as_of = str(calc.get("as_of", "")).strip()

    def cash_for(ltv_ratio: float) -> dict:
        loanable = price * ltv_ratio
        tax = price * tax_rate
        own = price - loanable + tax + other
        return {"ltv": ltv_ratio, "loanable": loanable, "tax": tax, "own": own}

    base = cash_for(ltv)

    answer_box = (
        f"주택가격 {format_krw_short(price, approx=False)}, LTV {format_pct(ltv)} 기준 "
        f"대출 가능액은 {format_krw_short(base['loanable'])}, 취득세 {format_krw_short(base['tax'])}"
        f"{('·기타비용 ' + format_krw_short(other, approx=False)) if other else ''}를 더하면 "
        f"필요한 자기자금은 {format_krw_short(base['own'])}입니다."
    )

    assumption_rows = [
        ("주택가격", format_krw_short(price, approx=False)),
        ("LTV 한도", format_pct(ltv)),
        ("취득세율", format_pct(tax_rate) if tax_rate else "본문 참조"),
        ("기타 부대비용", format_krw_short(other, approx=False) if other else "0원"),
        ("기준일", as_of or "본문 참조"),
    ]

    calc_process_headers = ["구분", "금액"]
    calc_process_rows = [
        ["주택가격", format_krw_short(price, approx=False)],
        [f"대출 가능액(LTV {format_pct(ltv)})", format_krw_short(base["loanable"])],
        ["취득세", format_krw_short(base["tax"])],
        ["기타 부대비용", format_krw_short(other, approx=False)],
        ["필요 자기자금", format_krw_short(base["own"])],
    ]

    ltv_scenarios = calc.get("ltv_scenarios") or [0.40, 0.50, 0.70]
    ltv_scenarios = sorted({round(float(x), 4) for x in ltv_scenarios} | {ltv})
    scenario_headers = ["LTV", "대출 가능액", "필요 자기자금", "기준 대비 증감"]
    scenario_rows = []
    for lr in ltv_scenarios:
        r = cash_for(lr)
        diff = r["own"] - base["own"]
        scenario_rows.append([
            format_pct(lr),
            format_krw_short(r["loanable"]),
            format_krw_short(r["own"]),
            "기준" if lr == ltv else format_krw_short(diff),
        ])

    return CalcResult(
        calc_type="purchase_cash",
        as_of=as_of,
        answer_box=answer_box,
        assumption_rows=assumption_rows,
        calc_process_headers=calc_process_headers,
        calc_process_rows=calc_process_rows,
        scenario_headers=scenario_headers,
        scenario_rows=scenario_rows,
        raw={"loanable": base["loanable"], "tax": base["tax"], "own_cash": base["own"]},
    )


CALC_DISPATCH = {
    "dsr_capacity": compute_dsr_capacity,
    "refinancing": compute_refinancing,
    "amortization": compute_amortization,
    "repayment_compare": compute_repayment_compare,
    "loan_limit": compute_loan_limit,
    "purchase_cash": compute_purchase_cash,
}


def compute_calc(calc: dict | None) -> CalcResult | None:
    """calc dict의 type을 보고 적절한 계산 함수 실행. 실패 시 None."""
    if not calc or not isinstance(calc, dict):
        return None
    calc_type = calc.get("type")
    fn = CALC_DISPATCH.get(calc_type)
    if not fn:
        return None
    try:
        return fn(calc)
    except (KeyError, TypeError, ValueError) as exc:
        print(f"[FINANCE] 계산 실패({calc_type}): {exc}", flush=True)
        return None


# ───────────────────────────────────────────
# HTML 렌더러 (Tailwind prose 호환)
# ───────────────────────────────────────────

def _esc(text: str) -> str:
    return (str(text).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def render_answer_box(result: CalcResult) -> str:
    """상단 핵심 답변 박스 (blockquote로 시각 강조)."""
    return (
        f'<blockquote><p><strong>📌 핵심 답변</strong><br>'
        f'{_esc(result.answer_box)}</p></blockquote>'
    )


def _render_table(headers: list[str], rows: list[list[str]], numeric_from: int = 1) -> str:
    """숫자 열(numeric_from 이상)은 우측 정렬."""
    def align(i: int) -> str:
        return ' style="text-align:right"' if i >= numeric_from else ''
    thead = "".join(f"<th{align(i)}>{_esc(h)}</th>" for i, h in enumerate(headers))
    body = ""
    for row in rows:
        tds = "".join(f"<td{align(i)}>{_esc(c)}</td>" for i, c in enumerate(row))
        body += f"<tr>{tds}</tr>"
    return f"<table><thead><tr>{thead}</tr></thead><tbody>{body}</tbody></table>"


def render_comparison_tables(tables: list[Any] | None) -> str:
    """비계산형 글(전세·정책·신용점수)용 구조화 비교표 렌더러.

    LLM이 채운 comparison_tables([{title, headers, rows}])를 안전하게 렌더링한다.
    모든 셀은 이스케이프되며, 텍스트 표이므로 좌측 정렬한다.
    표준 계산 공식이 없는 글도 채점관이 실제로 채점할 '조건/기관 비교표'를 갖게 한다.
    """
    if not tables:
        return ""
    out: list[str] = []
    for t in tables:
        if not isinstance(t, dict):
            continue
        headers = [str(h) for h in (t.get("headers") or [])]
        clean_rows: list[list[str]] = []
        for r in t.get("rows") or []:
            if isinstance(r, (list, tuple)) and r:
                clean_rows.append([str(c) for c in r])
        if len(headers) < 2 or not clean_rows:
            continue
        title = str(t.get("title") or "조건 비교")
        # numeric_from=len(headers) → 모든 열 좌측 정렬(텍스트 표)
        out.append(f"<h2>{_esc(title)}</h2>" + _render_table(headers, clean_rows, numeric_from=len(headers)))
    return "".join(out)


def count_valid_comparison_tables(tables: list[Any] | None) -> int:
    """헤더 2개 이상 + 유효 행 2개 이상인 비교표 개수 (검증용)."""
    n = 0
    for t in tables or []:
        if not isinstance(t, dict):
            continue
        headers = t.get("headers") or []
        valid_rows = [r for r in (t.get("rows") or [])
                      if isinstance(r, (list, tuple)) and len(r) >= 2]
        if len(headers) >= 2 and len(valid_rows) >= 2:
            n += 1
    return n


def render_calc_tables(result: CalcResult) -> str:
    """계산 가정 표 + 계산 과정 표 + 시나리오 비교표 HTML."""
    assumption = _render_table(
        ["항목", "기준"],
        [[k, v] for k, v in result.assumption_rows],
        numeric_from=1,
    )
    process = _render_table(result.calc_process_headers, result.calc_process_rows, numeric_from=1)
    scenario = _render_table(result.scenario_headers, result.scenario_rows, numeric_from=1)
    return (
        f"<h2>계산 가정</h2>{assumption}"
        f"<h2>계산 과정</h2>{process}"
        f"<h2>조건별 시나리오 비교</h2>{scenario}"
    )


# ───────────────────────────────────────────
# 출처 렌더러 (기관명·문서명·기준일·확인기준 구조화)
# ───────────────────────────────────────────

def render_sources(sources: list[Any]) -> str:
    """구조화 출처(dict) 또는 문자열 출처를 렌더링. 기준일 있으면 명시."""
    if not sources:
        return ""
    items = []
    for s in sources:
        if isinstance(s, dict):
            org = s.get("org", "").strip()
            doc = s.get("doc", "").strip()
            as_of = (s.get("as_of") or s.get("date") or "").strip()
            basis = s.get("basis", "").strip()
            url = s.get("url", "").strip()
            parts = [p for p in [org, f"「{doc}」" if doc else "",
                                 f"기준일: {as_of}" if as_of else "",
                                 f"확인 기준: {basis}" if basis else ""] if p]
            text = ", ".join(parts)
            if url:
                text = f'{text} — <a href="{_esc(url)}" rel="nofollow noopener" target="_blank">원문</a>'
            items.append(f"<li>{text if url else _esc(text)}</li>" if url else f"<li>{_esc(text)}</li>")
        else:
            items.append(f"<li>{_esc(str(s))}</li>")
    return f"<hr><h3>참고 자료</h3><ul>{''.join(items)}</ul>"


def source_to_text(source: Any) -> str:
    """구조화 출처(dict) 또는 문자열 출처를 한 줄 요약 문자열로 변환 (프롬프트/로그용)."""
    if isinstance(source, dict):
        org = (source.get("org") or "").strip()
        doc = (source.get("doc") or "").strip()
        as_of = (source.get("as_of") or source.get("date") or "").strip()
        basis = (source.get("basis") or "").strip()
        parts = [p for p in [
            org,
            f"「{doc}」" if doc else "",
            f"기준일: {as_of}" if as_of else "",
            f"확인 기준: {basis}" if basis else "",
        ] if p]
        return ", ".join(parts)
    return str(source)


def source_has_date(source: Any) -> bool:
    """출처에 기준일/발표일이 구체적으로 있는지 판정."""
    if isinstance(source, dict):
        as_of = (source.get("as_of") or source.get("date") or "").strip()
        # 'YYYY' 만 있는 것은 불충분 — 최소 YYYY.MM 형태 요구
        return bool(re.search(r"\d{4}[.\-/]\s?\d{1,2}", as_of))
    if isinstance(source, str):
        # "금융위원회, 2025" 처럼 연도만 있으면 실패, "2025.05.20" 형태면 통과
        return bool(re.search(r"\d{4}[.\-/]\s?\d{1,2}", source))
    return False


# ───────────────────────────────────────────
# CTA 정규화 (본문 중간 1 + 하단 1, 최대 2, URL 중복 제거)
# ───────────────────────────────────────────

def normalize_ctas(ctas: list[dict] | None) -> list[dict]:
    """CTA를 최대 2개로 제한하고 동일 URL 중복을 제거한다."""
    if not ctas:
        return []
    seen: set[str] = set()
    result: list[dict] = []
    for c in ctas:
        if not isinstance(c, dict):
            continue
        url = (c.get("url") or "").strip()
        label = (c.get("label") or "").strip()
        if not url or not label or url in seen:
            continue
        seen.add(url)
        # 앵커 텍스트 꼬리 '→' 정리 후 단일화
        label = label.rstrip().rstrip("→").rstrip()
        result.append({"url": url, "label": label})
        if len(result) == 2:
            break
    return result


# ───────────────────────────────────────────
# 글 검증기 (하드 게이트: 계산·출처·렌더링)
# ───────────────────────────────────────────

# 본문 문단에 원시 HTML/마크다운 링크가 노출됐는지 탐지
_RAW_ANCHOR_RE = re.compile(r"<\s*a\b|</\s*a\s*>|href\s*=", re.IGNORECASE)
_MD_LINK_RE = re.compile(r"\]\(\s*/?[\w./#-]+\s*\)")
_RAW_TAG_RE = re.compile(r"<\s*(h[1-6]|p|ul|ol|li|table|div|span|strong|br)\b", re.IGNORECASE)


@dataclass
class ValidationResult:
    checks: dict[str, bool]           # 항목별 통과 여부
    hard_fail: list[str]              # 발행 불가 사유
    warnings: list[str]              # 경고
    calc_present: bool               # 코드 계산 결과 존재 여부

    @property
    def passed(self) -> bool:
        return not self.hard_fail


def validate_article(
    *,
    calc_result: CalcResult | None,
    paragraphs: list[str],
    answer_box_text: str,
    sources: list[Any],
    ctas: list[dict],
    full_html: str,
    requires_calc: bool,
    comparison_tables: list[Any] | None = None,
) -> ValidationResult:
    """발행 전 하드 게이트 검증.

    requires_calc=True(금융 계산형 카테고리)인데 계산 결과가 없으면 발행 불가.
    requires_calc=False(전세·정책 등)인데 계산 표도 비교표도 없으면 경고.
    """
    checks: dict[str, bool] = {}
    hard_fail: list[str] = []
    warnings: list[str] = []

    # 1) 계산 검증
    calc_present = calc_result is not None
    checks["calc_present"] = calc_present
    if requires_calc and not calc_present:
        hard_fail.append("금융 계산형 글이지만 코드 계산 결과가 없습니다 (계산 검증 실패)")

    # 1-b) 비계산형 글은 구조화 비교표가 있어야 채점 가능 (없으면 경고)
    if not requires_calc and not calc_present:
        table_count = count_valid_comparison_tables(comparison_tables)
        checks["comparison_table_present"] = table_count > 0
        if table_count == 0:
            warnings.append("비계산형 글인데 구조화 비교표가 없습니다 (조건·기관 비교표 1개 이상 권장)")

    # 상단 핵심 답변에 최종 결과 수치가 있는지 (계산이 있으면 계산값 기반이라 자동 충족)
    has_number = bool(re.search(r"\d", answer_box_text or ""))
    checks["answer_has_number"] = has_number
    if requires_calc and not has_number:
        hard_fail.append("상단 핵심 답변에 결과 수치가 없습니다")

    # 2) 출처 기준일 검증
    checks["sources_present"] = bool(sources)
    if not sources:
        if requires_calc:
            hard_fail.append("출처가 없습니다")
        else:
            warnings.append("출처가 없습니다")
    else:
        dated = [s for s in sources if source_has_date(s)]
        checks["sources_dated"] = len(dated) == len(sources)
        if not dated:
            hard_fail.append("모든 출처에 기준일/발표일이 없습니다 (예: '금융위원회, 2025'는 불가)")
        elif len(dated) < len(sources):
            warnings.append(f"출처 {len(sources) - len(dated)}건에 구체적 기준일이 없습니다")

    # 3) CTA 절제 검증
    checks["cta_within_limit"] = len(ctas) <= 2
    if len(ctas) > 2:
        hard_fail.append(f"CTA가 {len(ctas)}개입니다 (최대 2개)")
    urls = [c.get("url") for c in ctas]
    if len(urls) != len(set(urls)):
        hard_fail.append("동일 CTA URL이 중복됩니다")

    # 4) 렌더링 검증 — 문단에 원시 HTML/마크다운 링크 노출 금지
    raw_html_in_body = False
    for p in paragraphs:
        if _RAW_ANCHOR_RE.search(p) or _MD_LINK_RE.search(p) or _RAW_TAG_RE.search(p):
            raw_html_in_body = True
            break
    checks["no_raw_html_in_body"] = not raw_html_in_body
    if raw_html_in_body:
        hard_fail.append("본문 문단에 원시 HTML/링크 태그가 노출됩니다")

    # 빈 bullet / 깨진 표 흔적
    checks["no_empty_bullet"] = "<li></li>" not in full_html
    if "<li></li>" in full_html:
        warnings.append("빈 목록 항목이 있습니다")

    return ValidationResult(
        checks=checks,
        hard_fail=hard_fail,
        warnings=warnings,
        calc_present=calc_present,
    )
