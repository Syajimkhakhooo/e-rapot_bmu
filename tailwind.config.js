const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "error-container": "#fef2f2",
        "error": "#ef4444",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8fafc",
        "primary": "#0f172a", /* Professional Dark Navy/Slate */
        "on-primary": "#ffffff",
        "primary-container": "#f1f5f9",
        "on-primary-container": "#0f172a",
        "secondary": "#3b82f6", /* Clear Blue Accent */
        "secondary-container": "#eff6ff",
        "on-secondary-container": "#1e3a8a",
        "surface-variant": "#f1f5f9",
        "on-surface-variant": "#64748b",
        "outline-variant": "#e2e8f0",
        "outline": "#cbd5e1",
        "surface-bright": "#ffffff",
        "surface-container-high": "#f1f5f9",
        "background": "#fafafa", /* Very light neutral gray */
        "surface": "#ffffff",
        "on-background": "#0f172a",
        "on-surface": "#0f172a",
        
        border: "var(--outline-variant)",
        input: "var(--outline-variant)",
        ring: "var(--primary)",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        unit: "4px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
        gutter: "24px",
        "container-max": "1280px",
      },
      fontFamily: {
        "headline-lg": ["Geist", "sans-serif"],
        "title-lg": ["Geist", "sans-serif"],
        "label-md": ["Geist", "sans-serif"],
        "body-md": ["Geist", "sans-serif"],
        "body-lg": ["Geist", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"],
        sans: ["Geist", ...fontFamily.sans],
      },
      fontSize: {
        "headline-lg": ["28px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "title-lg": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "label-md": ["13px", { lineHeight: "1", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-lg": ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-md": ["20px", { lineHeight: "1.3", fontWeight: "600" }]
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
