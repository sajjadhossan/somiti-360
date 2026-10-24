/**
 * Somiti 360 - High-Speed Production Host & Mobile WiFi Preview Server
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DIST_DIR = path.join(__dirname, 'dist');
const DEFAULT_PORT = 5174;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm'
};

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  let filePath = path.join(DIST_DIR, safePath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('404 Not Found - Please build first using: npm run build');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

server.listen(DEFAULT_PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log('===================================================================');
  console.log('           সমিতি ৩৬০ - লাইভ প্রিভিউ হোস্ট সক্রিয় হয়েছে');
  console.log('===================================================================');
  console.log(`  💻 পিসি ব্রাউজার লিংক : http://localhost:${DEFAULT_PORT}`);
  ips.forEach(ip => {
    console.log(`  📱 মোবাইল ওয়াইফাই লিংক: http://${ip}:${DEFAULT_PORT}`);
  });
  console.log('===================================================================');
});
