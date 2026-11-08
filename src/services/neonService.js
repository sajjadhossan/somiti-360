/**
 * Somiti 360 - Neon Client Service
 * ----------------------------------------------------------------------------
 * Integrates Neon's modern serverless backend primitives into the client app:
 * 1. Neon Managed Auth (@neon/auth) with Better Auth method set
 * 2. Neon Realtime (@neon/realtime/client) with Live SQL subscriptions
 * 3. Neon Object Storage config & helpers for branch asset management
 */

import { createAuthClient } from '@neon/auth';
import { BetterAuthReactAdapter } from '@neon/auth/react/adapters';
import { createRealtimeClient } from '@neon/realtime/client';

const NEON_AUTH_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEON_AUTH_URL) ||
  'https://ep-wispy-unit-aodnt6pk.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth';

const NEON_REALTIME_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEON_REALTIME_URL) ||
  'wss://ep-wispy-unit-aodnt6pk.rt.c-2.ap-southeast-1.aws.neon.tech/';

/**
 * Checks if Neon Auth is enabled
 */
export const isNeonAuthAvailable = () => Boolean(NEON_AUTH_URL);

/**
 * Checks if Neon Realtime is enabled
 */
export const isNeonRealtimeAvailable = () => Boolean(NEON_REALTIME_URL);

/**
 * Neon Managed Better Auth Client singleton
 */
let cachedAuthClient = null;
export const getNeonAuthClient = () => {
  if (!cachedAuthClient && NEON_AUTH_URL) {
    try {
      cachedAuthClient = createAuthClient(NEON_AUTH_URL, {
        adapter: BetterAuthReactAdapter(),
      });
    } catch (err) {
      console.warn('Neon Auth Client initialization warning:', err);
      // Fallback without adapter if react hooks context is not active
      cachedAuthClient = createAuthClient(NEON_AUTH_URL);
    }
  }
  return cachedAuthClient;
};

/**
 * Neon Realtime WebSocket Client singleton
 */
let cachedRealtimeClient = null;
export const getNeonRealtimeClient = () => {
  if (!cachedRealtimeClient && NEON_REALTIME_URL) {
    try {
      cachedRealtimeClient = createRealtimeClient({
        url: NEON_REALTIME_URL,
      });
    } catch (err) {
      console.warn('Neon Realtime Client initialization warning:', err);
    }
  }
  return cachedRealtimeClient;
};

/**
 * Neon Object Storage Configuration for assets
 */
export const getNeonStorageConfig = () => {
  return {
    bucket: 'assets',
    region: 'ap-southeast-1',
    isBranchStorage: true,
  };
};

export const neonService = {
  getAuthClient: getNeonAuthClient,
  getRealtimeClient: getNeonRealtimeClient,
  getStorageConfig: getNeonStorageConfig,
  isAuthAvailable: isNeonAuthAvailable,
  isRealtimeAvailable: isNeonRealtimeAvailable,
};

export default neonService;
