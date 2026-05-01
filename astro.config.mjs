import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';

const CONTENT_DIR = path.resolve('src/content/posts');

const mimeTypes = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.mp3': 'audio/mpeg'
};

function serveAsset(postId, filename, res) {
  const safeName = path.basename(filename);
  const filePath = path.join(CONTENT_DIR, postId, safeName);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false;
  const ext = path.extname(safeName).toLowerCase();
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-cache');
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function postAssetsPlugin() {
  return {
    name: 'post-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/images\/posts\/([^/]+)\/(.+)$/);
        if (!match) return next();
        serveAsset(match[1], match[2], res) || next();
      });
    },
    writeBundle() {
      const outDir = path.resolve('dist');
      for (const entryName of fs.readdirSync(CONTENT_DIR, { withFileTypes: true })) {
        if (!entryName.isDirectory() || entryName.name.startsWith('_')) continue;
        const src = path.join(CONTENT_DIR, entryName.name);
        const dest = path.join(outDir, 'images', 'posts', entryName.name);
        copyDirRecursive(src, dest);
      }
    }
  };
}

export default defineConfig({
  site: 'https://your-domain.com',
  output: 'static',
  vite: {
    plugins: [postAssetsPlugin()]
  }
});
