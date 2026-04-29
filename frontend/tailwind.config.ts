import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Inter', 'sans-serif']
      },
      colors: {
        void: '#000000',
        obsidian: '#0A0A0A',
        cyan: '#00FFCC',
        glitch: '#FF003C',
        violet: '#8A2BE2',
        platinum: '#D8FFF7'
      },
      boxShadow: {
        neon: '0 0 28px rgba(0, 255, 204, 0.35)',
        danger: '0 0 32px rgba(255, 0, 60, 0.42)'
      },
      backgroundImage: {
        'grid-lines':
          'linear-gradient(rgba(0,255,204,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,204,.08) 1px, transparent 1px)'
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        pulseRed: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(255,0,60,.4))' },
          '50%': { filter: 'drop-shadow(0 0 24px rgba(255,0,60,.85))' }
        },
        glitch: {
          '0%, 100%': { textShadow: '2px 0 #00ffcc, -2px 0 #ff003c' },
          '25%': { textShadow: '-3px -1px #8a2be2, 2px 2px #ff003c' },
          '50%': { textShadow: '3px 1px #00ffcc, -1px -2px #8a2be2' },
          '75%': { textShadow: '-2px 2px #ff003c, 3px -1px #00ffcc' }
        }
      },
      animation: {
        scan: 'scan 8s linear infinite',
        pulseRed: 'pulseRed 1.4s ease-in-out infinite',
        glitch: 'glitch 760ms steps(2, end) infinite'
      }
    }
  },
  plugins: []
} satisfies Config
