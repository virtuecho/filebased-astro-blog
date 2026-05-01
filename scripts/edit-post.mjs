import { argv } from 'node:process';
import { cliCopy, openPath, selectPost } from './cli-utils.mjs';

// Build search query from CLI arguments
const query = argv.slice(2).join(' ').trim();
// Select a post interactively (or by query)
const post = await selectPost(query);

if (post) {
  console.log(`\n${cliCopy.messages.opening}`);
  console.log(post.filePath);
  console.log(`\n${cliCopy.messages.assetFolder}`);
  console.log(post.postDir);
  // Open the post file in the user's configured $EDITOR
  openPath(post.filePath, { editor: true });
}
