<#
.SYNOPSIS
  GSC 관찰 -> 지난 판단 채점 -> 결정 -> 알림. 매주 화요일 09:10 작업 스케줄러가 호출한다.

.DESCRIPTION
  루프는 두 티어로 나뉜다. 매주 에이전트를 띄우면 대부분의 회차가 "기다리기"인데
  토큰만 태우므로, 값싼 관측(파이썬)과 비싼 판단(LLM)을 분리한다.

  Tier 1 (매회, 파이썬만):
    1) gsc_daily_insight.py 로 리포트 생성 (28일 창 + 7일 급변 감지)
    2) gsc_evaluate.py 로 만기 결정의 실측 수치 산출 + 배포일 역추적
    3) 트리거 조건을 확인 -> 없으면 알림만 보내고 종료 (LLM 미실행)

  Tier 2 (조건 충족 시, LLM 실행):
    4) Claude Code 헤드리스로 gsc-daily-strategist 실행
       1막 판정(지난 판단 채점) -> 2막 결정(행동 선택, '아무것도 안 함' 포함)
    5) 러너가 독립적으로 tsc/test 재검증 -> 실패하면 전체 되돌림
    6) 결과 알림 (커밋/푸시는 하지 않음 — 사용자가 직접)

  Tier 2 트리거 (하나라도 참이면 실행):
    - 판정 기일이 도래한 결정이 있다
    - 최근 7일 지표가 급변했다 (노출 +-40% 등)
    - 마지막 심층 실행 후 28일이 지났다 (정기 점검 보장)
    - -Force 지정

.PARAMETER Days
  분석 구간 길이 (기본 28일). 현재 트래픽에서 14일 창은 노출이 잡음에 묻힌다.

.PARAMETER SkipAgent
  Tier 1 만 수행한다 (동작 확인용)

.PARAMETER Force
  트리거 조건과 무관하게 Tier 2 를 실행한다

.PARAMETER DryRun
  에이전트가 파일을 수정하지 않고 분석·계획까지만 수행한다
#>
[CmdletBinding()]
param(
    [int]$Days = 28,
    [switch]$SkipAgent,
    [switch]$Force,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ReportDir = Join-Path $RepoRoot 'reports\gsc'
$LogDir = Join-Path $ReportDir 'logs'
$Stamp = Get-Date -Format 'yyyy-MM-dd'
$LogPath = Join-Path $LogDir "run-$Stamp.log"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Log {
    param([string]$Message, [string]$Level = 'INFO')
    $line = "[{0}] [{1}] {2}" -f (Get-Date -Format 'HH:mm:ss'), $Level, $Message
    Write-Output $line
    Add-Content -Path $LogPath -Value $line -Encoding UTF8
}

function Send-DesktopNotification {
    param([string]$Title, [string]$Message)
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
        Add-Type -AssemblyName System.Drawing -ErrorAction Stop
        $icon = New-Object System.Windows.Forms.NotifyIcon
        $icon.Icon = [System.Drawing.SystemIcons]::Information
        $icon.BalloonTipTitle = $Title
        $icon.BalloonTipText = $Message
        $icon.Visible = $true
        $icon.ShowBalloonTip(15000)
        Start-Sleep -Seconds 12
        $icon.Dispose()
        Write-Log "데스크톱 알림 전송 완료"
    } catch {
        Write-Log "데스크톱 알림 실패: $($_.Exception.Message)" 'WARN'
    }
}

function Send-WebhookNotification {
    <# GSC_NOTIFY_WEBHOOK 환경변수가 있으면 Slack/Discord 호환 웹훅으로도 보낸다. #>
    param([string]$Message)
    $hook = $env:GSC_NOTIFY_WEBHOOK
    if ([string]::IsNullOrWhiteSpace($hook)) { return }
    try {
        $payload = @{ text = $Message; content = $Message } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri $hook -Method Post -ContentType 'application/json' -Body $payload | Out-Null
        Write-Log "웹훅 알림 전송 완료"
    } catch {
        Write-Log "웹훅 알림 실패: $($_.Exception.Message)" 'WARN'
    }
}

