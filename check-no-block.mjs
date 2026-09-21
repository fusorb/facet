const ws = new WebSocket("ws://localhost:9222/devtools/browser/d319e4c8-962f-40a5-9546-4a0ff5b61645");
let sessionId = null;

ws.onopen = () => {
  ws.send(JSON.stringify({ id: 1, method: "Target.createTarget", params: { url: "about:blank", windowWidth: 1280, windowHeight: 800 } }));
};

ws.onmessage = (event) => {
  const m = JSON.parse(event.data.toString());
  
  if (m.method === "Runtime.consoleAPICalled") {
    const args = m.params?.args?.map(a => a.value ?? a.description ?? JSON.stringify(a));
    console.log("CONSOLE:", JSON.stringify(args));
  }
  if (m.method === "Runtime.exceptionThrown") {
    const ed = m.params?.exceptionDetails;
    console.log("JS ERROR:", ed?.text, ed?.exception?.description);
    ed?.stackTrace?.callFrames?.slice(0,3).forEach(f => {
      console.log("  at " + f.functionName + " @ " + f.url.split('/').pop() + ":" + f.lineNumber + ":" + f.columnNumber);
    });
  }
  if (m.method === "Network.responseReceived") {
    const r = m.params?.response;
    if (r?.status >= 400 || r?.status === -1) {
      console.log("NETWORK ERROR:", r?.status, r?.url?.substring(0, 100));
    }
  }
  
  const send = (id, method, params = {}) => {
    if (sessionId) {
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    }
  };
  
  if (m.id === 1 && m.result?.targetId) {
    setTimeout(() => {
      ws.send(JSON.stringify({ id: 3, method: "Target.getTargets" }));
    }, 1000);
  }
  if (m.id === 3) {
    const pageTarget = m.result.targetInfos.find(t => t.type === "page" && t.url === "about:blank");
    if (pageTarget) {
      ws.send(JSON.stringify({ id: 4, method: "Target.attachToTarget", params: { targetId: pageTarget.targetId, flatten: true } }));
    }
  }
  if (m.id === 4 && m.result?.sessionId) {
    sessionId = m.result.sessionId;
    send(5, "Runtime.enable");
    send(6, "Page.enable");
    send(7, "Network.enable");
    // NO blocking this time
    send(8, "Page.navigate", { url: "http://localhost:5174/" });
    
    // Check at 5s intervals
    setTimeout(() => {
      send(10, "Runtime.evaluate", { expression: "document.querySelector('#root').children.length + ' root children, body bg: ' + getComputedStyle(document.body).backgroundColor + ', color: ' + getComputedStyle(document.body).color + ', css links: ' + document.querySelectorAll('link[rel=stylesheet]').length + ', css loaded: ' + Array.from(document.styleSheets).filter(s=>!s.disabled).length" });
    }, 5000);
    setTimeout(() => {
      send(11, "Runtime.evaluate", { expression: "document.querySelector('#root').children.length + ' root children, body bg: ' + getComputedStyle(document.body).backgroundColor + ', color: ' + getComputedStyle(document.body).color" });
    }, 10000);
    setTimeout(() => {
      send(12, "Runtime.evaluate", { expression: "document.querySelector('#root').children.length + ' root children, body bg: ' + getComputedStyle(document.body).backgroundColor + ', color: ' + getComputedStyle(document.body).color + ', content preview: ' + (document.querySelector('#root').innerHTML || '').substring(0, 300)" });
    }, 15000);
  }
  
  if ((m.id === 10 || m.id === 11 || m.id === 12) && m.result?.result) {
    console.log("CHECK(id=" + m.id + "): " + m.result.result.value);
  }
};

ws.onerror = (e) => console.log("WS ERROR:", e);
setTimeout(() => { try { ws.close(); } catch {} process.exit(0); }, 20000);
