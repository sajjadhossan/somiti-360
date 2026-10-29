/**
 * Somiti 360 - High-Speed Production Host & Mobile WiFi Preview Server
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, execSync } = require('child_process');

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

function serveStatic(req, res) {
  try {
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
      'Cache-Control': ext === '.html' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=31536000'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('Internal Server Error: ' + err.message);
  }
}

function startServer(port = DEFAULT_PORT) {
  // Ensure dist bundle exists
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.log('📦 প্রডাকশন বিল্ড পাওয়া যায়নি। স্বয়ংক্রিয়ভাবে তৈরি করা হচ্ছে...');
    try {
      execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
    } catch (e) {
      console.error('বিল্ড ত্রুটি:', e.message);
    }
  }

  const server = http.createServer(serveStatic);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ পোর্ট ${port} ব্যবহৃত হচ্ছে, পোর্ট ${port + 1}-এ চালু করা হচ্ছে...`);
      startServer(port + 1);
    } else {
      console.error('[ERROR] সার্ভার ত্রুটি:', err.message);
      process.exit(1);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    const ips = getLocalIpAddresses();
    console.log('===================================================================');
    console.log('           সমিতি ৩৬০ - লাইভ প্রিভিউ হোস্ট সক্রিয় হয়েছে');
    console.log('===================================================================');
    console.log(`  💻 পিসি ব্রাউজার লিংক : http://localhost:${port}`);
    ips.forEach(ip => {
      console.log(`  📱 মোবাইল ওয়াইফাই লিংক: http://${ip}:${port}`);
    });
    console.log('===================================================================');

    // Auto-open browser
    const startUrl = `http://localhost:${port}`;
    const startCmd = process.platform === 'win32'
      ? `start "" "${startUrl}"`
      : process.platform === 'darwin'
      ? `open "${startUrl}"`
      : `xdg-open "${startUrl}"`;

    setTimeout(() => {
      try {
        exec(startCmd);
      } catch {}
    }, 400);
  });
}

startServer();
