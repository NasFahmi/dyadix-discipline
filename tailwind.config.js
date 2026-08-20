/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{html,ts,tsx}',
    './src/**/*.{html,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#020617',
        foreground: '#F8FAFC',
        card: {
          DEFAULT: '#0E1223',
          foreground: '#F8FAFC',
          hover: '#13182E',
        },
        primary: {
          DEFAULT: '#0F172A',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#1E293B',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#22C55E',
          foreground: '#0F172A',
          hover: '#16A34A',
          glow: 'rgba(34, 197, 94, 0.25)',
        },
        muted: {
          DEFAULT: '#1A1E2F',
          foreground: '#94A3B8',
        },
        border: '#334155',
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
          glow: 'rgba(239, 68, 68, 0.25)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#0F172A',
          glow: 'rgba(245, 158, 11, 0.25)',
        },
        info: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
        },
        ring: '#22C55E',
      },
      fontFamily: {
        mono: ['"Fira Code"', 'JetBrains Mono', 'monospace'],
        sans: ['"Fira Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 15px rgba(34, 197, 94, 0.3)',
        'glow-destructive': '0 0 15px rgba(239, 68, 68, 0.3)',
        'glow-warning': '0 0 15px rgba(245, 158, 11, 0.3)',
        'glow-info': '0 0 15px rgba(59, 130, 246, 0.3)',
        'panel': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-slow': 'pulseSlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