function Get-RepoStatusMap {
    <# 경로 -> git status 코드 맵. 에이전트가 만진 파일을 정확히 식별하기 위해 쓴다. #>
    $map = @{}
    # --untracked-files=all 필수. 기본 옵션은 추적되지 않은 디렉터리를 'reports/' 처럼
    # 한 줄로 축약하는데, 그 경로가 되돌림 대상이 되면 디렉터리 트리 전체가 삭제된다.
    foreach ($line in (& git -C $RepoRoot status --porcelain --untracked-files=all)) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $code = $line.Substring(0, 2)
        $path = $line.Substring(3).Trim().Trim('"')
        $map[$path] = $code
    }
    return $map
}

function Undo-AgentChanges {
    <# 에이전트가 새로 만든 변경만 되돌린다. 실행 전부터 더러웠던 파일은 건드리지 않는다. #>
    param([string[]]$Paths, [hashtable]$StatusMap)
    foreach ($p in $Paths) {
        $full = Join-Path $RepoRoot $p
        try {
            if ($StatusMap[$p] -match '\?') {
                # 파일만 지운다. 디렉터리 재귀 삭제는 절대 하지 않는다 —
                # 경로 하나가 잘못 분류되면 트리 전체가 날아간다.
                if (Test-Path $full -PathType Container) {
                    Write-Log "  되돌림 생략(디렉터리): $p" 'WARN'
                } elseif (Test-Path $full) {
                    Remove-Item -Force $full
                    Write-Log "  되돌림(삭제): $p"
                }
            } else {
                & git -C $RepoRoot checkout -- $p 2>&1 | Out-Null
                Write-Log "  되돌림(복원): $p"
            }
        } catch {
            Write-Log "  되돌림 실패: $p — $($_.Exception.Message)" 'WARN'
        }
    }
}

function Resolve-ClaudeBinary {
    <# npm shim 이 깨진 환경이 있어 VSCode 확장 번들 바이너리까지 탐색한다. #>
    if ($env:CLAUDE_BIN -and (Test-Path $env:CLAUDE_BIN)) { return $env:CLAUDE_BIN }

    $extRoot = Join-Path $env:USERPROFILE '.vscode\extensions'
    if (Test-Path $extRoot) {
        $candidate = Get-ChildItem -Path $extRoot -Filter 'anthropic.claude-code-*' -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { Join-Path $_.FullName 'resources\native-binary\claude.exe' } |
            Where-Object { Test-Path $_ } |
            Select-Object -First 1
        if ($candidate) { return $candidate }
    }

    $onPath = Get-Command claude -ErrorAction SilentlyContinue
    if ($onPath) { return $onPath.Source }

    return $null
}

# ---------------------------------------------------------------- 1. 리포트 생성

Write-Log "===== GSC 일일 루틴 시작 (repo: $RepoRoot) ====="
Set-Location $RepoRoot
$env:PYTHONIOENCODING = 'utf-8'

# ---------------------------------------------------------------- 0. 원격 동기화
#
# 클라우드 Tier 1(gsc-observe.yml)이 매주 관측 기록과 결정 상태를 main 에 커밋한다.
# 그걸 먼저 받아오지 않으면 로컬이 낡은 상태로 판단하고, 나중에 푸시할 때 충돌한다.
# 작업 트리가 깨끗할 때만 당긴다 — 미커밋 변경이 있으면 건드리지 않는 편이 안전하다.
try {
    & git -C $RepoRoot fetch origin --quiet 2>&1 | Out-Null
    $behind = (& git -C $RepoRoot rev-list --count HEAD..'@{u}' 2>$null)
    if ($behind -and [int]$behind -gt 0) {
        $dirty = @(& git -C $RepoRoot status --porcelain --untracked-files=no)
        if ($dirty.Count -eq 0) {
            & git -C $RepoRoot pull --ff-only --quiet 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Log "원격에서 ${behind}개 커밋 동기화 완료"
            } else {
                Write-Log "동기화 실패 (fast-forward 불가) — 낡은 상태로 진행합니다" 'WARN'
            }
        } else {
            Write-Log "원격이 ${behind}개 앞서 있으나 미커밋 변경 $($dirty.Count)건이 있어 동기화를 건너뜁니다" 'WARN'
        }
    }
} catch {
    Write-Log "원격 동기화 시도 실패: $($_.Exception.Message)" 'WARN'
}

