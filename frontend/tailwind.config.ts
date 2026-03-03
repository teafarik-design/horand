import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#F3EDFF',
          100: '#EAD8FF',
          200: '#D4B0FF',
          300: '#C990FF',
          400: '#A855F7',
          500: '#9B59FF',
          600: '#7B2FE8',
          700: '#5A1CB8',
          800: '#4A1A94',
          900: '#2A0A5E',
        },
        dark: '#140D26',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        purple: '0 8px 40px rgba(123,47,232,0.15)',
        'purple-lg': '0 20px 80px rgba(123,47,232,0.2)',
      },
    },
  },
  plugins: [],
}
export default config
