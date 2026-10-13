import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full bg-[#0d0c13] border-b border-white/[0.07] shadow-sm overflow-x-auto`};

    & > div {
        ${tw`flex items-center text-sm mx-auto px-4`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-3 text-neutral-400 font-medium no-underline whitespace-nowrap transition-all duration-150`};

            &:not(:first-of-type) {
                ${tw`ml-1`};
            }

            &:hover {
                ${tw`text-neutral-100`};
            }

            &:active,
            &.active {
                ${tw`text-violet-300 font-semibold`};
                box-shadow: inset 0 -2px ${theme`colors.violet.500`.toString()};
            }
        }
    }
`;

export default SubNavigation;
