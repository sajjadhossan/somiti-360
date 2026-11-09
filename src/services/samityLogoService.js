/**
 * Somiti 360 - Unified Enterprise Samity Logo & Brand Identity Service
 * Commercial-grade persistent logo management across Web, Android APK, Windows & macOS.
 * Zero-demo: Synchronizes in real time across Header, Samity Setup, Letterhead, Receipts and Cloud DB.
 */

import { getTenantsList, saveTenantsList, getActiveWorkspaceId, getTenantById } from './tenantManagerService';
import { loadSamityData, saveSamityData } from './samityService';

const GLOBAL_LOGO_STORAGE_KEY = 'somiti360_active_samity_logo';
export const DEFAULT_FALLBACK_LOGO = '/somiti-emblem.png';

/**
 * Standard client-side image optimizer for crisp, lightweight base64 storage
 */
export const compressImageFile = (file, { maxWidth = 512, maxHeight = 512, quality = 0.9 } = {}) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Retrieve the active effective logo for the current workspace/tenant
 * Checks:
 * 1. Active Tenant's custom logo
 * 2. Active Samity profile custom logo
 * 3. Global persistent localStorage cache
 * 4. Fallback to official emblem
 */
export const getEffectiveSamityLogo = (tenantId = null) => {
  try {
    const activeId = tenantId || getActiveWorkspaceId();
    const tenant = getTenantById(activeId);

    // 1. If tenant has custom logo
    if (tenant?.logo && typeof tenant.logo === 'string' && tenant.logo.trim() !== '') {
      return tenant.logo;
    }

    // 2. If active samity profile has custom logo
    const samityData = loadSamityData();
    if (samityData?.samities && Array.isArray(samityData.samities)) {
      const activeSamity = samityData.samities.find(s => s.id === samityData.activeSamityId) || samityData.samities[0];
      if (activeSamity?.logo && typeof activeSamity.logo === 'string' && activeSamity.logo.trim() !== '') {
        return activeSamity.logo;
      }
    }

    // 3. Check local storage cache
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(`${GLOBAL_LOGO_STORAGE_KEY}_${activeId}`) || localStorage.getItem(GLOBAL_LOGO_STORAGE_KEY);
      if (cached && typeof cached === 'string' && cached.trim() !== '') {
        return cached;
      }
    }
  } catch (err) {
    console.warn('[samityLogoService] Error reading effective logo:', err);
  }

  return DEFAULT_FALLBACK_LOGO;
};

/**
 * Universally sets and propagates the Samity Logo across all layers:
 * 1. Tenant Registry (`tenantManagerService`)
 * 2. Samity Profile (`samityService`)
 * 3. Local persistent storage
 * 4. Global window custom event (`somiti_logo_updated`)
 * 5. Neon Postgres Cloud Database
 */
export const setGlobalSamityLogo = async (logoDataUrl, targetTenantId = null) => {
  const activeTenantId = targetTenantId || getActiveWorkspaceId();
  
  if (!logoDataUrl) {
    console.warn('[samityLogoService] Logo data URL is empty');
    return false;
  }

  try {
    // 1. Persist to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(GLOBAL_LOGO_STORAGE_KEY, logoDataUrl);
      localStorage.setItem(`${GLOBAL_LOGO_STORAGE_KEY}_${activeTenantId}`, logoDataUrl);
    }

    // 2. Update Tenant record
    const tenants = getTenantsList();
    const updatedTenants = tenants.map(t => {
      if (t.id === activeTenantId) {
        return {
          ...t,
          logo: logoDataUrl,
          settings: {
            ...(t.settings || {}),
            logo: logoDataUrl
          },
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    saveTenantsList(updatedTenants);

    // 3. Update Samity Profile data
    const samityData = loadSamityData();
    if (samityData?.samities && Array.isArray(samityData.samities)) {
      const activeSamityId = samityData.activeSamityId || samityData.samities[0]?.id;
      const updatedSamities = samityData.samities.map(s => {
        if (s.id === activeSamityId) {
          return {
            ...s,
            logo: logoDataUrl,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });
      saveSamityData({
        ...samityData,
        samities: updatedSamities
      });
    }

    // 4. Dispatch instant DOM event so Header, Drawer, Letterhead update without page refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('somiti_logo_updated', {
        detail: {
          logo: logoDataUrl,
          tenantId: activeTenantId,
          timestamp: Date.now()
        }
      }));
    }

    // 5. Asynchronously persist to Neon Postgres Cloud Database via CQRS endpoint
    try {
      if (typeof fetch !== 'undefined') {
        fetch('/api/cqrs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPDATE_TENANT_LOGO',
            tenantId: activeTenantId,
            sql: `UPDATE public.samity_tenants SET logo_url = $1, updated_at = now() WHERE id = $2`,
            params: [logoDataUrl, activeTenantId]
          })
        }).catch(() => {});
      }
    } catch (neonErr) {
      console.warn('[samityLogoService] Neon cloud sync warning (cached locally):', neonErr?.message);
    }

    return true;
  } catch (err) {
    console.error('[samityLogoService] Failed to set global logo:', err);
    return false;
  }
};
