// Single source of truth for all user-facing site settings
import siteSettings from '../.config/site-settings.json';

// Re-export the full settings object for direct access by consumers
export const siteConfig = siteSettings;

export type SupportedLocale = 'en' | 'zh-CN';

export const activeLocale = siteConfig.defaultLocale as SupportedLocale;
export const copy = siteConfig.copy[activeLocale];
export const contentDefaults = copy.contentDefaults;
export const dateLocale = siteConfig.dateLocales[activeLocale] ?? activeLocale;
