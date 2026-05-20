"""
Google Search Console 검색 성과 데이터 수집 → Supabase upsert

의존성: google-api-python-client, google-auth, google-auth-httplib2
  pip install -r scripts/requirements.txt
"""
from __future__ import annotations

import json
import re
from datetime import date, timedelta
from urllib import request
from urllib.error import HTTPError

try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow
    import googleapiclient.discovery as discovery
except ImportError:
    raise ImportError(
        "[GSC] google-api-python-client, google-auth-oauthlib 가 설치되어 있지 않습니다.\n"
        "  pip install -r scripts/requirements.txt  을 먼저 실행하세요."
    )

_SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]


class GSCCollector:
    """
    GSC Search Analytics → Supabase upsert

    Parameters
    ----------
    url_pattern : str
        페이지 URL에서 식별자를 추출할 정규식 (캡처 그룹 1개).
        예: r"/blog/([^/?#]+)"
    table : str
        저장할 Supabase 테이블명. 예: "post_performance"
    slug_column : str
        테이블의 slug/id 컬럼명. 예: "post_slug"
    conflict_columns : str
        upsert 충돌 기준 컬럼 (콤마 구분, URL 인코딩 형태).
        예: "post_slug%2Cdate"
    """

    def __init__(
        self,
        client_secret_path: str,
        token_path: str,
        site_url: str,
        supabase_url: str,
        service_role_key: str,
        url_pattern: str = r"/blog/([^/?#]+)",
        table: str = "post_performance",
        slug_column: str = "post_slug",
        conflict_columns: str = "post_slug%2Cdate",
        days: int = 28,
    ) -> None:
        self.site_url = site_url
        self.supabase_url = supabase_url.rstrip("/")
        self.days = days
        self.table = table
        self.slug_column = slug_column
        self.conflict_columns = conflict_columns
        self._url_re = re.compile(url_pattern)
        self._headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        }
        credentials = self._get_credentials(client_secret_path, token_path)
        self._service = discovery.build(
            "searchconsole", "v1", credentials=credentials, cache_discovery=False
        )

    def _get_credentials(self, client_secret_path: str, token_path: str) -> Credentials:
        from pathlib import Path
        creds = None
        token_file = Path(token_path)
        if token_file.exists():
            creds = Credentials.from_authorized_user_file(token_path, _SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(client_secret_path, _SCOPES)
                creds = flow.run_local_server(port=0)
            token_file.parent.mkdir(parents=True, exist_ok=True)
            token_file.write_text(creds.to_json(), encoding="utf-8")
        return creds

    def collect_and_save(self) -> int:
        """GSC 데이터를 수집하고 Supabase에 저장. 저장된 행 수 반환."""
        rows = self._fetch_gsc_rows()
        if not rows:
            print("[GSC] 수집된 데이터 없음", flush=True)
            return 0

        records = self._build_records(rows)
        if not records:
            print(f"[GSC] 매칭된 URL 없음 (패턴: {self._url_re.pattern})", flush=True)
            return 0

        saved = self._upsert(records)
        print(f"[GSC] {saved}건 upsert 완료 → {self.table}", flush=True)
        return saved

    def collect_queries_and_save(self, query_table: str = "gsc_search_queries", days: int | None = None) -> int:
        """GSC 검색어별 성과 데이터 수집 → Supabase 저장. 저장된 행 수 반환."""
        rows = self._fetch_query_rows(days or self.days)
        if not rows:
            print("[GSC-Q] 수집된 쿼리 없음", flush=True)
            return 0

        records = [
            {
                "query": row["keys"][0],
                "date": row["keys"][1],
                "clicks": int(row.get("clicks", 0)),
                "impressions": int(row.get("impressions", 0)),
                "ctr": float(row.get("ctr", 0.0)),
                "position": float(row.get("position", 0.0)),
            }
            for row in rows
            if len(row.get("keys", [])) >= 2
        ]

        url = f"{self.supabase_url}/rest/v1/{query_table}?on_conflict=query%2Cdate"
        raw_body = json.dumps(records).encode("utf-8")
        req = request.Request(
            url,
            data=raw_body,
            headers={
                **self._headers,
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=30) as resp:
                resp.read()
            print(f"[GSC-Q] {len(records)}건 upsert 완료 → {query_table}", flush=True)
            return len(records)
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"{query_table} upsert 실패 ({e.code}): {body}") from e

    def _fetch_query_rows(self, days: int) -> list[dict]:
        end_date = date.today() - timedelta(days=3)
        start_date = end_date - timedelta(days=days - 1)
        body = {
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "dimensions": ["query", "date"],
            "rowLimit": 25000,
        }
        print(f"[GSC-Q] 쿼리 데이터 조회 중... ({start_date} ~ {end_date})", flush=True)
        try:
            response = (
                self._service.searchanalytics()
                .query(siteUrl=self.site_url, body=body)
                .execute()
            )
        except Exception as exc:
            print(f"[GSC-Q] API 호출 실패: {exc}", flush=True)
            return []
        rows = response.get("rows", [])
        print(f"[GSC-Q] {len(rows)}행 수신", flush=True)
        return rows

    def _fetch_gsc_rows(self) -> list[dict]:
        end_date = date.today() - timedelta(days=3)
        start_date = end_date - timedelta(days=self.days - 1)

        body = {
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "dimensions": ["page", "date"],
            "rowLimit": 25000,
        }
        print(
            f"[GSC] {start_date} ~ {end_date} 조회 중... (site={self.site_url})",
            flush=True,
        )
        try:
            response = (
                self._service.searchanalytics()
                .query(siteUrl=self.site_url, body=body)
                .execute()
            )
        except Exception as exc:
            print(f"[GSC] API 호출 실패: {exc}", flush=True)
            return []

        rows = response.get("rows", [])
        print(f"[GSC] {len(rows)}행 수신", flush=True)
        return rows

    def _build_records(self, rows: list[dict]) -> list[dict]:
        records: list[dict] = []
        for row in rows:
            keys = row.get("keys", [])
            if len(keys) < 2:
                continue
            page_url, row_date = keys[0], keys[1]
            m = self._url_re.search(page_url)
            if not m:
                continue
            slug = m.group(1)
            records.append({
                self.slug_column: slug,
                "date": row_date,
                "clicks": int(row.get("clicks", 0)),
                "impressions": int(row.get("impressions", 0)),
                "ctr": float(row.get("ctr", 0.0)),
                "position": float(row.get("position", 0.0)),
            })
        return records

    def _upsert(self, records: list[dict]) -> int:
        url = (
            f"{self.supabase_url}/rest/v1/{self.table}"
            f"?on_conflict={self.conflict_columns}"
        )
        raw_body = json.dumps(records).encode("utf-8")
        req = request.Request(
            url,
            data=raw_body,
            headers={
                **self._headers,
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=30) as resp:
                resp.read()
            return len(records)
        except HTTPError as e:
            body = e.read().decode("utf-8")
            raise RuntimeError(f"{self.table} upsert 실패 ({e.code}): {body}") from e
