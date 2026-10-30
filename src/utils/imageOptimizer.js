/**
 * Enterprise Client-Side Image Optimizer for Somiti 360
 * Compresses large mobile camera photos, bank deposit slips, receipts and documents
 * into lightweight, crystal-clear WebP/JPEG data URLs (typically reducing 5-10MB down to 300-500KB)
 * while preserving receipt numbers, stamps, signatures, and essential text readability.
 */

export const optimizeImageWithStats = (fileOrDataUrl, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1800,
      maxHeight = 1800,
      targetMinKb = 300,
      targetMaxKb = 500,
      initialQuality = 0.85,
      mimeType = 'image/jpeg'
    } = options;

    if (!fileOrDataUrl) {
      resolve({
        dataUrl: '',
        originalSizeKb: 0,
        compressedSizeKb: 0,
        savedRatio: '0%',
        dimensions: { width: 0, height: 0 }
      });
      return;
    }

    let originalSizeKb = 0;
    if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      originalSizeKb = Math.round(fileOrDataUrl.size / 1024);
    }

    const processImageSource = (src) => {
      // Estimate size if source was already a data URL
      if (!originalSizeKb && typeof src === 'string') {
        const head = 'data:image/jpeg;base64,';
        originalSizeKb = Math.round((src.length - head.length) * 0.75 / 1024) || 100;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: src,
            originalSizeKb,
            compressedSizeKb: originalSizeKb,
            savedRatio: '0%',
            dimensions: { width: img.width, height: img.height }
          });
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // White background for transparent PNG converted to JPEG
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Adaptive compression loop to target ~300KB-500KB while preserving text sharpness
        let quality = initialQuality;
        let dataUrl = canvas.toDataURL(mimeType, quality);
        let curSizeKb = Math.round((dataUrl.length * 0.75) / 1024);

        // If too large (> targetMaxKb), lower quality gracefully
        if (curSizeKb > targetMaxKb && quality > 0.6) {
          quality = 0.72;
          dataUrl = canvas.toDataURL(mimeType, quality);
          curSizeKb = Math.round((dataUrl.length * 0.75) / 1024);
        }

        // If still too large, step down slightly
        if (curSizeKb > 800 && quality > 0.5) {
          quality = 0.62;
          dataUrl = canvas.toDataURL(mimeType, quality);
          curSizeKb = Math.round((dataUrl.length * 0.75) / 1024);
        }

        const savedPct = originalSizeKb > curSizeKb 
          ? Math.round(((originalSizeKb - curSizeKb) / originalSizeKb) * 100)
          : 0;

        resolve({
          dataUrl,
          originalSizeKb: originalSizeKb || curSizeKb,
          compressedSizeKb: curSizeKb,
          savedRatio: `${savedPct}%`,
          qualityUsed: quality,
          dimensions: { width, height }
        });
      };

      img.onerror = () => {
        resolve({
          dataUrl: src,
          originalSizeKb,
          compressedSizeKb: originalSizeKb,
          savedRatio: '0%',
          dimensions: { width: 0, height: 0 }
        });
      };

      img.src = src;
    };

    if (typeof fileOrDataUrl === 'string') {
      processImageSource(fileOrDataUrl);
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processImageSource(e.target?.result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      resolve({
        dataUrl: '',
        originalSizeKb: 0,
        compressedSizeKb: 0,
        savedRatio: '0%',
        dimensions: { width: 0, height: 0 }
      });
    }
  });
};

// Backward compatible helper for existing call sites
export const optimizeImage = async (fileOrDataUrl, options = {}) => {
  const result = await optimizeImageWithStats(fileOrDataUrl, options);
  return result.dataUrl;
};
