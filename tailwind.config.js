/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: {
          royal: '#2929D8',
          50: '#eef0ff',
          100: '#dfe3ff',
          200: '#c4cbff',
          300: '#9aa6ff',
          400: '#6b78ff',
          500: '#4169ff',
          600: '#2929D8',
          700: '#1f1fb0',
          800: '#181892',
          900: '#131372',
        },
        electric: {
          400: '#5577ff',
          500: '#4169FF',
          600: '#3255e6',
        },
        coral: {
          50: '#fff1f0',
          100: '#ffe0de',
          200: '#ffc4c1',
          300: '#ff9b96',
          400: '#ff756f',
          500: '#FF5B55',
          600: '#e64a44',
          700: '#c33b36',
        },
        teal: {
          400: '#2dc4b8',
          500: '#13A89E',
          600: '#0f8d84',
        },
        violet: {
          400: '#9b7ced',
          500: '#8257E5',
          600: '#6e45c9',
        },
        midnight: {
          50: '#3a4060',
          100: '#2a3050',
          200: '#1e2440',
          300: '#161b30',
          400: '#101323',
          500: '#0a0d1a',
        },
        slate2: {
          900: '#202A44',
          800: '#2a3656',
        },
        cloud: {
          50: '#F4F6FB',
          100: '#eaeef7',
          200: '#dde3f2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'ui-serif', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(16,19,35,0.08)',
        card: '0 4px 20px -4px rgba(16,19,35,0.10)',
        float: '0 12px 40px -8px rgba(16,19,35,0.22)',
        indigo: '0 8px 24px -6px rgba(41,41,216,0.35)',
        coral: '0 8px 24px -6px rgba(255,91,85,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.28s cubic-bezier(0.16,1,0.3,1)',
        fadeIn: 'fadeIn 0.2s ease-out',
        pop: 'pop 0.2s cubic-bezier(0.16,1,0.3,1)',
        toastIn: 'toastIn 0.25s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
};
