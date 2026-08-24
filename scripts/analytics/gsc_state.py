"""GSC 개선 루프의 지속 상태 — 결정(decision)과 판정(verdict).

이 모듈이 존재하는 이유: 관찰→실행 만 있는 오픈 루프를
관찰→실행→검증→학습 클로즈드 루프로 닫기 위해서다.

에이전트가 무언가를 바꾸면 여기에 **반증 가능한 예측**과 함께 결정을 남긴다.
정해진 기간이 지나면 gsc_evaluate.py 가 실제 수치를 뽑아오고,
다음 회차의 에이전트가 자기 예측을 채점한다.

핵심 장치는 셋이다.
  - freeze_until : 관찰 중인 대상을 재수정하지 못하게 잠근다 (인과 오염 방지)
  - deployed_at  : 커밋이 수동이므로 git log 로 실제 배포 시각을 역추적한다
  - 사이트 기준선 : 대상 변화에서 사이트 전체 변화를 뺀 값으로 판정한다

저장 위치: reports/gsc/state/
"""
from __future__ import annotations

import json
import re
import subprocess
from datetime import date, datetime, timedelta
from pathlib import Path

# ---------------------------------------------------------------- 파라미터
#
# 아래 숫자들은 현재 사이트 규모(28일 노출 ~160, 클릭 0, 평균순위 36)와
# 구글의 재크롤·재평가 지연을 근거로 정했다. 트래픽이 커지면 다시 조정한다.

# 등급별 일정 (배포일 기준 일수)
#   구글 재크롤 3~14일 + 순위 재평가 2~4주 → 최소 3주 전에는 판정하지 않는다.
#   신규 페이지(A)는 색인 자체에 1~3주가 더 들어 최종 판정을 길게 잡는다.
#   또한 판정 창(deployed+7 ~ today-3)이 최소 14일은 되어야 하므로
#   first >= AFTER_WINDOW_LAG_DAYS + MIN_AFTER_WINDOW_DAYS + _DATA_LAG(3) = 24 이다.
SCHEDULE: dict[str, dict[str, int]] = {
    "D": {"freeze": 24, "first": 24, "final": 42},   # 메타데이터 재작성
    "C": {"freeze": 28, "first": 28, "final": 56},   # 콘텐츠 심화
    "B": {"freeze": 42, "first": 42, "final": 70},   # 구조 변경
    "A": {"freeze": 42, "first": 42, "final": 84},   # 신규 페이지
    "O": {"freeze": 0, "first": 24, "final": 24},    # 관찰 등록 (변경 없음)
}

# 판정 창 산정 규칙.
#   배포 직후 며칠은 구글이 아직 재크롤하지 않았으므로 창에서 제외한다.
AFTER_WINDOW_LAG_DAYS = 7
#   이보다 짧은 창으로는 무엇도 말할 수 없다.
MIN_AFTER_WINDOW_DAYS = 14

# 판정 최소 데이터 — 이 아래면 '판정불가'. 없는 신호를 있다고 우기지 않기 위해서다.
MIN_IMPRESSIONS_AFTER = 30
MIN_IMPRESSIONS_BEFORE = 10
# GSC position 은 노출가중 평균이라 잡음이 크다. 3위 미만 변동은 이동으로 치지 않는다.
POSITION_MOVE_THRESHOLD = 3.0
# CTR 은 훨씬 많은 표본이 필요하다. 미만이면 CTR 판정은 보류한다.
MIN_IMPRESSIONS_FOR_CTR = 200

# 동시에 열어둘 수 있는 실험 수. 많으면 서로 간섭해 인과를 못 읽는다.
MAX_OPEN_EXPERIMENTS = 3
# 한 회차에 새로 만들 수 있는 결정 수.
MAX_NEW_DECISIONS_PER_RUN = 2
# 데이터가 모자랄 때 판정을 미룰 수 있는 횟수와 연장 기간.
MAX_EXTENSIONS = 1
EXTENSION_DAYS = 28

