import fs from 'node:fs/promises';
import path from 'node:path';
import { argv } from 'node:process';
import { cliCopy, root, selectPost } from './cli-utils.mjs';

function parseArgs(rawArgs) {
  const site = rawArgs.includes('--site');
  const args = rawArgs.filter((arg) => arg !== '--site');
  const unknownOption = args.find((arg) => arg.startsWith('--'));
  if (unknownOption) {
    throw new Error(
      `${cliCopy.messages.usageAddAssets}\nUnknown option: ${unknownOption}`,
    );
  }

  const query = site ? '' : (args.shift() ?? '');
  return { site, query, files: args };
}

try {
  const { site, query, files } = parseArgs(argv.slice(2));

  if (files.length === 0 || (!site && !query)) {
    console.log(cliCopy.messages.usageAddAssets);
    process.exit(0);
  }

  const post = site ? null : await selectPost(query);
  if (!site && !post) process.exit(0);

  const targetDir = site ? path.join(root, 'public/images/site') : post.postDir;
  await fs.mkdir(targetDir, { recursive: true });
  const seenTargets = new Set();

  for (const source of files) {
    const absoluteSource = path.resolve(source);
    const targetName = path.basename(absoluteSource);
    if (seenTargets.has(targetName.toLowerCase())) {
      throw new Error(`Conflicting output filename: ${targetName}`);
    }
    seenTargets.add(targetName.toLowerCase());

    const target = path.join(targetDir, targetName);
    await fs.copyFile(absoluteSource, target);
    console.log(`\n${cliCopy.messages.copiedAsset}`);
    console.log(target);

    if (site) {
      console.log(`Site path: /images/site/${encodeURIComponent(targetName)}`);
    } else {
      const markdownRef = `![${targetName}](./${encodeURIComponent(targetName)})`;
      console.log(`${cliCopy.messages.markdownPath} ${markdownRef}`);
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
