// Single source of truth for all user-facing site settings
import { rawContent } from '../INTERFACE.md';

type SiteCopy = {
  site: { title: string; description: string; footer: string };
  nav: Record<string, string>;
  home: { title: string; empty: string };
  about: {
    title: string;
    paragraphs: string[];
    principlesTitle: string;
    principles: string[];
  };
  sidebar: Record<string, string>;
  labels: Record<string, string>;
  pages: Record<string, string>;
  contentDefaults: { category: string };
};

type SiteSettings = SiteCopy & {
  theme: {
    bodyBackgroundImage: string;
    siteBackgroundImage: string;
    headerBackgroundImage: string;
    headerMinHeight: string;
    headerTextColor: string;
    headerDescriptionColor: string;
    typography: {
      fontFamily: string;
      baseFontSize: string;
      lineHeight: string;
      headingFontFamily: string;
      headingFontWeight: string;
      codeFontFamily: string;
    };
  };
};

const settingsBlocks = [
  ...rawContent().matchAll(
    /^```json site-settings\s*\r?\n([\s\S]*?)^```\s*$/gm,
  ),
];
const settingsBlock = settingsBlocks[0];

if (settingsBlocks.length !== 1 || !settingsBlock) {
  throw new Error(
    'INTERFACE.md must contain exactly one `json site-settings` code block.',
  );
}

const siteSettings = JSON.parse(settingsBlock[1]) as SiteSettings;

// Re-export the full settings object for direct access by consumers.
export const siteConfig = siteSettings;

export const activeLocale = 'en';
export const copy: SiteCopy = siteSettings;
export const contentDefaults = copy.contentDefaults;
export const dateLocale = 'en-US';
