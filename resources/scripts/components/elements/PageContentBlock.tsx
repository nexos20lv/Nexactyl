import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    const settings = useStoreState((state: ApplicationStore) => state.settings.data);
    const brandName = settings?.name || 'NXSLab';

    useEffect(() => {
        if (title) {
            document.title = `${title} • ${brandName}`;
        }
    }, [title, brandName]);

    return (
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <>
                <ContentContainer css={tw`my-4 sm:my-8`} className={className}>
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                    {children}
                </ContentContainer>
                <ContentContainer css={tw`mb-4`}>
                    <p css={tw`text-center text-neutral-500 text-xs font-mono`}>
                        {settings?.footerText ? (
                            <span>{settings.footerText}</span>
                        ) : (
                            <>
                                <span css={tw`text-violet-400 font-semibold tracking-wider`}>{brandName}</span>
                                &nbsp;&bull;&nbsp;{settings?.tagline || 'Plateforme Cloud Gaming Haute Performance'}
                            </>
                        )}
                    </p>
                </ContentContainer>
            </>
        </CSSTransition>
    );
};

export default PageContentBlock;
