'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PINNED_LANGUAGES, OTHER_LANGUAGES } from '@/lib/i18n/languages';

export default function LanguageButton() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 16 });

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const update = () => {
      const r = btnRef.current!.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 8, right: Math.max(8, window.innerWidth - r.right) });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  const menu = open ? (
    <>
      <div className="lang-menu-backdrop" onClick={() => setOpen(false)} aria-hidden />
      <div className="lang-menu-panel" style={{ top: menuPos.top, right: menuPos.right }}>
        {PINNED_LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => {
              setLang(l.code);
              setOpen(false);
            }}
            className="lang-menu-panel__item"
          >
            {l.label}
            {lang === l.code && <Check size={14} className="text-orange-400" />}
          </button>
        ))}
        <div className="lang-menu-panel__divider" />
        {OTHER_LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => {
              setLang(l.code);
              setOpen(false);
            }}
            className="lang-menu-panel__item"
          >
            {l.label}
            {lang === l.code && <Check size={14} className="text-orange-400" />}
          </button>
        ))}
      </div>
    </>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-semibold uppercase text-ink"
      >
        <Globe size={15} /> {lang}
      </button>
      {typeof document !== 'undefined' && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
