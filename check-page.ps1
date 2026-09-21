Add-Type -AssemblyName System.Net.WebSockets
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ws.Connect("ws://localhost:9222/devtools/page/FC8EE79F23C68F2A07E6373FC13C1353")

$errors = @()
$logs = @()

function Send-Cmd([string]$data) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($data)
    $ws.Send(new-object System.ArraySegment[byte]($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None) | Out-Null
}

function Read-Msg {
    $buf = New-Object byte[] 65536
    $seg = new-object System.ArraySegment[byte]($buf)
    $result = $ws.Receive($seg, [System.Threading.CancellationToken]::None)
    return [System.Text.Encoding]::UTF8.GetString($buf, 0, $result.Count)
}

Send-Cmd '{"id":1,"method":"Runtime.enable"}'
Send-Cmd '{"id":2,"method":"Page.enable"}'
Start-Sleep -Milliseconds 1000

# Get DOM content
Send-Cmd '{"id":4,"method":"Runtime.evaluate","params":{"expression":"document.querySelector('#root') ? document.querySelector('#root').innerHTML.substring(0,2000) : 'NO ROOT ELEMENT FOUND'"}}'

Start-Sleep -Milliseconds 5000

# Try to get any error
Send-Cmd '{"id":5,"method":"Runtime.evaluate","params":{"expression":"document.body ? document.body.children.length + \" children, html length: \" + document.body.innerHTML.length : \"NO BODY\""}}'

Start-Sleep -Milliseconds 2000

# Read all messages
try {
    while ($ws.State -eq "Open") {
        $msg = Read-Msg
        if ($msg) {
            $parsed = $msg | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($parsed.method -eq "Runtime.consoleAPICalled") {
                $logs += "LOG: $($parsed.params.args[0].value)"
            }
            if ($parsed.method -eq "Runtime.exceptionThrown") {
                $err = $parsed.params.exceptionDetails
                $errors += "ERROR: $($err.exception?.description) | Line: $($err.lineNumber) | URL: $($err.url)"
            }
            if ($parsed.id -eq 4 -and $parsed.result?.result) {
                $logs += "EVAL(4): $($parsed.result.result.value)"
            }
            if ($parsed.id -eq 5 -and $parsed.result?.result) {
                $logs += "EVAL(5): $($parsed.result.result.value)"
            }
        }
    }
} catch {
    Write-Host "Read error: $($_.Exception.Message)"
}

Write-Host "=== CONSOLE LOGS ==="
$logs | ForEach-Object { Write-Host $_ }
Write-Host "`n=== ERRORS ==="
$errors | ForEach-Object { Write-Host $_ }

$ws.Close() | Out-Null