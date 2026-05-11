import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMarkdown } from '../src/content-workflow.ts';

// The repository root is one directory above this script.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Directories that should never be traversed for source-policy checks.
const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  '.astro',
  '.post-preview',
]);

// Generated folders are allowed locally but must not be committed.
const GENERATED_DIRS = ['dist/', '.astro/', '.post-preview/', 'node_modules/'];

// Docs are part of the architecture contract, not optional side notes.
const REQUIRED_DOCS = [
  'AGENTS.md',
  'README.md',
  'README.zh-CN.md',
  'docs/engineering/ARCHITECTURE.md',
  'docs/engineering/CI_AND_HOOKS.md',
  'docs/engineering/COMMIT_CONVENTION.md',
  'docs/engineering/AI_CODE_REVIEW_CHECKLIST.md',
];

// Existing JavaScript source files that remain JS for a concrete reason.
const ALLOWED_SRC_JS = new Map([
  [
    'src/admin/local-file-storage.js',
    'Browser module used directly by the admin File System Access API script.',
  ],
  [
    'src/admin/sharp-image-processing.js',
    'Shared ESM helper consumed by the existing .mjs asset CLI scripts.',
  ],
  [
    'src/pages/rss.xml.js',
    'Astro endpoint filename maps directly to the generated RSS route.',
  ],
  [
    'src/pages/sitemap.xml.js',
    'Astro endpoint filename maps directly to the generated sitemap route.',
  ],
]);

// C and C++ files are out of scope for this static template.
const C_CPP_EXTENSIONS = new Set([
  '.c',
  '.cc',
  '.cpp',
  '.cxx',
  '.h',
  '.hh',
  '.hpp',
  '.hxx',
]);

const errors: string[] = [];

type JsonObject = Record<string, unknown>;

// Record a failed invariant and keep checking so the output is complete.
function fail(message: string) {
  errors.push(message);
}

// Resolve a repository-relative path to an absolute path.
function fromRoot(relativePath: string) {
  return path.join(root, relativePath);
}

// Read and parse JSON with a clearer filename in the thrown message.
function readJson(relativePath: string): JsonObject | null {
  try {
    return JSON.parse(
      readFileSync(fromRoot(relativePath), 'utf8'),
    ) as JsonObject;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`${relativePath} must be valid JSON: ${message}`);
    return null;
  }
}

// Recursively list repository files while skipping generated/vendor folders.
function listFiles(dir = root): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;

    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath));
      continue;
    }

    files.push(path.relative(root, absolutePath).replaceAll(path.sep, '/'));
  }

  return files;
}

