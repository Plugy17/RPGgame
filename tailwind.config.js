/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT:'#f59e0b', 50:'#fffbeb', 100:'#fef3c7', 200:'#fde68a', 300:'#fcd34d', 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706', 700:'#b45309', 800:'#92400e', 900:'#78350f' },
        secondary: { DEFAULT:'#3b82f6', 50:'#eff6ff', 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd', 400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8', 800:'#1e40af', 900:'#1e3a8a' },
        accent:    { DEFAULT:'#10b981', 50:'#ecfdf5', 100:'#d1fae5', 200:'#a7f3d0', 300:'#6ee7b7', 400:'#34d399', 500:'#10b981', 600:'#059669', 700:'#047857', 800:'#065f46', 900:'#064e3b' },
        success:   { DEFAULT:'#22c55e', 500:'#22c55e', 600:'#16a34a' },
        warning:   { DEFAULT:'#f59e0b', 500:'#f59e0b', 600:'#d97706' },
        error:     { DEFAULT:'#ef4444', 500:'#ef4444', 600:'#dc2626' },
        dark:      { DEFAULT:'#0d0d1a', 800:'#1a1a2e', 700:'#16213e', 600:'#0f3460', 500:'#1e3a5f' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        almendra: ['Almendra', 'serif'],
      },
    },
  },
  plugins: [],
};
