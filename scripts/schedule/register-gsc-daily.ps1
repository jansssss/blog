<#
.SYNOPSIS
  GSC 일일 분석 에이전트를 Windows 작업 스케줄러에 매일 09:10 실행으로 등록한다.

.EXAMPLE
  # 등록 (관리자 권한 불필요 — 현재 사용자 작업으로 등록)
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1

.EXAMPLE
  # 시간 변경
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -At "09:10"

.EXAMPLE
  # 등록 해제
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -Unregister

.EXAMPLE
  # 등록된 작업을 지금 한 번 실행 (동작 확인)
  powershell -ExecutionPolicy Bypass -File scripts\schedule\register-gsc-daily.ps1 -RunNow
#>
[CmdletBinding()]
param(
    [string]$TaskName = 'ohyess-gsc-daily',
    [string]$At = '09:10',
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
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$RunnerPath`"" `
    -WorkingDirectory $RepoRoot

if ($Weekdays) {
    $trigger = New-ScheduledTaskTrigger -Weekly `
        -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday -At $At
    $scheduleLabel = "평일(월~금) $At"
} else {
    $trigger = New-ScheduledTaskTrigger -Daily -At $At
    $scheduleLabel = "매일 $At"
}

# StartWhenAvailable 을 켜지 않는다 — PC가 꺼져 있어 09:10 을 놓치면
# 나중에 따라잡지 않고 그날은 통째로 건너뛰고 다음 날 정시를 기다린다.
# 배터리 상태로는 실행을 막지 않는다 (노트북 사용 고려).
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
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
    -Description 'ohyess.kr — 매일 GSC 유입 분석 후 개선안을 코드로 반영하고 알림 (커밋은 사용자가 직접)' | Out-Null

Write-Host ""
Write-Host "[OK] 작업 '$TaskName' 등록 완료 — $scheduleLabel 실행" -ForegroundColor Green
Write-Host "  러너   : $RunnerPath"
Write-Host "  작업경로: $RepoRoot"
Write-Host "  로그   : $(Join-Path $RepoRoot 'reports\gsc\logs')"
Write-Host "  놓친 실행: 따라잡지 않음 (PC가 꺼져 있었다면 그날은 건너뜀)"
Write-Host ""
Write-Host "지금 한 번 테스트하려면:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`" -RunNow"
Write-Host "등록 해제하려면:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Unregister"
