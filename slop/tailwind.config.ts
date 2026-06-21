import type { Config } from 'tailwindcss';

// Mirrors the design tokens of matybohacek.com so this app stays visually
// consistent with the main site. The canonical token values live in
// src/app/globals.css (@theme); this file just declares content paths and a
// couple of conveniences for editor tooling.
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Charter', 'Georgia', 'Times New Roman', 'serif'],
        display: ['Charter', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['Fira Code', 'Consolas', 'monospace'],
        ui: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
