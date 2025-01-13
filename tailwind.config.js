// tailwind.config.js
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        keyframes: {
          progress: {
            '0%': { width: '0%' },
            '100%': { width: '100%' }
          }
        },
        animation: {
          progress: 'progress 60s linear infinite'
        }
      }
    },
    plugins: [],
  }