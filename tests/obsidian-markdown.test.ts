import assert from 'node:assert/strict';
import test from 'node:test';
import { createNoteIndex, remarkObsidianLinks } from '../src/obsidian-links';

interface TestNode {
  type: string;
  value?: string;
  path?: string;
  heading?: string;
  alias?: string;
  embedded?: boolean;
  url?: string;
  data?: { hName?: string };
  children?: TestNode[];
}

const paths = ['Current Note.md', 'Daily Note.md', 'Note.md', 'Other Note.md'];
const render = remarkObsidianLinks(paths);

function transform(children: TestNode[], path = 'Current Note.md') {
  const tree: TestNode = { type: 'root', children };
  render(tree, { path: `src/content/posts/${path}` });
  return tree.children || [];
}

test('turns Obsidian links into slugged routes with heading anchors', () => {
  const [link] = transform([
    {
      type: 'wikilink',
      path: 'Daily Note.md',
      heading: 'Background',
      alias: 'read more',
      embedded: false,
    },
  ]);

  assert.equal(link.type, 'link');
  assert.equal(link.url, '/posts/daily-note/#background');
  assert.equal(link.children?.[0]?.value, 'read more');
});

test('rejects folder-qualified note links and duplicate filenames', () => {
  assert.throws(
    () =>
      transform([{ type: 'wikilink', path: 'folder/Note', embedded: false }]),
    /Markdown posts are flat/,
  );
  assert.throws(
    () => createNoteIndex(['Note.md', 'note.md']),
    /Duplicate Markdown filename/,
  );
});

test('rewrites Markdown internal links with URL-encoded paths', () => {
  const [link] = transform([
    {
      type: 'link',
      url: 'Daily%20Note.md#Background',
      children: [{ type: 'text', value: 'read this note' }],
    },
  ]);

  assert.equal(link.url, '/posts/daily-note/#background');
});

test('keeps file embeds as plain text when there is no attachment handling', () => {
  const [embed] = transform([
    {
      type: 'wikilink',
      path: 'diagram.png',
      heading: '',
      alias: '',
      embedded: true,
    },
  ]);

  assert.deepEqual(embed, { type: 'text', value: '![[diagram.png]]' });
});

test('renders Obsidian highlights and tags as HTML elements', () => {
  const [highlight, tag] = transform([
    { type: 'highlight', children: [{ type: 'text', value: 'important' }] },
    { type: 'tag', value: 'reading/list' },
  ]);

  assert.equal(highlight.data?.hName, 'mark');
  assert.equal(highlight.children?.[0]?.value, 'important');
  assert.equal(tag.data?.hName, 'span');
  assert.equal(tag.children?.[0]?.value, '#reading/list');
});

test('rejects note paths that collapse to the same public route', () => {
  assert.throws(
    () => createNoteIndex(['My Note.md', 'my-note.md']),
    /Markdown route collision/,
  );
});
