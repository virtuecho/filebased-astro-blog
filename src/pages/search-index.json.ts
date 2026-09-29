import type { APIRoute } from 'astro';
import { contentDefaults } from '../site.config';
import { getPosts, postUrl } from '../lib';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const index = posts.map((post) => {
    const category =
      post.data.category === contentDefaults.category ? '' : post.data.category;
    const tags = post.data.tags;

    return {
      url: postUrl(post),
      searchText: [
        post.data.title,
        post.data.description ?? '',
        category,
        tags.join(' '),
        post.body ?? '',
      ]
        .join(' ')
        .toLocaleLowerCase(),
    };
  });

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
