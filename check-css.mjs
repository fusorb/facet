import fs from 'fs';
import http from 'http';

const req = http.request({ hostname: 'localhost', port: 5174, path: '/src/app.css', method: 'GET' }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("CSS size:", data.length, "bytes");
    
    // Check for dark theme
    const hasDarkTheme = data.includes('data-theme="dark"') || data.includes('data-theme=dark');
    console.log("Has [data-theme=dark] selector:", hasDarkTheme);
    
    // Check for key variables
    for (const v of ['--background', '--foreground', '--bg:', '--text:', '--primary', '--primary-foreground']) {
      const re = new RegExp(v + '[^;]*;', 'g');
      const matches = data.match(re);
      console.log(v + ":", matches ? matches.length + " occurrences" : "NOT FOUND");
      if (matches && matches.length > 0) {
        matches.slice(0, 3).forEach(m => console.log("  " + m));
      }
    }
    
    // Check for :root block
    const rootMatch = data.match(/:root[^}]*}/);
    if (rootMatch) {
      const rootContent = rootMatch[0];
      console.log("\n:root block has --background:", rootContent.includes('--background'));
      console.log(":root block has --bg:", rootContent.includes('--bg'));
      console.log(":root block has --foreground:", rootContent.includes('--foreground'));
      console.log(":root block has --text:", rootContent.includes('--text'));
      console.log(":root block has --primary:", rootContent.includes('--primary'));
    }
    
    // Check for [data-theme="light"] vs [data-theme="dark"]
    const lightMatches = data.match(/data-theme="light"/g);
    const darkMatches = data.match(/data-theme="dark"/g);
    console.log("\n[data-theme=light] occurrences:", lightMatches ? lightMatches.length : 0);
    console.log("[data-theme=dark] occurrences:", darkMatches ? darkMatches.length : 0);
    
    // Check if body has background-color
    const bodyMatch = data.match(/body[^{]*{[^}]*}/g);
    if (bodyMatch) {
      bodyMatch.forEach(b => console.log("\n" + b.substring(0, 200)));
    }
  });
});

req.on('error', (e) => {
  console.log("Error:", e.message);
});
req.setTimeout(10000, () => {
  console.log("Request timed out");
  req.destroy();
});
req.end();
