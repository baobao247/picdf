/**
 * PicDF - Image Processing Module
 * Handles canvas rotation, scaling, and color filters (original/grayscale/contrast)
 */
const ImageProcessor = (function() {
  async function processImage(item, quality = 0.85, filterType = 'original') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const rot = (item.rotation || 0) % 360;

        if (rot === 90 || rot === 270) {
          canvas.width = img.naturalHeight;
          canvas.height = img.naturalWidth;
        } else {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        // Apply Image Processing Filter
        if (filterType === 'grayscale' || filterType === 'scan') {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          for (let p = 0; p < d.length; p += 4) {
            let gray = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
            if (filterType === 'scan') {
              // High contrast scan thresholding
              gray = gray > 140 ? 255 : (gray < 80 ? 0 : (gray - 80) * (255 / 60));
            }
            d[p] = gray;
            d[p + 1] = gray;
            d[p + 2] = gray;
          }
          ctx.putImageData(imgData, 0, 0);
        }

        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', quality),
          width: canvas.width,
          height: canvas.height
        });
      };
      img.onerror = reject;
      img.src = item.src;
    });
  }

  return {
    processImage
  };
})();

if (typeof window !== 'undefined') window.ImageProcessor = ImageProcessor;
