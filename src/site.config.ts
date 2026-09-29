// Single source of truth for all user-facing site settings
import siteSettings from '../.config/site-settings.json';
import { frontmatter as siteCopy } from '../INTERFACE.md';

// Re-export the full settings object for direct access by consumers
export const siteConfig = siteSettings;

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

export const activeLocale = 'en';
export const copy = siteCopy as SiteCopy;
export const contentDefaults = copy.contentDefaults;
export const dateLocale = 'en-US';
