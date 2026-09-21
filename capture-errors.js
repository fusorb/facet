// Use Node.js built-in fetch to access CDP HTTP endpoints
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 9222,
  path: '/json',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const pages = JSON.parse(data);
    const page = pages.find(p => p.type === 'page');
    if (!page) { console.log('No page found'); return; }
    console.log('Page URL:', page.url);
    
    // Try to use the CDP via HTTP - get the page's console
    // Actually, CDP requires WebSocket. Let me try a different approach.
    // Let me check what the page looks like by using Chrome's screenshot endpoint
    console.log('WebSocket URL:', page.webSocketDebuggerUrl);
    console.log('DevTools URL:', page.devtoolsFrontendUrl);
  });
});

req.on('error', (e) => {
  console.log('Error:', e.message);
});

req.end();
