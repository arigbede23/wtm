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
      // Custom "brand" color palette — defaults to crimson red (#C8102E).
      // Each shade reads from a CSS variable (--brand-*) set by useLocalTeam,
      // falling back to the default hex when no local team is detected.
      colors: {
        brand: {
          50: "var(--brand-50, #fef2f2)",
          100: "var(--brand-100, #fde3e3)",
          200: "var(--brand-200, #fccaca)",
          300: "var(--brand-300, #f9a3a3)",
          400: "var(--brand-400, #f46b6b)",
          500: "var(--brand-500, #e83a3a)",
          600: "var(--brand-600, #C8102E)",
          700: "var(--brand-700, #a80d26)",
          800: "var(--brand-800, #8c0f22)",
          900: "var(--brand-900, #751222)",
          950: "var(--brand-950, #40050e)",
        },
      },

      // Set Outfit as the default sans-serif font.
      // var(--font-outfit) is set by next/font in layout.tsx.
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },

  // Plugins add extra utility classes. tailwindcss-animate adds classes for
  // CSS animations (fade-in, slide-in, etc.) used by shadcn/ui components.
  plugins: [require("tailwindcss-animate")],
};
export default config;
