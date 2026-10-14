import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    ${tw`relative inline-flex items-center justify-center rounded-xl p-2 font-semibold text-sm border cursor-pointer select-none`};
    transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, border-color 0.15s ease,
        box-shadow 0.15s ease;

    &:active:not(:disabled) {
        transform: scale(0.97);
        transition-duration: 0.08s;
    }

    ${(props) =>
        ((!props.isSecondary && !props.color) || props.color === 'primary') &&
        css<Props>`
            ${(props) =>
                !props.isSecondary &&
                tw`bg-gradient-to-r from-violet-600 to-violet-700 border-violet-500/40 text-white`};
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 4px 14px rgba(124, 58, 237, 0.35);

            &:hover:not(:disabled) {
                ${tw`from-violet-500 to-violet-600 border-violet-400/50`};
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 6px 18px rgba(124, 58, 237, 0.45);
            }
        `};

    ${(props) =>
        props.color === 'grey' &&
        css`
            ${tw`border-white/[0.08] bg-white/[0.05] text-neutral-200`};
            backdrop-filter: blur(12px);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);

            &:hover:not(:disabled) {
                ${tw`border-violet-500/40 bg-white/[0.09] text-white`};
            }
        `};

    ${(props) =>
        props.color === 'green' &&
        css<Props>`
            ${tw`border-emerald-500/40 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white`};
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(16, 185, 129, 0.35);

            &:hover:not(:disabled) {
                ${tw`from-emerald-500 to-emerald-600 border-emerald-400/50`};
            }
        `};

    ${(props) =>
        props.color === 'red' &&
        css<Props>`
            ${tw`border-rose-500/40 bg-gradient-to-r from-rose-600 to-rose-700 text-white`};
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(244, 63, 94, 0.35);

            &:hover:not(:disabled) {
                ${tw`from-rose-500 to-rose-600 border-rose-400/50`};
            }
        `};

    ${(props) => props.size === 'xsmall' && tw`px-2.5 py-1 text-xs rounded-lg`};
    ${(props) => (!props.size || props.size === 'small') && tw`px-4 py-2 rounded-xl`};
    ${(props) => props.size === 'large' && tw`px-6 py-3 text-base rounded-2xl`};
    ${(props) => props.size === 'xlarge' && tw`p-4 w-full rounded-2xl`};

    ${(props) =>
        props.isSecondary &&
        css<Props>`
            ${tw`border-white/[0.08] bg-white/[0.05] text-neutral-200`};
            backdrop-filter: blur(12px);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);

            &:hover:not(:disabled) {
                ${tw`border-neutral-500 text-neutral-100 bg-white/[0.08]`};
                ${(props) => props.color === 'red' && tw`bg-rose-500/15 border-rose-500/30 text-rose-300`};
                ${(props) => props.color === 'primary' && tw`bg-violet-600/15 border-violet-500/30 text-violet-300`};
                ${(props) => props.color === 'green' && tw`bg-emerald-500/15 border-emerald-500/30 text-emerald-300`};
            }
        `};

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        box-shadow: none !important;
        transform: none !important;
    }
`;

type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({ children, isLoading, ...props }) => (
    <ButtonStyle {...props}>
        {isLoading && (
            <div css={tw`flex absolute justify-center items-center w-full h-full left-0 top-0`}>
                <Spinner size={'small'} />
            </div>
        )}
        <span css={isLoading ? tw`text-transparent` : undefined}>{children}</span>
    </ButtonStyle>
);

type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;

const LinkButton: React.FC<LinkProps> = (props) => <ButtonStyle as={'a'} {...props} />;

export { LinkButton, ButtonStyle };
export default Button;
