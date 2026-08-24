# GSC 관찰·판정·결정 루프

매주 화요일 09:10에 Google Search Console 데이터를 관찰하고,
**지난 회차의 자기 판단을 채점한 뒤**, 지금 무엇이 병목인지 스스로 정해
행동을 고른다. 아무것도 하지 않는 것도 정당한 결론이다.

```
관찰 -> 지난 판단 채점 -> 지금 무엇이 문제인가 -> 왜 그런가
     -> 지금 가장 중요한 목표는 -> 무엇이 가장 효과적인가
     -> 행동 (아무것도 안 함 / 관찰 / 콘텐츠 / 코드 / 구조)
     -> 실행 -> 예측과 함께 기록 -> 관찰 기간 대기 -> 채점 -> 반영
```

**커밋·푸시는 하지 않는다.** 변경을 확인한 뒤 직접 커밋·푸시하면 된다.
다만 **커밋해야 관찰이 시작된다** — 러너가 git 에서 배포 시각을 역추적해
그 시점부터 관찰 기간을 센다. 커밋하지 않으면 그 결정은 영원히 채점되지 않는다.

---

## 두 개의 티어

매주 LLM 을 띄우면 대부분의 회차가 "아직 기다릴 때"라는 같은 결론에 토큰을 태운다.
그래서 값싼 관측과 비싼 판단을 분리했다.

| 티어 | 무엇 | 비용 | 언제 |
|---|---|---|---|
| **Tier 1** | 리포트 생성 · 판정 근거 산출 · 배포일 역추적 · 급변 감지 | 파이썬만 | 매 회차 |
| **Tier 2** | 에이전트 판단 (1막 채점 -> 2막 결정) | LLM 세션 | 트리거 충족 시 |

Tier 2 트리거 (하나라도 참이면 실행):

- 판정 기일이 도래한 결정이 있다
- 최근 7일 지표가 급변했다 (노출 ±40%, 클릭·노출 소멸 등)
- 마지막 심층 실행 후 28일이 지났다 (정기 점검 보장)
- `-Force` 지정

---

## 기간 파라미터

현재 사이트는 28일 노출 ~250, 클릭 0, 평균순위 36이다.
이 규모에서는 **CTR 측정이 통계적으로 불가능하고 순위만 읽을 수 있다.**
아래 수치는 전부 거기서 나왔다.

| 항목 | 값 | 근거 |
|---|---|---|
| 분석 창 | 28일 | 14일 창은 노출 ~87로 잡음이 신호를 덮는다 |
| 급변 감지 창 | 7일 | 28일 평균이 급변을 지워버리므로 분리 |
| 판정 최소 표본 | after 노출 30 이상, before 10 이상 | 미만이면 `판정불가` |
| 순위 이동 인정 | 3.0위 이상 변동 | GSC 노출가중 평균의 잡음 폭 |
| CTR 판정 | 노출 200 이상 | 미만이면 CTR 항목 보류 |
| 동시 실험 | 최대 3건 | 많으면 서로 간섭해 인과를 못 읽는다 |
| 회차당 신규 결정 | 최대 2건 | |

**판정 일정 (배포일 기준)** — 구글 재크롤 3~14일 + 순위 재평가 2~4주를 반영:

| 등급 | 행동 | 관찰동결 | 1차 판정 | 최종 판정 |
|---|---|---|---|---|
| D | 메타데이터 재작성 | 24일 | +24일 | +42일 |
| C | 콘텐츠 심화 | 28일 | +28일 | +56일 |
| B | 구조 변경 | 42일 | +42일 | +70일 |
| A | 신규 페이지 | 42일 | +42일 | +84일 |
| N/H/O | 안 함 / 대기 / 관찰 등록 | — | — | — |

**동결(freeze)이 이 설계의 핵심이다.** 관찰 중인 페이지·검색어는 다음 회차에
수정이 금지된다. 효과가 나기 전에 처방을 갈아치우면 무엇이 통했는지 영원히 알 수 없다.

**교란 보정:** 사이트 전체 순위가 5위 올랐는데 대상도 5위 올랐다면 효과가 아니다.
판정은 언제나 `대상 변화량 - 사이트 전체 변화량` 으로 한다.

---


## 구성 요소

