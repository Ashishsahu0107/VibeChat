/**
 * Fast client-side image compression using HTML5 Canvas & Blob.
 * Drastically speeds up uploads by shrinking multi-megabyte photos to ~250-400KB
 * without perceptible quality loss on screens.
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.82) {
  // Only compress images (skip GIFs to preserve animation, skip non-images)
  if (!file || !file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  // If already under 400KB, upload as-is
  if (file.size <= 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          return resolve(file); // fallback to original
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP for modern browsers, fallback to JPEG
        const outputType = "image/webp";
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compression didn't reduce size, keep original
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          quality,
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}

