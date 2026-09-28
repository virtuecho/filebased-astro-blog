import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildMarkdown,
  parseMarkdown,
  postUrl,
  slugFromTitle,
} from '../src/content-workflow.ts';

describe('content workflow', () => {
  it('round-trips post frontmatter and Markdown body', () => {
    const markdown = buildMarkdown(
      {
        postId: 'post-1',
        slug: 'hello-world',
        title: 'Hello World',
        date: '2026-09-28',
        tags: ['notes', 'blog'],
        draft: false,
      },
      '## Hello\n\nPost body.',
    );

    const { data, body } = parseMarkdown(markdown);
    assert.equal(data.postId, 'post-1');
    assert.equal(data.slug, 'hello-world');
    assert.deepEqual(data.tags, ['notes', 'blog']);
    assert.equal(data.draft, false);
    assert.equal(body.trim(), '## Hello\n\nPost body.');
  });

  it('treats Markdown without frontmatter as a body', () => {
    assert.deepEqual(parseMarkdown('# Hello'), {
      data: {},
      body: '# Hello',
    });
  });

  it('uses the post ID when a title cannot produce a slug', () => {
    assert.equal(slugFromTitle('中文标题', '12345678-abcd'), 'post-12345678');
    assert.equal(postUrl({ slug: 'hello-world' }), '/posts/hello-world/');
  });
});
