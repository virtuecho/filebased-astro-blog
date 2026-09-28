import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type JsonObject = Record<string, unknown>;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const settingsPath = path.join(root, 'src/site-settings.json');
const settings = JSON.parse(readFileSync(settingsPath, 'utf8')) as JsonObject;
const errors: string[] = [];

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

const copy = asObject(settings.copy);
const en = asObject(copy?.en);
const zh = asObject(copy?.['zh-CN']);

if (!Array.isArray(settings.supportedLocales)) {
  errors.push('site-settings.json must include supportedLocales.');
} else if (!settings.supportedLocales.includes(settings.defaultLocale)) {
  errors.push('supportedLocales must include defaultLocale.');
}

if (!en || !zh) {
  errors.push('site-settings.json must include both English and Chinese copy.');
} else {
  const enKeys = collectKeys(en);
  const zhKeys = collectKeys(zh);
  const enOnly = [...enKeys].filter((key) => !zhKeys.has(key));
  const zhOnly = [...zhKeys].filter((key) => !enKeys.has(key));
  if (enOnly.length) errors.push(`Keys only in en: ${enOnly.join(', ')}`);
  if (zhOnly.length) errors.push(`Keys only in zh-CN: ${zhOnly.join(', ')}`);
}

if (errors.length) {
  console.error('\nSettings checks failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Settings checks passed.');
