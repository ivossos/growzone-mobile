import { colors } from "./src/styles/colors"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ 
    './src/app/**/*.{ts,tsx}',
  './src/components/**/*.{ts,tsx}',],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      fontFamily: {
        regular: ["Inter-Regular", "sans-serif"],
        medium: ["Inter-Medium", "sans-serif"],
        semibold: ["Inter-SemiBold", "sans-serif"],
      }
    },
  },
  plugins: [],
}

