/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette — deliberately cooler and more editorial than the
        // typical "cream + terracotta" wedding template.
        alabaster: '#FBFAF7', // page base
        linen: '#F1EDE4', // subtle panels / dividers
        ink: '#1C1A17', // primary text (warm near-black)
        stone: '#6E6A63', // secondary text
        gold: '#A68A5B', // restrained antique-gold accent
        'gold-soft': '#C9B38A',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Jost"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.28em', // for the few intentional small-caps labels
        wide2: '0.14em',
      },
      maxWidth: {
        editorial: '68rem',
        prose2: '38rem',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slow-zoom': 'slow-zoom 18s ease-out forwards',
      },
    },
  },
  plugins: [],
};
