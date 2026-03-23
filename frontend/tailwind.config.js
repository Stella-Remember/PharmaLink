/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        'steel-blue':   '#4F7CAC',
        'gunmetal':     '#2E3532',
        'alice-blue':   '#EFF7FF',
        'seagrass':     '#32A287',
        'space-indigo': '#201E50',

        // Dark surfaces
        'dark-base':     '#141318',
        'dark-surface':  '#1C1A2E',
        'dark-card':     '#22203A',
        'dark-elevated': '#2A2845',
        'dark-border':   '#2E2C4A',

        primary: {
          50:  '#EFF7FF',
          100: '#D6EAF8',
          200: '#AED6F1',
          300: '#85C1E9',
          400: '#6AAED6',
          500: '#4F7CAC',
          600: '#3D6A96',
          700: '#2E5580',
          800: '#201E50',
          900: '#16133A',
        },
        accent: {
          50:  '#E8F8F4',
          100: '#C3EDE4',
          200: '#86D9C7',
          300: '#50C5AA',
          400: '#3DAF93',
          500: '#32A287',
          600: '#268A72',
          700: '#1C705C',
          800: '#125546',
          900: '#093B30',
        },
      },
      fontFamily: {
        sans:    ['Numans', 'system-ui', 'sans-serif'],
        display: ['Taviraj', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}