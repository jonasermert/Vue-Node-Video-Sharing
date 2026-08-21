module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ffffff',
          100: '#ffffff',
          200: '#f7f7f7',
          300: '#efefef',
          400: '#d9d9d9',
          500: '#111111',
          600: '#0b0b0b',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        neutral: {
          50: '#ffffff',
          100: '#f9f9f9',
          200: '#f1f1f1',
          300: '#e5e5e5',
          400: '#d1d1d1',
          500: '#9b9b9b',
          600: '#6b6b6b',
          700: '#444444',
          800: '#222222',
          900: '#111111',
        }
      },
      fontFamily: {
        sans: ['Mona Sans', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
        display: ['Mona Sans', 'ui-sans-serif']
      }
    },
  },
  plugins: [],
};
