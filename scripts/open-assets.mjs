import fs from 'node:fs/promises';
import { argv } from 'node:process';
import { cliCopy, openPath, selectPost } from './cli-utils.mjs';

const args = argv.slice(2);
const printOnly = args.includes('--print');
const query = args.filter((arg) => arg !== '--print').join(' ').trim();

if (!query && !process.stdin.isTTY) {
  console.log(cliCopy.messages.usageOpenAssets);
  process.exit(0);
}

const post = await selectPost(query);

if (post) {
  await fs.mkdir(post.assetPath, { recursive: true });
  console.log(`\n${cliCopy.messages.assetFolder}`);
  console.log(post.assetPath);
  if (!printOnly) openPath(post.assetPath);
}
