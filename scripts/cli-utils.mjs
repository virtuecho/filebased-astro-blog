import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { spawn } from 'node:child_process';
import { env, platform, stdin as input, stdout as output } from 'node:process';
import { copy } from '../src/site.config.ts';
import { assetDirForPostId, parseMarkdown, publicAssetDir } from '../src/content-workflow.ts';

export const root = process.cwd();
export const postsDir = path.join(root, 'src/content/posts');
export const assetsBaseDir = path.join(root, 'public/images/posts');
export const cliCopy = copy.cli;
export const defaults = copy.contentDefaults;

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listPosts() {
  const files = await fs.readdir(postsDir).catch(() => []);
  const posts = [];

  for (const file of files) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    if (file === '_draft-template.md') continue;

    const filePath = path.join(postsDir, file);
    const markdown = await fs.readFile(filePath, 'utf8');
    const { data, body } = parseMarkdown(markdown);
    const postId = String(data.postId || path.basename(file, path.extname(file)));
    const assetDir = String(data.assetDir || assetDirForPostId(postId));
    posts.push({
      file,
      filePath,
      markdown,
      body,
      data: { ...data, postId, assetDir },
      title: String(data.title || defaults.unnamedPost),
      postId,
      slug: String(data.slug || ''),
      assetDir,
      assetPath: path.join(root, publicAssetDir(assetDir))
    });
  }

  return posts.sort((a, b) => {
    const ad = new Date(a.data.date || 0).getTime();
    const bd = new Date(b.data.date || 0).getTime();
    return bd - ad || a.title.localeCompare(b.title);
  });
}

export function findMatches(posts, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return posts;

  const number = Number(normalized);
  if (Number.isInteger(number) && number >= 1 && number <= posts.length) {
    return [posts[number - 1]];
  }

  return posts.filter((post) => {
    const haystack = `${post.file} ${post.title} ${post.postId} ${post.slug}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export function printPostList(posts) {
  console.log(`${cliCopy.messages.editablePosts}\n`);
  posts.forEach((post, index) => {
    const url = post.slug ? `  /posts/${post.slug}/` : '';
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   ${post.file}${url}`);
  });
}

export async function selectPost(queryFromArg = '') {
  const posts = await listPosts();

  if (posts.length === 0) {
    console.log(cliCopy.messages.noPosts);
    console.log('npm run new-post');
    return null;
  }

  printPostList(posts);
  let query = queryFromArg.trim();

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

  if (matches.length > 1) {
    console.log(`\n${cliCopy.messages.tooMany}`);
    matches.forEach((post) => {
      console.log(`- ${post.title} (${post.file})`);
    });
    return null;
  }

  return matches[0];
}

export function openPath(targetPath, { editor = false } = {}) {
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
