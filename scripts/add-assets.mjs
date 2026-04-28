import fs from 'node:fs/promises';
import path from 'node:path';
import { argv } from 'node:process';
import { cliCopy, selectPost } from './cli-utils.mjs';

const args = argv.slice(2);

if (args.length < 2) {
  console.log(cliCopy.messages.usageAddAssets);
  process.exit(0);
}

const query = args[0];
const files = args.slice(1);
const post = await selectPost(query);

if (post) {
  await fs.mkdir(post.assetPath, { recursive: true });
  for (const source of files) {
    const absoluteSource = path.resolve(source);
    const name = path.basename(absoluteSource);
    const target = path.join(post.assetPath, name);
    await fs.copyFile(absoluteSource, target);
    const markdownPath = `${post.assetDir}${encodeURIComponent(name)}`;
    console.log(`\n${cliCopy.messages.copiedAsset}`);
    console.log(target);
    console.log(`${cliCopy.messages.markdownPath} ${markdownPath}`);
  }
}
