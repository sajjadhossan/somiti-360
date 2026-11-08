/**
 * Somiti 360 - Client CQRS Service
 * ----------------------------------------------------------------------------
 * Clean, separated client API for transactional Writes (Commands) & Reads (Queries)
 */

import { executeDepositCommand, executeMemberCreateCommand, executeDashboardMetricsQuery, executeMemberDirectoryQuery } from '../../api/_lib/cqrsManager.js';

/**
 * Dispatches a Write Command (e.g. RECORD_DEPOSIT, CREATE_MEMBER)
 */
export async function sendCommand(command, payload, options = {}) {
  try {
    if (typeof window !== 'undefined' && window.location.origin) {
      const res = await fetch('/api/cqrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, payload, ...options })
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (e) {
    console.debug('[CQRS Client] API fetch fallback to direct manager');
  }

  // Direct client/electron fallback
  if (command === 'RECORD_DEPOSIT') {
    return await executeDepositCommand({ deposit: payload, ...options });
  }
  if (command === 'CREATE_MEMBER') {
    return await executeMemberCreateCommand({ member: payload, ...options });
  }
  throw new Error(`Unsupported offline command: ${command}`);
}

/**
 * Executes a Read Query (e.g. DASHBOARD_METRICS, MEMBER_DIRECTORY)
 */
export async function sendQuery(type, params = {}) {
  try {
    if (typeof window !== 'undefined' && window.location.origin) {
      const qs = new URLSearchParams({ type, ...params }).toString();
      const res = await fetch(`/api/cqrs?${qs}`);
      if (res.ok) {
        const body = await res.json();
        return body.data;
      }
    }
  } catch (e) {
    console.debug('[CQRS Client] Query fetch fallback to direct manager');
  }

  // Direct client/electron fallback
  if (type === 'DASHBOARD_METRICS') {
    return await executeDashboardMetricsQuery(params);
  }
  if (type === 'MEMBER_DIRECTORY') {
    return await executeMemberDirectoryQuery(params);
  }
  throw new Error(`Unsupported offline query: ${type}`);
}

export const cqrsService = {
  sendCommand,
  sendQuery
};

export default cqrsService;
