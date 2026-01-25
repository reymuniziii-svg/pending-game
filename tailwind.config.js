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
        }
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
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
      },
    },
  },
  plugins: [],
}
