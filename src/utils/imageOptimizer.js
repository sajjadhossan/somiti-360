/**
 * Smart Client-Side Image Optimizer for Somiti 360
 * Compresses large mobile camera photos, bank deposit slips, receipts and documents
 * into lightweight WebP/JPEG data URLs (typically reducing 5-10MB down to 80-180KB).
 */

export const optimizeImage = (fileOrDataUrl, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      mimeType = 'image/jpeg'
    } = options;

    if (!fileOrDataUrl) {
      resolve('');
      return;
    }

    const processImageSource = (src) => {
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
          resolve(src);
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

        try {
          const optimizedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(optimizedDataUrl);
        } catch {
          resolve(src);
        }
      };

      img.onerror = () => {
        // Fallback to original source if image load fails
        resolve(src);
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
      resolve('');
    }
  });
};
