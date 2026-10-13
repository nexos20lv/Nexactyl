import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && (
            <div css={tw`flex items-center mb-4 px-1`}>
                <div css={tw`w-1 h-5 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full mr-3`} />
                <h2 css={tw`text-white font-semibold text-xl tracking-tight`}>{title}</h2>
            </div>
        )}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4`} />
        )}
        <div
            css={[
                tw`bg-neutral-900/90 border border-violet-500/20 p-6 rounded-2xl shadow-xl relative overflow-hidden backdrop-blur-sm`,
                !!borderColor && tw`border-t-4 border-t-violet-500`,
            ]}
        >
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </div>
    </div>
);

export default ContentBox;
