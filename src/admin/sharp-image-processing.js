import path from 'node:path';
import sharp from 'sharp';

const PROCESSABLE_IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp']);
const CONTENT_TYPES = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
};
const WEBP_QUALITY = 90;
const JPEG_QUALITY = 92;

function unsupportedImageError(message = 'Unsupported image for sharp processing.') {
  const error = new Error(message);
  error.code = 'UNSUPPORTED_IMAGE_PROCESSING';
  return error;
}

function outputNameFor(filename, convertToWebp) {
  const parsed = path.parse(filename);
  return convertToWebp ? `${parsed.name}.webp` : parsed.base;
}

function targetFormatFor(sourceFormat, convertToWebp) {
  return convertToWebp ? 'webp' : sourceFormat;
}

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

export async function readImageMetadata(input) {
  try {
    return await sharp(input).metadata();
  } catch {
    return null;
  }
}

export function isProcessableImageMetadata(metadata) {
  if (!metadata) return false;
  const format = String(metadata.format || '').toLowerCase();
  const pages = Number(metadata.pages || 1);
  return PROCESSABLE_IMAGE_FORMATS.has(format) && pages <= 1;
}

export async function processImageInput(input, filename, options = {}) {
  const metadata = await readImageMetadata(input);
  if (!isProcessableImageMetadata(metadata)) {
    throw unsupportedImageError();
  }

  const sourceFormat = String(metadata.format || '').toLowerCase();
  const outputFormat = targetFormatFor(sourceFormat, Boolean(options.convertToWebp));
  const outputName = outputNameFor(filename, Boolean(options.convertToWebp));

  let pipeline = sharp(input).autoOrient();
  pipeline = applyOutputFormat(pipeline, outputFormat);

  return {
    data: await pipeline.toBuffer(),
    outputFormat,
    outputName,
    contentType: CONTENT_TYPES[outputFormat] || 'application/octet-stream'
  };
}
