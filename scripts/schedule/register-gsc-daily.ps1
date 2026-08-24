<#
.SYNOPSIS
  GSC 분석 에이전트를 Windows 작업 스케줄러에 등록한다. 기본은 주 1회(월요일 09:10).

.DESCRIPTION
  트래픽이 적을 때는 주 1회가 맞다. 리포트가 누적 구간을 보므로 매일 돌리면
  연속 실행이 대부분 같은 데이터를 보게 되고, SEO 변경은 재크롤링·재평가에
  며칠~몇 주가 걸려서 매일 손대면 어떤 변경이 효과가 있었는지 알 수 없다.
  일간 클릭이 두 자리로 올라오면 -Daily 로 전환한다.

.EXAMPLE
  # 등록 — 주 1회 월요일 09:10, 최근 14일 구간 분석 (기본값)
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1

.EXAMPLE
  # 요일·시각 변경
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -DayOfWeek Tuesday -At "10:10"

.EXAMPLE
  # 트래픽이 늘어난 뒤 매일 실행으로 전환 (구간도 7일로)
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -Daily -Days 14

.EXAMPLE
  # 평일만 매일
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -Weekdays

.EXAMPLE
  # 등록 해제 / 지금 한 번 실행
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -Unregister
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -RunNow
#>
[CmdletBinding()]
param(
    [string]$TaskName = 'ohyess-gsc-daily',
    [string]$At = '09:10',
    [int]$Days = 28,
    [ValidateSet('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')]
    [string]$DayOfWeek = 'Monday',
    [switch]$Daily,
    [switch]$Weekdays,
    [switch]$Unregister,
    [switch]$RunNow
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$RunnerPath = Join-Path $PSScriptRoot 'run-gsc-daily.ps1'

if ($Unregister) {
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "[OK] 작업 '$TaskName' 등록 해제 완료" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] 작업 '$TaskName' 이 등록되어 있지 않습니다" -ForegroundColor Yellow
    }
    return
}

if ($RunNow) {
    if (-not (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] 작업 '$TaskName' 이 등록되어 있지 않습니다. 먼저 등록하세요." -ForegroundColor Red
        exit 1
    }
    Start-ScheduledTask -TaskName $TaskName
    Write-Host "[OK] 작업 '$TaskName' 실행 요청 완료. 로그: reports\gsc\logs\" -ForegroundColor Green
    return
}

if (-not (Test-Path $RunnerPath)) {
    Write-Host "[ERROR] 러너를 찾을 수 없습니다: $RunnerPath" -ForegroundColor Red
    exit 1
}

# --- 사전 점검: claude 바이너리 존재 여부 ---
$claudeFound = $null
if ($env:CLAUDE_BIN -and (Test-Path $env:CLAUDE_BIN)) {
    $claudeFound = $env:CLAUDE_BIN
} else {
    $extRoot = Join-Path $env:USERPROFILE '.vscode\extensions'
    if (Test-Path $extRoot) {
        $claudeFound = Get-ChildItem -Path $extRoot -Filter 'anthropic.claude-code-*' -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { Join-Path $_.FullName 'resources\native-binary\claude.exe' } |
            Where-Object { Test-Path $_ } |
            Select-Object -First 1
    }
    if (-not $claudeFound) {
        $cmd = Get-Command claude -ErrorAction SilentlyContinue
        if ($cmd) { $claudeFound = $cmd.Source }
    }
}
if ($claudeFound) {
    Write-Host "[CHECK] claude 바이너리: $claudeFound" -ForegroundColor Cyan
} else {
    Write-Host "[WARN] claude 실행 파일을 찾지 못했습니다. CLAUDE_BIN 환경변수를 설정하세요." -ForegroundColor Yellow
}

# --- 작업 등록 ---
$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$RunnerPath`" -Days $Days" `
    -WorkingDirectory $RepoRoot

if ($Weekdays) {
    $trigger = New-ScheduledTaskTrigger -Weekly `
        -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday -At $At
    $scheduleLabel = "평일(월~금) $At"
} elseif ($Daily) {
    $trigger = New-ScheduledTaskTrigger -Daily -At $At
    $scheduleLabel = "매일 $At"
} else {
    # 기본값: 주 1회. 트래픽이 적은 동안은 이쪽이 맞다.
    $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $DayOfWeek -At $At
    $scheduleLabel = "매주 $DayOfWeek $At"
}

# 저장소가 외장하드(USB)에 있고 PC 가 항상 켜져 있지도 않다 — 결번을 전제로 설정한다.
#
# StartWhenAvailable: 놓친 회차를 다음 부팅 때 따라잡는다. 판정 일정이 날짜 기반이라
#   늦게 돌아도 판정은 사라지지 않고 미뤄질 뿐이며, 오히려 표본이 커진다.
# WakeToRun: 절전 상태면 깨워서 실행한다 (전원이 꺼져 있으면 당연히 불가).
# ExecutionTimeLimit 3시간: Tier 2 에이전트 회차가 30분을 넘기는 일이 흔하다.
#   1시간 한도면 검증·되돌림 단계 전에 강제 종료되어 반쪽 변경이 남을 수 있다.
# RestartCount: 외장하드가 아직 안 붙었거나 네트워크가 늦게 올라오는 경우를 위한 재시도.
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -RunOnlyIfNetworkAvailable `
    -StartWhenAvailable `
    -WakeToRun `
    -ExecutionTimeLimit (New-TimeSpan -Hours 3) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 15) `
    -MultipleInstances IgnoreNew

# 알림이 보이도록 로그온 세션에서 실행 (S4U/서비스 세션이면 토스트가 안 뜬다)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "[INFO] 기존 작업을 교체합니다" -ForegroundColor Yellow
}

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'ohyess.kr — GSC 관찰·판정·결정 루프 (커밋은 사용자가 직접)' | Out-Null

Write-Host ""
Write-Host "[OK] 작업 '$TaskName' 등록 완료 — $scheduleLabel 실행" -ForegroundColor Green
Write-Host "  분석 구간: 최근 ${Days}일"
Write-Host "  러너   : $RunnerPath"
Write-Host "  작업경로: $RepoRoot"
Write-Host "  로그   : $(Join-Path $RepoRoot 'reports\gsc\logs')"
Write-Host "  놓친 실행: 다음 부팅 때 따라잡음 (StartWhenAvailable)"
Write-Host "  절전 상태: 깨워서 실행 (WakeToRun) — 전원이 꺼져 있으면 불가"
Write-Host "  실행 한도: 3시간 / 실패 시 15분 간격 3회 재시도"
Write-Host ""
Write-Host "지금 한 번 테스트하려면:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`" -RunNow"
Write-Host "등록 해제하려면:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Unregister"
