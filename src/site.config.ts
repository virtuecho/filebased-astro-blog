import siteSettings from './site-settings.json';

export const siteConfig = siteSettings;

export type SupportedLocale = 'en' | 'zh-CN';

export const activeLocale = siteConfig.defaultLocale as SupportedLocale;
export const copy = siteConfig.copy[activeLocale];
export const contentDefaults = copy.contentDefaults;
export const dateLocale = siteConfig.dateLocales[activeLocale] ?? activeLocale;

export function getCopy(locale: SupportedLocale = activeLocale) {
  return siteConfig.copy[locale];
}
