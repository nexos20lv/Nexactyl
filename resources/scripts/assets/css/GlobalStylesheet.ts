import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';
// @ts-expect-error untyped font file
import font from '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2';

export default createGlobalStyle`
    :root, [data-theme="violet"] {
        --spring-settle: cubic-bezier(0.16, 1, 0.3, 1);
        --spring-snappy: cubic-bezier(0.2, 0.8, 0.2, 1);
        --liquid-glass-bg: rgba(14, 12, 24, 0.82);
        --liquid-glass-border: rgba(255, 255, 255, 0.08);
        --liquid-glass-blur: blur(24px) saturate(160%);
        --accent-primary: #8b5cf6;
        --accent-secondary: #7c3aed;
        --accent-light: #c084fc;
        --accent-ring: rgba(139, 92, 246, 0.45);
        --accent-subtle: rgba(139, 92, 246, 0.15);
        --accent-glow: 0 0 20px rgba(139, 92, 246, 0.35);
        --accent-gradient: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
    }

    [data-theme="azure"] {
        --accent-primary: #38bdf8;
        --accent-secondary: #0284c7;
        --accent-light: #7dd3fc;
        --accent-ring: rgba(56, 189, 248, 0.45);
        --accent-subtle: rgba(56, 189, 248, 0.15);
        --accent-glow: 0 0 20px rgba(56, 189, 248, 0.35);
        --accent-gradient: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
    }

    [data-theme="emerald"] {
        --accent-primary: #34d399;
        --accent-secondary: #059669;
        --accent-light: #6ee7b7;
        --accent-ring: rgba(52, 211, 153, 0.45);
        --accent-subtle: rgba(52, 211, 153, 0.15);
        --accent-glow: 0 0 20px rgba(52, 211, 153, 0.35);
        --accent-gradient: linear-gradient(135deg, #34d399 0%, #059669 100%);
    }

    [data-theme="crimson"] {
        --accent-primary: #f43f5e;
        --accent-secondary: #e11d48;
        --accent-light: #fda4af;
        --accent-ring: rgba(244, 63, 94, 0.45);
        --accent-subtle: rgba(244, 63, 94, 0.15);
        --accent-glow: 0 0 20px rgba(244, 63, 94, 0.35);
        --accent-gradient: linear-gradient(135deg, #fb7185 0%, #e11d48 100%);
    }

    [data-theme="amber"] {
        --accent-primary: #fbbf24;
        --accent-secondary: #d97706;
        --accent-light: #fde68a;
        --accent-ring: rgba(251, 191, 36, 0.45);
        --accent-subtle: rgba(251, 191, 36, 0.15);
        --accent-glow: 0 0 20px rgba(251, 191, 36, 0.35);
        --accent-gradient: linear-gradient(135deg, #fcd34d 0%, #d97706 100%);
    }

    [data-theme="fuchsia"] {
        --accent-primary: #e879f9;
        --accent-secondary: #c026d3;
        --accent-light: #f0abfc;
        --accent-ring: rgba(232, 121, 249, 0.45);
        --accent-subtle: rgba(232, 121, 249, 0.15);
        --accent-glow: 0 0 20px rgba(232, 121, 249, 0.35);
        --accent-gradient: linear-gradient(135deg, #f472b6 0%, #c026d3 100%);
    }

    @font-face {
        font-family: 'IBM Plex Sans';
        font-style: normal;
        font-display: swap;
        font-weight: 100 700;
        src: url(${font}) format('woff2-variations');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    * {
        -webkit-tap-highlight-color: transparent;
    }

    body {
        ${tw`font-sans bg-black text-neutral-200`};
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "IBM Plex Sans", system-ui, sans-serif;
        letter-spacing: -0.011em;
        background-color: #07060a;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    h1, h2, h3, h4, h5, h6 {
        ${tw`font-semibold font-header`};
        letter-spacing: -0.018em;
    }

    p {
        ${tw`text-neutral-200 leading-snug font-sans`};
    }

    form {
        ${tw`m-0`};
    }

    textarea, select, input, button, button:focus, button:focus-visible {
        ${tw`outline-none`};
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield !important;
    }

    ::selection {
        background: var(--accent-ring);
        color: #ffffff;
    }

    /* Apple HIG Sleek Scrollbar */
    ::-webkit-scrollbar {
        background: transparent;
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background-color: var(--accent-ring);
        border-radius: 9999px;
        border: 2px solid transparent;
        background-clip: padding-box;
        transition: background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: var(--accent-primary);
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }

    /* Apple Fluid Spring Feedback Classes */
    .apple-glass {
        background: var(--liquid-glass-bg);
        backdrop-filter: var(--liquid-glass-blur);
        -webkit-backdrop-filter: var(--liquid-glass-blur);
        border: 1px solid var(--liquid-glass-border);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    .apple-card {
        background: #0d0b16;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 1rem;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .apple-card:hover {
        border-color: var(--accent-ring);
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), var(--accent-glow);
    }

    .apple-card:active {
        transform: scale(0.99) translateY(0);
        transition-duration: 0.1s;
    }
`;
