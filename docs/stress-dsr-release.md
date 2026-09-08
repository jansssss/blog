# 스트레스 DSR 페이지 발행·검색 점검

- 작성·검토일: 2026-09-08
- 주소: https://www.ohyess.kr/guide/stress-dsr
- 검색 의도: 스트레스 DSR 계산, 지역·금리 유형에 따른 주담대 한도 감소, 연봉별 비교.
- 기존 `/guide/dsr-dti-ltv`는 용어 비교, `/guide/ltv-ok-dsr-blocked`는 담보·소득 병목을 담당한다. 새 페이지는 스트레스 금리 계산과 실제 납입액 구분에 집중한다.
- 참고 GSC: 저장된 `reports/gsc/latest.json`, 2026-08-08~2026-09-04. 전체 242노출·0클릭, `dsr 계산기` 23노출·평균 32.7위, `dsr계산기` 9노출·평균 33.3위. 이번 요청은 사용자가 지정한 주제로 제작했으며 신규 GSC 수집은 하지 않았다.

## 계산 근거

1. [금융위원회 2026-07-01 행정지도](https://better.fsc.go.kr/fsc_new/status/adminMap/OpertnDetail.do?muNo=145&postNo=4215&stNo=11): HWPX 원문 확인. 수도권·규제지역 3% 하한, 기타 1.5~3%, 지방 주담대 50% 및 유형별 2단계 비율을 2026-12-31까지 적용. 혼합·주기형 비중의 30/50/70% 경계, 5년 미만 100%, 신용대출의 별도 기준과 경과규정 확인.
2. [금융위원회 10·15 대책](https://www.fsc.go.kr/no010101/85432): 2025-10-16부터 수도권·규제지역 주담대 스트레스 금리 하한 3%.
3. [금융위원회 3단계 시행방안](https://www.fsc.go.kr/no010101/84617): 실제 금리에는 가산하지 않는 원칙, 유형별 비율, 지방의 2단계 유형 비율을 교차 확인.
4. [은행연합회 2026년 하반기 운영방안 — 한국금융연구원 게재](https://www.kif.re.kr/kif2/publication/maildetview.aspx?SL=0&controlno=364749&ismail=1&nodeid=402): 지방 주담대 2단계 유지 기간 확인. 모델 참고값은 수도권 3%, 지방 기본 1.5%에 50% 적용. 반기 실제 고시·은행 산출값 및 경과규정은 실행 전 재확인.

신규 일반 주담대 1건·비거치·원리금균등·1~30년 범위만 계산한다. 기존 부채의 DSR 연 원리금과 스트레스 추가 차액은 사용자가 입력한다. LTV, 방공제, 주택가격별 총액 제한, 정책대출, 경과규정은 자동 판정하지 않는다. 숫자 예시는 동일 함수에서 서버 렌더링해 위젯과 표의 계산 차이를 방지한다.

## 적용한 검색·발견 장치

- 고유 title·description·canonical, index/follow, Open Graph article·공유 PNG, Twitter 큰 이미지 카드.
- GuideLayout의 Article·BreadcrumbList·본문과 일치하는 FAQPage, 계산기의 WebApplication 구조화 데이터. 허위 리뷰·평점은 없음.
- 서버 컴포넌트의 본문·예시 표·공식 출처: 입력 동작만 클라이언트에서 처리하며 주요 설명은 자바스크립트 실행 전 HTML에 포함.
- 렌더링 검사에서 발견한 공통 FAQ 스키마 이중 출력을 제거하고, FAQ를 네이티브 details/summary로 바꿔 답변이 초기 HTML에 포함되고 자바스크립트 없이도 열리게 했다.
- `#calculator`, `#examples` 등 명시적 목차·섹션 앵커. 하단 해시태그는 실제 섹션으로 이동하는 탐색 링크.
- STATIC_GUIDES에 한 번 등록. 발행 시 홈페이지 첫 카드, 모바일 첫 4개에 포함. 홈 12개와 `/guide` 전체 목록 규칙 유지.
- 기존 사이트 내부 검색은 DB 블로그 글만 검색했다. `/search`에 단일 가이드 레지스트리 검색 결과를 추가해 `스트레스 DSR`, `스트레스DSR계산기`, `#스트레스DSR`로도 새 페이지가 바로 나타나게 했다. 금융 가이드는 ohyess.kr과 로컬 개발 호스트에만 노출한다.
- DSR·DTI·LTV, LTV/DSR 병목, 연봉 5천 주담대 가이드 3개 및 DSR 허브에서 새 페이지로 연결. 새 페이지에서 허브·관련 가이드·한도 계산기로 연결.
- 사이트맵 경로·실제 변경일 반영. 기존 robots는 공개 페이지 허용 및 sitemap 주소 제공.
- NEW는 2026-09-28까지 표시, 2026-09-29 00:00 KST 종료. 공통 GuideLayout의 본문 뒤 인아티클·하단 멀티플렉스 2개 슬롯 사용.

메타 keywords나 해시태그가 즉시 색인·순위를 보장하지 않는다. 제목과 요약문은 실제 질문에 답하고, 앵커는 긴 글의 원하는 부분으로 이동하는 용도다. Google은 [2026-05-07부터 FAQ 리치 결과를 종료](https://developers.google.com/search/updates#may-2026)했으므로 FAQ 스키마를 특수 검색노출 보장 수단으로 설명하지 않는다.

## 배포 후 실행할 절차

1. 프로덕션 페이지 HTTP 200, canonical이 `https://www.ohyess.kr/guide/stress-dsr`인지 확인. noindex·로그인·robots 차단이 없어야 한다. 본문·예시·공식 링크가 HTML에 있는지 확인한다.
2. 홈페이지 첫 카드와 `/guide` 목록, 관련 페이지 왕복 링크, `/sitemap.xml`의 새 URL, 공유 PNG 응답을 확인한다.
3. Google Search Console에서 해당 URL 검사 → 실제 URL 테스트 → 색인 생성 요청. 기존 GSC OAuth 수집 스크립트는 읽기 전용이므로 이 요청을 대체하지 못한다. 페이지가 실제 배포된 다음에 진행한다.
4. 네이버 서치어드바이저의 사이트 소유 확인 및 사이트맵 제출 상태를 확인하고, 웹페이지 수집 요청에 같은 canonical URL을 넣는다.
5. Google Rich Results Test로 Article·Breadcrumb 구문을 확인한다. WebApplication·FAQPage의 모든 스키마가 Google 리치 결과 대상인 것은 아니다.
6. 7~14일 후 색인·모바일 레이아웃을 확인하고, 28~42일 후 GSC에서 새 URL과 `스트레스 DSR`, `스트레스 DSR 계산기` 검색어의 노출·클릭·순위를 확인한다. 같은 검색 의도의 글을 추가 복제하지 않는다.

[Google 재크롤링 안내](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)는 수집에 며칠~몇 주가 걸릴 수 있고 요청도 색인·즉시 노출을 보장하지 않는다고 설명한다. [Google 설명문 안내](https://developers.google.com/search/docs/appearance/snippet) 및 [네이버 검색엔진 최적화 가이드](https://searchadvisor.naver.com/guide/seo-basic-intro)를 기준으로 운영한다.

## 검증 기록

- `npm run check:sitemap`: 66개 통과.
- `npm test`: 214개 통과. 신규 계산·지역/유형 경계·0%·잘못된 입력·부채 중복 방지·홈 노출/NEW 만료·내부 검색 표기 변형 포함.
- `npx tsc --noEmit`: 통과.
- `git diff --check`: 통과.
- 실제 페이지 컴포넌트의 독립 SSR 검사: 예시 6개, 고유 섹션 ID와 앵커, Article·FAQPage·BreadcrumbList·WebApplication 각 1회 출력, 공유 PNG 1200×630 확인.
- 독립 미리보기 브라우저 검사: 기본값·지방·주기형 예시, 소득 변경 시 즉시 재계산, 소득 0 오류 처리·초기화 확인. 390px 모바일에서 가로 넘침 없이 표시되며 입력 영역 스크롤 중 요약 결과를 고정 표시한다. DB에 의존하는 사이트 전체 통합 검증과는 구분한다.
- `npm run build`: 컴파일·타입 검사 통과, 기존 `/api/admin/news/bulk-delete`에서 Supabase 서비스 역할 환경변수 부재로 페이지 데이터 수집 실패.
- 환경변수를 생성하거나 가짜 값으로 빌드를 통과시키지 않았다. 최초 검증 시 커밋·푸시를 보류했으나, 빌드 제약을 안내받은 사용자가 이후 `main` 커밋·푸시를 명시적으로 요청했다. 해당 요청에 따라 저장소 반영을 진행하며, 실제 배포 성공 확인과 검색엔진 수집 요청은 별도로 남아 있다.
