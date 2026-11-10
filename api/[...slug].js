/**
 * Somiti 360 - Enterprise Universal Serverless API Gateway
 * -----------------------------------------------------------
 * Static Dispatch Table ensures 100% reliable bundling by @vercel/nft.
 * Counts as EXACTLY 1 Serverless Function on Vercel Hobby Plan (Limit: 12).
 *
 * Supported Routes:
 *  - /api/app/version
 *  - /api/samity/cloud-state
 *  - /api/health
 *  - /api/public/verify
 *  - /api/receipts/pdf, /api/receipts/qr, /api/receipts/cancel, etc.
 *  - /api/documents/pdf, /api/documents/qr, etc.
 *  - /api/sync/push, /api/sync/pull, /api/sync/bulk, etc.
 *  - /api/cqrs
 *  - /api/ai/deposit-scan, /api/ai/deposit-draft
 */

import appVersionHandler from './_handlers/app/version.js';
import samityCloudStateHandler from './_handlers/samity/cloud-state.js';
import healthHandler from './_handlers/health.js';
import publicVerifyHandler from './_handlers/public/verify.js';
import receiptsPdfHandler from './_handlers/receipts/pdf.js';
import receiptsQrHandler from './_handlers/receipts/qr.js';
import receiptsQrPngHandler from './_handlers/receipts/qr-png.js';
import receiptsQrSvgHandler from './_handlers/receipts/qr-svg.js';
import receiptsCancelHandler from './_handlers/receipts/cancel.js';
import receiptsUploadHandler from './_handlers/receipts/upload.js';
import documentsPdfHandler from './_handlers/documents/pdf.js';
import documentsQrHandler from './_handlers/documents/qr.js';
import documentsCancelHandler from './_handlers/documents/cancel.js';
import syncPushHandler from './_handlers/sync/push.js';
import syncPullHandler from './_handlers/sync/pull.js';
import syncBulkHandler from './_handlers/sync/bulk.js';
import syncStatusHandler from './_handlers/sync/status.js';
import syncReverseHandler from './_handlers/sync/reverse.js';
import syncConflictsResolveHandler from './_handlers/sync/conflicts/resolve.js';
import syncItemsRetryHandler from './_handlers/sync/items/retry.js';
import aiDepositScanHandler from './_handlers/ai/deposit-scan.js';
import aiDepositDraftHandler from './_handlers/ai/deposit-draft.js';
import cqrsHandler from './_handlers/cqrs.js';

const ROUTE_HANDLERS = {
  'app/version': appVersionHandler,
  'samity/cloud-state': samityCloudStateHandler,
  'health': healthHandler,
  'public/verify': publicVerifyHandler,
  'receipts/pdf': receiptsPdfHandler,
  'receipts/qr': receiptsQrHandler,
  'receipts/qr-png': receiptsQrPngHandler,
  'receipts/qr-svg': receiptsQrSvgHandler,
  'receipts/cancel': receiptsCancelHandler,
  'receipts/upload': receiptsUploadHandler,
  'documents/pdf': documentsPdfHandler,
  'documents/qr': documentsQrHandler,
  'documents/cancel': documentsCancelHandler,
  'sync/push': syncPushHandler,
  'sync/pull': syncPullHandler,
  'sync/bulk': syncBulkHandler,
  'sync/status': syncStatusHandler,
  'sync/reverse': syncReverseHandler,
  'sync/conflicts/resolve': syncConflictsResolveHandler,
  'sync/items/retry': syncItemsRetryHandler,
  'ai/deposit-scan': aiDepositScanHandler,
  'ai/deposit-draft': aiDepositDraftHandler,
  'cqrs': cqrsHandler
};

export default async function gatewayHandler(req, res) {
  // 1. Universal Cross-Origin Resource Sharing (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 2. Resolve target subpath
    let slug = req.query?.slug;
    let subPath = '';

    if (Array.isArray(slug)) {
      subPath = slug.join('/');
    } else if (typeof slug === 'string' && slug.trim() !== '') {
      subPath = slug.trim();
    } else {
      const parsedUrl = new URL(req.url, 'http://localhost');
      subPath = parsedUrl.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
    }

    subPath = subPath.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.js$/, '');

    // 3. Fallback / Health check
    if (!subPath) {
      return res.status(200).json({
        success: true,
        gateway: 'Somiti 360 Universal Serverless API Gateway',
        status: 'online',
        version: '2.5.1',
        endpoints: Object.keys(ROUTE_HANDLERS).length,
        timestamp: new Date().toISOString()
      });
    }

    // 4. Lookup in Static Route Handlers Map
    const handler = ROUTE_HANDLERS[subPath];
    if (typeof handler === 'function') {
      return await handler(req, res);
    }

    // 5. 404 Route Not Found
    return res.status(404).json({
      success: false,
      error: {
        code: 'API_ENDPOINT_NOT_FOUND',
        message: `Endpoint '/api/${subPath}' does not exist in Somiti 360 Gateway.`,
        requestedPath: `/api/${subPath}`
      }
    });
  } catch (err) {
    console.error('[API Gateway Error]:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'GATEWAY_INTERNAL_ERROR',
        message: err.message || 'Internal server error in API gateway.'
      }
    });
  }
}
