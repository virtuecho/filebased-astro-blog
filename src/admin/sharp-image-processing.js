import path from 'node:path';
import sharp from 'sharp';

// Image formats that sharp can read and re-encode
const PROCESSABLE_IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp']);
// MIME type mapping for output formats
const CONTENT_TYPES = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
};
// Quality setting for WebP output (0–100)
const WEBP_QUALITY = 90;
// Quality setting for JPEG output (0–100)
const JPEG_QUALITY = 92;

// Create a tagged error for non-processable images (multi-page, unsupported format, etc.)
function unsupportedImageError(message = 'Unsupported image for sharp processing.') {
  const error = new Error(message);
  error.code = 'UNSUPPORTED_IMAGE_PROCESSING';
  return error;
}

// Determine the output filename — swaps extension to .webp when converting
function outputNameFor(filename, convertToWebp) {
  const parsed = path.parse(filename);
  return convertToWebp ? `${parsed.name}.webp` : parsed.base;
}

// Map source format to target format, optionally overriding to webp
function targetFormatFor(sourceFormat, convertToWebp) {
  return convertToWebp ? 'webp' : sourceFormat;
}

// Apply format-specific encoding options to the sharp pipeline
function applyOutputFormat(pipeline, format) {
  switch (format) {
    case 'jpeg':
      return pipeline.jpeg({ quality: JPEG_QUALITY });
    case 'png':
      return pipeline.png();
    case 'webp':
      return pipeline.webp({ quality: WEBP_QUALITY });
    default:
      throw unsupportedImageError(`Unsupported output format: ${format}`);
  }
}

// Read image metadata (format, dimensions, etc.) from a buffer or file path
export async function readImageMetadata(input) {
  try {
    return await sharp(input).metadata();
  } catch {
    return null;
  }
}

// Returns true if the image can be safely processed (static, single-page, known format)
export function isProcessableImageMetadata(metadata) {
  if (!metadata) return false;
  const format = String(metadata.format || '').toLowerCase();
  // Multi-page images (animated GIFs, etc.) are not processable
  const pages = Number(metadata.pages || 1);
  return PROCESSABLE_IMAGE_FORMATS.has(format) && pages <= 1;
}

// Process an image buffer/path: auto-orient, optionally convert to WebP, return buffer + metadata
export async function processImageInput(input, filename, options = {}) {
  const metadata = await readImageMetadata(input);
  if (!isProcessableImageMetadata(metadata)) {
    throw unsupportedImageError();
  }

  const sourceFormat = String(metadata.format || '').toLowerCase();
  const outputFormat = targetFormatFor(sourceFormat, Boolean(options.convertToWebp));
  const outputName = outputNameFor(filename, Boolean(options.convertToWebp));

  // Auto-orient corrects EXIF rotation so images display upright
  let pipeline = sharp(input).autoOrient();
  pipeline = applyOutputFormat(pipeline, outputFormat);

  return {
    data: await pipeline.toBuffer(),
    outputFormat,
    outputName,
    contentType: CONTENT_TYPES[outputFormat] || 'application/octet-stream'
  };
}
