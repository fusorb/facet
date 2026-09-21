const ws = new WebSocket("ws://localhost:9222/devtools/page/FC8EE79E23C68F2A07E6373FC13C1353");
const errors = [];
const logs = [];

ws.onopen = () => {
  console.error("Connected to Chrome CDP");
  ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
  ws.send(JSON.stringify({ id: 2, method: "Page.enable" }));
  ws.send(JSON.stringify({ id: 3, method: "Page.reload" }));
  setTimeout(() => {
    ws.send(JSON.stringify({
      id: 4,
      method: "Runtime.evaluate",
      params: { expression: "document.querySelector('#root') ? ('ROOT FOUND, children: ' + document.querySelector('#root').children.length + ', html: ' + document.querySelector('#root').innerHTML.substring(0, 500)) : 'NO ROOT FOUND'" }
    }));
  }, 5000);
  setTimeout(() => {
    ws.send(JSON.stringify({
      id: 5,
      method: "Runtime.evaluate",
      params: { expression: "document.body ? ('BODY EXISTS, len: ' + document.body.innerHTML.length + ', html: ' + document.body.innerHTML.substring(0, 500)) : 'NO BODY'" }
    }));
  }, 8000);
  setTimeout(() => {
    try { ws.close(); } catch {}
    console.log("=== CONSOLE LOGS ===");
    console.log(JSON.stringify(logs, null, 2));
    console.log("=== ERRORS ===");
    console.log(JSON.stringify(errors, null, 2));
    process.exit(0);
  }, 10000);
};

ws.onmessage = (event) => {
  const m = JSON.parse(event.data.toString());
  if (m.method === "Runtime.consoleAPICalled") {
    logs.push({ type: m.params?.type, args: m.params?.args?.map(a => a.value ?? a.description ?? JSON.stringify(a)) });
  }
  if (m.method === "Runtime.exceptionThrown") {
    const ed = m.params?.exceptionDetails;
    errors.push({
      text: ed?.text,
      exception: ed?.exception?.description,
      stack: ed?.stackTrace?.callFrames?.map(f => `${f.functionName || 'anonymous'} at ${f.url}:${f.lineNumber}:${f.columnNumber}`),
    });
  }
  if (m.id === 4 && m.result?.result) {
    logs.push({ type: "eval4", value: m.result.result.value });
  }
  if (m.id === 5 && m.result?.result) {
    logs.push({ type: "eval5", value: m.result.result.value });
  }
};

ws.onerror = (e) => {
  console.log("WS ERROR:", e.message);
};
