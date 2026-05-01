import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { argv } from 'node:process';
import { marked } from 'marked';
import { cliCopy, openPath, root, selectPost } from './cli-utils.mjs';
import { copy } from '../src/site.config.ts';

// Escape special HTML characters to prevent XSS in generated preview
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Rewrite relative asset URLs ("./img.jpg") to absolute file:// URLs so they load in the standalone preview
function rewriteAssetUrls(html, postDir) {
  const dirUrl = pathToFileURL(postDir).href;
  return html.replaceAll('src="./', `src="${dirUrl}/`).replaceAll('href="./', `href="${dirUrl}/`);
}

// Parse CLI arguments: anything not --no-open is part of the post query
const args = argv.slice(2);
const noOpen = args.includes('--no-open');
const query = args.filter((arg) => arg !== '--no-open').join(' ').trim();

// If no query and stdin is not a TTY, show usage and exit
if (!query && !process.stdin.isTTY) {
  console.log(cliCopy.messages.usagePreview);
  process.exit(0);
}

const post = await selectPost(query);

if (post) {
  // Load the site's CSS for styling the preview
  const cssPath = path.join(root, 'src/styles.css');
  const css = await fs.readFile(cssPath, 'utf8').catch(() => '');
  // Convert markdown body to HTML and rewrite asset paths
  const bodyHtml = rewriteAssetUrls(marked.parse(post.body || ''), post.postDir);
  // Build cover image tag if one is set
  const cover = post.data.cover ? rewriteAssetUrls(`<img src="${escapeHtml(post.data.cover)}" alt="${escapeHtml(post.title)}" />`, post.postDir) : '';
  // Write preview to .post-preview/ (gitignored)
  const previewDir = path.join(root, '.post-preview');
  const previewPath = path.join(previewDir, `${post.postId}.html`);

  // Assemble a standalone HTML page with inlined CSS
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(post.title)} - ${escapeHtml(copy.site.title)}</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="site">
      <div class="layout" style="display:block;">
        <main class="content">
          <article>
            <h1 class="article-title">${escapeHtml(post.title)}</h1>
            <div class="article-meta meta">${escapeHtml(post.data.date || '')} | ${escapeHtml(post.file)}</div>
            ${cover}
            <div class="article-body">${bodyHtml}</div>
          </article>
        </main>
      </div>
    </div>
  </body>
</html>
`;

  await fs.mkdir(previewDir, { recursive: true });
  await fs.writeFile(previewPath, html, 'utf8');
  console.log(`\n${cliCopy.messages.previewCreated}`);
  console.log(previewPath);

  // Open the preview in the default browser unless --no-open was passed
  if (!noOpen) {
    console.log(`\n${cliCopy.messages.openingPreview}`);
    console.log(previewPath);
    openPath(previewPath);
  }
}
