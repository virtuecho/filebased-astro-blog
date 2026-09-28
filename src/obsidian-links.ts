import { existsSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { slug } from 'github-slugger';

interface MarkdownNode {
  type: string;
  value?: string;
  path?: string;
  heading?: string;
  alias?: string;
  embedded?: boolean;
  children?: MarkdownNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, string | string[]>;
  };
  url?: string;
}

interface MarkdownFile {
  path?: string;
}

interface Note {
  route: string;
}

interface NoteIndex {
  byName: Map<string, Note>;
}

const postsRoot = resolve(process.cwd(), 'posts');

function markdownPaths() {
  if (!existsSync(postsRoot)) return [];

  return readdirSync(postsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);
}

function normalizeName(path: string) {
  return path
    .replaceAll('\\', '/')
    .replace(/^\.\//, '')
    .replace(/\.(md|mdx)$/i, '');
}

export function createNoteIndex(paths: string[]): NoteIndex {
  const byName = new Map<string, Note>();
  const byRoute = new Map<string, string>();

  for (const filename of paths) {
    if (filename.includes('/') || filename.includes('\\')) {
      throw new Error(
        `Markdown posts must be directly inside "posts/". Move "${filename}" there.`,
      );
    }

    const name = normalizeName(filename);
    const key = name.toLocaleLowerCase();
    if (byName.has(key)) {
      throw new Error(
        `Duplicate Markdown filename "${filename}". File names must be unique.`,
      );
    }

    const route = `/posts/${encodeURIComponent(slug(name))}/`;
    const routeOwner = byRoute.get(route);
    if (routeOwner) {
      throw new Error(
        `Markdown route collision: "${routeOwner}" and "${filename}" both map to "${route}". Rename one file.`,
      );
    }

    byName.set(key, { route });
    byRoute.set(route, filename);
  }

  return { byName };
}

function currentNoteName(filePath?: string) {
  return filePath ? normalizeName(basename(filePath)) : '';
}

function noteUrl(
  path: string,
  heading: string,
  index: NoteIndex,
  currentName: string,
) {
  const target = normalizeName(path);
  if (target.includes('/')) {
    throw new Error(
      `Markdown posts are flat. Move the note into "posts/" and link by filename, such as "[[${basename(target)}]]".`,
    );
  }

  const name = target || currentName;
  const note = index.byName.get(name.toLocaleLowerCase());
  if (!note) return undefined;

  const anchor = heading ? `#${encodeURIComponent(slug(heading))}` : '';
  return `${note.route}${anchor}`;
}

function sourceText(node: MarkdownNode) {
  const target = `${node.path || ''}${node.heading ? `#${node.heading}` : ''}`;
  return node.alias ? `[[${target}|${node.alias}]]` : `[[${target}]]`;
}

function markdownNoteUrl(url: string, index: NoteIndex, currentName: string) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(url)) return undefined;

  const [encodedPath, encodedHeading = ''] = url.split('#', 2);
  let path: string;
  let heading: string;
  try {
    path = decodeURIComponent(encodedPath);
    heading = decodeURIComponent(encodedHeading);
  } catch {
    return undefined;
  }

  const target = normalizeName(path);
  if (target.includes('/')) {
    if (!index.byName.has(basename(target).toLocaleLowerCase()))
      return undefined;
  } else if (!index.byName.has(target.toLocaleLowerCase())) {
    return undefined;
  }

  return noteUrl(path, heading, index, currentName);
}

function renderObsidianNodes(
  parent: MarkdownNode,
  index: NoteIndex,
  currentName: string,
) {
  if (!parent.children) return;

  parent.children = parent.children.flatMap((node) => {
    if (node.type === 'wikilink') {
      const path = node.path || '';
      if (node.embedded) {
        return [{ type: 'text', value: `!${sourceText(node)}` }];
      }

      const url = noteUrl(path, node.heading || '', index, currentName);
      if (!url) return [{ type: 'text', value: sourceText(node) }];

      const label = node.alias || normalizeName(path) || node.heading || path;
      return [
        {
          type: 'link',
          url,
          data: { hProperties: { className: ['obsidian-link'] } },
          children: [{ type: 'text', value: label }],
        },
      ];
    }

    if (node.type === 'link' && node.url) {
      const url = markdownNoteUrl(node.url, index, currentName);
      if (url) node.url = url;
      renderObsidianNodes(node, index, currentName);
      return [node];
    }

    if (node.type === 'highlight') {
      renderObsidianNodes(node, index, currentName);
      return [
        {
          type: 'emphasis',
          data: { hName: 'mark' },
          children: node.children || [],
        },
      ];
    }

    if (node.type === 'tag') {
      return [
        {
          type: 'strong',
          data: {
            hName: 'span',
            hProperties: { className: ['obsidian-tag'] },
          },
          children: [{ type: 'text', value: `#${node.value || ''}` }],
        },
      ];
    }

    renderObsidianNodes(node, index, currentName);
    return [node];
  });
}

export function remarkObsidianLinks(paths?: string[]) {
  let notePaths = paths || markdownPaths();
  let pathKey = notePaths.join('\0');
  let index = createNoteIndex(notePaths);

  return (tree: MarkdownNode, file: MarkdownFile) => {
    if (!paths) {
      notePaths = markdownPaths();
      const nextPathKey = notePaths.join('\0');
      if (nextPathKey !== pathKey) {
        index = createNoteIndex(notePaths);
        pathKey = nextPathKey;
      }
    }
    renderObsidianNodes(tree, index, currentNoteName(file.path));
  };
}
