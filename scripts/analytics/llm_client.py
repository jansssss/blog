"""파이썬 배치용 LLM 클라이언트 (선택적).

이 모듈은 **판단 루프의 본체가 아니다.** 관찰→판정→결정 루프는 로컬 Claude Code
헤드리스 세션(`claude -p --agent gsc-daily-strategist`)이 수행하며 파일도 그쪽이 쓴다.

여기는 파이썬이 리포트를 만드는 도중 "의미 판단"이 필요한 좁은 구간만 담당한다.

  1) 검색어 의도 분류 — 기존 classify_intent() 정규식의 상위 호환
  2) 커버리지 판정 — "이 검색어에 대한 답이 우리 사이트에 이미 있는가"
     (있는데 도달 못 함 = 구조/랭킹 문제, 아예 없음 = 콘텐츠 공백)

ANTHROPIC_API_KEY 가 없거나 SDK 가 없으면 조용히 비활성화되고, 호출부는
기존 규칙 기반 로직으로 자동 강등된다. 키 없이도 파이프라인은 항상 돈다.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

# 배치 분류·대조용. 저렴하고 충분히 정확하다.
_MODEL = os.getenv("GSC_LLM_MODEL", "claude-haiku-4-5-20251001")
_MAX_TOKENS = 4096


def _load_dotenv(dotenv_path: Path) -> None:
    """scripts/pipeline/config.py 와 동일한 최소 파서 (의존성 추가 없이)."""
    if not dotenv_path.exists():
        return
    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def _project_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent


_dotenv_loaded = False


def _ensure_env() -> None:
    global _dotenv_loaded
    if _dotenv_loaded:
        return
    root = _project_root()
    _load_dotenv(root / ".env.local")
    _load_dotenv(root / ".env")
    _dotenv_loaded = True


_client = None
_client_resolved = False
_unavailable_reason = ""


def _get_client():
    global _client, _client_resolved, _unavailable_reason
    if _client_resolved:
        return _client
    _client_resolved = True
    _ensure_env()

    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        _unavailable_reason = "ANTHROPIC_API_KEY 미설정"
        return None
    try:
        import anthropic
    except ImportError:
        _unavailable_reason = "anthropic 패키지 미설치 (pip install -r scripts/requirements.txt)"
        return None
    try:
        _client = anthropic.Anthropic(api_key=key)
    except Exception as exc:  # 자격증명 형식 오류 등
        _unavailable_reason = f"클라이언트 초기화 실패: {exc}"
        _client = None
    return _client


def is_available() -> bool:
    return _get_client() is not None


def unavailable_reason() -> str:
    _get_client()
    return _unavailable_reason


def _extract_json(text: str):
    """모델이 코드펜스나 서두를 붙여도 JSON 을 건져낸다."""
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(.+?)```", text, re.S)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # 가장 바깥 배열/객체만 잘라 재시도
    for opener, closer in (("[", "]"), ("{", "}")):
        i, j = text.find(opener), text.rfind(closer)
        if i != -1 and j > i:
            try:
                return json.loads(text[i : j + 1])
            except json.JSONDecodeError:
                continue
    return None


def complete_json(system: str, user: str, max_tokens: int = _MAX_TOKENS):
    """JSON 응답을 요구하는 단발 호출. 실패하면 None (예외를 던지지 않는다).

    이 모듈의 모든 용도는 '있으면 좋은' 보강이므로, 어떤 실패도 리포트 생성을
    막아서는 안 된다.
    """
    client = _get_client()
    if client is None:
        return None
    try:
        resp = client.messages.create(
            model=_MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
    except Exception as exc:
        print(f"[LLM] 호출 실패: {exc}", flush=True)
        return None

    parts = [b.text for b in resp.content if getattr(b, "type", "") == "text"]
    return _extract_json("\n".join(parts))


# ---------------------------------------------------------------- 용도 1: 의도 분류

_INTENT_LABELS = [
    "계산", "비교", "자격조건", "절차방법", "한도금리", "사례후기", "정의개념", "기타",
]

_INTENT_SYSTEM = """너는 한국어 금융 검색어의 검색 의도를 분류한다.
각 검색어에 대해 아래 라벨 중 정확히 하나를 고른다.

