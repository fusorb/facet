const ws = new WebSocket("ws://localhost:9222/devtools/page/FC8EE79E23C68F2A07E6373FC13C1353");
const errors = [];
const logs = [];

ws.on("open", () => {
  ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
  ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
  setTimeout(() => {
    ws.send(JSON.stringify({
      id: 4,
      method: "Runtime.evaluate",
      params: { expression: "document.querySelector('#root') ? document.querySelector('#root').innerHTML.substring(0, 2000) : 'NO ROOT'" }
    }));
  }, 3000);
  setTimeout(() => {
    try { ws.close(); } catch {}
    console.log("=== CONSOLE LOGS ===");
    console.log(JSON.stringify(logs, null, 2));
    console.log("=== ERRORS ===");
    console.log(JSON.stringify(errors, null, 2));
    process.exit(0);
  }, 8000);
});

ws.on("message", (data) => {
  const m = JSON.parse(data.toString());
  if (m.method === "Runtime.consoleAPICalled") {
    logs.push({ type: m.params?.args?.[0]?.type || m.params?.type, value: m.params?.args?.[0]?.value || m.params?.args?.[0]?.description || JSON.stringify(m.params) });
  }
  if (m.method === "Runtime.exceptionThrown") {
    errors.push(m.params?.exceptionDetails);
  }
  if (m.id === 4 && m.result?.result) {
    logs.push({ type: "eval_result", value: m.result.result.value });
  }
});

ws.on("error", (e) => {
  console.log("WS ERROR:", e.message);
});
