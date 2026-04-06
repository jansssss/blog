from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AppConfig:
    project_root: Path
    prompt_path: Path
    anthropic_api_key: str | None
    anthropic_model: str
    tavily_api_key: str | None
    supabase_url: str | None
    supabase_service_role_key: str | None
    publish_mode: str          # "publish" | "draft"
    posts_per_run: int         # 한 번에 생성할 글 수


def _load_dotenv(dotenv_path: Path) -> None:
    if not dotenv_path.exists():
        return
    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def load_config() -> AppConfig:
    project_root = Path(__file__).resolve().parent.parent.parent
    _load_dotenv(project_root / ".env.local")
    _load_dotenv(project_root / ".env")

    scripts_root = project_root / "scripts"
    return AppConfig(
        project_root=project_root,
        prompt_path=scripts_root / "prompts" / "financial_columnist.txt",
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY") or None,
        anthropic_model=os.getenv("ANTHROPIC_MODEL") or "claude-sonnet-4-6",
        tavily_api_key=os.getenv("TAVILY_API_KEY") or None,
        supabase_url=os.getenv("NEXT_PUBLIC_SUPABASE_URL") or None,
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY") or None,
        publish_mode=os.getenv("PUBLISH_MODE", "publish"),
        posts_per_run=int(os.getenv("POSTS_PER_RUN", "1")),
    )
