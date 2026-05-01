import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { randomUUID } from 'node:crypto';
import { stdin as input, stdout as output } from 'node:process';
import { cliCopy, defaults, pathExists, postsDir } from './cli-utils.mjs';
import {
  buildMarkdown,
  createPostId,
  fallbackSlugFromPostId,
  slugify,
  todayLocalDate
} from '../src/content-workflow.ts';

// Readline interface for interactive prompts (set when TTY)
let rl;
// Pre-populated answers from piped stdin (each line = one answer)
let pipedAnswers;

// Ask a question: use piped answers if available, otherwise prompt via readline
async function ask(question, fallback = '') {
  if (pipedAnswers) {
    // Consume next line from piped input
    const answer = (pipedAnswers.shift() ?? '').trim();
    // Echo question + answer to stdout for transparency
    output.write(question);
    output.write(answer ? `${answer}\n` : '\n');
    return answer || fallback;
  }

  const answer = (await rl.question(question)).trim();
  return answer || fallback;
}

// Generate an HTML comment block explaining the post's identity and conventions
function postComment(postId, draft) {
  const note = cliCopy.postComment;

  return `<!--
${note.stableId}
${postId}

${note.identity}
${note.keepStable}

${note.cover}
cover: "./cover.jpg"

${note.image}
![image description](./001.jpg)

${note.slugTip}

${draft ? note.draftTip : note.publishedTip}
-->

`;
}

// Main entry point: gather post metadata interactively and write the markdown file
async function main() {
  // Set up readline for TTY or read piped stdin entirely
  if (input.isTTY) {
    rl = readline.createInterface({ input, output });
  } else {
    const chunks = [];
    for await (const chunk of input) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    // Split piped input into lines (one answer per line)
    pipedAnswers = Buffer.concat(chunks).toString('utf8').split(/\r?\n/);
  }

  // Today's date in the configured locale
  const date = todayLocalDate();
  // Generate a stable UUID-based post identifier
  const postId = createPostId(randomUUID);
  const titleInput = await ask(cliCopy.prompts.title);
  const title = titleInput || `${defaults.untitledDraft} ${date}`;
  const slugInput = await ask(cliCopy.prompts.slug);
  // Slug from explicit input, or derived from title, or fallback from postId
  const slug = (slugInput ? slugify(slugInput) : slugify(titleInput)) || fallbackSlugFromPostId(postId);
  const category = await ask(cliCopy.prompts.category, defaults.category);
  const tagsInput = await ask(cliCopy.prompts.tags);
  const description = await ask(cliCopy.prompts.description);
  const author = await ask(cliCopy.prompts.author, defaults.author);
  const publishInput = await ask(cliCopy.prompts.publish);
  // Draft unless user answers "y" or "yes"
  const draft = !/^y(es)?$/i.test(publishInput);
  // Parse comma-separated tags into an array
  const tags = tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);
  const postDir = path.join(postsDir, postId);
  const postPath = path.join(postDir, 'index.md');

  if (await pathExists(postDir)) {
    throw new Error(`Post already exists: ${postDir}`);
  }

  // Build full markdown (frontmatter + body), prepend the explanatory comment
  const markdown = buildMarkdown(
    {
      postId,
      slug,
      title,
      description,
      date,
      category,
      tags,
      author,
      draft
    },
    `${postComment(postId, draft)}${defaults.body}`,
    defaults
  );

  await fs.mkdir(postDir, { recursive: true });
  await fs.writeFile(postPath, markdown, 'utf8');

  console.log(`\n${cliCopy.messages.createdPost}`);
  console.log(postPath);
  console.log(`\n${cliCopy.messages.postId}`);
  console.log(postId);
  console.log(`\n${cliCopy.messages.currentSlug}`);
  console.log(slug);
}

try {
  await main();
} finally {
  // Always close the readline interface
  rl?.close();
}