| 파일 | 역할 |
|---|---|
| `scripts/analytics/gsc_daily_insight.py` | GSC 조회 -> 관측 리포트 생성 (**처방하지 않는다**) |
| `scripts/analytics/gsc_state.py` | 결정·판정 상태 저장소. 일정·동결·판정 산수 |
| `scripts/analytics/gsc_evaluate.py` | 만기 결정의 실측 수치 산출, 배포일 역추적 |
| `scripts/analytics/llm_client.py` | 배치 의미 판단 (의도 분류·커버리지). 키 없으면 자동 강등 |
| `.claude/agents/gsc-daily-strategist.md` | 판단 주체. 1막 채점 -> 2막 결정 |
| `scripts/schedule/run-gsc-daily.ps1` | 전체 러너 (Tier 1/2 게이트 포함) |
| `scripts/schedule/register-gsc-daily.ps1` | Windows 작업 스케줄러 등록/해제 |

산출물은 모두 `reports/gsc/` 아래에 쌓인다 (git 추적 제외).

```
reports/gsc/
  latest.json/.md          최신 리포트 (에이전트가 읽음)
  YYYY-MM-DD.json/.md      회차별 리포트
  agent-YYYY-MM-DD.md      에이전트 보고 원문
  patches/YYYY-MM-DD.patch 그 회차 변경분 (되돌리기용)
  logs/run-*.log           실행 로그
  state/                   <- 루프의 기억. 이게 있어야 채점이 된다
    goals.md               상위 목표(사용자 소유) + 현재 병목(에이전트 갱신)
    beliefs.md             사이트에 대한 현재 가설 모델
    verdicts.md            판정 이력
    decisions/*.json       개별 결정 — 가설·예측·baseline·배포일
    evaluation-input.json  이번 회차 판정 근거 (러너가 생성)
    status.json            티어 판정용 상태 요약
    last-tier2.txt         마지막 심층 실행일
```

`state/` 의 goals·beliefs·verdicts·decisions 는 **git 에 커밋해야 한다.**
PC 간 동기화도 되고, 무엇보다 배포 시각 역추적이 git 히스토리에 의존한다.
나머지 산출물은 `.gitignore` 로 제외된다.

---

## 다른 PC에서 세팅 (집 ↔ 회사)

git 으로 따라오는 것과 아닌 것이 나뉜다. **아래 4개는 PC마다 직접 해야 한다.**

| 항목 | git 동기화 | 조치 |
|---|:---:|---|
| 분석 스크립트 · 러너 · 등록 스크립트 | ✅ | 없음 |
| `.claude/agents/` 에이전트 지침 | ✅ | 없음 |
| `.claude/agent-memory/` 누적 지식 | ✅ | 없음 |
| `.claude/settings.local.json` | ❌ | 머신별 권한 캐시. 그대로 두면 된다 |
| **`.env.local`** | ❌ | 기존 PC에서 복사 (`GSC_SITE_URL` 등) |
| **`scripts/credentials/`** | ❌ | `client_secret.json` · `token.json` 복사 |
| **작업 스케줄러 등록** | ❌ | 아래 등록 명령 실행 |
| **Claude Code 로그인** | ❌ | 해당 PC에서 한 번 로그인 |

```bash
git pull
npm ci
pip install -r scripts/requirements.txt
# .env.local 과 scripts/credentials/ 를 기존 PC에서 복사
powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1
```

