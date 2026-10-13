import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-xl no-underline text-neutral-200 items-center bg-neutral-900/90 p-4 border border-violet-500/20 shadow-md transition-all duration-200 overflow-hidden`};

    ${(props) => props.$hoverable !== false && tw`hover:border-violet-500/40 hover:bg-neutral-800/80`};

    & .icon {
        ${tw`rounded-xl w-11 h-11 flex items-center justify-center bg-violet-950/40 border border-violet-500/20 p-2 text-violet-400`};
    }
`;