$pythonExe = (Get-Command python -ErrorAction SilentlyContinue)
if (-not $pythonExe) { $pythonExe = (Get-Command py -ErrorAction SilentlyContinue) }
if (-not $pythonExe) {
    Write-Log "python 실행 파일을 찾을 수 없습니다." 'ERROR'
    Send-DesktopNotification -Title 'GSC 일일 분석 실패' -Message 'python 을 찾을 수 없습니다.'
    exit 1
}

Write-Log "GSC 리포트 생성 중 (최근 ${Days}일)..."
$insightOutput = & $pythonExe.Source -m scripts.analytics.gsc_daily_insight --days $Days 2>&1
$insightOutput | ForEach-Object { Write-Log $_ }

if ($LASTEXITCODE -ne 0) {
    Write-Log "리포트 생성 실패 (exit $LASTEXITCODE)" 'ERROR'
    Send-DesktopNotification -Title 'GSC 일일 분석 실패' -Message '리포트 생성 단계에서 실패했습니다. 로그를 확인하세요.'
    exit 1
}

$latestJson = Join-Path $ReportDir 'latest.json'
if (-not (Test-Path $latestJson)) {
    Write-Log "latest.json 이 생성되지 않았습니다." 'ERROR'
    exit 1
}

$report = Get-Content $latestJson -Raw -Encoding UTF8 | ConvertFrom-Json
$cur = $report.summary.current
$headline = "클릭 {0} / 노출 {1} / CTR {2:P2} / 평균순위 {3:N1}" -f `
    $cur.clicks, $cur.impressions, $cur.ctr, $cur.position
Write-Log "리포트 요약 — $headline"

# ------------------------------------------------- 1-2. 판정 근거 산출 + 배포일 역추적
#
# 커밋은 사용자가 직접 하므로 결정이 '언제 실제로 배포됐는지'를 git 에서 찾아야
# 관찰 기간의 기준점이 생긴다. 이 단계가 없으면 판정 자체가 불가능하다.

Write-Log "판정 근거 산출 중..."
$evalOutput = & $pythonExe.Source -m scripts.analytics.gsc_evaluate 2>&1
$evalOutput | ForEach-Object { Write-Log $_ }
if ($LASTEXITCODE -ne 0) {
    Write-Log "판정 근거 산출 실패 (exit $LASTEXITCODE) — 이번 회차는 관찰만 수행합니다" 'WARN'
}

# 이번 회차 관측을 압축해 state/observations/ 에 남긴다.
# 리포트 원본은 git 에서 제외돼 있어, 이걸 안 남기면 지난 회차들이 어땠는지가
# 아무 데도 안 남는다. 나중에 에이전트가 스냅샷 하나가 아니라 추이를 읽게 하려는 것.
& $pythonExe.Source -m scripts.analytics.gsc_evaluate --record-observation 2>&1 |
    ForEach-Object { Write-Log $_ }

$statusJson = & $pythonExe.Source -m scripts.analytics.gsc_evaluate --status 2>&1 | Select-Object -Last 1
$status = $null
try { $status = $statusJson | ConvertFrom-Json } catch {
    Write-Log "상태 파싱 실패: $statusJson" 'WARN'
}

$dueCount = if ($status) { [int]$status.due_count } else { 0 }
$openCount = if ($status) { [int]$status.open_count } else { 0 }
$staleCount = if ($status) { [int]$status.stale_pending_count } else { 0 }
$daysSinceDeep = if ($status) { [int]$status.days_since_last_deep_run } else { 999 }
Write-Log "루프 상태 — 판정대기 $dueCount / 열린실험 $openCount / 커밋대기 $staleCount / 마지막 심층실행 ${daysSinceDeep}일 전"

if ($staleCount -gt 0) {
    Write-Log "커밋되지 않은 결정 ${staleCount}건 — 커밋해야 관찰이 시작됩니다" 'WARN'
}

if ($SkipAgent) {
    Write-Log "SkipAgent 지정됨 — Tier 1 만 수행하고 종료"
    Send-DesktopNotification -Title 'GSC 리포트 생성 완료' -Message $headline
    exit 0
}

# ---------------------------------------------------------------- 1-3. 실행 티어 결정
#
# 매주 LLM 을 띄우면 대부분의 회차가 '아직 기다릴 때' 라는 같은 결론에 토큰을 태운다.
# 판단이 필요한 회차에만 띄운다.

$triggers = @()
if ($Force) { $triggers += '-Force 지정' }
if ($dueCount -gt 0) { $triggers += "판정 기일 도래 ${dueCount}건" }
if ($daysSinceDeep -ge 28) { $triggers += "마지막 심층 실행 후 ${daysSinceDeep}일 (정기 점검)" }

$anomalyFlags = @()
if ($report.anomaly -and $report.anomaly.flags) { $anomalyFlags = @($report.anomaly.flags) }
if ($anomalyFlags.Count -gt 0) { $triggers += "급변 감지: $($anomalyFlags -join ', ')" }

if ($cur.impressions -eq 0 -and $dueCount -eq 0) {
    Write-Log "노출 0 + 판정 대상 없음 — 판단할 재료가 없어 생략" 'WARN'
    Send-DesktopNotification -Title 'GSC 루프' -Message '노출 데이터와 판정 대상이 모두 없어 이번 회차를 건너뜁니다.'
    exit 0
}

if ($triggers.Count -eq 0) {
    Write-Log "Tier 2 트리거 없음 — 관찰만 수행하고 종료 (LLM 미실행)"
    $quietMsg = "$headline`n판정대기 $dueCount / 열린실험 $openCount — 변화 없음, 대기 중."
    Send-DesktopNotification -Title "GSC 루프 — 관찰만 ($Stamp)" -Message $quietMsg
    Send-WebhookNotification -Message "**GSC 루프 — 관찰만 ($Stamp)**`n$quietMsg"
    Write-Log "===== Tier 1 종료 ====="
    exit 0
}

