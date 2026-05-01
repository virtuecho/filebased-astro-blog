// Get (or optionally create) a subdirectory handle within a parent directory handle
export async function getDir(parent, name, create = false) {
  return parent.getDirectoryHandle(name, { create });
}

// Get (or optionally create) a file handle within a parent directory handle
export async function getFile(parent, name, create = false) {
  return parent.getFileHandle(name, { create });
}

// IndexedDB database name for persisting state across sessions
const DB_NAME = 'astro-file-blog-admin';
// Single object store holding key-value pairs (handle, path prefs, etc.)
const STORE_NAME = 'app-state';
// Key used to store/retrieve the project root FileSystemDirectoryHandle
const ROOT_HANDLE_KEY = 'project-root-handle';

// Open IndexedDB and run migrations; returns null when IndexedDB is unavailable
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

// Open a transaction on the shared store, run `run(store)`, and resolve with its return value
// Uses a settled flag to prevent double resolution from overlapping complete/error/abort events
async function withStore(mode, run) {
  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    let result = null;

    // Guard to ensure transaction lifecycle callbacks fire only once
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

// Persist a FileSystemDirectoryHandle to IndexedDB for later reuse
export async function saveProjectRootHandle(handle) {
  return withStore('readwrite', (store) => {
    store.put(handle, ROOT_HANDLE_KEY);
  });
}

// Retrieve the previously saved project root FileSystemDirectoryHandle
export async function loadProjectRootHandle() {
  return withStore('readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get(ROOT_HANDLE_KEY);
      request.addEventListener('success', () => resolve(request.result || null));
      request.addEventListener('error', () => reject(request.error));
    });
  });
}

// Remove the stored project root handle from IndexedDB
export async function clearProjectRootHandle() {
  return withStore('readwrite', (store) => {
    store.delete(ROOT_HANDLE_KEY);
  });
}

// Check current permission state for a FileSystemHandle (returns 'granted', 'denied', or 'prompt')
export async function queryHandlePermission(handle, mode = 'readwrite') {
  if (!handle?.queryPermission) return 'prompt';
  try {
    return await handle.queryPermission({ mode });
  } catch {
    return 'prompt';
  }
}

// Prompt the user to grant permission on a FileSystemHandle; returns true if granted
export async function requestHandlePermission(handle, mode = 'readwrite') {
  if (!handle?.requestPermission) return false;
  try {
    return (await handle.requestPermission({ mode })) === 'granted';
  } catch {
    return false;
  }
}

// Resolve or create the standard project directory layout under the given root handle
export async function ensureProjectHandles(root) {
  const src = await getDir(root, 'src');
  const content = await getDir(src, 'content');
  const postsDir = await getDir(content, 'posts', true);
  const publicDir = await getDir(root, 'public', true);
  const images = await getDir(publicDir, 'images', true);
  const imagesSiteDir = await getDir(images, 'site', true);

  return { postsDir, publicDir, imagesSiteDir };
}

// Read the full text contents of a file from a FileSystemFileHandle
export async function readFile(handle) {
  const file = await handle.getFile();
  return file.text();
}

// Write string content to a file via its FileSystemFileHandle (truncates existing content)
export async function writeFile(handle, content) {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

// List all posts in the posts directory, parse frontmatter, and return them sorted by date desc then title asc
export async function listPostFiles(postsDir, parseMarkdown, indexFile) {
  const posts = [];

  for await (const [name, handle] of postsDir.entries()) {
    // Skip non-directory entries and underscore-prefixed directories (e.g. _drafts)
    if (handle.kind !== 'directory') continue;
    if (name.startsWith('_')) continue;

    let postHandle;
    try {
      postHandle = await handle.getFileHandle(indexFile);
    } catch {
      // Post directory exists but has no index file — skip it
      continue;
    }

    const markdown = await readFile(postHandle);
    const { data } = parseMarkdown(markdown);
    posts.push({ name, handle: postHandle, dirHandle: handle, data });
  }

  // Sort by date descending; fall back to title alphabetical for tie-breaking
  return posts.sort((a, b) => {
    const ad = new Date(a.data.date || 0).getTime();
    const bd = new Date(b.data.date || 0).getTime();
    return bd - ad || String(a.data.title || '').localeCompare(String(b.data.title || ''));
  });
}
