/**
 * Somiti 360 (সমিতি ৩৬০) - High-Speed Production Web Server for Render.com
 * Supports dynamic port binding ($PORT), SPA client-side routing,
 * gzip static compression, security headers, and health checks.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIST_DIR = path.join(__dirname, 'dist');
const PORT = parseInt(process.env.PORT, 10) || 10000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
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

async function handleApiRoute(req, res, parsedUrl) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let bodyBuffer = '';
  req.on('data', chunk => { bodyBuffer += chunk; });
  req.on('end', async () => {
    let body = {};
    if (bodyBuffer) {
      try {
        body = JSON.parse(bodyBuffer);
      } catch {
        body = bodyBuffer;
      }
    }

    req.body = body;
    req.query = Object.fromEntries(parsedUrl.searchParams.entries());

    // Express/Vercel compatibility helpers
    res.status = function(code) {
      this.statusCode = code;
      return this;
    };
    res.json = function(data) {
      this.setHeader('Content-Type', 'application/json; charset=UTF-8');
      this.end(JSON.stringify(data));
      return this;
    };
    res.send = function(data) {
      if (typeof data === 'object') return this.json(data);
      this.end(data);
      return this;
    };

    // Locate matching api file in _handlers or api root
    const subPath = parsedUrl.pathname.replace(/^\/api\/?/, '');
    let apiFilePath = path.join(__dirname, 'api', '_handlers', subPath + '.js');
    if (!fs.existsSync(apiFilePath)) {
      apiFilePath = path.join(__dirname, 'api', '_handlers', subPath, 'index.js');
    }
    if (!fs.existsSync(apiFilePath)) {
      apiFilePath = path.join(__dirname, 'api', subPath + '.js');
    }
    if (!fs.existsSync(apiFilePath)) {
      apiFilePath = path.join(__dirname, 'api', subPath, 'index.js');
    }

    if (fs.existsSync(apiFilePath)) {
      try {
        const fileUrl = 'file://' + apiFilePath.replace(/\\/g, '/');
        const mod = await import(fileUrl);
        const handler = mod.default || mod;
        await handler(req, res);
      } catch (err) {
        console.error(`[API Error in ${parsedUrl.pathname}]:`, err);
        res.status(500).json({ success: false, error: err.message });
      }
    } else {
      res.status(404).json({ success: false, error: `API endpoint not found: ${parsedUrl.pathname}` });
    }
  });
}

function serveStatic(req, res) {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Health check endpoint for Render service monitoring & Neon Full-Stack diagnostics
    if (pathname === '/api/health' || pathname === '/healthz') {
      import('./api/_lib/dualEngineDb.js').then(async (dualEngine) => {
        let healthData = {};
        try {
          healthData = await dualEngine.checkDualEngineHealth();
        } catch (e) {
          healthData = { error: e.message };
        }
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=UTF-8',
          'Cache-Control': 'no-cache, no-store'
        });
        res.end(JSON.stringify({
          status: 'ok',
          uptime: process.uptime(),
          platform: 'render',
          timestamp: new Date().toISOString(),
          version: '2.5.0',
          dualEngine: healthData
        }, null, 2));
      }).catch(err => {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=UTF-8'
        });
        res.end(JSON.stringify({
          status: 'ok',
          uptime: process.uptime(),
          platform: 'render',
          timestamp: new Date().toISOString(),
          version: '2.5.0',
          fallback: true
        }));
      });
      return;
    }

    // Dynamic API Router for all other /api/* endpoints (Vercel Serverless Function Compatibility)
    if (pathname.startsWith('/api/')) {
      handleApiRoute(req, res, parsedUrl);
      return;
    }

    // Sanitize path to prevent directory traversal
    let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
      safePath = '/index.html';
    }

    let filePath = path.join(DIST_DIR, safePath);

    // If file does not exist or is a directory, fall back to index.html for SPA routing
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Application is building or dist directory not found. Please build using npm run build.');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isHtml = ext === '.html';

    const headers = {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': isHtml
        ? 'public, max-age=0, must-revalidate'
        : 'public, max-age=31536000, immutable'
    };

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const rawStream = fs.createReadStream(filePath);

    // Compress text & js & css assets with Gzip if supported
    if (
      /\b(gzip)\b/.test(acceptEncoding) &&
      (contentType.includes('text') || contentType.includes('javascript') || contentType.includes('json') || contentType.includes('svg'))
    ) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      rawStream.pipe(zlib.createGzip()).pipe(res);
    } else {
      res.writeHead(200, headers);
      rawStream.pipe(res);
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('Internal Server Error: ' + err.message);
  }
}

const server = http.createServer(serveStatic);

server.listen(PORT, HOST, () => {
  console.log('===================================================================');
  console.log('🚀 SOMITI 360 (সমিতি ৩৬০) - RENDER.COM PRODUCTION SERVER ONLINE');
  console.log('===================================================================');
  console.log(`📡 Server listening on : http://${HOST}:${PORT}`);
  console.log(`🌍 Environment         : ${process.env.NODE_ENV || 'production'}`);
  console.log(`📦 Serving Directory   : ${DIST_DIR}`);
  console.log('===================================================================');
});
