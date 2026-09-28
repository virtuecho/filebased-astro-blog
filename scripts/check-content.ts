import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMarkdown } from '../src/content-workflow.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors: string[] = [];
type JsonObject = Record<string, unknown>;

function fail(message: string) {
  errors.push(message);
}

function listPosts(directory = 'src/content/posts'): string[] {
  const absoluteDirectory = path.join(root, directory);
  if (!existsSync(absoluteDirectory)) return [];

  return readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap(
    (entry) => {
      if (entry.name.startsWith('_')) return [];
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) return listPosts(file);
      return /\.mdx?$/.test(entry.name) ? [file.split(path.sep).join('/')] : [];
    },
  );
}

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function collectKeys(value: unknown, prefix = ''): Set<string> {
  const object = asObject(value);
  const keys = new Set<string>();
  if (!object) return keys;

  for (const [key, nestedValue] of Object.entries(object)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.add(fullKey);
    for (const nestedKey of collectKeys(nestedValue, fullKey)) {
      keys.add(nestedKey);
    }
  }
  return keys;
}

const postIds = new Map<string, string>();
const publishedSlugs = new Map<string, string>();
for (const file of listPosts()) {
  const markdown = readFileSync(path.join(root, file), 'utf8');
  const { data } = parseMarkdown(markdown);
  const postId = String(data.postId || '').trim();
  const slug = String(data.slug || '').trim();

  if (postId) {
    const existingFile = postIds.get(postId);
    if (existingFile) {
      fail(`Duplicate postId "${postId}" in ${existingFile} and ${file}.`);
    } else {
      postIds.set(postId, file);
    }
  }

  if (data.draft !== true && slug) {
    const existingFile = publishedSlugs.get(slug);
    if (existingFile) {
      fail(
        `Duplicate published slug "${slug}" in ${existingFile} and ${file}.`,
      );
    } else {
      publishedSlugs.set(slug, file);
    }
  }
}

const settingsPath = 'src/site-settings.json';
let settings: JsonObject | null = null;
try {
  settings = asObject(
    JSON.parse(readFileSync(path.join(root, settingsPath), 'utf8')),
  );
  if (!settings) fail(`${settingsPath} must contain a JSON object.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  fail(`${settingsPath} must be valid JSON: ${message}`);
}

if (settings) {
  for (const key of ['defaultLocale', 'supportedLocales', 'copy', 'theme']) {
    if (!(key in settings)) fail(`${settingsPath} must include ${key}.`);
  }

  const copy = asObject(settings.copy);
  const en = asObject(copy?.en);
  const zh = asObject(copy?.['zh-CN']);
  if (!en) fail(`${settingsPath} must include copy.en.`);
  if (!zh) fail(`${settingsPath} must include copy["zh-CN"].`);

  if (Array.isArray(settings.supportedLocales)) {
    if (!settings.supportedLocales.includes(settings.defaultLocale)) {
      fail(`${settingsPath} supportedLocales must include defaultLocale.`);
    }
  } else {
    fail(`${settingsPath} must include supportedLocales.`);
  }

  if (en && zh) {
    const enKeys = collectKeys(en);
    const zhKeys = collectKeys(zh);
    const enOnly = [...enKeys].filter((key) => !zhKeys.has(key));
    const zhOnly = [...zhKeys].filter((key) => !enKeys.has(key));
    if (enOnly.length) fail(`Locale keys only in en: ${enOnly.join(', ')}`);
    if (zhOnly.length) fail(`Locale keys only in zh-CN: ${zhOnly.join(', ')}`);
  }
}

if (errors.length) {
  console.error('\nContent checks failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Content checks passed.');
