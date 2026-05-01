import fs from 'node:fs/promises';
import path from 'node:path';
import { argv } from 'node:process';
import { cliCopy, selectPost } from './cli-utils.mjs';
import {
  isProcessableImageMetadata,
  processImageInput,
  readImageMetadata
} from '../src/admin/sharp-image-processing.js';

// Raw CLI arguments (excluding node and script path)
const args = argv.slice(2);

// Parse CLI arguments: first non-flag arg is the post query, remaining are file paths
function parseAddAssetsArgs(rawArgs) {
  const options = {
    convertToWebp: false,
    stripMetadata: false
  };
  let query = '';
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
      throw new Error(`${cliCopy.messages.usageAddAssets}\nUnknown option: ${arg}`);
    }
    // First non-flag arg is the post query; everything after are file paths
    if (!query) {
      query = arg;
      continue;
    }
    files.push(arg);
  }

  return { query, files, options };
}

// Determine the output filename, optionally changing the extension to .webp
function processedOutputName(sourcePath, convertToWebp) {
  const parsed = path.parse(sourcePath);
  return convertToWebp ? `${parsed.name}.webp` : parsed.base;
}

// Read image metadata (dimensions, format, etc.) via sharp
async function inspectImage(sourcePath) {
  return readImageMetadata(sourcePath);
}

// Copy or process an asset into the post's directory (WebP conversion, metadata stripping)
async function copyOrProcessAsset(post, source, options, seenTargets) {
  const absoluteSource = path.resolve(source);
  const metadata = await inspectImage(absoluteSource);
  // Only process if flags are set AND the image format is supported by sharp
  const shouldProcess = (options.convertToWebp || options.stripMetadata) && isProcessableImageMetadata(metadata);
  const targetName = processedOutputName(absoluteSource, shouldProcess && options.convertToWebp);
  const normalizedTarget = targetName.toLowerCase();

  // Detect filename collisions after processing (case-insensitive)
  if (seenTargets.has(normalizedTarget)) {
    throw new Error(`Conflicting output filename after processing: ${targetName}`);
  }
  seenTargets.add(normalizedTarget);

  const target = path.join(post.postDir, targetName);
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
  const { query, files, options } = parseAddAssetsArgs(args);

  if (!query || files.length === 0) {
    console.log(cliCopy.messages.usageAddAssets);
    process.exit(0);
  }

  const post = await selectPost(query);
  if (!post) process.exit(0);

  // Ensure the post directory exists
  await fs.mkdir(post.postDir, { recursive: true });
  // Track output filenames to detect conflicts (case-insensitive)
  const seenTargets = new Set();

  for (const source of files) {
    const result = await copyOrProcessAsset(post, source, options, seenTargets);
    // Generate the markdown image reference for easy pasting into the post
    const markdownRef = `![${result.targetName}](./${encodeURIComponent(result.targetName)})`;
    const label = result.processed
      ? cliCopy.messages.processedAsset
      : result.skipped
        ? cliCopy.messages.copiedAssetUnchanged
        : cliCopy.messages.copiedAsset;
    console.log(`\n${label}`);
    console.log(result.target);
    console.log(`${cliCopy.messages.markdownPath} ${markdownRef}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
