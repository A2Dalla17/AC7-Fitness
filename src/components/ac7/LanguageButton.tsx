'use client';

import { useEffect, useState } from 'react';
import { Globe, Check } from 'lucide-react';

// Pinned first, then common languages in alphabetical order.
const PINNED = [
  { code: 'so', label: 'Somali' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
];
const OTHERS = [
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
];

export default function LanguageButton() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('ac7-lang');
    if (saved) setLang(saved);
  }, []);

  const choose = (code: string) => {
    setLang(code);
    localStorage.setItem('ac7-lang', code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        className="flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-semibold uppercase text-ink"
      >
        <Globe size={15} /> {lang}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-30 max-h-80 w-44 overflow-y-auto rounded-2xl border border-white/10 bg-surface py-1 shadow-xl">
            {PINNED.map((l) => (
              <button
                key={l.code}
                onClick={() => choose(l.code)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-ink/90 hover:bg-navy/10"
              >
                {l.label} {lang === l.code && <Check size={14} className="text-navy" />}
              </button>
            ))}
            <div className="my-1 border-t border-white/10" />
            {OTHERS.map((l) => (
              <button
                key={l.code}
                onClick={() => choose(l.code)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm text-ink/90 hover:bg-navy/10"
              >
                {l.label} {lang === l.code && <Check size={14} className="text-navy" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
