import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { argv, stdin as input, stdout as output, exit } from 'node:process';

// Project root directory
const root = process.cwd();
// Path to the single source-of-truth site settings file
const settingsPath = path.join(root, 'src/site-settings.json');

// Print usage help for the direct (non-interactive) mode
function usage() {
  console.log(`Usage:
  npm run site-config                        interactive menu
  npm run site-config -- --show              print current settings
  npm run site-config -- --lang zh-CN        set default language
  npm run site-config -- --bg-header URL     set header background image
  npm run site-config -- --bg-body URL       set body background image
  npm run site-config -- --bg-site URL       set site background image
  npm run site-config -- --font-family FONT  set body font family
  `);
  exit(0);
}

// Load and parse the site-settings.json file
async function loadSettings() {
  try {
    const raw = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Could not read site-settings.json: ${error.message}`);
    exit(1);
  }
}

// Write settings back to disk with pretty-printing
async function saveSettings(settings) {
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log('Saved to src/site-settings.json');
}

// Pretty-print current settings to stdout (used by --show)
function display(settings) {
  console.log(JSON.stringify(settings, null, 2));
}

// Prompt the user for input with an optional default value
async function ask(question, defaultValue = '') {
  const rl = readline.createInterface({ input, output });
  const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  const answer = await rl.question(prompt);
  rl.close();
  return answer.trim() || defaultValue;
}

// Interactive numbered menu for editing settings one field at a time
async function interactiveMenu(settings) {
  console.log('\nSite Settings\n');

  // Extract all current values with safe fallbacks
  const lang = settings.defaultLocale;
  const en = settings.copy?.en?.site || {};
  const zh = settings.copy?.['zh-CN']?.site || {};
  const enHome = settings.copy?.en?.home || {};
  const zhHome = settings.copy?.['zh-CN']?.home || {};
  const enSidebar = settings.copy?.en?.sidebar || {};
  const zhSidebar = settings.copy?.['zh-CN']?.sidebar || {};
  const enAdmin = settings.copy?.en?.admin || {};
  const zhAdmin = settings.copy?.['zh-CN']?.admin || {};
  const theme = settings.theme || {};
  const t = theme.typography || {};

  // Display numbered menu of all editable settings
  console.log(` 1. Language         : ${lang}`);
  console.log(` 2. Title (en)       : ${en.title}`);
  console.log(` 3. Description (en) : ${en.description}`);
  console.log(` 4. Footer (en)      : ${en.footer}`);
  console.log(` 5. Title (zh-CN)    : ${zh.title}`);
  console.log(` 6. Description (zh-CN): ${zh.description}`);
  console.log(` 7. Footer (zh-CN)   : ${zh.footer}`);
  console.log(` 8. Home Notice (en) : ${enHome.notice || '(default)'}`);
  console.log(` 9. Home Notice (zh) : ${zhHome.notice || '(default)'}`);
  console.log(`10. Sidebar About Title (en): ${enSidebar.aboutTitle || '(default)'}`);
  console.log(`11. Sidebar About Text (en) : ${enSidebar.aboutText || '(default)'}`);
  console.log(`12. Sidebar About Title (zh): ${zhSidebar.aboutTitle || '(default)'}`);
  console.log(`13. Sidebar About Text (zh) : ${zhSidebar.aboutText || '(default)'}`);
  console.log(`14. Admin Intro (en)  : ${enAdmin.intro || '(default)'}`);
  console.log(`15. Admin Intro (zh)  : ${zhAdmin.intro || '(default)'}`);
  console.log(`16. Body BG Image     : ${theme.bodyBackgroundImage || '(none)'}`);
  console.log(`17. Header BG Image   : ${theme.headerBackgroundImage || '(none)'}`);
  console.log(`18. Site BG Image     : ${theme.siteBackgroundImage || '(none)'}`);
  console.log(`19. Header Text Color   : ${theme.headerTextColor || '(default)'}`);
  console.log(`20. Header Desc Color   : ${theme.headerDescriptionColor || '(default)'}`);
  console.log(`21. Header Min Height   : ${theme.headerMinHeight || '(default)'}`);
  console.log(`22. Font Family     : ${t.fontFamily || '(default)'}`);
  console.log(`23. Base Font Size  : ${t.baseFontSize || '(default)'}`);
  console.log(`24. Line Height     : ${t.lineHeight || '(default)'}`);
  console.log(`25. Heading Font    : ${t.headingFontFamily || '(default)'}`);
  console.log(`26. Heading Weight  : ${t.headingFontWeight || '(default)'}`);
  console.log(`27. Code Font       : ${t.codeFontFamily || '(default)'}`);
  console.log('');

  const choice = await ask('Enter number to change (or Enter to quit)');
  if (!choice) return;

  const num = Number(choice);
  let value;

  // Map each number to its settings path and prompt for new value
  switch (num) {
    case 1:
      value = await ask('Language code', lang);
      if (value) settings.defaultLocale = value;
      break;
    case 2:
      value = await ask('Title (en)', en.title);
      settings.copy.en.site.title = value;
      break;
    case 3:
      value = await ask('Description (en)', en.description);
      settings.copy.en.site.description = value;
      break;
    case 4:
      value = await ask('Footer (en)', en.footer);
      settings.copy.en.site.footer = value;
      break;
    case 5:
      value = await ask('Title (zh-CN)', zh.title);
      // Lazily initialize zh-CN copy if it doesn't exist
      if (!settings.copy['zh-CN']) settings.copy['zh-CN'] = { site: { title: '', description: '', footer: '' } };
      settings.copy['zh-CN'].site.title = value;
      break;
    case 6:
      value = await ask('Description (zh-CN)', zh.description);
      if (!settings.copy['zh-CN']) settings.copy['zh-CN'] = { site: { title: '', description: '', footer: '' } };
      settings.copy['zh-CN'].site.description = value;
      break;
    case 7:
      value = await ask('Footer (zh-CN)', zh.footer);
      if (!settings.copy['zh-CN']) settings.copy['zh-CN'] = { site: { title: '', description: '', footer: '' } };
      settings.copy['zh-CN'].site.footer = value;
      break;
    case 8:
      value = await ask('Home Notice (en) — empty to hide', enHome.notice);
      settings.copy.en.home.notice = value;
      break;
    case 9:
      value = await ask('Home Notice (zh-CN) — empty to hide', zhHome.notice);
      if (settings.copy['zh-CN']) settings.copy['zh-CN'].home.notice = value;
      break;
    case 10:
      value = await ask('Sidebar About Title (en)', enSidebar.aboutTitle);
      settings.copy.en.sidebar.aboutTitle = value;
      break;
    case 11:
      value = await ask('Sidebar About Text (en)', enSidebar.aboutText);
      settings.copy.en.sidebar.aboutText = value;
      break;
    case 12:
      value = await ask('Sidebar About Title (zh-CN)', zhSidebar.aboutTitle);
      if (settings.copy['zh-CN']) settings.copy['zh-CN'].sidebar.aboutTitle = value;
      break;
    case 13:
      value = await ask('Sidebar About Text (zh-CN)', zhSidebar.aboutText);
      if (settings.copy['zh-CN']) settings.copy['zh-CN'].sidebar.aboutText = value;
      break;
    case 14:
      value = await ask('Admin Intro (en) — empty to hide', enAdmin.intro);
      settings.copy.en.admin.intro = value;
      break;
    case 15:
      value = await ask('Admin Intro (zh-CN) — empty to hide', zhAdmin.intro);
      if (settings.copy['zh-CN']) settings.copy['zh-CN'].admin.intro = value;
      break;
    case 16:
      value = await ask('Body background image path', theme.bodyBackgroundImage);
      settings.theme.bodyBackgroundImage = value || '';
      break;
    case 17:
      value = await ask('Header background image path', theme.headerBackgroundImage);
      settings.theme.headerBackgroundImage = value || '';
      break;
    case 18:
      value = await ask('Site background image path', theme.siteBackgroundImage);
      settings.theme.siteBackgroundImage = value || '';
      break;
    case 19:
      value = await ask('Header text color', theme.headerTextColor || '#111111');
      settings.theme.headerTextColor = value || '';
      break;
    case 20:
      value = await ask('Header description color', theme.headerDescriptionColor || '#555555');
      settings.theme.headerDescriptionColor = value || '';
      break;
    case 21:
      value = await ask('Header min height', theme.headerMinHeight || '120px');
      settings.theme.headerMinHeight = value || '';
      break;
    case 22:
      value = await ask('Font family', t.fontFamily);
      settings.theme.typography.fontFamily = value || '';
      break;
    case 23:
      value = await ask('Base font size', t.baseFontSize);
      settings.theme.typography.baseFontSize = value || '';
      break;
    case 24:
      value = await ask('Line height', t.lineHeight);
      settings.theme.typography.lineHeight = value || '';
      break;
    case 25:
      value = await ask('Heading font family', t.headingFontFamily);
      settings.theme.typography.headingFontFamily = value || '';
      break;
    case 26:
      value = await ask('Heading font weight', t.headingFontWeight);
      settings.theme.typography.headingFontWeight = value || '';
      break;
    case 27:
      value = await ask('Code font family', t.codeFontFamily);
      settings.theme.typography.codeFontFamily = value || '';
      break;
    default:
      console.log('Invalid choice.');
      return;
  }

  await saveSettings(settings);
}

// Direct (non-interactive) mode: parse --flag value pairs from CLI args
function parseDirectArgs(args) {
  const settings = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    // Each --flag consumes the next argument as its value
    if (arg === '--lang') settings.defaultLocale = args[++i];
    else if (arg === '--bg-body') settings.bodyBackgroundImage = args[++i];
    else if (arg === '--bg-header') settings.headerBackgroundImage = args[++i];
    else if (arg === '--bg-site') settings.siteBackgroundImage = args[++i];
    else if (arg === '--header-text-color') settings.headerTextColor = args[++i];
    else if (arg === '--header-desc-color') settings.headerDescriptionColor = args[++i];
    else if (arg === '--header-height') settings.headerMinHeight = args[++i];
    else if (arg === '--font-family') settings.fontFamily = args[++i];
    else if (arg === '--base-font-size') settings.baseFontSize = args[++i];
    else if (arg === '--line-height') settings.lineHeight = args[++i];
    else if (arg === '--heading-font') settings.headingFontFamily = args[++i];
    else if (arg === '--heading-weight') settings.headingFontWeight = args[++i];
    else if (arg === '--code-font') settings.codeFontFamily = args[++i];
    else if (arg === '--title-en') settings.titleEn = args[++i];
    else if (arg === '--desc-en') settings.descEn = args[++i];
    else if (arg === '--footer-en') settings.footerEn = args[++i];
    else if (arg === '--title-zh') settings.titleZh = args[++i];
    else if (arg === '--desc-zh') settings.descZh = args[++i];
    else if (arg === '--footer-zh') settings.footerZh = args[++i];
    else if (arg === '--notice-en') settings.noticeEn = args[++i];
    else if (arg === '--notice-zh') settings.noticeZh = args[++i];
    else if (arg === '--sidebar-title-en') settings.sidebarTitleEn = args[++i];
    else if (arg === '--sidebar-title-zh') settings.sidebarTitleZh = args[++i];
    else if (arg === '--sidebar-text-en') settings.sidebarTextEn = args[++i];
    else if (arg === '--sidebar-text-zh') settings.sidebarTextZh = args[++i];
    else if (arg === '--admin-intro-en') settings.adminIntroEn = args[++i];
    else if (arg === '--admin-intro-zh') settings.adminIntroZh = args[++i];
    else if (arg === '--admin-root-help-en') settings.adminRootHelpEn = args[++i];
    else if (arg === '--admin-root-help-zh') settings.adminRootHelpZh = args[++i];
    else if (arg === '--admin-asset-hint-en') settings.adminAssetHintEn = args[++i];
    else if (arg === '--admin-asset-hint-zh') settings.adminAssetHintZh = args[++i];
    else if (arg === '--help' || arg === '-h') usage();
    else if (arg === '--show') settings.show = true;
  }
  return settings;
}

// Write parsed direct-mode values into the full settings object
function applyDirectChanges(settings, direct) {
  if (direct.defaultLocale) settings.defaultLocale = direct.defaultLocale;
  if (direct.bodyBackgroundImage !== undefined) settings.theme.bodyBackgroundImage = direct.bodyBackgroundImage;
  if (direct.headerBackgroundImage !== undefined) settings.theme.headerBackgroundImage = direct.headerBackgroundImage;
  if (direct.siteBackgroundImage !== undefined) settings.theme.siteBackgroundImage = direct.siteBackgroundImage;
  if (direct.headerTextColor !== undefined) settings.theme.headerTextColor = direct.headerTextColor;
  if (direct.headerDescriptionColor !== undefined) settings.theme.headerDescriptionColor = direct.headerDescriptionColor;
  if (direct.headerMinHeight !== undefined) settings.theme.headerMinHeight = direct.headerMinHeight;
  if (direct.fontFamily !== undefined) settings.theme.typography.fontFamily = direct.fontFamily;
  if (direct.baseFontSize !== undefined) settings.theme.typography.baseFontSize = direct.baseFontSize;
  if (direct.lineHeight !== undefined) settings.theme.typography.lineHeight = direct.lineHeight;
  if (direct.headingFontFamily !== undefined) settings.theme.typography.headingFontFamily = direct.headingFontFamily;
  if (direct.headingFontWeight !== undefined) settings.theme.typography.headingFontWeight = direct.headingFontWeight;
  if (direct.codeFontFamily !== undefined) settings.theme.typography.codeFontFamily = direct.codeFontFamily;
  if (direct.titleEn !== undefined) settings.copy.en.site.title = direct.titleEn;
  if (direct.descEn !== undefined) settings.copy.en.site.description = direct.descEn;
  if (direct.footerEn !== undefined) settings.copy.en.site.footer = direct.footerEn;
  if (direct.titleZh !== undefined && settings.copy['zh-CN']) settings.copy['zh-CN'].site.title = direct.titleZh;
  if (direct.descZh !== undefined && settings.copy['zh-CN']) settings.copy['zh-CN'].site.description = direct.descZh;
  if (direct.footerZh !== undefined && settings.copy['zh-CN']) settings.copy['zh-CN'].site.footer = direct.footerZh;
  if (direct.noticeEn !== undefined) settings.copy.en.home.notice = direct.noticeEn;
  if (direct.noticeZh !== undefined && settings.copy['zh-CN']) settings.copy['zh-CN'].home.notice = direct.noticeZh;
  if (direct.sidebarTitleEn !== undefined) settings.copy.en.sidebar.aboutTitle = direct.sidebarTitleEn;
  if (direct.sidebarTitleZh !== undefined && settings.copy['zh-CN']) settings.copy['zh-CN'].sidebar.aboutTitle = direct.sidebarTitleZh;
  if (direct.sidebarTextEn !== undefined) settings.copy.en.sidebar.aboutText = direct.sidebarTextEn;
  if (direct.sidebarTextZh !== undefined && settings.copy['zh-CN']) settings.copy['zh-CN'].sidebar.aboutText = direct.sidebarTextZh;
  if (direct.adminIntroEn !== undefined) settings.copy.en.admin.intro = direct.adminIntroEn;
  if (direct.adminIntroZh !== undefined && settings.copy['zh-CN']) settings.copy['zh-CN'].admin.intro = direct.adminIntroZh;
  if (direct.adminRootHelpEn !== undefined) settings.copy.en.admin.rootHelp = direct.adminRootHelpEn;
  if (direct.adminRootHelpZh !== undefined && settings.copy['zh-CN']) settings.copy['zh-CN'].admin.rootHelp = direct.adminRootHelpZh;
  if (direct.adminAssetHintEn !== undefined) settings.copy.en.admin.assetHintBeforePost = direct.adminAssetHintEn;
  if (direct.adminAssetHintZh !== undefined && settings.copy['zh-CN']) settings.copy['zh-CN'].admin.assetHintBeforePost = direct.adminAssetHintZh;
}

// Main entry point: no args = interactive menu, with args = direct mode
async function main() {
  const args = argv.slice(2);
  const settings = await loadSettings();

  // No arguments: launch interactive menu
  if (args.length === 0) {
    await interactiveMenu(settings);
    return;
  }

  const direct = parseDirectArgs(args);

  // --show: display current settings and exit
  if (direct.show) {
    display(settings);
    return;
  }

  // Apply parsed --flag values and save
  applyDirectChanges(settings, direct);
  await saveSettings(settings);
}

main().catch((error) => {
  console.error(error.message);
  exit(1);
});