Write-Log "Tier 2 실행 — 트리거: $($triggers -join ' / ')"

# ---------------------------------------------------------------- 2. 에이전트 실행

$claude = Resolve-ClaudeBinary
if (-not $claude) {
    Write-Log "claude 실행 파일을 찾을 수 없습니다. CLAUDE_BIN 환경변수로 지정하세요." 'ERROR'
    Send-DesktopNotification -Title 'GSC 일일 분석 실패' -Message 'claude CLI 를 찾을 수 없습니다.'
    exit 1
}
Write-Log "claude 바이너리: $claude"

$prompt = @"
이번 회차의 GSC 루프를 수행하라. 리포트와 판정 근거는 방금 생성되어 있다 (다시 생성하지 마라).

읽을 것:
  reports/gsc/latest.json / latest.md            현재 상태
  reports/gsc/state/evaluation-input.md / .json  판정 기일이 도래한 결정과 실측 수치
  reports/gsc/state/beliefs.md                   사이트에 대한 현재 가설 모델
  reports/gsc/state/verdicts.md                  지난 판정 이력
  reports/gsc/state/goals.md                     상위 목표 (수정 금지) 와 현재 병목

이번 회차가 실행된 이유(트리거): $($triggers -join ' / ')
루프 상태: 판정대기 $dueCount / 열린실험 $openCount / 커밋대기 $staleCount

