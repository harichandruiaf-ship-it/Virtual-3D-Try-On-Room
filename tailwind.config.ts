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
        room: {
          bg: '#0f0f12',
          surface: '#18181c',
          border: '#27272a',
          accent: '#a78bfa',
          muted: '#71717a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
