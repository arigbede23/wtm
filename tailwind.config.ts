// Tailwind CSS Configuration — customizes the design system (colors, fonts, etc.).
// Tailwind scans your files for class names and generates only the CSS you actually use.
// Docs: https://tailwindcss.com/docs/configuration

import type { Config } from "tailwindcss";

const config: Config = {
  // Dark mode is toggled by adding class="dark" to the <html> element.
  // (The alternative "media" option would follow the OS preference automatically.)
  darkMode: "class",

  // Tell Tailwind which files to scan for class names.
  // It reads these files and generates CSS only for the classes it finds.
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // Custom "brand" color palette — used throughout the app as bg-brand-600,
      // text-brand-600, etc. This is a blue palette inspired by Indigo from
      // Open Color. The main brand color is brand-600 (#4c6ef5).
      colors: {
        brand: {
          50: "#f0f4ff",   // Lightest — used for subtle backgrounds
          100: "#dbe4ff",
          200: "#bac8ff",
          300: "#91a7ff",
          400: "#748ffc",
          500: "#5c7cfa",
          600: "#4c6ef5",  // Primary brand color — buttons, links, accents
          700: "#4263eb",  // Hover state for brand-600
          800: "#3b5bdb",
          900: "#364fc7",  // Darkest — used for pressed/active states
        },
      },

      // Set Inter as the default sans-serif font.
      // var(--font-inter) is set by next/font in layout.tsx.
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },

  // Plugins add extra utility classes. tailwindcss-animate adds classes for
  // CSS animations (fade-in, slide-in, etc.) used by shadcn/ui components.
  plugins: [require("tailwindcss-animate")],
};
export default config;
