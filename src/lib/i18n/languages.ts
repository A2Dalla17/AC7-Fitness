/** All selectable languages — full UI translations */
export const PINNED_LANGUAGES = [
  { code: 'so', label: 'Somali' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
] as const;

export const OTHER_LANGUAGES = [
  { code: 'zh', label: 'Chinese' },
  { code: 'nl', label: 'Dutch' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'es', label: 'Spanish' },
  { code: 'sw', label: 'Swahili' },
  { code: 'tr', label: 'Turkish' },
] as const;

export const ALL_LANGUAGES = [...PINNED_LANGUAGES, ...OTHER_LANGUAGES] as const;

export type LangCode = (typeof ALL_LANGUAGES)[number]['code'];

const CODE_SET = new Set<string>(ALL_LANGUAGES.map((l) => l.code));

export function isLangCode(code: string): code is LangCode {
  return CODE_SET.has(code);
}

export function languageLabel(code: string): string {
  return ALL_LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();
}
