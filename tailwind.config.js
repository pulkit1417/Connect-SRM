/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        colors: {
            primary: '#2563EB',
            secondary: '#1D4ED8',
            accent: '#0EA5E9',
            background: '#F3F4F6',
            surface: '#FFFFFF',
            text: '#1F2937',
            muted: '#6B7280',
            footer: '#E5E7EB',
        },
        backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        }
    },
},
  plugins: [],
}