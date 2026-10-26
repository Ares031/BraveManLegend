const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');

const url = 'http://127.0.0.1:4173/';
const root = path.resolve(__dirname, '..');

function ready() {
  return new Promise(resolve => {
    const request = http.get(`${url}index.html`, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve(response.statusCode === 200 && body.includes('towns/starter-village/index.html')));
      response.on('error', () => resolve(false));
    });
    request.setTimeout(800, () => request.destroy());
    request.on('error', () => resolve(false));
  });
}

function openBrowser() {
  const browser = spawn('cmd.exe', ['/d', '/c', 'start', '', url], { windowsHide: true, stdio: 'ignore' });
  browser.on('error', () => console.log(`Open your browser at ${url}`));
}

(async () => {
  if (await ready()) {
    console.log(`Game server is already running: ${url}`);
    openBrowser();
    return;
  }
  console.log('Starting BraveManLegend. Keep this window open while playing.');
  console.log('Close this window or press Ctrl+C to stop the server.');
  const server = spawn(process.execPath, [path.join(root, 'server.cjs')], { cwd: root, stdio: 'inherit', windowsHide: true });
  let stopped = false;
  server.on('error', error => { stopped = true; console.error(error.message); process.exitCode = 1; });
  server.on('exit', code => { stopped = true; if (code) process.exitCode = code; });
  process.on('SIGINT', () => { server.kill(); process.exit(); });
  process.on('SIGTERM', () => { server.kill(); process.exit(); });
  for (let attempt = 0; attempt < 20 && !stopped; attempt++) {
    if (await ready()) { openBrowser(); return; }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  console.error('Unable to start preview. Port 4173 may be occupied. See the error above.');
  if (!stopped) server.kill();
  process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
