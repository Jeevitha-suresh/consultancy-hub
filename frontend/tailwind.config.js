/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* ── Consultancy Hub Green Palette ── */
        hub: {
          50:  '#f0fdf4',
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
        sidebar: {
          DEFAULT: '#0d4f3f',
          mid:     '#0f5c4a',
          deep:    '#064e3b',
          text:    '#6ee7b7',
          muted:   '#a7f3d0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "1rem",
        '2xl': "1.25rem",
        '3xl': "1.5rem",
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
        'sidebar': 'inset -1px 0 0 rgba(255,255,255,0.08)',
        'green':  '0 4px 14px rgba(16,185,129,0.3)',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, #0d4f3f 0%, #0f5c4a 45%, #064e3b 100%)',
        'banner-gradient': 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
        'card-gradient': 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      },
      animation: {
        'slide-in':    'slide-in-right 0.3s ease-out',
        'slide-up':    'slide-in-up 0.35s ease-out',
        'fade-in':     'fade-in 0.25s ease-out',
        'pulse-green': 'pulse-green 2s infinite',
        'shimmer':     'shimmer 1.5s infinite',
        'spin-slow':   'spin 2s linear infinite',
      },
      keyframes: {
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(1.5rem)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(1rem)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
          '70%':      { boxShadow: '0 0 0 8px rgba(16,185,129,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
