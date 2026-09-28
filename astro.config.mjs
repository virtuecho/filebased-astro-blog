import remarkObsidian from '@quartz-community/remark-obsidian';
import rehypeCallouts from 'rehype-callouts';
import rehypeKatex from 'rehype-katex';
import { defineConfig } from 'astro/config';
import { remarkObsidianLinks } from './src/markdown/obsidian-links.js';

export default defineConfig({
  site: 'https://your-domain.com',
  output: 'static',
  markdown: {
    remarkPlugins: [remarkObsidian, remarkObsidianLinks],
    rehypePlugins: [rehypeKatex, rehypeCallouts],
  },
});