에이전트 지침대로 1막과 2막을 순서대로 수행하라.

  1막 — 판정: 만기 결정을 채점한다. judgement.verdict 는 산수로 확정된 값이니 뒤집지 마라.
        adjusted_delta(사이트 보정치)로만 판단하고, '판정불가' 에서는 어떤 결론도 내지 마라.
        verdicts.md 에 기록하고 beliefs.md 를 갱신한다.

  2막 — 결정: 현재 상태를 읽고, '답이 사이트에 있는데 못 찾았나 / 아예 없나' 를 가르고,
        지금 병목을 한 문장으로 정한 뒤, 행동을 고른다.
        N(아무것도 안 함)/H(대기)/O(관찰 등록) 도 정당한 결론이다.
        무언가 하는 것과 하지 않는 것에 같은 수준의 근거를 대라.
        loop_state.frozen 의 대상은 절대 건드리지 마라 — 관찰 중인 실험이다.
        코드를 바꿨다면 반드시 reports/gsc/state/decisions/ 에 반증 가능한 예측과 함께 결정 파일을 남겨라.
        baseline 은 손으로 옮기지 말고 다음 명령의 출력을 붙여넣어라:
          python -m scripts.analytics.gsc_evaluate --snapshot --page <경로> --query "<검색어>"

변경이 있으면 npx tsc --noEmit 과 npm test 를 통과시키고,
지정된 형식의 한국어 보고를 출력하라.

git add / git commit / git push 는 절대 실행하지 마라. 커밋은 사용자가 직접 한다.
"@

# plan 모드는 ExitPlanMode 승인이 필요해 헤드리스에서 막힌다.
# DryRun 은 쓰기 도구를 차단하고 프롬프트로 분석까지만 지시하는 방식으로 구현한다.
#
# 쓰기 허용 범위는 app/** (페이지 콘텐츠·metadata) 로 한정한다.
# 계산 로직(lib/), 테스트, 빌드 설정, 파이프라인은 SEO 개선과 무관하고
# 잘못 건드리면 금액이 틀리거나 배포가 깨지므로 도구 레벨에서 막는다.
$protectedWrites = @(
    'Edit(lib/**)', 'Write(lib/**)',
    'Edit(scripts/**)', 'Write(scripts/**)',
    'Edit(__tests__/**)', 'Write(__tests__/**)',
    'Edit(.github/**)', 'Write(.github/**)',
    'Edit(supabase/**)', 'Write(supabase/**)',
    'Edit(components/ui/**)', 'Write(components/ui/**)',
    'Edit(package.json)', 'Edit(package-lock.json)',
    'Edit(next.config.js)', 'Edit(middleware.ts)',
    'Edit(vercel.json)', 'Edit(tsconfig.json)', 'Edit(CLAUDE.md)'
)
$deniedTools = @('Bash(git add*)', 'Bash(git commit*)', 'Bash(git push*)',
                 'Bash(git checkout*)', 'Bash(git reset*)', 'WebSearch') + $protectedWrites
if ($DryRun) {
    $deniedTools += @('Edit', 'Write', 'NotebookEdit')
    $prompt += "`n`n[DRY-RUN] 이번 실행에서는 파일을 수정하지 마라. 1막 채점과 2막의 판단(병목 규정·행동 선택)까지만 머릿속으로 수행하고, 무엇을 어떻게 바꿀 계획이며 그 예측이 무엇인지 근거 수치와 함께 보고만 하라. verdicts.md·beliefs.md·결정 파일도 쓰지 말고 내용만 보고하라."
}
Write-Log ("에이전트 실행 (mode={0})..." -f $(if ($DryRun) { 'dry-run/분석만' } else { '코드 반영' }))

