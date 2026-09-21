// Step 1: Connect to browser, create a new target
const browserWs = new WebSocket("ws://localhost:9222/devtools/browser/d319e4c8-962f-40a5-9546-4a0ff5b61645");

browserWs.onopen = () => {
  console.error("Connected to browser CDP");
  // Create a new page target
  browserWs.send(JSON.stringify({ id: 1, method: "Target.createTarget", params: { url: "about:blank", windowWidth: 1280, windowHeight: 800 } }));
};

browserWs.onmessage = (event) => {
  const m = JSON.parse(event.data.toString());
  if (m.id === 1 && m.result?.targetId) {
    const targetId = m.result.targetId;
    console.error("Created target:", targetId);
    // Get the target's WebSocket URL
    browserWs.send(JSON.stringify({ id: 2, method: "Target.getTargets" }));
  }
  if (m.id === 2) {
    const target = m.result.targetInfos.find(t => t.targetId);
    // Wait for the page target
    setTimeout(() => {
      browserWs.send(JSON.stringify({ id: 3, method: "Target.getTargets" }));
    }, 1000);
  }
  if (m.id === 3) {
    const pageTarget = m.result.targetInfos.find(t => t.type === "page" && t.url === "about:blank");
    if (pageTarget) {
      console.error("Found page target:", pageTarget.targetId);
      // Get the page's DevTools session
      browserWs.send(JSON.stringify({ id: 4, method: "Target.attachToTarget", params: { targetId: pageTarget.targetId, flatten: true } }));
    }
  }
  if (m.id === 4 && m.result?.sessionId) {
    const sessionId = m.result.sessionId;
    console.error("Session:", sessionId);
    
    // UsesessionId to send commands
    const send = (method, params = {}) => {
      browserWs.send(JSON.stringify({ id: 0, sessionId, method, params }));
    };
    
    send("Runtime.enable");
    send("Page.enable");
    send("Page.bringToFront");
    
    // Navigate to the landing app
    send("Page.navigate", { url: "http://localhost:5174/" });
    
    setTimeout(() => {
      // Get DOM content
      send("Runtime.evaluate", { expression: "document.body ? ('BODY: ' + document.body.innerHTML.substring(0, 500)) : 'NO BODY'" });
    }, 5000);
    
    setTimeout(() => {
      send("Runtime.evaluate", { expression: "document.querySelector('#root') ? ('ROOT: children=' + document.querySelector('#root').children.length + ' html=' + document.querySelector('#root').innerHTML.substring(0, 300)) : 'NO ROOT'" });
    }, 8000);
  }
  
  // Capture errors
  if (m.method === "Runtime.consoleAPICalled") {
    console.log("CONSOLE:", JSON.stringify(m.params?.args?.map(a => a.value ?? a.description)));
  }
  if (m.method === "Runtime.exceptionThrown") {
    const ed = m.params?.exceptionDetails;
    console.log("JS ERROR:", ed?.exception?.description, "| text:", ed?.text);
    const frames = ed?.stackTrace?.callFrames?.map(f => `${f.functionName || 'anon'} at ${f.url.split('/').pop()}:${f.lineNumber}:${f.columnNumber}`);
    console.log("STACK:", frames);
  }
  if (m.id === 0 && m.result?.result) {
    console.log("EVAL RESULT:", m.result.result.value);
  }
};

browserWs.onerror = (e) => {
  console.log("WS ERROR:", e);
};

setTimeout(() => {
  try { browserWs.close(); } catch {}
  process.exit(0);
}, 15000);
