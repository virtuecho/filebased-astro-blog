// Single source of truth for all user-facing site settings
import siteSettings from './site-settings.json';

// Re-export the full settings object for direct access by consumers
export const siteConfig = siteSettings;

// Union type of all locales the site supports
export type SupportedLocale = 'en' | 'zh-CN';

// The current default locale (as configured in site-settings.json)
export const activeLocale = siteConfig.defaultLocale as SupportedLocale;
// All UI copy strings for the active locale
export const copy = siteConfig.copy[activeLocale];
// Content defaults (e.g., cover placeholder) for the active locale
export const contentDefaults = copy.contentDefaults;
// Date-locale string for the active locale; falls back to locale code itself
export const dateLocale = siteConfig.dateLocales[activeLocale] ?? activeLocale;

// Returns the full copy object for a given locale (defaults to active)
export function getCopy(locale: SupportedLocale = activeLocale) {
  return siteConfig.copy[locale];
}
