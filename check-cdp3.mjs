const ws = new WebSocket("ws://localhost:9222/devtools/browser/d319e4c8-962f-40a5-9546-4a0ff5b61645");

ws.onopen = () => {
  ws.send(JSON.stringify({ id: 1, method: "Target.createTarget", params: { url: "about:blank", windowWidth: 1280, windowHeight: 800 } }));
};

ws.onmessage = (event) => {
  const m = JSON.parse(event.data.toString());
  
  if (m.method === "Runtime.consoleAPICalled") {
    console.log("CONSOLE:", JSON.stringify(m.params?.args?.map(a => a.value ?? a.description)));
  }
  if (m.method === "Runtime.exceptionThrown") {
    const ed = m.params?.exceptionDetails;
    console.log("JS ERROR:", ed?.text, ed?.exception?.description);
    const frames = ed?.stackTrace?.callFrames?.map(f => `${f.functionName || 'anon'} at ${f.url.split('/').pop()}:${f.lineNumber}:${f.columnNumber}`);
    console.log("STACK:", frames);
  }
  
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
    const sessionId = m.result.sessionId;
    const send = (id, method, params = {}) => {
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    };
    
    send(5, "Runtime.enable");
    send(6, "Page.enable");
    send(7, "Network.enable");
    send(8, "Page.navigate", { url: "http://localhost:5174/" });
    
    setTimeout(() => {
      send(9, "Runtime.evaluate", { expression: "document.querySelector('#root') ? ('ROOT children=' + document.querySelector('#root').children.length + ' innerHTML=' + document.querySelector('#root').innerHTML.substring(0, 1000)) : 'NO ROOT'" });
    }, 10000);
  }
  
  if (m.id === 9 && m.result?.result) {
    console.log("ROOT HTML:", m.result.result.value);
  }
};

ws.onerror = (e) => console.log("WS ERROR");
setTimeout(() => { try { ws.close(); } catch {} process.exit(0); }, 20000);
