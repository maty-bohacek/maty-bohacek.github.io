import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Green primary - kept from original
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Accent colors
        accent: {
          red: '#ef4444',
          orange: '#f97316',
          yellow: '#eab308',
          blue: '#3b82f6',
          pink: '#ec4899',
          purple: '#8b5cf6',
        },
        // Softer neutral tones
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#353535',
          900: '#1a1a1a',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Charter', 'Georgia', 'Times New Roman', 'serif'],
        display: ['Charter', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['Fira Code', 'Consolas', 'monospace'],
        ui: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '800' }],
        'display-lg': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '800' }],
        'display-md': ['2rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '800' }],
        'display-sm': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '800' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      gridTemplateColumns: {
        'auto-fit-sm': 'repeat(auto-fit, minmax(200px, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(280px, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(350px, 1fr))',
      },
    },
  },
  plugins: [],
};

export default config;
