import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                red: {
                    primary: "#FF0033", // Vibrant Red for strong contrast against black
                    accent: "#BE123C", // Rose-700
                    dark: "#881337",   // Rose-900
                },
                pink: {
                    hot: "#DB2777" // Pink-600
                },
                background: {
                    main: "#000000", // Pure black
                    card: "#111111", // Very dark gray for cards
                    overlay: "rgba(0,0,0,0.8)",
                },
                text: {
                    primary: "#FFFFFF",
                    secondary: "#D1D5DB", // Gray-300
                    muted: "#9CA3AF", // Gray-400
                },
            },
            backgroundImage: {
                'hero-gradient': "linear-gradient(to bottom, #000000, #111111)",
                'button-gradient': "linear-gradient(to right, #E11D48, #DB2777)", // Red to Pink
            },
            fontFamily: {
                sans: ["var(--font-outfit)", "sans-serif"],
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