동작 확인:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\schedule\run-gsc-daily.ps1 -SkipAgent
```

`credentials/` 를 복사하지 않고 터미널에서 직접 실행하면 브라우저 OAuth 인증이 열리므로,
그 방식으로 새로 발급받아도 된다 (`client_secret.json` 은 필요).

> **주의 — 두 PC에 모두 등록하지 말 것.**
> 양쪽이 화요일 09:10에 각자 코드를 고치면 서로 다른 변경이 생겨 커밋이 충돌한다.
> **주로 쓰는 PC 한 대에만 등록**하고, 다른 쪽에서는 필요할 때 수동 실행하는 편이 낫다.
> 이미 등록해버렸다면 `register-gsc-daily.ps1 -Unregister` 로 해제한다.

---

## 등록

```powershell
powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1
```

기본값은 **매주 화요일 09:10, 최근 14일 구간** 분석이다.

| 명령 | 동작 |
|---|---|
| `register-gsc-daily.ps1` | 등록 (이미 있으면 교체) |
| `register-gsc-daily.ps1 -DayOfWeek Thursday` | 실행 요일 변경 |
| `register-gsc-daily.ps1 -At "09:40"` | 실행 시각 변경 |
| `register-gsc-daily.ps1 -Days 28` | 분석 구간 변경 |
| `register-gsc-daily.ps1 -Daily -Days 7` | 매일 실행으로 전환 |
| `register-gsc-daily.ps1 -Weekdays` | 평일(월~금)만 실행 |
| `register-gsc-daily.ps1 -RunNow` | 등록된 작업을 지금 한 번 실행 |
| `register-gsc-daily.ps1 -Unregister` | 등록 해제 |

> 스크립트 이름의 `daily` 는 최초 설계의 흔적이다. 실행 주기는 등록 옵션이 정한다.

### 왜 매일이 아니라 주 1회인가

트래픽이 적은 동안은 주 1회가 맞다. 세 가지 이유가 있다.

1. **SEO 피드백 루프가 느리다.** 제목·콘텐츠를 바꾸면 구글이 재크롤링하고 순위에
   반영하기까지 며칠~몇 주 걸린다. 매일 손대면 어떤 변경이 효과가 있었는지
   영영 귀속시킬 수 없다. 바꾸고 → 기다리고 → 결과를 보는 주기가 필요하다.
2. **리포트가 누적 구간을 본다.** 14일 구간을 매일 돌리면 연속 실행이 13일치를
   공유한다. 같은 데이터를 놓고 매일 새 개선거리를 찾으려 들게 된다.
3. **표본이 늘어난다.** 실측 기준 7일 87노출 → 14일 122노출로 늘고,
   탐지되는 기회도 `CTR갭 0·스트라이킹 2` → `CTR갭 1·스트라이킹 3` 으로 늘었다.

**매일로 전환할 시점** — 일간 클릭이 두 자리로 올라와 하루치만으로도 노이즈와
신호가 구분될 때. 그때는 구간도 7일로 줄이는 편이 급상승 검색어를 빨리 잡는다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -Daily -Days 7
```

### 실행 조건 — 놓치면 그 주는 건너뛴다

| 상황 | 동작 |
|---|---|
| PC 켜짐 + 로그인 상태 | 화요일 09:10 실행 |
| PC 꺼짐 / 절전 / 로그아웃 | **그 주는 건너뜀.** 다음 주 화요일을 기다린다 |
| 09:10 이후 뒤늦게 부팅 | 실행하지 않음 (따라잡기 없음) |
| 실행 중 실패 | 재시도하지 않음. 로그에만 남는다 |

`StartWhenAvailable`(놓친 실행 따라잡기)과 `WakeToRun`(절전 해제)을 모두 끈 상태다.
켜둔 날만 돌리고, 안 켠 날은 그냥 넘어가는 동작을 의도한 것이다.

건너뛴 주를 뒤늦게 돌리려면 수동 실행하면 된다:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -RunNow
```

한 주를 통째로 걸러도 데이터는 잃지 않는다. GSC 쪽에 계속 쌓이고 우리는 조회만
하므로, 다음 실행이 **최근 14일 누적**을 그대로 포함해서 분석한다.

---

## 수동 실행

```powershell
# 전체 (리포트 + 코드 반영 + 알림)
powershell -ExecutionPolicy Bypass -File scripts\schedule\run-gsc-daily.ps1

# 리포트만 (에이전트 미실행)
powershell -ExecutionPolicy Bypass -File scripts\schedule\run-gsc-daily.ps1 -SkipAgent

# 코드 변경 없이 분석·제안만 확인 (Edit/Write 도구 차단)
powershell -ExecutionPolicy Bypass -File scripts\schedule\run-gsc-daily.ps1 -DryRun

# 분석 구간 변경 (기본 14일)
powershell -ExecutionPolicy Bypass -File scripts\schedule\run-gsc-daily.ps1 -Days 28
```

리포트만 따로 만들려면:

```bash
python -m scripts.analytics.gsc_daily_insight --days 14
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

하나라도 걸리면 **그 회차 변경 전체를 자동으로 되돌리고** 실패 알림을 보낸다 (exit 2).
실행 전부터 변경돼 있던 파일은 되돌림 대상에서 제외하므로, 작업 중이던 내용이 날아가지 않는다.

### 3겹 — 에이전트 지침의 판단 가드레일

- **추가 우선** — 기존 섹션 재작성보다 새 섹션 추가
- **기존 콘텐츠 삭제 금지** — 지워야 한다고 판단되면 보고만 하고 사용자에게 맡김
- **평균 순위 10위 이내 페이지의 title·h1 은 수정 금지** — 통하고 있는 것을 망치지 않는다
- **테스트를 고쳐서 통과시키지 않는다** — 테스트가 실패하면 변경이 틀린 것
- 한 회차 1~3건만, 근거 수치 없는 변경 금지

### 그래도 마음에 안 들면

에이전트 변경분은 실행할 때마다 패치로 저장된다.

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
