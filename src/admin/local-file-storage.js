export async function getDir(parent, name, create = false) {
  return parent.getDirectoryHandle(name, { create });
}

export async function getFile(parent, name, create = false) {
  return parent.getFileHandle(name, { create });
}

const DB_NAME = 'astro-file-blog-admin';
const STORE_NAME = 'app-state';
const ROOT_HANDLE_KEY = 'project-root-handle';

function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.addEventListener('upgradeneeded', () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    });
    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('error', () => reject(request.error));
  });
}

async function withStore(mode, run) {
  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    let result = null;

    let settled = false;
    const finish = (callback) => (event) => {
      if (settled) return;
      settled = true;
      callback(event);
    };

    transaction.addEventListener('complete', finish(() => {
      db.close();
      resolve(result);
    }));
    transaction.addEventListener('error', finish(() => {
      db.close();
      reject(transaction.error);
    }));
    transaction.addEventListener('abort', finish(() => {
      db.close();
      reject(transaction.error);
    }));

    Promise.resolve()
      .then(() => run(store))
      .then((value) => {
        result = value ?? null;
      })
      .catch(finish((error) => {
        db.close();
        reject(error);
      }));
  });
}

export async function saveProjectRootHandle(handle) {
  return withStore('readwrite', (store) => {
    store.put(handle, ROOT_HANDLE_KEY);
  });
}

export async function loadProjectRootHandle() {
  return withStore('readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get(ROOT_HANDLE_KEY);
      request.addEventListener('success', () => resolve(request.result || null));
      request.addEventListener('error', () => reject(request.error));
    });
  });
}

export async function clearProjectRootHandle() {
  return withStore('readwrite', (store) => {
    store.delete(ROOT_HANDLE_KEY);
  });
}

export async function queryHandlePermission(handle, mode = 'readwrite') {
  if (!handle?.queryPermission) return 'prompt';
  try {
    return await handle.queryPermission({ mode });
  } catch {
    return 'prompt';
  }
}

export async function requestHandlePermission(handle, mode = 'readwrite') {
  if (!handle?.requestPermission) return false;
  try {
    return (await handle.requestPermission({ mode })) === 'granted';
  } catch {
    return false;
  }
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
