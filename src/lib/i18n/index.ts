import type { AppCopy } from './types';
import { buildLocale } from './buildLocale';
import { LOCALE_STRINGS } from './strings';
import { isLangCode, type LangCode } from './languages';

const COPIES = Object.fromEntries(
  (Object.entries(LOCALE_STRINGS) as [LangCode, (typeof LOCALE_STRINGS)[LangCode]][]).map(
    ([code, strings]) => [code, buildLocale(strings)],
  ),
) as Record<LangCode, AppCopy>;

export function getCopy(lang: string): AppCopy {
  if (isLangCode(lang)) return COPIES[lang];
  return COPIES.en;
}

export const COPY_EN = COPIES.en;
export const COPY_SO = COPIES.so;

export { isLangCode, languageLabel, ALL_LANGUAGES, PINNED_LANGUAGES, OTHER_LANGUAGES } from './languages';
export type { LangCode };
export type { AppCopy };
