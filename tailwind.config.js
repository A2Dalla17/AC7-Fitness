/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        'bg-secondary': 'var(--color-bg-secondary)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        /* Legacy "navy" → orange accent (no blue CTAs) */
        navy: 'var(--elite-primary)',
        'navy-deep': '#ea580c',
        blue: 'var(--elite-primary)',
        glow: 'var(--elite-glow)',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        mission: 'var(--elite-primary)',
        calendar: '#7C3AED',
        chat: 'var(--color-surface-elevated)',
        chatReceived: 'var(--color-surface-elevated)',
        community: 'var(--elite-primary)',
        announce: 'var(--color-surface)',
      },
      borderRadius: {
        btn: '14px',
        card: '20px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl2: '20px',
      },
      maxWidth: {
        elite: '1440px',
        tablet: '1024px',
      },
      spacing: {
        elite: '24px',
      },
    },
  },
  plugins: [],
};
