'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { mode, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle light or dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ink"
    >
      {mode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
