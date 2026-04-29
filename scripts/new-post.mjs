import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { randomUUID } from 'node:crypto';
import { stdin as input, stdout as output } from 'node:process';
import { cliCopy, defaults, pathExists, postsDir, root } from './cli-utils.mjs';
import {
  assetDirForPostId,
  buildMarkdown,
  createPostId,
  fallbackSlugFromPostId,
  postFileName,
  slugify,
  todayLocalDate
} from '../src/content-workflow.ts';

let rl;
let pipedAnswers;

async function ask(question, fallback = '') {
  if (pipedAnswers) {
    const answer = (pipedAnswers.shift() ?? '').trim();
    output.write(question);
    output.write(answer ? `${answer}\n` : '\n');
    return answer || fallback;
  }

  const answer = (await rl.question(question)).trim();
  return answer || fallback;
}

function postComment(postId, assetDir, draft) {
  const imageUrl = assetDir.replace(/\/$/, '');
  const publicAssetPath = `public${assetDir}`;
  const note = cliCopy.postComment;

  return `<!--
${note.stableId}
${postId}

${note.identity}
${note.keepStable}

${note.assetFolder}
${publicAssetPath}

${note.cover}
cover: "${imageUrl}/cover.jpg"

${note.image}
![image description](${imageUrl}/001.jpg)

${note.slugTip}

${draft ? note.draftTip : note.publishedTip}
-->

`;
}

async function main() {
  if (input.isTTY) {
    rl = readline.createInterface({ input, output });
  } else {
    const chunks = [];
    for await (const chunk of input) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    pipedAnswers = Buffer.concat(chunks).toString('utf8').split(/\r?\n/);
  }

  const date = todayLocalDate();
  const postId = createPostId(randomUUID);
  const titleInput = await ask(cliCopy.prompts.title);
  const title = titleInput || `${defaults.untitledDraft} ${date}`;
  const slugInput = await ask(cliCopy.prompts.slug);
  const slug = (slugInput ? slugify(slugInput) : slugify(titleInput)) || fallbackSlugFromPostId(postId);
  const category = await ask(cliCopy.prompts.category, defaults.category);
  const tagsInput = await ask(cliCopy.prompts.tags);
  const description = await ask(cliCopy.prompts.description);
  const author = await ask(cliCopy.prompts.author, defaults.author);
  const publishInput = await ask(cliCopy.prompts.publish);
  const draft = !/^y(es)?$/i.test(publishInput);
  const tags = tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);
  const assetDir = assetDirForPostId(postId);
  const imageDir = path.join(root, 'public/images/posts', postId);
  const postPath = path.join(postsDir, postFileName(postId));

  if (await pathExists(postPath)) {
    throw new Error(`Post already exists: ${postPath}`);
  }

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
      assetDir,
      draft
    },
    `${postComment(postId, assetDir, draft)}${defaults.body}`,
    defaults
  );

  await fs.mkdir(postsDir, { recursive: true });
  await fs.mkdir(imageDir, { recursive: true });
  await fs.writeFile(postPath, markdown, 'utf8');

  console.log(`\n${cliCopy.messages.createdPost}`);
  console.log(postPath);
  console.log(`\n${cliCopy.messages.createdAssets}`);
  console.log(imageDir);
  console.log(`\n${cliCopy.messages.postId}`);
  console.log(postId);
  console.log(`\n${cliCopy.messages.currentSlug}`);
  console.log(slug);
}

try {
  await main();
} finally {
  rl?.close();
}
