/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Documentary aesthetic - muted, restrained
        background: {
          DEFAULT: '#f8f9fa',
          dark: '#1a1a2e',
        },
        foreground: {
          DEFAULT: '#2c3e50',
          muted: '#7f8c8d',
        },
        primary: {
          DEFAULT: '#2c3e50',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#3498db',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#e67e22',
          foreground: '#ffffff',
        },
        danger: {
          DEFAULT: '#c0392b',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#27ae60',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#ecf0f1',
          foreground: '#7f8c8d',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#2c3e50',
        },
        border: '#bdc3c7',
        // Status-specific colors
        status: {
          daca: '#9b59b6',
          h1b: '#3498db',
          asylum: '#e67e22',
          undocumented: '#c0392b',
          greencard: '#27ae60',
          citizen: '#2ecc71',
          pending: '#f39c12',
        },
        // === V2: Dual Color System ===
        // Life palette (warm) - human moments
        life: {
          bg: '#fefae0',           // Cream
          text: '#3d405b',         // Warm charcoal
          accent: '#d4a373',       // Amber/honey
          secondary: '#e9c46a',    // Warm gold
          muted: '#f5f0e1',        // Soft cream
        },
        // System palette (cold) - bureaucratic moments
        system: {
          bg: '#f8fafc',           // Clinical white
          text: '#0f172a',         // Cold black
          accent: '#64748b',       // Slate
          secondary: '#94a3b8',    // Light slate
          danger: '#dc2626',       // Bureaucratic red
          muted: '#e2e8f0',        // Cool gray
        },
        // Character signature colors
        character: {
          maria: '#c87941',        // Terracotta
          david: '#5a9178',        // Muted jade
          fatima: '#d4a373',       // Rich amber
          elena: '#c9a9a6',        // Warm rose
        },
        // Scene atmosphere colors
        scene: {
          home: '#fef3c7',         // Warm amber
          uscis: '#e2e8f0',        // Steel gray
          work: '#dbeafe',         // Soft blue
          airport: '#374151',      // Dark slate
          court: '#fde68a',        // Amber
          community: '#dcfce7',    // Soft green
          hospital: '#f1f5f9',     // Clinical
          street: '#f3f4f6',       // Neutral
        },
      },
      fontFamily: {
        serif: ['Source Serif Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.75rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-urgent': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scene-fade': 'sceneFade 0.5s ease-in-out',
        'vignette-pulse': 'vignettePulse 2s ease-in-out infinite',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'blink': 'blink 1s step-end infinite',
        'stamp': 'stamp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        sceneFade: {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        vignettePulse: {
          '0%, 100%': { boxShadow: 'inset 0 0 80px rgba(0,0,0,0.3)' },
          '50%': { boxShadow: 'inset 0 0 100px rgba(0,0,0,0.4)' },
        },
        typewriter: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: 'currentColor' },
        },
        stamp: {
          '0%': { transform: 'scale(2) rotate(-15deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(-5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
        '500': '500ms',
      },
    },
  },
  plugins: [],
}
