-- gsc_query_pages: GSC query + page URL 조합 성과 저장
-- 어떤 검색어가 어떤 페이지로 노출/유입됐는지 추적하여 사례형 글 주제 선정에 활용
CREATE TABLE IF NOT EXISTS gsc_query_pages (
  query        text             NOT NULL,
  page_url     text             NOT NULL,
  page_path    text             NOT NULL,
  page_type    text             NOT NULL,
  page_key     text,
  date         date             NOT NULL,
  clicks       integer          NOT NULL DEFAULT 0,
  impressions  integer          NOT NULL DEFAULT 0,
  ctr          double precision NOT NULL DEFAULT 0,
  position     double precision NOT NULL DEFAULT 0,
  created_at   timestamptz      NOT NULL DEFAULT now(),
  CONSTRAINT gsc_query_pages_pkey PRIMARY KEY (query, page_url, date)
);

CREATE INDEX IF NOT EXISTS idx_gsc_qp_query       ON gsc_query_pages (query);
CREATE INDEX IF NOT EXISTS idx_gsc_qp_page_path   ON gsc_query_pages (page_path);
CREATE INDEX IF NOT EXISTS idx_gsc_qp_page_type   ON gsc_query_pages (page_type);
CREATE INDEX IF NOT EXISTS idx_gsc_qp_date        ON gsc_query_pages (date DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_qp_impressions ON gsc_query_pages (impressions DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_qp_position    ON gsc_query_pages (position);
