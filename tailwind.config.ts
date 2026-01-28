import type { Config } from "tailwindcss";
/** @type {import('tailwindcss').Config} */

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        russoone: ["Russo One", "sans-serif"],
        hudson: ["Hudson", "sans-serif"],
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: "#0A0A0A",
        primary: "#90EE90",
        secondary: "#A8A29E",
        variantHover: "#BCFCAD",
        cardBackground: "#121212",
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
};
export default config;
