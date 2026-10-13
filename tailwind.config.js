const colors = require('tailwindcss/colors');

const obsidianGray = {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#9d96c4',
    500: '#6d6792',
    600: '#2b2640',
    700: '#1c182c',
    800: '#120f1e',
    900: '#0b0914',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#07060a',
                primary: colors.violet,
                gray: obsidianGray,
                neutral: obsidianGray,
                cyan: colors.fuchsia,
                violet: colors.violet,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.600', 'rgba(255, 255, 255, 0.08)'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
