import fs from 'node:fs/promises';
import { argv } from 'node:process';
import { buildMarkdown, parseMarkdown, slugFromTitle } from '../src/content-workflow.ts';
import { cliCopy, defaults, listPosts } from './cli-utils.mjs';

const only = argv.slice(2).join(' ').trim().toLowerCase();
const posts = await listPosts();
let changed = 0;

for (const post of posts) {
  const title = String(post.data.title || '');
  const postId = String(post.data.postId || post.postId);
  const currentSlug = String(post.data.slug || '');

  if (only) {
    const haystack = `${post.file} ${title} ${postId} ${currentSlug}`.toLowerCase();
    if (!haystack.includes(only)) continue;
  }

  if (!title) {
    console.log(`${cliCopy.messages.skippedNoTitle} ${post.file}`);
    continue;
  }

  const nextSlug = slugFromTitle(title, postId);
  if (nextSlug === currentSlug) {
    console.log(`${cliCopy.messages.noSlugChange} ${post.file} -> ${nextSlug}`);
    continue;
  }

  const { data, body } = parseMarkdown(post.markdown);
  data.slug = nextSlug;
  data.postId ||= postId;
  data.assetDir ||= post.assetDir;
  await fs.writeFile(post.filePath, buildMarkdown(data, body, defaults), 'utf8');
  changed += 1;
  console.log(`${cliCopy.messages.updatedSlug} ${post.file}`);
  console.log(`  ${currentSlug || '(none)'} -> ${nextSlug}`);
}

if (changed === 0) {
  console.log(cliCopy.messages.noSlugUpdates);
}
