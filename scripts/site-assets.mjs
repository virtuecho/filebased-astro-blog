import fs from 'node:fs/promises';
import path from 'node:path';
import { argv } from 'node:process';
import { copy } from '../src/site.config.ts';
import {
  isProcessableImageMetadata,
  processImageInput,
  readImageMetadata
} from '../src/admin/sharp-image-processing.js';

const cliCopy = copy.cli;
const root = process.cwd();
const siteAssetsDir = path.join(root, 'public/images/site');

function usage() {
  console.log('Usage: npm run site-assets -- <file...> [--webp] [--strip-metadata]');
  process.exit(0);
}

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

function outputName(sourcePath, convertToWebp) {
  const parsed = path.parse(sourcePath);
  return convertToWebp ? `${parsed.name}.webp` : parsed.base;
}

async function processFile(source, options, seenTargets) {
  const absoluteSource = path.resolve(source);
  const metadata = await readImageMetadata(absoluteSource);
  const shouldProcess = (options.convertToWebp || options.stripMetadata) && isProcessableImageMetadata(metadata);
  const targetName = outputName(absoluteSource, shouldProcess && options.convertToWebp);
  const normalized = targetName.toLowerCase();

  if (seenTargets.has(normalized)) {
    throw new Error(`Conflicting output filename after processing: ${targetName}`);
  }
  seenTargets.add(normalized);

  const target = path.join(siteAssetsDir, targetName);
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
  const { files, options } = parseArgs(argv.slice(2));

  if (files.length === 0) {
    usage();
  }

  await fs.mkdir(siteAssetsDir, { recursive: true });
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
    console.log(`Site path: /images/site/${encodeURIComponent(result.targetName)}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
