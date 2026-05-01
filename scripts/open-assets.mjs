import { argv } from 'node:process';
import { selectPost, cliCopy, openPath } from './cli-utils.mjs';

const query = argv.slice(2).join(' ').trim();

const post = await selectPost(query);
if (post) {
  const printOnly = argv.includes('--print');
  console.log(`\n${cliCopy.messages.assetFolder}`);
  console.log(post.postDir);
  if (!printOnly) openPath(post.postDir);
}
