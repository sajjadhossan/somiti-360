/**
 * Somiti 360 - Enterprise CQRS Router Endpoint
 * Handles Command (Writes via Neon Pooler) and Query (Reads with In-Memory Caching)
 */

import { dispatchCqrsCommand, dispatchCqrsQuery } from './_lib/cqrsManager.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. QUERY PATH (GET): Read metrics, member directory, etc.
    if (req.method === 'GET') {
      const { type = 'DASHBOARD_METRICS', tenantId = 'tenant_main', search = '', limit = 50, offset = 0 } = req.query || {};
      const result = await dispatchCqrsQuery(type, {
        tenantId,
        search,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      });

      return res.status(200).json({
        success: true,
        mode: 'CQRS_QUERY_READ',
        data: result
      });
    }

    // 2. COMMAND PATH (POST): Write deposit, create member, cancel receipt
    if (req.method === 'POST') {
      const { command, payload = {}, tenantId = 'tenant_main', actorId = 'system' } = req.body || {};

      if (!command) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_COMMAND: Specify command name (e.g. RECORD_DEPOSIT, CREATE_MEMBER, CANCEL_RECEIPT)'
        });
      }

      const result = await dispatchCqrsCommand(command, payload, { tenantId, actorId });

      return res.status(200).json({
        success: true,
        mode: 'CQRS_COMMAND_WRITE',
        result
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
  } catch (err) {
    console.error('[CQRS] Error processing request:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
