param(
  [int]$AppPort = 5173,
  [int]$DebugPort = 9222,
  [int]$Width = 390,
  [int]$Height = 844
)

$ErrorActionPreference = "Stop"

$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path -LiteralPath $edge)) {
  throw "Microsoft Edge was not found at $edge"
}

$profile = Join-Path ([System.IO.Path]::GetTempPath()) ("kitty-edge-smoke-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $profile | Out-Null

$edgeProcess = Start-Process -FilePath $edge -PassThru -WindowStyle Hidden -ArgumentList @(
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--remote-allow-origins=*",
  "--remote-debugging-port=$DebugPort",
  "--user-data-dir=$profile",
  "--window-size=$Width,$Height",
  "http://localhost:$AppPort/"
)

function Receive-CdpMessage($socket) {
  $buffer = [byte[]]::new(65536)
  $segment = [ArraySegment[byte]]::new($buffer)
  $builder = [System.Text.StringBuilder]::new()
  do {
    $result = $socket.ReceiveAsync($segment, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    if ($result.Count -gt 0) {
      [void]$builder.Append([System.Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count))
    }
  } while (-not $result.EndOfMessage)
  return ($builder.ToString() | ConvertFrom-Json)
}

try {
  $tabs = $null
  for ($i = 0; $i -lt 30; $i++) {
    try {
      $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$DebugPort/json" -TimeoutSec 1
      if ($tabs.Count -gt 0) { break }
    } catch {
      Start-Sleep -Milliseconds 250
    }
  }
  if (-not $tabs) { throw "Could not connect to Edge debugging endpoint." }

  $tab = @($tabs) | Where-Object { $_.type -eq "page" -and $_.url -like "http://localhost:$AppPort/*" } | Select-Object -First 1
  if (-not $tab) { throw "Could not find the app page in Edge debugging targets." }
  $socket = [System.Net.WebSockets.ClientWebSocket]::new()
  [void]$socket.ConnectAsync([Uri]$tab.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
  $nextId = 1

  function Send-Cdp($method, $params = @{}) {
    $script:nextId += 1
    $id = $script:nextId
    $payload = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Depth 20 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    $segment = [ArraySegment[byte]]::new($bytes)
    $script:socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    while ($true) {
      $message = Receive-CdpMessage $script:socket
      if ($message.id -eq $id) { return $message }
    }
  }

  Send-Cdp "Runtime.enable" | Out-Null
  Send-Cdp "Page.enable" | Out-Null
  Send-Cdp "Emulation.setDeviceMetricsOverride" @{
    width = $Width
    height = $Height
    deviceScaleFactor = 1
    mobile = $true
  } | Out-Null
  Send-Cdp "Page.navigate" @{ url = "http://localhost:$AppPort/" } | Out-Null
  Start-Sleep -Milliseconds 1200

  $expression = @'
(() => {
  const result = {};
  result.viewport = window.innerWidth;
  result.mobileBreakpoint = matchMedia("(max-width: 640px)").matches;
  result.noHorizontalScroll = document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  result.hubCards = document.querySelectorAll(".game-card").length;
  const targets = {
    pairs: ".pair-board .card-tile",
    merge: ".merge-board .merge-cell",
    sort: ".sort-items .tile-button",
    find: ".find-scenes .scene",
    dress: ".avatar-stage .avatar",
    room: ".room-stage .room-desk",
    milkTea: ".milk-tea-scene #serveMilkTea",
    flowerShop: ".flower-scene #serveBouquet",
    stall: ".market-scene #startStallDay",
    skyShooter: ".shooter-wrap .shooter-canvas"
  };
  for (const [id, selector] of Object.entries(targets)) {
    startGame(id);
    result[id] = document.querySelectorAll(selector).length;
    result[`${id}NoHorizontalScroll`] = document.documentElement.scrollWidth <= document.documentElement.clientWidth;
  }
  const save = JSON.parse(localStorage.getItem("kitty-office-mini-games-v1"));
  result.saved = !!save && save.plays >= 6 && save.coins >= 0;
  return JSON.stringify(result);
})()
'@

  $response = Send-Cdp "Runtime.evaluate" @{
    expression = $expression
    returnByValue = $true
    awaitPromise = $true
  }

  if ($response.result.exceptionDetails) {
    throw ($response.result.exceptionDetails.text | Out-String)
  }

  $result = $response.result.result.value | ConvertFrom-Json
  $checks = [ordered]@{
    viewport = $result.viewport -eq $Width
    mobileBreakpoint = [bool]$result.mobileBreakpoint
    noHorizontalScroll = [bool]$result.noHorizontalScroll
    hubCards = $result.hubCards -eq 10
    pairs = $result.pairs -eq 16
    pairsNoHorizontalScroll = [bool]$result.pairsNoHorizontalScroll
    merge = $result.merge -eq 16
    mergeNoHorizontalScroll = [bool]$result.mergeNoHorizontalScroll
    sort = $result.sort -eq 12
    sortNoHorizontalScroll = [bool]$result.sortNoHorizontalScroll
    find = $result.find -eq 2
    findNoHorizontalScroll = [bool]$result.findNoHorizontalScroll
    dress = $result.dress -eq 1
    dressNoHorizontalScroll = [bool]$result.dressNoHorizontalScroll
    room = $result.room -eq 1
    roomNoHorizontalScroll = [bool]$result.roomNoHorizontalScroll
    milkTea = $result.milkTea -eq 1
    milkTeaNoHorizontalScroll = [bool]$result.milkTeaNoHorizontalScroll
    flowerShop = $result.flowerShop -eq 1
    flowerShopNoHorizontalScroll = [bool]$result.flowerShopNoHorizontalScroll
    stall = $result.stall -eq 1
    stallNoHorizontalScroll = [bool]$result.stallNoHorizontalScroll
    skyShooter = $result.skyShooter -eq 1
    skyShooterNoHorizontalScroll = [bool]$result.skyShooterNoHorizontalScroll
    saved = [bool]$result.saved
  }

  $checks.GetEnumerator() | ForEach-Object {
    Write-Host ("{0}: {1}" -f $_.Key, $_.Value)
  }

  if ($checks.Values -contains $false) {
    throw "Smoke test failed."
  }
}
finally {
  if ($socket) { $socket.Dispose() }
  if ($edgeProcess -and -not $edgeProcess.HasExited) {
    Stop-Process -Id $edgeProcess.Id -Force -ErrorAction SilentlyContinue
  }
  if (Test-Path -LiteralPath $profile) {
    Remove-Item -LiteralPath $profile -Recurse -Force -ErrorAction SilentlyContinue
  }
}
