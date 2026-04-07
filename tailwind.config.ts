import type { Config } from "tailwindcss";

const config: Config = {
  // Try changing this from 'class' to 'selector'
  darkMode: "selector",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Your existing theme extensions...
    },
  },
  plugins: [],
};
export default config;
