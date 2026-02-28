/**
 * ai/track-a/ocr/preprocess.js
 * Image pre-processing pipeline for hospital bill OCR
 * Steps: grayscale → contrast enhance → deskew → denoise → resize
 */

/**
 * Full preprocessing pipeline for a bill image file.
 * Returns a base64-encoded processed image URL ready for Tesseract.
 * @param {File|string} imageInput - File object (browser) or file path (Node)
 * @returns {Promise<HTMLCanvasElement|string>} Processed canvas or base64 string
 */
export async function preprocessBill(imageInput) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Load image into a canvas
  const img = await loadImage(imageInput);

  // Step 1: Resize to 1024px width (OCR sweet spot)
  const scale = 1024 / img.width;
  canvas.width = 1024;
  canvas.height = Math.round(img.height * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Step 2: Convert to grayscale
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  toGrayscale(imageData);
  ctx.putImageData(imageData, 0, 0);

  // Step 3: CLAHE-style adaptive contrast enhancement
  const contrastData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyContrastEnhancement(contrastData);
  ctx.putImageData(contrastData, 0, 0);

  // Step 4: Median blur (remove salt/pepper noise)
  const blurData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyMedianBlur(blurData, canvas.width, canvas.height);
  ctx.putImageData(blurData, 0, 0);

  // Step 5: Deskew (basic horizontal alignment)
  const deskewed = await deskewCanvas(canvas);

  return deskewed;
}

/** Load an image from a File object or URL string */
async function loadImage(input) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (typeof input === 'string') {
      img.src = input;
    } else {
      img.src = URL.createObjectURL(input);
    }
  });
}

/** Convert ImageData to grayscale in-place */
function toGrayscale(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Luminance formula
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = lum;
  }
}

/** Simple adaptive contrast enhancement (CLAHE-approximation via histogram stretch) */
function applyContrastEnhancement(imageData) {
  const data = imageData.data;
  let min = 255, max = 0;

  // Find actual min/max luminance
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }

  const range = max - min || 1;
  const factor = 255 / range;

  for (let i = 0; i < data.length; i += 4) {
    const stretched = Math.min(255, Math.max(0, (data[i] - min) * factor));
    data[i] = data[i + 1] = data[i + 2] = stretched;
  }
}

/** 3x3 median blur to remove salt/pepper noise */
function applyMedianBlur(imageData, width, height) {
  const src = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const neighbors = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          neighbors.push(src[idx]);
        }
      }
      neighbors.sort((a, b) => a - b);
      const median = neighbors[4];
      const idx = (y * width + x) * 4;
      data[idx] = data[idx + 1] = data[idx + 2] = median;
    }
  }
}

/**
 * Basic deskew: copies canvas as-is (browser rotation handles most phone images).
 * A full Hough-transform deskew is possible but out of scope for this demo.
 */
async function deskewCanvas(canvas) {
  // For the hackathon: rely on phone EXIF auto-rotate (handled by browser).
  // Advanced: detect row-wise text angle, rotate canvas.
  return canvas;
}
