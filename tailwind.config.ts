import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#e6fafd',
          100: '#b3f0f8',
          500: '#00B8D4',
          600: '#0091EA',
          700: '#0288D1',
          900: '#01579B',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '72ch',
            color: 'rgba(255,255,255,0.85)',
            a: { color: '#00B8D4', textDecoration: 'underline' },
            h1: { color: '#ffffff' },
            h2: { color: '#ffffff' },
            h3: { color: '#ffffff' },
            h4: { color: '#ffffff' },
            strong: { color: '#ffffff' },
            code: { color: '#00B8D4', backgroundColor: 'rgba(0,184,212,0.1)', padding: '0.2em 0.4em', borderRadius: '0.25rem' },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: { backgroundColor: 'rgba(0,0,0,0.5)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)' },
            blockquote: { color: 'rgba(255,255,255,0.6)', borderLeftColor: '#00B8D4' },
            hr: { borderColor: 'rgba(255,255,255,0.1)' },
            th: { color: '#ffffff' },
            td: { color: 'rgba(255,255,255,0.8)' },
            li: { color: 'rgba(255,255,255,0.85)' },
            'ul > li::marker': { color: '#00B8D4' },
            'ol > li::marker': { color: '#00B8D4' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
