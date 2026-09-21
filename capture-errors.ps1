$ErrorActionPreference = "Stop"
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ws.Connect("ws://localhost:9222/devtools/page/FC8EE79E23C68F2A07E6373FC13C1353")
Start-Sleep -Milliseconds 200

function Send-JSON([string]$json) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $ws.Send((New-Object System.ArraySegment[byte[]]($bytes)), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None) | Out-Null
}

function Read-Msg {
    $buf = New-Object byte[] 65536
    $seg = New-Object System.ArraySegment[byte[]]($buf)
    $result = $ws.Receive($seg, [System.Threading.CancellationToken]::None)
    return [System.Text.Encoding]::UTF8.GetString($buf, 0, $result.Count)
}

# Enable Runtime to capture errors
Send-JSON '{"id":1,"method":"Runtime.enable"}'
Send-JSON '{"id":2,"method":"Page.enable"}'
Send-JSON '{"id":3,"method":"Page.reload"}'
Start-Sleep -Milliseconds 5000

# Get DOM content after reload
$json = '{"id":4,"method":"Runtime.evaluate","params":{"expression":"(function(){var r=document.querySelector(%22#root%22);return r?(%22ROOT%20FOUND,%20children:%22+r.children.length+%22,%20innerHTML:%22+r.innerHTML.substring(0,500)):%22NO%20ROOT%20FOUND%22);})()"}}'
Send-JSON $json
Start-Sleep -Milliseconds 3000

# Get body text
$json2 = '{"id":5,"method":"Runtime.evaluate","params":{"expression":"(function(){var b=document.body;return b?(%22BODY%20exists,%20innerHTML%20length:%22+b.innerHTML.length):%22NO%20BODY%22);})()"}}'
Send-JSON $json2
Start-Sleep -Milliseconds 3000

# Read all messages
$logs = @()
try {
    while ($ws.State -eq "Open") {
        $msg = Read-Msg
        if ($msg -and $msg.Length -gt 0) {
            $logs += $msg
        }
    }
} catch {
    # Expected on timeout
}

Write-Host "=== RESPONSES ==="
$logs | ForEach-Object {
    $parsed = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($parsed) {
        if ($parsed.method -eq "Runtime.consoleAPICalled") {
            $arg = $parsed.params.args[0]
            $val = if ($arg.value) { $arg.value } elseif ($arg.description) { $arg.description } else { "unknown" }
            Write-Host ("CONSOLE: " + $val)
        }
        if ($parsed.method -eq "Runtime.exceptionThrown") {
            $ed = $parsed.params.exceptionDetails
            Write-Host ("JS ERROR: " + $ed.exception.description)
            if ($ed.stackTrace) {
                $frame = $ed.stackTrace.callFrames[0]
                Write-Host ("  at " + $frame.functionName + ":" + $frame.lineNumber + ":" + $frame.columnNumber)
            }
        }
        if ($parsed.id -eq 4 -or $parsed.id -eq 5) {
            Write-Host ("EVAL(id=$($parsed.id)): " + $parsed.result.result.value)
        }
    } else {
        $display = $_.Substring(0, [Math]::Min(200, $_.Length))
        Write-Host "RAW: $display"
    }
}

$ws.Abort() | Out-Null