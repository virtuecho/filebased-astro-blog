import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { contentDefaults } from './site.config';

const postSchema = z.object({
  postId: z.string().optional(),
  slug: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  assetDir: z.string().optional(),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  author: z.string().default(contentDefaults.author)
});

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts'
  }),
  schema: postSchema
});

export const collections = { posts };
