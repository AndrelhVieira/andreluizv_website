/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,md,mdx}',
    './components/**/*.{js,ts,jsx,tsx,md,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,md,mdx}',
    './data/**/*.{js,ts,jsx,tsx,md,mdx}',
  ],
  theme: {
    extend: {},
  },
  safelist: [
    'blur-[3px]',
    'blur-[2px]',
    'blur-[1.5px]',
    'blur-[1px]',
    'blur-[0px]',
    'opacity-[90%]',
    'opacity-[80%]',
    'opacity-[70%]',
    'opacity-[60%]',
    'opacity-[50%]',
    'opacity-[40%]',
    'opacity-[30%]',
    'opacity-[20%]',
    'opacity-[10%]',
  ],
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
