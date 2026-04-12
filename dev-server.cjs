/**
 * Servidor local que espelha o rewrite do vercel.json:
 * /produtos/:slug → /produtos/index.html
 * O pacote `serve` não aplica rewrites; em produção a Vercel sim.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (urlPath !== '/' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  let filePath = urlPath === '/' ? path.join(PUBLIC, 'index.html') : path.join(PUBLIC, urlPath.slice(1));

  fs.stat(filePath, (err, st) => {
    if (!err && st.isFile()) {
      if (req.method === 'HEAD') {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end();
        return;
      }
      return sendFile(res, filePath);
    }

    const produtosSlug = urlPath.match(/^\/produtos\/([^/]+)$/);
    if (produtosSlug) {
      const spa = path.join(PUBLIC, 'produtos', 'index.html');
      if (req.method === 'HEAD') {
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end();
        return;
      }
      return sendFile(res, spa);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  });
});

server.listen(PORT, () => {
  console.log(`Dev: http://localhost:${PORT}/ (rewrites /produtos/:slug → produtos/index.html)`);
});
