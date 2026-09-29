import remarkObsidian from '@quartz-community/remark-obsidian';
import rehypeCallouts from 'rehype-callouts';
import rehypeKatex from 'rehype-katex';
import { defineConfig } from 'astro/config';
import { remarkObsidianLinks } from '../src/obsidian-links.js';

export default defineConfig({
  ...(process.env.SITE_URL ? { site: process.env.SITE_URL } : {}),
  output: 'static',
  markdown: {
    shikiConfig: { theme: 'github-light' },
    remarkPlugins: [remarkObsidian, remarkObsidianLinks],
    rehypePlugins: [rehypeKatex, rehypeCallouts],
  },
});
