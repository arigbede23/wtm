// PostCSS Configuration — processes your CSS before the browser sees it.
// PostCSS is a tool that transforms CSS using plugins. Two plugins are used here:
//   1. tailwindcss: Turns Tailwind's @tailwind directives into actual CSS utilities
//   2. autoprefixer: Adds vendor prefixes (-webkit-, -moz-) for browser compatibility

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
