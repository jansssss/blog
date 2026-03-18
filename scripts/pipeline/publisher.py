"""
Supabase REST API로 posts 테이블에 직접 발행
- service role key 사용 (RLS 우회)
- ohyess.kr site_id 자동 조회
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from urllib import request
from urllib.error import HTTPError

from .columnist import Article


class SupabasePublisher:
    def __init__(self, supabase_url: str, service_role_key: str) -> None:
        self.base_url = supabase_url.rstrip("/")
        self.key = service_role_key
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self._site_id: str | None = None

    def _get_site_id(self) -> str:
        """ohyess.kr의 site_id 조회 (캐시)"""
        if self._site_id:
            return self._site_id

        url = f"{self.base_url}/rest/v1/sites?domain=eq.ohyess.kr&select=id&limit=1"
        req = request.Request(url, headers={**self._headers, "Prefer": "return=representation"})
        try:
            with request.urlopen(req, timeout=15) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
                if not rows:
                    raise RuntimeError("ohyess.kr 사이트를 Supabase에서 찾을 수 없습니다")
                self._site_id = rows[0]["id"]
                return self._site_id
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"Supabase sites 조회 실패 ({e.code}): {body}") from e

    def _slug_is_unique(self, slug: str) -> bool:
        url = f"{self.base_url}/rest/v1/posts?slug=eq.{slug}&select=id&limit=1"
        req = request.Request(url, headers=self._headers)
        with request.urlopen(req, timeout=10) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
            return len(rows) == 0

    def _unique_slug(self, base_slug: str) -> str:
        slug = base_slug
        suffix = 1
        while not self._slug_is_unique(slug):
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        return slug

    def publish(self, article: Article, html: str, mode: str = "publish") -> dict:
        """
        posts 테이블에 insert
        mode: "publish" → published=true, "draft" → published=false
        """
        site_id = self._get_site_id()
        slug = self._unique_slug(article.slug)
        now = datetime.now(timezone.utc).isoformat()

        row = {
            "title": article.title,
            "slug": slug,
            "summary": article.meta_description or article.subtitle,
            "content": html,
            "category": article.category,
            "tags": article.tags,
            "published": mode == "publish",
            "published_at": now if mode == "publish" else None,
            "site_id": site_id,
        }

        raw_body = json.dumps(row).encode("utf-8")
        req = request.Request(
            f"{self.base_url}/rest/v1/posts",
            data=raw_body,
            headers=self._headers,
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                post = result[0] if isinstance(result, list) else result
                return {"id": post.get("id"), "slug": slug, "published": mode == "publish"}
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"Supabase insert 실패 ({e.code}): {body}") from e
