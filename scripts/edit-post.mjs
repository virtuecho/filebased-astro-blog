import { argv } from 'node:process';
import { cliCopy, openPath, selectPost } from './cli-utils.mjs';

const query = argv.slice(2).join(' ').trim();
const post = await selectPost(query);

if (post) {
  console.log(`\n${cliCopy.messages.opening}`);
  console.log(post.filePath);
  console.log(`\n${cliCopy.messages.assetFolder}`);
  console.log(post.assetPath);
  openPath(post.filePath, { editor: true });
}
