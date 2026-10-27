/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          primary: '#6C4CF1',
          'primary-hover': '#5E3EE3',
          deep: '#5035C9',
          accent: '#4285F4',
          bg: '#F7F8FC',
          card: '#FFFFFF',
          text: '#182033',
          muted: '#778198',
          subtle: '#9AA4BC',
          border: '#E8EAF2',
          borderLight: '#F0F2F7',
          success: '#10B981',
          'success-bg': '#ECFDF5',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          danger: '#EF4444',
          'danger-bg': '#FEF2F2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px 0 rgba(24, 32, 51, 0.04), 0 1px 3px 0 rgba(24, 32, 51, 0.02)',
        'card-hover': '0 8px 24px 0 rgba(108, 76, 241, 0.08), 0 2px 6px 0 rgba(24, 32, 51, 0.04)',
        'modal': '0 20px 40px -10px rgba(24, 32, 51, 0.15)',
      }
    },
  },
  plugins: [],
}
