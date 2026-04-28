export async function getDir(parent, name, create = false) {
  return parent.getDirectoryHandle(name, { create });
}

export async function getFile(parent, name, create = false) {
  return parent.getFileHandle(name, { create });
}

export async function ensureProjectHandles(root) {
  const src = await getDir(root, 'src');
  const content = await getDir(src, 'content');
  const postsDir = await getDir(content, 'posts', true);
  const publicDir = await getDir(root, 'public', true);
  const images = await getDir(publicDir, 'images', true);
  const imagesPostsDir = await getDir(images, 'posts', true);

  return { postsDir, publicDir, imagesPostsDir };
}

export async function readFile(handle) {
  const file = await handle.getFile();
  return file.text();
}

export async function writeFile(handle, content) {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function listPostFiles(postsDir, parseMarkdown) {
  const posts = [];

  for await (const [name, handle] of postsDir.entries()) {
    if (handle.kind !== 'file') continue;
    if (!name.endsWith('.md') && !name.endsWith('.mdx')) continue;
    if (name === '_draft-template.md') continue;

    const markdown = await readFile(handle);
    const { data } = parseMarkdown(markdown);
    posts.push({ name, handle, data });
  }

  return posts.sort((a, b) => {
    const ad = new Date(a.data.date || 0).getTime();
    const bd = new Date(b.data.date || 0).getTime();
    return bd - ad || String(a.data.title || '').localeCompare(String(b.data.title || ''));
  });
}

export async function writeBrowserFile(dir, name, content) {
  const handle = await getFile(dir, name, true);
  await writeFile(handle, content);
  return handle;
}
