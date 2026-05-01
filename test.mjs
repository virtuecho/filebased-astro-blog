// Run shell commands synchronously
import { execSync } from 'node:child_process';
// Read files and list directories
import { readFileSync, readdirSync } from 'node:fs';
// Resolve and manipulate file paths
import { resolve, dirname } from 'node:path';
// Convert `import.meta.url` to a local filesystem path
import { fileURLToPath } from 'node:url';

// Directory containing this test script (project root)
const __dirname = dirname(fileURLToPath(import.meta.url));
// Convenience alias for the project root
const root = __dirname;

// Counters for test results
let failed = 0;
let passed = 0;

// Runs a single named test and tracks pass/fail
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

// Executes a shell command from the project root, returning stdout
function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
    ...opts
  });
}

// ---------------------------------------------------------------------------
// 1. Build & type-check — verifies the project compiles and builds cleanly
// ---------------------------------------------------------------------------
console.log('\n[1] Build & type-check');

// Runs `astro check` to validate TypeScript types
test('astro check passes', () => {
  run('npx astro check', { timeout: 60000 });
});

// Runs a full static build to ensure no runtime errors
test('astro build succeeds', () => {
  run('npm run build', { timeout: 60000 });
});

// ---------------------------------------------------------------------------
// 2. CLI script syntax — ensures every .mjs script is syntactically valid
// ---------------------------------------------------------------------------
console.log('\n[2] CLI script syntax check');

// Absolute path to the scripts/ directory
const SCRIPTS_DIR = resolve(root, 'scripts');
// All .mjs files inside scripts/
const scriptFiles = readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith('.mjs'));

// Check each script with `node --check` (parses without executing)
for (const file of scriptFiles) {
  test(`scripts/${file} syntax ok`, () => {
    run(`node --check ${resolve(SCRIPTS_DIR, file)}`);
  });
}

// ---------------------------------------------------------------------------
// 3. admin.astro import integrity — catches missing imports for used functions
// ---------------------------------------------------------------------------
console.log('\n[3] admin.astro import integrity');

// Path to the admin page
const adminPath = resolve(root, 'src/pages/admin.astro');
// Full source of admin.astro
const adminSrc = readFileSync(adminPath, 'utf8');

