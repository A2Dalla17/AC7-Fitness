'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Mode = 'dark' | 'light';

interface ThemeContextValue {
  mode: Mode;
  toggle: () => void;
  setMode: (m: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('dark');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('ac7-theme')) as Mode | null;
    if (saved === 'light' || saved === 'dark') setModeState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = mode;
    localStorage.setItem('ac7-theme', mode);
  }, [mode]);

  const setMode = (m: Mode) => setModeState(m);
  const toggle = () => setModeState((m) => (m === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ mode, toggle, setMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
