import fs from 'node:fs/promises';
import { argv } from 'node:process';
import { buildMarkdown, parseMarkdown, slugFromTitle } from '../src/content-workflow.ts';
import { cliCopy, defaults, listPosts } from './cli-utils.mjs';

// Optional filter: only update posts matching this query
const only = argv.slice(2).join(' ').trim().toLowerCase();
// Load all posts
const posts = await listPosts();
// Count of slugs that were actually changed
let changed = 0;

for (const post of posts) {
  const title = String(post.data.title || '');
  const postId = String(post.data.postId || post.postId);
  const currentSlug = String(post.data.slug || '');

  // Skip if a filter is set and this post doesn't match
  if (only) {
    const haystack = `${post.file} ${title} ${postId} ${currentSlug}`.toLowerCase();
    if (!haystack.includes(only)) continue;
  }

  // Posts without a title can't generate a meaningful slug
  if (!title) {
    console.log(`${cliCopy.messages.skippedNoTitle} ${post.file}`);
    continue;
  }

  // Generate the canonical slug from the title
  const nextSlug = slugFromTitle(title, postId);
  // Skip if slug hasn't changed
  if (nextSlug === currentSlug) {
    console.log(`${cliCopy.messages.noSlugChange} ${post.file} -> ${nextSlug}`);
    continue;
  }

  // Re-parse and rewrite the markdown with the updated slug
  const { data, body } = parseMarkdown(post.markdown);
  data.slug = nextSlug;
  // Preserve postId and assetDir if they exist in frontmatter
  data.postId ||= postId;
  data.assetDir ||= post.postDir;
  await fs.writeFile(post.filePath, buildMarkdown(data, body, defaults), 'utf8');
  changed += 1;
  console.log(`${cliCopy.messages.updatedSlug} ${post.file}`);
  console.log(`  ${currentSlug || '(none)'} -> ${nextSlug}`);
}

if (changed === 0) {
  console.log(cliCopy.messages.noSlugUpdates);
}
