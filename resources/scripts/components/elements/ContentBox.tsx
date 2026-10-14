import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        icon?: IconProp;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const ContentBox = ({ title, icon, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && (
            <div css={tw`flex items-center mb-4 px-1`}>
                {icon ? (
                    <div
                        css={tw`w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-sm mr-3 shadow-[0_0_12px_rgba(139,92,246,0.25)]`}
                    >
                        <FontAwesomeIcon icon={icon} />
                    </div>
                ) : (
                    <div
                        css={tw`w-1.5 h-5 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full mr-3 shadow-[0_0_8px_rgba(139,92,246,0.8)]`}
                    />
                )}
                <h2 css={tw`text-white font-bold text-xl tracking-tight`}>{title}</h2>
            </div>
        )}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4`} />
        )}
        <div
            style={{
                background: '#0d0b16',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
            css={[
                tw`p-6 sm:p-8 rounded-3xl relative overflow-hidden`,
                !!borderColor && tw`border-t-2 border-t-violet-500`,
            ]}
        >
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </div>
    </div>
);

export default ContentBox;
