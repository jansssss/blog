# GSC 일일 개선 에이전트

매일 아침 09:10에 Google Search Console 데이터를 분석해서
**유입 형태 · 유입 검색어 · 충족되지 않은 사용자 니즈**를 파악하고,
그에 맞는 개선안을 **코드로 직접 반영**한 뒤 데스크톱 알림으로 보고한다.

**커밋·푸시는 하지 않는다.** 변경 내용을 확인한 뒤 직접 커밋·푸시하면 된다.

---

## 구성 요소

| 파일 | 역할 |
|---|---|
| `scripts/analytics/gsc_daily_insight.py` | GSC API 조회 → 분석 → 리포트(JSON/MD) 생성 |
| `.claude/agents/gsc-daily-strategist.md` | 리포트를 읽고 개선안을 코드로 구현하는 에이전트 지침 |
| `scripts/schedule/run-gsc-daily.ps1` | 리포트 생성 → 에이전트 실행 → 알림, 전체 러너 |
| `scripts/schedule/register-gsc-daily.ps1` | Windows 작업 스케줄러 등록/해제 |

산출물은 모두 `reports/gsc/` 아래에 쌓인다 (git 추적 제외).

```
reports/gsc/
  2026-08-17.json      당일 리포트 (기계 판독용, 에이전트가 읽음)
  2026-08-17.md        당일 리포트 (사람 판독용)
  latest.json/.md      최신 리포트 사본
  agent-2026-08-20.md  에이전트 보고 원문
  action-log.md        누적 조치 이력 (중복 개선 방지)
  logs/run-*.log       실행 로그
```

---

## 등록

```powershell
powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1
```

매일 09:10 실행으로 등록된다.

| 명령 | 동작 |
|---|---|
| `register-gsc-daily.ps1` | 등록 (이미 있으면 교체) |
| `register-gsc-daily.ps1 -At "08:30"` | 실행 시각 변경 |
| `register-gsc-daily.ps1 -Weekdays` | 평일(월~금)만 실행 |
| `register-gsc-daily.ps1 -RunNow` | 등록된 작업을 지금 한 번 실행 |
| `register-gsc-daily.ps1 -Unregister` | 등록 해제 |

### 실행 조건 — 놓치면 그날은 건너뛴다

| 상황 | 동작 |
|---|---|
| PC 켜짐 + 로그인 상태 | 09:10 실행 |
| PC 꺼짐 / 절전 / 로그아웃 | **그날은 건너뜀.** 다음 날 09:10을 기다린다 |
| 09:10 이후 뒤늦게 부팅 | 실행하지 않음 (따라잡기 없음) |
| 실행 중 실패 | 재시도하지 않음. 로그에만 남는다 |

`StartWhenAvailable`(놓친 실행 따라잡기)과 `WakeToRun`(절전 해제)을 모두 끈 상태다.
아침에 켜두는 날만 돌리고, 안 켠 날은 그냥 넘어가는 동작을 의도한 것이다.

뒤늦게라도 그날 분석을 돌리고 싶으면 수동 실행하면 된다:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -RunNow
```

데이터가 하루 비어도 문제되지 않는다. 리포트는 항상 **최근 7일 누적**을 보므로
하루 건너뛰어도 다음 실행이 그 기간을 포함해서 분석한다.

---

## 수동 실행

```powershell
# 전체 (리포트 + 코드 반영 + 알림)
powershell -ExecutionPolicy Bypass -File scripts\schedule\run-gsc-daily.ps1

# 리포트만 (에이전트 미실행)
powershell -ExecutionPolicy Bypass -File scripts\schedule\run-gsc-daily.ps1 -SkipAgent

# 코드 변경 없이 분석·제안만 확인 (Edit/Write 도구 차단)
powershell -ExecutionPolicy Bypass -File scripts\schedule\run-gsc-daily.ps1 -DryRun

