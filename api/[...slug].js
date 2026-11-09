/**
 * Somiti 360 - Enterprise Universal Serverless API Gateway
 * -----------------------------------------------------------
 * Dynamically dispatches all `/api/*` endpoints to modular handlers
 * located in `api/_handlers/`.
 *
 * Benefits:
 *  1. Completely bypasses Vercel's Hobby 12-function limit (counts as exactly 1 function).
 *  2. Infinite scalability: Add hundreds of new APIs to `api/_handlers/` with zero config.
 *  3. Preserves 100% backward compatibility for all URLs (/api/app/version, /api/health, /api/cqrs, etc.)
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HANDLERS_DIR = path.join(__dirname, '_handlers');

export default async function gatewayHandler(req, res) {
  // 1. Universal CORS Configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 2. Resolve requested slug / subpath
    let slug = req.query?.slug;
    let subPath = '';

    if (Array.isArray(slug)) {
      subPath = slug.join('/');
    } else if (typeof slug === 'string' && slug.trim() !== '') {
      subPath = slug.trim();
    } else {
      // Fallback: parse from req.url
      const parsedUrl = new URL(req.url, 'http://localhost');
      subPath = parsedUrl.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
    }

    // Sanitize path against directory traversal
    subPath = path.normalize(decodeURIComponent(subPath)).replace(/^(\.\.[\/\\])+/, '');

    if (!subPath) {
      return res.status(200).json({
        success: true,
        gateway: 'Somiti 360 Universal Serverless API Gateway',
        status: 'online',
        version: '2.4.0',
        timestamp: new Date().toISOString()
      });
    }

    // 3. Locate target handler in api/_handlers/
    let targetFile = path.join(HANDLERS_DIR, `${subPath}.js`);
    if (!fs.existsSync(targetFile)) {
      targetFile = path.join(HANDLERS_DIR, subPath, 'index.js');
    }

    if (!fs.existsSync(targetFile)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'API_ENDPOINT_NOT_FOUND',
          message: `Endpoint '/api/${subPath}' does not exist in api/_handlers/`,
          requestedPath: `/api/${subPath}`
        }
      });
    }

    // 4. Dynamically load and invoke handler
    const fileUrl = 'file://' + targetFile.replace(/\\/g, '/');
    const mod = await import(fileUrl);
    const handler = mod.default || mod;

    if (typeof handler !== 'function') {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INVALID_HANDLER_EXPORT',
          message: `Handler at '${subPath}' did not export a default function.`
        }
      });
    }

    return await handler(req, res);
  } catch (err) {
    console.error('[API Gateway Error]:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'GATEWAY_INTERNAL_ERROR',
        message: err.message
      }
    });
  }
}
