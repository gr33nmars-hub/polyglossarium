/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'display': ['"Oswald"', 'sans-serif'],
                'mono': ['"JetBrains Mono"', 'monospace'],
                'sans': ['"Inter"', 'sans-serif'],
            },
            colors: {
                black: '#050505',
                white: '#FFFFFF',
            },
            boxShadow: {
                'brutal': '4px 4px 0px 0px #050505',
                'brutal-lg': '8px 8px 0px 0px #050505',
                'brutal-sm': '2px 2px 0px 0px #050505',
            },
            animation: {
                'marquee': 'marquee 25s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            }
        },
    },
    plugins: [],
}
