import fs from 'node:fs/promises';
import path from 'node:path';
import { argv } from 'node:process';
import { copy } from '../src/site.config.ts';
import {
  isProcessableImageMetadata,
  processImageInput,
  readImageMetadata
} from '../src/admin/sharp-image-processing.js';

// CLI-specific localized copy strings
const cliCopy = copy.cli;
// Project root directory
const root = process.cwd();
// Directory for global site assets (served at /images/site/)
const siteAssetsDir = path.join(root, 'public/images/site');

// Print usage help and exit
function usage() {
  console.log('Usage: npm run site-assets -- <file...> [--webp] [--strip-metadata]');
  process.exit(0);
}

// Parse CLI arguments: any non-flag arg is a file path
function parseArgs(rawArgs) {
  const options = {
    convertToWebp: false,
    stripMetadata: false
  };
  const files = [];

  for (const arg of rawArgs) {
    if (arg === '--webp') {
      options.convertToWebp = true;
      continue;
    }
    if (arg === '--strip-metadata') {
      options.stripMetadata = true;
      continue;
    }
    if (arg.startsWith('--')) {
      console.error(`Unknown option: ${arg}`);
      usage();
    }
    files.push(arg);
  }

  return { files, options };
}

// Determine the output filename, optionally changing the extension to .webp
function outputName(sourcePath, convertToWebp) {
  const parsed = path.parse(sourcePath);
  return convertToWebp ? `${parsed.name}.webp` : parsed.base;
}

// Copy or process an image file into the site assets directory
async function processFile(source, options, seenTargets) {
  const absoluteSource = path.resolve(source);
  const metadata = await readImageMetadata(absoluteSource);
  // Only process if flags are set AND the image format is supported by sharp
  const shouldProcess = (options.convertToWebp || options.stripMetadata) && isProcessableImageMetadata(metadata);
  const targetName = outputName(absoluteSource, shouldProcess && options.convertToWebp);
  const normalized = targetName.toLowerCase();

  // Detect filename collisions after processing (case-insensitive)
  if (seenTargets.has(normalized)) {
    throw new Error(`Conflicting output filename after processing: ${targetName}`);
  }
  seenTargets.add(normalized);

  const target = path.join(siteAssetsDir, targetName);
  if (shouldProcess) {
    // Read into buffer and process with sharp
    const sourceBuffer = await fs.readFile(absoluteSource);
    const result = await processImageInput(sourceBuffer, absoluteSource, options);
    await fs.writeFile(target, result.data);
  } else {
    // Straight copy for non-image files or when no processing flags are set
    await fs.copyFile(absoluteSource, target);
  }

  return {
    target,
    targetName,
    processed: shouldProcess,
    // Skipped = flags were set but file type is not processable
    skipped: (options.convertToWebp || options.stripMetadata) && !shouldProcess
  };
}

try {
  const { files, options } = parseArgs(argv.slice(2));

  if (files.length === 0) {
    usage();
  }

  // Ensure the site assets directory exists
  await fs.mkdir(siteAssetsDir, { recursive: true });
  // Track output filenames to detect conflicts (case-insensitive)
  const seenTargets = new Set();

  for (const source of files) {
    const result = await processFile(source, options, seenTargets);
    const label = result.processed
      ? cliCopy.messages.processedAsset
      : result.skipped
        ? cliCopy.messages.copiedAssetUnchanged
        : cliCopy.messages.copiedAsset;
    console.log(`\n${label}`);
    console.log(result.target);
    // Show the public URL path for the copied/processed file
    console.log(`Site path: /images/site/${encodeURIComponent(result.targetName)}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