계산 — 숫자를 직접 산출하고 싶다 (이자, 한도, 월납입금)
비교 — 여러 선택지 중 무엇이 나은지 알고 싶다
자격조건 — 내가 대상이 되는지 알고 싶다
절차방법 — 어떻게 하는지 단계를 알고 싶다
한도금리 — 얼마까지 / 몇 %인지 수치 자체를 알고 싶다
사례후기 — 남들은 어땠는지 알고 싶다
정의개념 — 용어가 무슨 뜻인지 알고 싶다
기타 — 위 어디에도 뚜렷이 속하지 않는다

출력은 JSON 배열만. 설명 금지.
[{"q": "<입력 검색어 그대로>", "intent": "<라벨>"}]"""


def classify_intents(queries: list[str]) -> dict[str, str]:
    """검색어 → 의도 라벨. 사용 불가하면 빈 dict (호출부가 정규식으로 강등)."""
    if not queries or not is_available():
        return {}

    out: dict[str, str] = {}
    for i in range(0, len(queries), 120):  # 배치로 나눠 토큰 폭주 방지
        chunk = queries[i : i + 120]
        payload = json.dumps(chunk, ensure_ascii=False)
        data = complete_json(_INTENT_SYSTEM, f"검색어 목록:\n{payload}")
        if not isinstance(data, list):
            continue
        for row in data:
            if not isinstance(row, dict):
                continue
            q, intent = row.get("q"), row.get("intent")
            if q in chunk and intent in _INTENT_LABELS:
                out[q] = intent
    return out


# ---------------------------------------------------------------- 용도 2: 커버리지 판정

_COVERAGE_SYSTEM = """너는 금융 정보 사이트의 콘텐츠 커버리지를 판정한다.

사이트가 가진 페이지 목록(경로 + 제목/주요 헤딩)과 검색어 목록이 주어진다.
각 검색어에 대해, **그 사람이 알고 싶어 한 것에 실제로 답하는 페이지가 사이트에 있는가**를 판정한다.

경로나 제목에 단어가 들어 있는지가 아니라, **답이 되는지**로 판단한다.
예: "1억 대출 이자"에 대해 대출이자 계산기 페이지는 답이 된다(covered).
    "전세자금대출 조건"에 대해 대출이자 계산기는 답이 아니다(missing).

verdict 는 셋 중 하나:
  covered  — 답하는 페이지가 명확히 있다 (즉, 도달 실패 = 랭킹/동선 문제)
  partial  — 관련 페이지는 있으나 그 질문에 정면으로 답하지는 않는다 (콘텐츠 심화 필요)
  missing  — 답하는 페이지가 없다 (콘텐츠 공백)

출력은 JSON 배열만. 설명 금지.
[{"q": "<검색어 그대로>", "verdict": "covered|partial|missing", "best_page": "<경로 또는 null>", "why": "<20자 이내>"}]"""


def assess_coverage(queries: list[str], pages: list[dict]) -> dict[str, dict]:
    """검색어별 커버리지 판정.

    pages: [{"path": "/calculator/loan-interest", "title": "...", "headings": ["...", ...]}]
    반환: {검색어: {"verdict": ..., "best_page": ..., "why": ...}}
    사용 불가하면 빈 dict.
    """
    if not queries or not pages or not is_available():
        return {}

    page_lines = []
    for p in pages:
        heads = " / ".join((p.get("headings") or [])[:6])
        page_lines.append(f"{p.get('path')} — {p.get('title', '')}" + (f" [{heads}]" if heads else ""))
    pages_blob = "\n".join(page_lines)

    out: dict[str, dict] = {}
    for i in range(0, len(queries), 60):
        chunk = queries[i : i + 60]
        user = (
            f"[사이트 페이지 목록]\n{pages_blob}\n\n"
            f"[검색어 목록]\n{json.dumps(chunk, ensure_ascii=False)}"
        )
        data = complete_json(_COVERAGE_SYSTEM, user)
        if not isinstance(data, list):
            continue
        for row in data:
            if not isinstance(row, dict):
                continue
            q = row.get("q")
            if q in chunk and row.get("verdict") in ("covered", "partial", "missing"):
                out[q] = {
                    "verdict": row["verdict"],
                    "best_page": row.get("best_page"),
                    "why": row.get("why", ""),
                }
    return out
