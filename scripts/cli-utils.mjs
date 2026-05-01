import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { spawn } from 'node:child_process';
import { env, platform, stdin as input, stdout as output } from 'node:process';
import { copy } from '../src/site.config.ts';
import { parseMarkdown } from '../src/content-workflow.ts';

// Project root directory
export const root = process.cwd();
// Directory where all post content lives (one subdirectory per post)
export const postsDir = path.join(root, 'src/content/posts');
// CLI-specific localized copy strings
export const cliCopy = copy.cli;
// Default content values (author, category, etc.)
export const defaults = copy.contentDefaults;

// Check whether a file or directory exists at the given path
export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Read all posts from the content directory, sorted by date descending
export async function listPosts() {
  const entries = await fs.readdir(postsDir, { withFileTypes: true }).catch(() => []);
  const posts = [];

  for (const entry of entries) {
    // Only process directories (each post is a directory)
    if (!entry.isDirectory()) continue;
    // Skip hidden/draft directories prefixed with _
    if (entry.name.startsWith('_')) continue;

    const indexPath = path.join(postsDir, entry.name, 'index.md');
    try {
      const markdown = await fs.readFile(indexPath, 'utf8');
      // Parse frontmatter + body from the markdown file
      const { data, body } = parseMarkdown(markdown);
      const postId = String(data.postId || entry.name);
      posts.push({
        file: `${entry.name}/index.md`,   // relative path for display
        filePath: indexPath,              // absolute path on disk
        markdown,
        body,
        data,
        title: String(data.title || defaults.unnamedPost),
        postId,
        slug: String(data.slug || ''),
        postDir: path.join(postsDir, entry.name)  // post's directory (for assets)
      });
    } catch {
      // skip directories without valid index.md
    }
  }

  // Sort by date descending; fall back to alphabetical by title
  return posts.sort((a, b) => {
    const ad = new Date(a.data.date || 0).getTime();
    const bd = new Date(b.data.date || 0).getTime();
    return bd - ad || a.title.localeCompare(b.title);
  });
}

// Filter a post list by a query string (matches title, slug, postId, or file path)
// Numeric queries match by index in the list (1-based)
export function findMatches(posts, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return posts;

  // If the query is a number, select by 1-based list index
  const number = Number(normalized);
  if (Number.isInteger(number) && number >= 1 && number <= posts.length) {
    return [posts[number - 1]];
  }

  // Fuzzy match against file path, title, postId, and slug
  return posts.filter((post) => {
    const haystack = `${post.file} ${post.title} ${post.postId} ${post.slug}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

// Print a numbered list of posts to the console
export function printPostList(posts) {
  console.log(`${cliCopy.messages.editablePosts}\n`);
  posts.forEach((post, index) => {
    const url = post.slug ? `  /posts/${post.slug}/` : '';
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   ${post.file}${url}`);
  });
}

// Interactive post picker: list posts, prompt for selection, return the match
export async function selectPost(queryFromArg = '') {
  const posts = await listPosts();

  if (posts.length === 0) {
    console.log(cliCopy.messages.noPosts);
    console.log('npm run new-post');
    return null;
  }

  printPostList(posts);
  let query = queryFromArg.trim();

  // No query provided: prompt interactively if TTY, otherwise show usage
  if (!query) {
    if (!input.isTTY) {
      console.log(`\n${cliCopy.messages.usageEdit}`);
      console.log('npm run edit-post -- 1');
      console.log('npm run edit-post -- welcome');
      return null;
    }

    const rl = readline.createInterface({ input, output });
    query = await rl.question(`\n${cliCopy.prompts.selectPost}`);
    rl.close();
  }

  const matches = findMatches(posts, query);

  if (matches.length === 0) {
    console.log(`\n${cliCopy.messages.notFound}`);
    return null;
  }

  // Multiple matches: show list and exit (no ambiguous selection)
  if (matches.length > 1) {
    console.log(`\n${cliCopy.messages.tooMany}`);
    matches.forEach((post) => {
      console.log(`- ${post.title} (${post.file})`);
    });
    return null;
  }

  return matches[0];
}

// Open a file or directory using the OS default handler or the configured $EDITOR
export function openPath(targetPath, { editor = false } = {}) {
  // Use $VISUAL or $EDITOR when opening for editing
  const customEditor = editor ? env.VISUAL || env.EDITOR : '';
  let command;
  let args;
  let shell = false;

  if (customEditor) {
    command = customEditor;
    args = [targetPath];
    shell = true;
  } else if (platform === 'darwin') {
    command = 'open';
    args = [targetPath];
  } else if (platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', targetPath];
  } else {
    command = 'xdg-open';
    args = [targetPath];
  }

  const child = spawn(command, args, { stdio: 'inherit', shell });
  child.on('error', () => {
    console.log(`\n${cliCopy.messages.openFailed}`);
    console.log(targetPath);
  });
}
