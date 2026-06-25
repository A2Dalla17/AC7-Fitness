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
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        surface: 'var(--color-surface)',
        navy: '#2563EB',
        'navy-deep': '#1D4ED8',
        blue: '#3B82F6',
        glow: '#60A5FA',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        mission: '#2563EB',
        calendar: '#7C3AED',
        chat: '#1e3a8a',
        chatReceived: '#1e293b',
        community: '#2563EB',
        announce: '#0e1a30',
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