$agentOutPath = Join-Path $ReportDir "agent-$Stamp.md"

$claudeArgs = @(
    '-p', $prompt,
    '--agent', 'gsc-daily-strategist',
    '--permission-mode', 'acceptEdits',
    '--allowedTools', 'Read', 'Edit', 'Write', 'Glob', 'Grep',
    'Bash(python*)', 'Bash(npx tsc*)', 'Bash(npm test)', 'Bash(npm run build)',
    'Bash(git status*)', 'Bash(git diff*)',
    '--disallowedTools'
) + $deniedTools

$runStartedAt = Get-Date
$preStatus = Get-RepoStatusMap
$dirtyAtStart = @($preStatus.Keys | Where-Object { $_ -notlike 'reports*' })
if ($dirtyAtStart.Count -gt 0) {
    Write-Log "실행 전 이미 변경된 파일 $($dirtyAtStart.Count)개 — 이 파일들은 자동 되돌림 대상에서 제외됩니다" 'WARN'
}

$agentOutput = & $claude @claudeArgs 2>&1
$agentExit = $LASTEXITCODE

$agentText = ($agentOutput | Out-String).Trim()
# Set-Content -Encoding UTF8 은 PS 5.1 에서 BOM 을 붙인다 — 마크다운 첫 글자가 깨지므로 직접 쓴다.
[System.IO.File]::WriteAllText($agentOutPath, $agentText, (New-Object System.Text.UTF8Encoding($false)))
Write-Log "에이전트 출력 저장: $agentOutPath (exit $agentExit)"

if ($agentExit -ne 0) {
    Write-Log "에이전트 실행 실패 (exit $agentExit)" 'ERROR'
    Send-DesktopNotification -Title 'GSC 일일 분석 — 에이전트 실패' -Message "exit $agentExit. $agentOutPath 확인"
    exit 1
}

# ---------------------------------------------------------------- 3. 검증 및 안전장치

$postStatus = Get-RepoStatusMap

# 에이전트가 "새로" 만든 변경만 골라낸다 (실행 전부터 더러웠던 파일은 제외)
$agentTouched = @()
foreach ($path in $postStatus.Keys) {
    # reports/ 이하는 산출물·루프 상태라 되돌림 대상이 아니다.
    # 축약 경로('reports/')까지 확실히 걸러내려고 접두사만으로 판정한다.
    if ($path -like 'reports*') { continue }
    if (-not $preStatus.ContainsKey($path)) { $agentTouched += $path }
    elseif ($preStatus[$path] -ne $postStatus[$path]) { $agentTouched += $path }
}

$changedCount = $agentTouched.Count
Write-Log "에이전트 변경 파일 ${changedCount}개"
$agentTouched | ForEach-Object { Write-Log "  변경: $_" }

$rejectReasons = @()

if ($changedCount -gt 0) {
    # (1) 보호 경로 침범 — 도구 차단을 우회했더라도 여기서 잡는다
    $protectedPattern = '^(lib/|scripts/|__tests__/|\.github/|supabase/|components/ui/|middleware\.ts|next\.config\.js|package(-lock)?\.json|vercel\.json|tsconfig\.json|CLAUDE\.md)'
    $violations = @($agentTouched | Where-Object { $_ -match $protectedPattern })
    if ($violations.Count -gt 0) {
        $rejectReasons += "보호 경로 수정: $($violations -join ', ')"
    }

    # (2) 변경 규모 폭주 — 하루 1~3건 개선이 8개 파일을 넘길 이유가 없다
    if ($changedCount -gt 8) {
        $rejectReasons += "변경 파일 ${changedCount}개로 과다 (상한 8개)"
    }

    # (3) 타입 검사 — 에이전트 보고를 믿지 않고 러너가 직접 돌린다
    Write-Log "타입 검사 실행 중..."
    & npx tsc --noEmit 2>&1 | ForEach-Object { Write-Log "  tsc: $_" }
    if ($LASTEXITCODE -ne 0) { $rejectReasons += "npx tsc --noEmit 실패" }

    # (4) 테스트 — 계산 로직 회귀를 잡는 최후 방어선
    Write-Log "테스트 실행 중..."
    & npm test 2>&1 | Select-Object -Last 15 | ForEach-Object { Write-Log "  test: $_" }
    if ($LASTEXITCODE -ne 0) { $rejectReasons += "npm test 실패" }
}

