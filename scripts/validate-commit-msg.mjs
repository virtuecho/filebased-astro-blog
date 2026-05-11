import { readFileSync } from 'node:fs';

// Conventional Commit types allowed for this repository.
const ALLOWED_TYPES = new Set([
  'feat',
  'fix',
  'refactor',
  'perf',
  'style',
  'test',
  'docs',
  'build',
  'ops',
  'chore',
]);

// Git passes the commit message file path as the first argument.
const messagePath = process.argv[2];

if (!messagePath) {
  console.error('Missing commit message file path.');
  process.exit(1);
}

// Only validate the first non-comment line; Git metadata follows later.
const header = readFileSync(messagePath, 'utf8')
  .split(/\r?\n/)
  .find((line) => line.trim() && !line.startsWith('#'))
  ?.trim();

if (!header) {
  console.error('Commit message must not be empty.');
  process.exit(1);
}

const match = header.match(/^([a-z]+)(\([a-z0-9-]+\))?: ([a-z].*)$/);

if (!match) {
  console.error(
    'Commit header must match: <type>(optional-scope): <lowercase description>',
  );
  process.exit(1);
}

const [, type, , description] = match;

if (!ALLOWED_TYPES.has(type)) {
  console.error(`Unsupported commit type "${type}".`);
  console.error(`Allowed types: ${[...ALLOWED_TYPES].join(', ')}`);
  process.exit(1);
}

if (description.endsWith('.')) {
  console.error('Commit description must not end with a period.');
  process.exit(1);
}