// Query tracked files so local build output does not fail the check.
function listTrackedFiles(): string[] {
  try {
    return execSync('git ls-files', {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Collect nested object keys for locale parity checks.
function collectKeys(value: unknown, prefix = ''): Set<string> {
  const keys = new Set<string>();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return keys;

  for (const [key, nestedValue] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.add(fullKey);

    if (
      nestedValue &&
      typeof nestedValue === 'object' &&
      !Array.isArray(nestedValue)
    ) {
      for (const nestedKey of collectKeys(nestedValue, fullKey)) {
        keys.add(nestedKey);
      }
    }
  }

  return keys;
}

// Read all content markdown files that represent actual posts.
function listPostMarkdownFiles(): string[] {
  const postsRoot = fromRoot('src/content/posts');
  if (!existsSync(postsRoot)) return [];

  return listFiles(postsRoot)
    .map((file) =>
      path.relative('src/content/posts', file).replaceAll('\\', '/'),
    )
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .filter((file) => !file.split('/').some((part) => part.startsWith('_')))
    .map((file) => `src/content/posts/${file}`);
}

// Check pnpm-only package manager invariants.
if (!existsSync(fromRoot('pnpm-lock.yaml'))) {
  fail('pnpm-lock.yaml must exist.');
}

if (existsSync(fromRoot('package-lock.json'))) {
  fail('package-lock.json must not exist. Use pnpm only.');
}

if (existsSync(fromRoot('yarn.lock'))) {
  fail('yarn.lock must not exist. Use pnpm only.');
}

const packageJson = readJson('package.json');
const packageManager =
  packageJson && typeof packageJson.packageManager === 'string'
    ? packageJson.packageManager
    : '';
if (packageJson && !packageManager.startsWith('pnpm@')) {
  fail('package.json packageManager must start with "pnpm@".');
}

// Check strict Astro TypeScript configuration.
const tsconfig = readJson('tsconfig.json');
const tsconfigExtends =
  tsconfig && typeof tsconfig.extends === 'string' ? tsconfig.extends : '';
if (tsconfig && tsconfigExtends !== 'astro/tsconfigs/strict') {
  fail('tsconfig.json must extend "astro/tsconfigs/strict".');
}

// Check required docs exist.
for (const docPath of REQUIRED_DOCS) {
  if (!existsSync(fromRoot(docPath)))
    fail(`Required document missing: ${docPath}`);
}

// Check generated folders are not tracked in git.
const trackedFiles = listTrackedFiles();
for (const generatedDir of GENERATED_DIRS) {
  if (trackedFiles.some((file) => file.startsWith(generatedDir))) {
    fail(`Generated folder must not be committed: ${generatedDir}`);
  }
}

// Check source files for language boundary violations.
const repoFiles = listFiles();
for (const file of repoFiles) {
  const extension = path.extname(file).toLowerCase();

  if (C_CPP_EXTENSIONS.has(extension)) {
    fail(`C/C++ source is not allowed in this template: ${file}`);
  }

  if (
    file.startsWith('src/') &&
    extension === '.js' &&
    !ALLOWED_SRC_JS.has(file)
  ) {
    fail(
      `Unexpected JavaScript source file: ${file}. Prefer TypeScript or add an explicit allowlist reason.`,
    );
  }
}

// Check all allowlisted JS files still exist, keeping the allowlist honest.
for (const [file, reason] of ALLOWED_SRC_JS) {
  if (!existsSync(fromRoot(file))) {
    fail(`Allowlisted JavaScript file is missing: ${file} (${reason})`);
  }
}

// Check duplicate post IDs and published slugs.
const postIds = new Map<string, string>();
const publishedSlugs = new Map<string, string>();
for (const file of listPostMarkdownFiles()) {
  const markdown = readFileSync(fromRoot(file), 'utf8');
  const { data } = parseMarkdown(markdown);
  const postId = String(data.postId || '').trim();
  const slug = String(data.slug || '').trim();
  const isPublished = data.draft !== true;

  if (postId) {
    const existingFile = postIds.get(postId);
    if (existingFile) {
      fail(`Duplicate postId "${postId}" in ${existingFile} and ${file}.`);
    } else {
      postIds.set(postId, file);
    }
  }

  if (isPublished && slug) {
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

// Check settings JSON and locale copy parity.
const settings = readJson('src/site-settings.json');
if (settings) {
  const copy =
    settings.copy &&
    typeof settings.copy === 'object' &&
    !Array.isArray(settings.copy)
      ? (settings.copy as JsonObject)
      : null;
  const enCopy = copy?.en;
  const zhCopy = copy?.['zh-CN'];

  if (!enCopy) fail('src/site-settings.json must include copy.en.');
  if (!zhCopy) fail('src/site-settings.json must include copy["zh-CN"].');

  if (enCopy && zhCopy) {
    const enKeys = collectKeys(enCopy);
    const zhKeys = collectKeys(zhCopy);
    const enOnly = [...enKeys].filter((key) => !zhKeys.has(key));
    const zhOnly = [...zhKeys].filter((key) => !enKeys.has(key));

    if (enOnly.length) fail(`Locale keys only in en: ${enOnly.join(', ')}`);
    if (zhOnly.length) fail(`Locale keys only in zh-CN: ${zhOnly.join(', ')}`);
  }
}

// Print clear results for local use and CI logs.
if (errors.length > 0) {
  console.error('\nArchitecture check failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Architecture check passed.');