if ($rejectReasons.Count -gt 0) {
    Write-Log "검증 실패 — 에이전트 변경을 되돌립니다" 'ERROR'
    $rejectReasons | ForEach-Object { Write-Log "  사유: $_" 'ERROR' }
    Undo-AgentChanges -Paths $agentTouched -StatusMap $postStatus

    # 되돌린 변경을 가리키는 결정 파일이 남으면 다음 회차가 유령을 채점하게 된다.
    # 이번 회차에 새로 생긴 결정만 지운다 (기존 결정은 건드리지 않는다).
    $decisionDir = Join-Path $ReportDir 'state\decisions'
    if (Test-Path $decisionDir) {
        Get-ChildItem -Path $decisionDir -Filter '*.json' -ErrorAction SilentlyContinue |
            Where-Object { $_.CreationTime -ge $runStartedAt } |
            ForEach-Object {
                Remove-Item $_.FullName -Force
                Write-Log "  되돌림(결정 삭제): $($_.Name)"
            }
    }

    $failMsg = "검증 실패로 변경을 되돌렸습니다: $($rejectReasons -join ' / ')"
    Send-DesktopNotification -Title "GSC 일일 분석 — 변경 취소 ($Stamp)" -Message $failMsg
    Send-WebhookNotification -Message "**GSC 일일 분석 — 변경 취소 ($Stamp)**`n$failMsg`n로그: $LogPath"
    Write-Log "===== 검증 실패로 종료 ====="
    exit 2
}

# 되돌리기 쉽도록 변경분 패치를 남긴다
if ($changedCount -gt 0) {
    $patchDir = Join-Path $ReportDir 'patches'
    New-Item -ItemType Directory -Force -Path $patchDir | Out-Null
    $patchPath = Join-Path $patchDir "$Stamp.patch"
    & git -C $RepoRoot diff -- $agentTouched > $patchPath
    Write-Log "변경 패치 저장: $patchPath"
    Write-Log "되돌리려면: git checkout -- $($agentTouched -join ' ')"
}

# ---------------------------------------------------------------- 4. 알림

if (-not $DryRun) {
    & $pythonExe.Source -m scripts.analytics.gsc_evaluate --mark-deep-run 2>&1 |
        ForEach-Object { Write-Log $_ }
}

$notifyBody = if ($changedCount -eq 0) {
    "$headline`n이번 회차 변경 없음 (판정 $dueCount / 열린실험 $openCount)."
} else {
    "$headline`n변경 파일 ${changedCount}개 (tsc·test 통과) — 커밋해야 관찰이 시작됩니다."
}
if ($staleCount -gt 0) {
    $notifyBody += "`n⚠️ 커밋 대기 중인 지난 결정 ${staleCount}건 — 커밋 전까지 채점 불가."
}

Send-DesktopNotification -Title "GSC 루프 완료 ($Stamp)" -Message $notifyBody

$webhookMsg = @"
**GSC 루프 완료 — $Stamp**
$headline
트리거: $($triggers -join ' / ')
판정 대기 $dueCount / 열린 실험 $openCount / 커밋 대기 $staleCount
변경 파일 ${changedCount}개 — tsc·test 통과, 커밋 대기
리포트: $agentOutPath
"@
Send-WebhookNotification -Message $webhookMsg

Write-Log "===== 완료 ====="
Write-Output ""
Write-Output "--------- 에이전트 보고 ---------"
Write-Output $agentText
exit 0
