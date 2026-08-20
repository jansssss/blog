<#
.SYNOPSIS
  GSC 일일 분석 -> 개선안 코드 반영 -> 알림. 매일 09:10 작업 스케줄러가 호출한다.

.DESCRIPTION
  1) scripts/analytics/gsc_daily_insight.py 로 GSC 리포트 생성
  2) Claude Code 헤드리스(-p)로 gsc-daily-strategist 에이전트 실행 -> 코드 변경
  3) 결과 요약을 데스크톱 알림 + 로그로 전달 (커밋/푸시는 하지 않음)

.PARAMETER Days
  분석 구간 길이 (기본 14일). 스케줄 등록 시 register-gsc-daily.ps1 이 값을 넘긴다.

.PARAMETER SkipAgent
  리포트만 만들고 에이전트는 실행하지 않는다 (동작 확인용)

.PARAMETER DryRun
  에이전트를 plan 모드로 실행해 코드를 수정하지 않는다
#>
[CmdletBinding()]
param(
    [int]$Days = 14,
    [switch]$SkipAgent,
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
    foreach ($line in (& git -C $RepoRoot status --porcelain)) {
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
                if (Test-Path $full) { Remove-Item -Recurse -Force $full }
                Write-Log "  되돌림(삭제): $p"
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

if ($SkipAgent) {
    Write-Log "SkipAgent 지정됨 — 에이전트 실행 생략"
    Send-DesktopNotification -Title 'GSC 리포트 생성 완료' -Message $headline
    exit 0
}

if ($cur.impressions -eq 0) {
    Write-Log "노출 데이터 없음 — 에이전트 실행 생략" 'WARN'
    Send-DesktopNotification -Title 'GSC 일일 분석' -Message '최근 구간 노출 데이터가 없어 조치를 건너뜁니다.'
    exit 0
}

# ---------------------------------------------------------------- 2. 에이전트 실행

$claude = Resolve-ClaudeBinary
if (-not $claude) {
    Write-Log "claude 실행 파일을 찾을 수 없습니다. CLAUDE_BIN 환경변수로 지정하세요." 'ERROR'
    Send-DesktopNotification -Title 'GSC 일일 분석 실패' -Message 'claude CLI 를 찾을 수 없습니다.'
    exit 1
}
Write-Log "claude 바이너리: $claude"

$prompt = @'
오늘의 GSC 일일 개선 루틴을 수행하라.

reports/gsc/latest.json 과 reports/gsc/latest.md 는 방금 생성되어 있다 (다시 생성할 필요 없음).
reports/gsc/action-log.md 를 먼저 읽어 최근 처리 항목과 중복되지 않게 하라.

gsc-daily-strategist 에이전트 지침의 STEP 2~6 을 순서대로 수행하라:
유입 형태와 검색어·니즈를 해석하고, 임팩트 큰 개선 기회를 최대 3건 선정해
실제 코드로 반영한 뒤, npx tsc --noEmit 으로 검증하고,
action-log.md 에 기록한 다음, 지정된 형식의 한국어 요약 보고를 출력하라.

git add / git commit / git push 는 절대 실행하지 마라. 커밋은 사용자가 직접 한다.
'@

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
    $prompt += "`n`n[DRY-RUN] 이번 실행에서는 파일을 수정하지 마라. STEP 2~3(분석·기회 선정)까지만 수행하고, 어떤 파일을 어떻게 바꿀 계획인지 근거 수치와 함께 보고만 하라."
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

$preStatus = Get-RepoStatusMap
$dirtyAtStart = @($preStatus.Keys | Where-Object { $_ -notlike 'reports/gsc*' })
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
    if ($path -like 'reports/gsc*') { continue }
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

$notifyBody = if ($changedCount -eq 0) {
    "$headline`n오늘은 코드 변경 없음."
} else {
    "$headline`n변경 파일 ${changedCount}개 (tsc·test 통과) — 검토 후 커밋해주세요."
}

Send-DesktopNotification -Title "GSC 일일 분석 완료 ($Stamp)" -Message $notifyBody

$webhookMsg = @"
**GSC 일일 분석 완료 — $Stamp**
$headline
변경 파일 ${changedCount}개 — tsc·test 통과, 커밋 대기
리포트: $agentOutPath
"@
Send-WebhookNotification -Message $webhookMsg

Write-Log "===== 완료 ====="
Write-Output ""
Write-Output "--------- 에이전트 보고 ---------"
Write-Output $agentText
exit 0
