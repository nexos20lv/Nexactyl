import styled from 'styled-components/macro';
import tw from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full bg-[#0a0814]/90 backdrop-blur-md border-b border-white/[0.07] shadow-md overflow-x-auto py-2.5`};

    & > div {
        ${tw`flex items-center gap-1.5 text-xs sm:text-sm mx-auto px-4`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-flex items-center gap-2 py-2 px-3.5 rounded-xl text-neutral-400 font-medium no-underline whitespace-nowrap transition-all duration-150 border border-transparent`};

            &:hover {
                ${tw`text-neutral-200 bg-white/[0.04] border-white/[0.05]`};
            }

            &:active,
            &.active {
                ${tw`text-violet-300 font-semibold bg-violet-600/20 border-violet-500/40 shadow-sm`};
                box-shadow: 0 0 14px rgba(139, 92, 246, 0.22);
            }
        }
    }
`;

export default SubNavigation;
