import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-full max-w-md mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`max-w-lg`}
    `};

    ${tw`w-full max-w-md mx-auto px-4 py-8`}
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const settings = useStoreState((state: ApplicationStore) => state.settings.data);
    const brandName = settings?.name || 'NXSLab';
    const brandTagline = settings?.tagline || 'Plateforme Cloud Gaming Haute Performance';
    const brandLogo = settings?.logo;

    return (
        <Container>
            <div css={tw`text-center mb-8`}>
                {brandLogo ? (
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-xl mb-4 p-2'>
                        <img src={brandLogo} alt={brandName} className='w-12 h-12 object-contain' />
                    </div>
                ) : (
                    <div
                        css={tw`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-500 shadow-xl mb-4 border border-violet-400/30`}
                    >
                        <svg className={'w-9 h-9 text-white'} fill={'currentColor'} viewBox={'0 0 24 24'}>
                            <path d={'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'} />
                        </svg>
                    </div>
                )}
                <h1
                    css={tw`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 tracking-wider`}
                >
                    {brandName}
                </h1>
                <p css={tw`text-xs text-neutral-400 font-mono tracking-widest uppercase mt-1`}>{brandTagline}</p>
            </div>
            <FlashMessageRender css={tw`mb-4 px-1`} />
            <div
                className={
                    'w-full bg-[#0e0c18]/95 border border-violet-500/20 shadow-2xl shadow-violet-950/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl'
                }
            >
                {title && (
                    <div css={tw`mb-6 pb-4 border-b border-violet-500/10`}>
                        <h2 css={tw`text-xl font-bold text-white tracking-tight`}>{title}</h2>
                        <p css={tw`text-xs text-neutral-400 mt-1`}>Accédez en toute sécurité à vos serveurs de jeu</p>
                    </div>
                )}
                <Form {...props} ref={ref}>
                    <div css={tw`w-full space-y-4`}>{props.children}</div>
                </Form>
            </div>
            <p css={tw`text-center text-neutral-500 text-xs font-mono mt-6`}>
                &copy; {new Date().getFullYear()} <span css={tw`text-violet-400 font-semibold`}>{brandName}</span>{' '}
                &bull; Tous droits réservés
            </p>
        </Container>
    );
});
