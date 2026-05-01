import { argv } from 'node:process';
import { selectPost, cliCopy, openPath } from './cli-utils.mjs';

// Build search query from CLI arguments
const query = argv.slice(2).join(' ').trim();

const post = await selectPost(query);
if (post) {
  // --print: only display the path, don't open the folder
  const printOnly = argv.includes('--print');
  console.log(`\n${cliCopy.messages.assetFolder}`);
  console.log(post.postDir);
  // Open the post directory in the OS file manager
  if (!printOnly) openPath(post.postDir);
}
