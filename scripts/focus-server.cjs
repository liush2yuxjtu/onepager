#!/usr/bin/env node
const http = require('http');
const { execFile } = require('child_process');
const PORT = process.env.PORT || 8791;

const HTML_OK = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>已聚焦</title></head>
<body style="font-family:-apple-system,sans-serif;background:#0d1117;color:#e6edf3;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<div style="text-align:center"><div style="font-size:48px">✓</div><h1 style="font-size:20px">已在 Herdr 中聚焦对应窗口</h1>
<p style="color:#8b98a5;font-size:13px">切回 Herdr 网页查看 · 本标签页可关闭</p></div></body></html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (url.pathname === '/focus') {
    const pane = url.searchParams.get('pane') || '';
    if (!/^[\w:-]+$/.test(pane)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'bad pane id' }));
      return;
    }
    execFile('herdr', ['agent', 'focus', pane], { timeout: 8000 }, (err, stdout, stderr) => {
      res.writeHead(err ? 502 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(err ? `<h1>聚焦失败</h1><pre>${stderr || err.message}</pre>` : HTML_OK);
    });
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`focus server on http://127.0.0.1:${PORT} (loopback only)`);
});
