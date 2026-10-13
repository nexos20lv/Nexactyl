import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export interface Props {
    isLight?: boolean;
    hasError?: boolean;
}

const light = css<Props>`
    ${tw`bg-neutral-800/90 border-neutral-700/80 text-white`};
    &:focus {
        ${tw`border-violet-400 ring-2 ring-violet-500/25`}
    }

    &:disabled {
        ${tw`bg-neutral-900 border-neutral-800 text-neutral-500`};
    }
`;

const checkboxStyle = css<Props>`
    ${tw`bg-neutral-800 cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4 text-violet-500 border border-violet-500/30 rounded-md`};
    color-adjust: exact;
    background-origin: border-box;
    transition: all 75ms linear, box-shadow 25ms linear;

    &:checked {
        ${tw`border-transparent bg-violet-600 bg-no-repeat bg-center`};
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
        background-color: currentColor;
        background-size: 100% 100%;
    }

    &:focus {
        ${tw`outline-none border-violet-400`};
        box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.35);
    }
`;

const inputStyle = css<Props>`
    resize: none;
    ${tw`appearance-none outline-none w-full min-w-0`};
    ${tw`p-3 border rounded-xl text-sm transition-all duration-150`};
    ${tw`bg-neutral-900/90 border-neutral-700/60 hover:border-violet-500/40 text-neutral-100 placeholder-neutral-500 shadow-none focus:ring-0`};

    & + .input-help {
        ${tw`mt-1 text-xs`};
        ${(props) => (props.hasError ? tw`text-red-400` : tw`text-neutral-400`)};
    }

    &:required,
    &:invalid {
        ${tw`shadow-none`};
    }

    &:not(:disabled):not(:read-only):focus {
        ${tw`shadow-md border-violet-500 ring-2 ring-violet-500/20`};
        ${(props) => props.hasError && tw`border-red-400 ring-red-500/20`};
    }

    &:disabled {
        ${tw`opacity-60 cursor-not-allowed`};
    }

    ${(props) => props.isLight && light};
    ${(props) => props.hasError && tw`text-red-200 border-red-500/70 hover:border-red-500`};
`;

const Input = styled.input<Props>`
    &:not([type='checkbox']):not([type='radio']) {
        ${inputStyle};
    }

    &[type='checkbox'],
    &[type='radio'] {
        ${checkboxStyle};

        &[type='radio'] {
            ${tw`rounded-full`};
        }
    }
`;
const Textarea = styled.textarea<Props>`
    ${inputStyle}
`;

export { Textarea };
export default Input;
