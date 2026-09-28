import { readdirSync } from 'node:fs';
import { extname, relative, resolve, sep } from 'node:path';
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
  path: string;
  route: string;
}

interface NoteIndex {
  byPath: Map<string, Note>;
  byName: Map<string, Note[]>;
}

const postsRoot = resolve(process.cwd(), 'src/content/posts');

function markdownPaths(directory = postsRoot): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      return markdownPaths(path);
    }
    return entry.isFile() && extname(entry.name).toLowerCase() === '.md'
      ? [relative(postsRoot, path).split(sep).join('/')]
      : [];
  });
}

function normalizePath(path: string) {
  return path
    .replaceAll('\\', '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/\.(md|mdx)$/i, '')
    .replace(/\/$/, '');
}

export function createNoteIndex(paths: string[]): NoteIndex {
  const byPath = new Map<string, Note>();
  const byName = new Map<string, Note[]>();
  const byRoute = new Map<string, string>();

  for (const sourcePath of paths) {
    const path = normalizePath(sourcePath);
    const routeSegments = path.split('/').map((segment) => slug(segment));
    const route = `/posts/${routeSegments.map(encodeURIComponent).join('/')}/`;
    const routeOwner = byRoute.get(route);
    if (routeOwner) {
      throw new Error(
        `Markdown route collision: "${routeOwner}.md" and "${sourcePath}" both map to "${route}". Rename one file or folder.`,
      );
    }

    const note = { path, route };
    byRoute.set(route, sourcePath);
    byPath.set(path.toLowerCase(), note);
    const name = path.split('/').pop()?.toLowerCase() || path;
    byName.set(name, [...(byName.get(name) || []), note]);
  }

  return { byPath, byName };
}

function currentNotePath(filePath: string | undefined) {
  if (!filePath) return '';
  const absolutePath = resolve(process.cwd(), filePath);
  const path = relative(postsRoot, absolutePath);
  return path.startsWith('..') ? '' : normalizePath(path);
}

function noteUrl(
  path: string,
  heading: string,
  index: NoteIndex,
  sourcePath: string,
) {
  const target = normalizePath(path);
  const note = target
    ? target.includes('/')
      ? index.byPath.get(target.toLowerCase())
      : resolveShortLink(target, sourcePath, index)
    : index.byPath.get(sourcePath.toLowerCase());

  if (!note) {
    const matches = index.byName.get(target.toLowerCase()) || [];
    if (matches.length > 1) {
      throw new Error(
        `Ambiguous Obsidian link "[[${path}]]" in "${sourcePath || 'unknown note'}". Use a folder-qualified link such as "[[${matches[0].path}]]".`,
      );
    }
    return undefined;
  }

  const anchor = heading ? `#${encodeURIComponent(slug(heading))}` : '';
  return `${note.route}${anchor}`;
}

function resolveShortLink(
  target: string,
  sourcePath: string,
  index: NoteIndex,
) {
  const matches = index.byName.get(target.toLowerCase()) || [];
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) return undefined;

  const currentFolder = sourcePath.split('/').slice(0, -1).join('/');
  return index.byPath.get(
    normalizePath(`${currentFolder}/${target}`).toLowerCase(),
  );
}

function sourceText(node: MarkdownNode) {
  const target = `${node.path || ''}${node.heading ? `#${node.heading}` : ''}`;
  return node.alias ? `[[${target}|${node.alias}]]` : `[[${target}]]`;
}

function markdownNoteUrl(url: string, index: NoteIndex, sourcePath: string) {
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

  const target = normalizePath(path).toLowerCase();
  const basename = target.split('/').pop() || target;
  if (!index.byPath.has(target) && !index.byName.has(basename))
    return undefined;
  return noteUrl(path, heading, index, sourcePath);
}

function renderObsidianNodes(
  parent: MarkdownNode,
  index: NoteIndex,
  sourcePath: string,
) {
  if (!parent.children) return;

  parent.children = parent.children.flatMap((node) => {
    if (node.type === 'wikilink') {
      const path = node.path || '';
      if (node.embedded) {
        return [{ type: 'text', value: `!${sourceText(node)}` }];
      }

      const url = noteUrl(path, node.heading || '', index, sourcePath);
      if (!url) return [{ type: 'text', value: sourceText(node) }];

      const label =
        node.alias ||
        path
          .split('/')
          .pop()
          ?.replace(/\.(md|mdx)$/i, '') ||
        node.heading ||
        path;
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
      const url = markdownNoteUrl(node.url, index, sourcePath);
      if (url) node.url = url;
      renderObsidianNodes(node, index, sourcePath);
      return [node];
    }

    if (node.type === 'highlight') {
      renderObsidianNodes(node, index, sourcePath);
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

    renderObsidianNodes(node, index, sourcePath);
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
    renderObsidianNodes(tree, index, currentNotePath(file.path));
  };
}
