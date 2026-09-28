import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { contentDefaults } from './site.config';

const postSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
  category: z.string().default(contentDefaults.category),
  tags: z.array(z.string()).default([]),
  author: z.string().default(contentDefaults.author),
});

const posts = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/posts',
  }),
  schema: postSchema,
});

export const collections = { posts };
