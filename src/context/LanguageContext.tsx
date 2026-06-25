'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCopy, isLangCode, type AppCopy, type LangCode } from '@/lib/i18n';

const STORAGE_KEY = 'ac7-lang';

type LanguageContextValue = {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  copy: AppCopy;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isLangCode(saved)) setLangState(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, ready]);

  const setLang = (code: LangCode) => setLangState(code);

  return (
    <LanguageContext.Provider value={{ lang, setLang, copy: getCopy(lang) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

/** Translated copy for the active language */
export function useCopy(): AppCopy {
  return useLanguage().copy;
}

export type { LangCode } from '@/lib/i18n';
