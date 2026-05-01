import fs from 'node:fs/promises';
import path from 'node:path';
import { argv } from 'node:process';
import { cliCopy, selectPost } from './cli-utils.mjs';
import {
  isProcessableImageMetadata,
  processImageInput,
  readImageMetadata
} from '../src/admin/sharp-image-processing.js';

const args = argv.slice(2);

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
    if (!query) {
      query = arg;
      continue;
    }
    files.push(arg);
  }

  return { query, files, options };
}

function processedOutputName(sourcePath, convertToWebp) {
  const parsed = path.parse(sourcePath);
  return convertToWebp ? `${parsed.name}.webp` : parsed.base;
}

async function inspectImage(sourcePath) {
  return readImageMetadata(sourcePath);
}

async function copyOrProcessAsset(post, source, options, seenTargets) {
  const absoluteSource = path.resolve(source);
  const metadata = await inspectImage(absoluteSource);
  const shouldProcess = (options.convertToWebp || options.stripMetadata) && isProcessableImageMetadata(metadata);
  const targetName = processedOutputName(absoluteSource, shouldProcess && options.convertToWebp);
  const normalizedTarget = targetName.toLowerCase();

  if (seenTargets.has(normalizedTarget)) {
    throw new Error(`Conflicting output filename after processing: ${targetName}`);
  }
  seenTargets.add(normalizedTarget);

  const target = path.join(post.postDir, targetName);
  if (shouldProcess) {
    const sourceBuffer = await fs.readFile(absoluteSource);
    const result = await processImageInput(sourceBuffer, absoluteSource, options);
    await fs.writeFile(target, result.data);
  } else {
    await fs.copyFile(absoluteSource, target);
  }

  return {
    target,
    targetName,
    processed: shouldProcess,
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

  await fs.mkdir(post.postDir, { recursive: true });
  const seenTargets = new Set();

  for (const source of files) {
    const result = await copyOrProcessAsset(post, source, options, seenTargets);
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