# 배포 대기 상태가 이 기간을 넘으면 사용자가 커밋을 잊은 것으로 보고 알린다.
STALE_DEPLOY_DAYS = 14

STATUS_PENDING = "pending_deploy"   # 코드는 바꿨으나 아직 커밋(배포) 안 됨
STATUS_OBSERVING = "observing"      # 배포됨, 관찰 기간 중
STATUS_DUE = "verdict_due"          # 판정 기일 도래
STATUS_CLOSED = "closed"            # 판정 완료


# ---------------------------------------------------------------- 경로

def state_dir(project_root: Path) -> Path:
    d = project_root / "reports" / "gsc" / "state"
    d.mkdir(parents=True, exist_ok=True)
    (d / "decisions").mkdir(exist_ok=True)
    return d


def decisions_dir(project_root: Path) -> Path:
    return state_dir(project_root) / "decisions"


# ---------------------------------------------------------------- 입출력

def _parse_date(value) -> date | None:
    if not value:
        return None
    if isinstance(value, date):
        return value
    try:
        return datetime.strptime(str(value)[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def load_decisions(project_root: Path) -> list[dict]:
    out = []
    for path in sorted(decisions_dir(project_root).glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            print(f"[STATE] 결정 파일 읽기 실패 {path.name}: {exc}", flush=True)
            continue
        data["_path"] = str(path)
        out.append(data)
    return out


def save_decision(project_root: Path, decision: dict) -> Path:
    d = dict(decision)
    d.pop("_path", None)
    path = decisions_dir(project_root) / f"{d['id']}.json"
    path.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def new_decision_id(created: date, slug: str) -> str:
    slug = re.sub(r"[^a-z0-9가-힣]+", "-", slug.lower()).strip("-")[:48] or "decision"
    return f"{created.isoformat()}-{slug}"


# ---------------------------------------------------------------- 배포 시각 역추적

def _git(project_root: Path, *args: str) -> str:
    try:
        r = subprocess.run(
            ["git", "-C", str(project_root), *args],
            capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=30,
        )
        return r.stdout.strip() if r.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def backfill_deployed_at(project_root: Path, decisions: list[dict]) -> list[dict]:
    """커밋은 사용자가 직접 하므로, 결정이 '언제 실제로 배포됐는지'를 git 에서 찾는다.

    이게 없으면 관찰 기간의 기준점이 없어 판정 자체가 불가능해진다.
    결정 생성일 이후에 대상 파일을 건드린 첫 커밋의 시각을 배포 시각으로 본다.
    """
    changed = []
    for d in decisions:
        if d.get("deployed_at") or d.get("status") == STATUS_CLOSED:
            continue
        files = d.get("files") or []
        if not files:
            # 변경 파일이 없는 결정(O 등급 관찰)은 생성 즉시 관찰 시작
            d["deployed_at"] = d.get("created")
            _apply_schedule(d)
            changed.append(d)
            continue

        created = _parse_date(d.get("created"))
        since = (created - timedelta(days=1)).isoformat() if created else None
        args = ["log", "--reverse", "--format=%cI", "--max-count=1"]
        if since:
            args.append(f"--since={since}")
        args.append("--")
        args.extend(files)
        out = _git(project_root, *args)
        if not out:
            continue
        first = out.splitlines()[0].strip()
        d["deployed_at"] = first[:10]
        _apply_schedule(d)
        changed.append(d)
    return changed


def _apply_schedule(d: dict) -> None:
    """deployed_at 이 정해진 결정에 동결·판정 기일을 계산해 넣는다."""
    deployed = _parse_date(d.get("deployed_at"))
    if not deployed:
        return
    sched = SCHEDULE.get(str(d.get("grade", "C")).upper(), SCHEDULE["C"])
    d["freeze_until"] = (deployed + timedelta(days=sched["freeze"])).isoformat()
    d["evaluate_at"] = (deployed + timedelta(days=sched["first"])).isoformat()
    d["final_evaluate_at"] = (deployed + timedelta(days=sched["final"])).isoformat()
    if d.get("status") in (None, STATUS_PENDING):
        d["status"] = STATUS_OBSERVING


# ---------------------------------------------------------------- 조회

def refresh_statuses(decisions: list[dict], today: date | None = None) -> None:
    """판정 기일이 지난 관찰 건을 verdict_due 로 승격한다."""
    today = today or date.today()
    for d in decisions:
        if d.get("status") != STATUS_OBSERVING:
            continue
        due = _parse_date(d.get("evaluate_at"))
        if due and today >= due:
            d["status"] = STATUS_DUE


def due_decisions(decisions: list[dict], today: date | None = None) -> list[dict]:
    refresh_statuses(decisions, today)
    return [d for d in decisions if d.get("status") == STATUS_DUE]


def open_experiments(decisions: list[dict]) -> list[dict]:
    return [d for d in decisions
            if d.get("status") in (STATUS_PENDING, STATUS_OBSERVING, STATUS_DUE)]


def stale_pending(decisions: list[dict], today: date | None = None) -> list[dict]:
    """코드는 바뀌었는데 오래도록 커밋되지 않은 결정 — 사용자에게 알려야 한다."""
    today = today or date.today()
    out = []
    for d in decisions:
        if d.get("status") != STATUS_PENDING or d.get("deployed_at"):
            continue
        created = _parse_date(d.get("created"))
        if created and (today - created).days >= STALE_DEPLOY_DAYS:
            out.append(d)
    return out


def frozen_targets(decisions: list[dict], today: date | None = None) -> dict:
    """지금 손대면 안 되는 페이지·검색어. 관찰 중인 실험을 덮어쓰지 않기 위한 잠금.

    반환: {"pages": {경로: 해제일}, "queries": {검색어: 해제일}, "decisions": [...]}
    """
    today = today or date.today()
    pages: dict[str, str] = {}
    queries: dict[str, str] = {}
    owners = []
    for d in decisions:
        if d.get("status") == STATUS_CLOSED:
            continue
        until = _parse_date(d.get("freeze_until"))
        # 배포 전(pending)이면 아직 기일이 없지만, 이미 작업 트리가 바뀐 상태라
        # 같은 대상을 또 건드리면 안 된다 → 배포 전에도 잠근다.
        if d.get("status") != STATUS_PENDING:
            if not until or today >= until:
                continue
        label = d.get("freeze_until") or "배포대기"
        targets = d.get("targets") or {}
        for p in targets.get("pages") or []:
            pages[p] = label
        for q in targets.get("queries") or []:
            queries[q] = label
        for f in d.get("files") or []:
            pages.setdefault(f, label)
        owners.append({"id": d.get("id"), "until": label, "grade": d.get("grade")})
    return {"pages": pages, "queries": queries, "decisions": owners}


def can_open_new(decisions: list[dict]) -> tuple[bool, str]:
    n = len(open_experiments(decisions))
    if n >= MAX_OPEN_EXPERIMENTS:
        return False, f"열린 실험 {n}건 (상한 {MAX_OPEN_EXPERIMENTS}) — 판정이 끝날 때까지 신규 결정 금지"
    return True, f"열린 실험 {n}건 / 상한 {MAX_OPEN_EXPERIMENTS}"


# ---------------------------------------------------------------- 판정 계산

def judge(before: dict, after: dict, site_before: dict, site_after: dict,
          predict: dict, days_before: int = 28, days_after: int = 28) -> dict:
    """한 결정에 대한 기계적 판정. 최종 해석은 LLM 이 하지만,
    데이터 충족 여부와 기준선 보정은 여기서 확정한다 — 이건 취향이 아니라 산수다.

    before 창(28일)과 after 창(배포+7 ~ 데이터확정일)은 길이가 다르므로
    노출·클릭은 일평균으로 환산해 비교한다. 순위는 이미 평균이라 그대로 쓴다.
    """
    imp_b = int(before.get("impressions", 0) or 0)
    imp_a = int(after.get("impressions", 0) or 0)
    db = max(1, int(days_before or 1))
    da = max(1, int(days_after or 1))

    result = {
        "impressions_before": imp_b,
        "impressions_after": imp_a,
        "days_before": db,
        "days_after": da,
        "impressions_per_day_before": round(imp_b / db, 2),
        "impressions_per_day_after": round(imp_a / da, 2),
        "position_before": round(float(before.get("position", 0) or 0), 1),
        "position_after": round(float(after.get("position", 0) or 0), 1),
        "clicks_before": int(before.get("clicks", 0) or 0),
        "clicks_after": int(after.get("clicks", 0) or 0),
    }

    if imp_a < MIN_IMPRESSIONS_AFTER or imp_b < MIN_IMPRESSIONS_BEFORE:
        result["verdict"] = "판정불가"
        result["reason"] = (
            f"표본 부족 (before {imp_b}/{MIN_IMPRESSIONS_BEFORE}, "
            f"after {imp_a}/{MIN_IMPRESSIONS_AFTER})"
        )
        # 판정 근거로는 못 쓰지만 방향만은 참고로 남긴다 — LLM 이 '참고'로만 읽는다.
        result["weak_signal"] = (
            f"참고(판정 근거 아님): 일평균 노출 {result['impressions_per_day_before']} "
            f"→ {result['impressions_per_day_after']}, "
            f"순위 {result['position_before']} → {result['position_after']}"
        )
        return result

    # 순위는 낮을수록 좋다. delta < 0 이면 개선.
    tgt_delta = result["position_after"] - result["position_before"]
    site_delta = (float(site_after.get("position", 0) or 0)
                  - float(site_before.get("position", 0) or 0))
    adjusted = tgt_delta - site_delta

    result["position_delta"] = round(tgt_delta, 1)
    result["site_position_delta"] = round(site_delta, 1)
    result["adjusted_delta"] = round(adjusted, 1)

    if abs(adjusted) < POSITION_MOVE_THRESHOLD:
        result["verdict"] = "변화없음"
        result["reason"] = (
            f"사이트 보정 후 {adjusted:+.1f}위 — 인정 임계 {POSITION_MOVE_THRESHOLD}위 미만"
        )
    else:
        improved = adjusted < 0
        want_down = str(predict.get("direction", "down")).lower() == "down"
        hit = improved if want_down else (not improved)
        result["verdict"] = "적중" if hit else "빗나감"
        result["reason"] = (
            f"사이트 보정 후 {adjusted:+.1f}위 "
            f"(대상 {tgt_delta:+.1f} − 사이트 {site_delta:+.1f})"
        )

    # CTR 은 표본이 훨씬 많이 필요하다 — 순위 판정과 분리해 별도로 다룬다.
    if imp_a >= MIN_IMPRESSIONS_FOR_CTR:
        ctr_b = float(before.get("ctr", 0) or 0)
        ctr_a = float(after.get("ctr", 0) or 0)
        result["ctr_before"] = round(ctr_b, 4)
        result["ctr_after"] = round(ctr_a, 4)
        result["ctr_delta"] = round(ctr_a - ctr_b, 4)
    else:
        result["ctr_note"] = f"노출 {imp_a} < {MIN_IMPRESSIONS_FOR_CTR} — CTR 판정 보류"

    return result


def extend(d: dict, today: date | None = None) -> bool:
    """표본 부족으로 판정을 미룬다. 상한을 넘으면 미루지 않고 종결시킨다."""
    today = today or date.today()
    used = int(d.get("extensions", 0) or 0)
    if used >= MAX_EXTENSIONS:
        return False
    d["extensions"] = used + 1
    d["evaluate_at"] = (today + timedelta(days=EXTENSION_DAYS)).isoformat()
    d["freeze_until"] = d["evaluate_at"]
    d["status"] = STATUS_OBSERVING
    return True


def close(d: dict, verdict: str, note: str, today: date | None = None) -> None:
    today = today or date.today()
    d.setdefault("verdicts", []).append(
        {"date": today.isoformat(), "verdict": verdict, "note": note}
    )
    d["status"] = STATUS_CLOSED
    d["closed_at"] = today.isoformat()
    d["final_verdict"] = verdict
