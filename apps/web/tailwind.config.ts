import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(173, 85%, 38%)',
          foreground: 'hsl(0,0%,100%)',
          50: 'hsl(173,85%,96%)',
          100: 'hsl(173,85%,90%)',
          200: 'hsl(173,85%,75%)',
          500: 'hsl(173,85%,38%)',
          600: 'hsl(173,85%,30%)',
          700: 'hsl(173,85%,22%)',
        },
        secondary: {
          DEFAULT: 'hsl(252, 39%, 30%)',
          foreground: 'hsl(0,0%,100%)',
        },
        accent: {
          DEFAULT: 'hsl(42, 100%, 70%)',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        destructive: 'hsl(0, 84%, 60%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        enter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        enter: 'enter 0.4s ease-out forwards',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config;