// Extract the import block from ../admin/local-file-storage.js
const storageImportMatch = adminSrc.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\.\/admin\/local-file-storage\.js['"]/);
// Set of function names already imported from local-file-storage.js
const storageUsed = new Set(
  (storageImportMatch?.[1] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

// Functions exported by local-file-storage.js
const STORAGE_EXPORTS = [
  'getDir',
  'getFile',
  'saveProjectRootHandle',
  'loadProjectRootHandle',
  'clearProjectRootHandle',
  'queryHandlePermission',
  'requestHandlePermission',
  'ensureProjectHandles',
  'readFile',
  'writeFile',
  'listPostFiles'
];

// Find functions called from local-file-storage that are NOT imported
// We do this by checking for the function names in the code (after the import)
const scriptCode = adminSrc.slice(adminSrc.indexOf('  <script>'));
for (const fn of STORAGE_EXPORTS) {
  // Check if the function is called outside of the import statement
  const regex = new RegExp(`\\b${fn}\\s*\\(`);
  const matches = scriptCode.match(regex);
  if (matches && !storageUsed.has(fn)) {
    test(`admin.astro imports ${fn} (used but not imported)`, () => {
      throw new Error(`${fn}() is called in admin.astro but not imported from local-file-storage.js`);
    });
  }
}

// Also verify content-workflow imports
const cwImportMatch = adminSrc.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\.\/content-workflow['"]/);
// Set of function names already imported from content-workflow
const cwUsed = new Set(
  (cwImportMatch?.[1] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

// Functions exported by content-workflow module
const CW_EXPORTS = [
  'buildMarkdown',
  'createPostId',
  'fallbackSlugFromPostId',
  'INDEX_FILE',
  'parseMarkdown',
  'slugFromTitle',
  'todayLocalDate'
];

// Check each content-workflow export for usage without import
for (const fn of CW_EXPORTS) {
  const regex = new RegExp(`\\b${fn}\\b`);
  const matchAfterImport = scriptCode.slice(scriptCode.indexOf('import {')).match(regex);
  // Find usage after the import block
  const afterImports = scriptCode.slice(scriptCode.indexOf('const config'));
  if (afterImports.match(regex) && !cwUsed.has(fn)) {
    test(`admin.astro imports ${fn} from content-workflow`, () => {
      throw new Error(`${fn} is used in admin.astro but not imported from content-workflow`);
    });
  }
}

// Pass-through — the actual checks run in the loops above
test('all storage exports are imported if used', () => {});

// ---------------------------------------------------------------------------
// 4. CLI scripts — listPosts() return property integrity
// ---------------------------------------------------------------------------
console.log('\n[4] CLI listPosts() return property integrity');

// Known return properties from cli-utils.mjs listPosts()
const POST_PROPS = new Set([
  'file',
  'filePath',
  'markdown',
  'body',
  'data',
  'title',
  'postId',
  'slug',
  'postDir'
]);

// Scripts that consume listPosts() output and reference post.XXX properties
const callerFiles = ['edit-post.mjs', 'update-slug.mjs', 'open-assets.mjs', 'preview-post.mjs'];

// Verify every post.XXX reference in caller scripts is a known return property
for (const callerFile of callerFiles) {
  const callerSrc = readFileSync(resolve(SCRIPTS_DIR, callerFile), 'utf8');
  const postRefs = callerSrc.matchAll(/post\.(\w+)/g);
  for (const ref of postRefs) {
    const prop = ref[1];
    if (!POST_PROPS.has(prop)) {
      // Skip standard Object.prototype properties that may appear as post.xxx
      if (['length', 'name', 'toString'].includes(prop)) continue;

      test(`scripts/${callerFile} references post.${prop}`, () => {
        throw new Error(
          `post.${prop} is referenced in ${callerFile} but listPosts() returns: ${[...POST_PROPS].join(', ')}`
        );
      });
    }
  }
}

// Pass-through — the actual checks run in the loop above
test('listPosts return properties cover all caller references', () => {});

// ---------------------------------------------------------------------------
// 5. site-settings.json validity — ensures config is well-formed and consistent
// ---------------------------------------------------------------------------
console.log('\n[5] site-settings.json validity');

// Absolute path to the settings file
const settingsPath = resolve(root, 'src/site-settings.json');
// Parse the JSON (will throw if invalid)
const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));

// Pass-through — JSON.parse above already validates syntax
test('site-settings.json is valid JSON', () => {});

// Verify all required top-level keys exist
test('has required top-level keys', () => {
  const required = ['defaultLocale', 'supportedLocales', 'copy', 'theme'];
  const missing = required.filter((k) => !(k in settings));
  if (missing.length) throw new Error(`Missing keys: ${missing.join(', ')}`);
});

// Both English and Chinese copy objects must be present
test('copy has en and zh-CN locales', () => {
  if (!settings.copy?.en) throw new Error('Missing copy.en');
  if (!settings.copy?.['zh-CN']) throw new Error('Missing copy["zh-CN"]');
});

// Recursively collects all dot-separated keys from a nested object
function collectKeys(obj, prefix = '') {
  const keys = new Set();
  for (const [key, val] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    keys.add(full);
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      for (const sub of collectKeys(val, full)) {
        keys.add(sub);
      }
    }
  }
  return keys;
}

// Ensure both locales have the exact same key structure (no drift)
test('both locales have matching key structure', () => {
  const enKeys = collectKeys(settings.copy.en);
  const zhKeys = collectKeys(settings.copy['zh-CN']);
  const enOnly = [...enKeys].filter((k) => !zhKeys.has(k));
  const zhOnly = [...zhKeys].filter((k) => !enKeys.has(k));
  const mismatches = [];
  if (enOnly.length) mismatches.push(`en-only: ${enOnly.join(', ')}`);
  if (zhOnly.length) mismatches.push(`zh-CN-only: ${zhOnly.join(', ')}`);
  if (mismatches.length) throw new Error(mismatches.join('; '));
});

// The default locale must be listed in supportedLocales
test('supportedLocales includes defaultLocale', () => {
  if (!settings.supportedLocales?.includes(settings.defaultLocale)) {
    throw new Error(`defaultLocale "${settings.defaultLocale}" not in supportedLocales`);
  }
});

// ---------------------------------------------------------------------------
// 6. README parity — warns if English and Chinese READMEs have diverged
// ---------------------------------------------------------------------------
console.log('\n[6] README parity');

// Read both language versions of the README
const readmeEn = readFileSync(resolve(root, 'README.md'), 'utf8');
const readmeZh = readFileSync(resolve(root, 'README.zh-CN.md'), 'utf8');
// Line counts for each
const enLines = readmeEn.split('\n').length;
const zhLines = readmeZh.split('\n').length;
// Absolute difference and percentage divergence
const diff = Math.abs(enLines - zhLines);
const pct = Math.round((diff / Math.max(enLines, zhLines)) * 100);

// Fail if line counts differ by more than 10%
test(`README line counts similar (en: ${enLines}, zh: ${zhLines}, diff: ${diff}, ${pct}%)`, () => {
  if (pct > 10) throw new Error(`README files diverged by ${pct}% — they should be kept in sync`);
});

// ---------------------------------------------------------------------------
// Results — print summary and exit with appropriate code
// ---------------------------------------------------------------------------
console.log(`\nResults: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
  process.exit(1);
}
