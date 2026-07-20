"""
OpenAI Chat Completions 공통 호출 클라이언트.

존재 이유:
GPT-5 계열(gpt-5.6-terra 등)은 추론 모델이라 temperature·top_p 같은
샘플링 파라미터를 거부하고 400을 돌려준다. 파이프라인 4곳이 각자 payload를
만들어 쏘고 있어서, 모델을 바꾸면 전 구간이 조용히 죽는 구조였다.

이 모듈은 모델이 특정 파라미터를 거부하면 그 파라미터만 떼고 자동 재시도한다.
덕분에 구모델(temperature 지원)과 신모델(거부)을 같은 코드로 호출할 수 있다.
"""
from __future__ import annotations

import json
import re
from urllib import request
from urllib.error import HTTPError

CHAT_URL = "https://api.openai.com/v1/chat/completions"

# "Unsupported parameter: 'temperature' is not supported with this model."
# "Unsupported value: 'temperature' does not support 0.1 with this model."
_UNSUPPORTED_RE = re.compile(
    r"[Uu]nsupported (?:parameter|value)[^'\"]*['\"]([A-Za-z0-9_.]+)['\"]"
)
# 떼어내도 안전한(결과 정확성에 영향 없는) 파라미터만 자동 제거 대상으로 둔다
_DROPPABLE = {"temperature", "top_p", "frequency_penalty", "presence_penalty"}


class OpenAIRequestError(RuntimeError):
    """OpenAI API 호출 실패. code/body를 그대로 보존한다."""

    def __init__(self, code: int, body: str) -> None:
        super().__init__(f"HTTP {code}: {body}")
        self.code = code
        self.body = body


def post_chat(api_key: str, payload: dict, timeout: int = 60, tag: str = "OPENAI") -> dict:
    """Chat Completions 호출. 모델이 거부하는 샘플링 파라미터는 떼고 재시도한다."""
    payload = dict(payload)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    for _ in range(len(_DROPPABLE) + 1):
        req = request.Request(
            CHAT_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            match = _UNSUPPORTED_RE.search(body)
            param = match.group(1) if match else None
            if e.code == 400 and param in _DROPPABLE and param in payload:
                payload.pop(param)
                print(
                    f"[{tag}] 모델 '{payload.get('model')}'이(가) '{param}'을 지원하지 않음 "
                    f"— 제거 후 재시도",
                    flush=True,
                )
                continue
            raise OpenAIRequestError(e.code, body) from e

    raise OpenAIRequestError(400, "지원되지 않는 파라미터를 모두 제거했으나 계속 실패")
