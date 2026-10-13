import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-lg no-underline text-neutral-200 items-center bg-neutral-800/80 p-4 border border-white/[0.06] transition-all duration-150 overflow-hidden`};

    ${(props) => props.$hoverable !== false && tw`hover:border-violet-500/40 hover:bg-neutral-800`};

    & .icon {
        ${tw`rounded-lg w-12 h-12 flex items-center justify-center bg-neutral-700/60 p-2 text-violet-400`};
    }
`;
