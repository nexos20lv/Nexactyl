import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-2xl no-underline text-neutral-200 items-center p-4 sm:p-5 shadow-lg overflow-hidden select-none`};
    background: #0d0b16;
    border: 1px solid rgba(255, 255, 255, 0.07);
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease;

    ${(props) =>
        props.$hoverable !== false &&
        `
        &:hover {
            border-color: rgba(139, 92, 246, 0.4);
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.15);
        }

        &:active {
            transform: scale(0.99) translateY(0);
        }
    `};

    & .icon {
        ${tw`rounded-2xl w-12 h-12 flex items-center justify-center p-2.5 flex-shrink-0 mr-4 text-violet-300`};
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%);
        border: 1px solid rgba(139, 92, 246, 0.3);
    }
`;