# 분석 구간 변경 (기본 7일)
powershell -ExecutionPolicy Bypass -File scripts\schedule\run-gsc-daily.ps1 -Days 28
```

리포트만 따로 만들려면:

```bash
python -m scripts.analytics.gsc_daily_insight --days 7
python -m scripts.analytics.gsc_daily_insight --days 28 --min-impressions 10
```

---

## 리포트가 보는 것

**유입 형태** — 디바이스·국가 분포, 페이지 타입별(calculator/guide/blog/compare/policy) 노출·클릭 비중, 전주 대비 증감

**유입 검색어** — TOP 검색어, 급상승(신규 포함), 하락 검색어

**사용자 니즈** — 검색어를 의도별로 자동 분류하고 의도별 수요·충족도(CTR)를 집계

> 계산 · 비교 · 자격조건 · 절차방법 · 한도금리 · 사례후기 · 정의개념 · 기타

**개선 기회** — 검색어 단위 4종 + 페이지 단위 3종

| 유형 | 의미 | 표준 대응 |
|---|---|---|
| `ctr_gap` | 순위 대비 클릭 부족 | 제목/메타 재작성 |
| `striking_distance` | 4~20위, 조금만 보강하면 상위권 | 해당 검색어 섹션·FAQ 추가 |
| `zero_click` | 노출은 있는데 클릭 0 | 순위 문제와 의도 불일치를 구분해 대응 |
| `content_gap` | 랜딩이 홈/목록 = 전용 페이지 없음 | 전용 계산기·가이드 신설 |
| `page.buried` | 수요 대비 순위 20위 밖 | 콘텐츠 보강 + 내부링크 |
| `page.ctr_gap` | 순위 확보했으나 CTR 미달 | metadata 재작성 |
| `page.decaying` | 클릭 하락 | 콘텐츠 신선도 갱신 |

기회 판정 최소 노출 임계값은 **총 노출량에 맞춰 자동 조정**된다 (총 노출의 1.5%, 2~30회 사이). 트래픽이 커져도 노이즈가 늘지 않는다.

---

## 안전장치 — 대책이 엉망일 때

에이전트 판단을 신뢰하지 않는 것을 전제로 3겹으로 막는다.

### 1겹 — 쓸 수 있는 범위를 도구 레벨에서 제한

`app/**` 의 페이지 콘텐츠·metadata 만 수정할 수 있다. 아래는 읽기만 가능하다.

```
lib/**  __tests__/**  scripts/**  .github/**  supabase/**  components/ui/**
package.json  package-lock.json  next.config.js  middleware.ts
vercel.json  tsconfig.json  CLAUDE.md
```

계산 로직(`lib/calculators.ts` 등)을 못 건드리게 한 것이 핵심이다.
**금액이 틀리는 것이 순위가 낮은 것보다 훨씬 나쁘다.**
계산 로직 변경이 필요하면 에이전트는 고치지 않고 보고서에 제안으로만 적는다.

`git add` / `commit` / `push` / `checkout` / `reset` 도 함께 차단된다.

### 2겹 — 러너가 독립적으로 재검증하고, 실패하면 전부 되돌림

에이전트 보고를 믿지 않고 러너가 직접 돌린다.

| 검사 | 실패 시 |
|---|---|
| 보호 경로 수정 여부 | 되돌림 |
| 변경 파일 8개 초과 | 되돌림 |
| `npx tsc --noEmit` | 되돌림 |
| `npm test` (178개, 계산 로직 커버) | 되돌림 |

하나라도 걸리면 **그날 변경 전체를 자동으로 되돌리고** 실패 알림을 보낸다 (exit 2).
실행 전부터 변경돼 있던 파일은 되돌림 대상에서 제외하므로, 작업 중이던 내용이 날아가지 않는다.

### 3겹 — 에이전트 지침의 판단 가드레일

- **추가 우선** — 기존 섹션 재작성보다 새 섹션 추가
- **기존 콘텐츠 삭제 금지** — 지워야 한다고 판단되면 보고만 하고 사용자에게 맡김
- **평균 순위 10위 이내 페이지의 title·h1 은 수정 금지** — 통하고 있는 것을 망치지 않는다
- **테스트를 고쳐서 통과시키지 않는다** — 테스트가 실패하면 변경이 틀린 것
- 하루 1~3건만, 근거 수치 없는 변경 금지

### 그래도 마음에 안 들면

에이전트 변경분은 매일 패치로 저장된다.

```powershell
reports\gsc\patches\YYYY-MM-DD.patch
```

되돌리는 명령은 로그 마지막에 그대로 적혀 있다.

```bash
git checkout -- <변경된 파일들>   # 로그에서 복사
git diff                          # 커밋 전 항상 확인
```

**최종 방어선은 커밋 전 `git diff` 다.** 위 3겹은 명백한 사고를 막을 뿐,
"이 문구가 더 나은가"는 사람이 판단해야 한다.

---

## 알림

- **데스크톱 알림** — 요약(클릭/노출/CTR/순위 + 변경 파일 수)이 풍선 알림으로 뜬다.
  작업이 로그온 세션에서 실행되도록 등록되므로 로그인 상태여야 보인다.
- **웹훅(선택)** — 환경변수 `GSC_NOTIFY_WEBHOOK` 에 Slack/Discord 웹훅 URL을 넣으면 그쪽으로도 보낸다.

```powershell
[Environment]::SetEnvironmentVariable('GSC_NOTIFY_WEBHOOK', 'https://hooks.slack.com/...', 'User')
```

상세 보고 원문은 `reports/gsc/agent-YYYY-MM-DD.md` 에 저장된다.

---

## 커밋

에이전트는 작업 트리에 변경만 남긴다. 확인 후:

```bash
git status
git diff
git add -A && git commit -m "SEO: GSC 분석 기반 <내용>" && git push
```

---

## 문제 해결

**`claude` 실행 파일을 찾을 수 없다고 나올 때**
러너는 `CLAUDE_BIN` 환경변수 → VSCode 확장 번들 바이너리 → PATH 순으로 탐색한다.
직접 지정하려면:

```powershell
[Environment]::SetEnvironmentVariable('CLAUDE_BIN', 'C:\path\to\claude.exe', 'User')
```

**GSC 인증이 만료됐을 때**
`scripts/credentials/token.json` 이 자동 갱신되지만, refresh token까지 만료되면 브라우저 인증이 필요하다.
`python -m scripts.analytics.gsc_daily_insight` 를 터미널에서 직접 실행하면 인증 흐름이 열린다.

**노출 데이터가 0으로 나올 때**
GSC는 최근 3일치 데이터를 확정하지 않는다. 리포트는 항상 `오늘 - 3일` 까지만 본다.
그래도 0이면 `.env.local` 의 `GSC_SITE_URL` (`sc-domain:ohyess.kr`) 과 색인 상태를 확인한다.

**실행 로그** — `reports/gsc/logs/run-YYYY-MM-DD.log`

---

## 설계 메모

- **plan 모드를 쓰지 않는다.** 헤드리스(`-p`) 실행에서는 `ExitPlanMode` 승인을 받을 사람이 없어 에이전트가 계획 모드에 갇힌다. `-DryRun` 은 `Edit`/`Write`/`NotebookEdit` 도구를 차단하고 프롬프트로 분석까지만 지시하는 방식으로 구현했다.
- **PowerShell 스크립트는 UTF-8 BOM 으로 저장해야 한다.** Windows PowerShell 5.1 은 BOM 없는 UTF-8 을 cp949 로 읽어 한글 문자열이 깨지고 파서 에러가 난다. 편집 후 BOM 이 유지됐는지 확인할 것.
- **git 차단은 도구 레벨.** 지침 문장만으로는 부족하므로 `--disallowedTools` 로 `Bash(git add*)`, `Bash(git commit*)`, `Bash(git push*)` 를 실제로 막는다.
