import React from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSyncAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import styled, { keyframes } from 'styled-components/macro';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import NotFoundSvg from '@/assets/images/not_found.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';

interface BaseProps {
    title: string;
    image: string;
    message: string;
    onRetry?: () => void;
    onBack?: () => void;
}

interface PropsWithRetry extends BaseProps {
    onRetry?: () => void;
    onBack?: never;
}

interface PropsWithBack extends BaseProps {
    onBack?: () => void;
    onRetry?: never;
}

export type ScreenBlockProps = PropsWithBack | PropsWithRetry;

const spin = keyframes`
    to { transform: rotate(360deg) }
`;

const ActionButton = styled(Button)`
    ${tw`rounded-full w-9 h-9 flex items-center justify-center p-0`};

    &.hover\\:spin:hover {
        animation: ${spin} 2s linear infinite;
    }
`;

const ScreenBlock = ({ title, image, message, onBack, onRetry }: ScreenBlockProps) => (
    <PageContentBlock>
        <div className={'flex justify-center my-6'}>
            <div
                className={
                    'w-full sm:w-4/5 md:w-3/5 lg:w-1/2 p-8 sm:p-12 md:p-16 bg-[#0b0914]/95 border border-[#25213b] rounded-3xl shadow-2xl text-center relative backdrop-blur-md overflow-hidden'
                }
            >
                <div
                    className={
                        'absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none'
                    }
                />

                {(typeof onBack === 'function' || typeof onRetry === 'function') && (
                    <div className={'absolute left-4 top-4 z-10'}>
                        <ActionButton
                            onClick={() => (onRetry ? onRetry() : onBack ? onBack() : null)}
                            className={onRetry ? 'hover:spin' : undefined}
                            isSecondary
                        >
                            <FontAwesomeIcon icon={onRetry ? faSyncAlt : faArrowLeft} />
                        </ActionButton>
                    </div>
                )}

                <div className={'relative z-10 flex flex-col items-center'}>
                    <div className={'w-32 h-32 max-h-32 mb-6 flex items-center justify-center'}>
                        <img
                            src={image}
                            className={
                                'w-full h-full object-contain select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]'
                            }
                        />
                    </div>

                    <h2 className={'text-2xl sm:text-3xl font-bold text-white tracking-tight'}>{title}</h2>
                    <p className={'text-sm sm:text-base text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed'}>
                        {message}
                    </p>

                    <div className={'flex flex-wrap items-center justify-center gap-3 mt-8'}>
                        {onRetry && (
                            <Button onClick={onRetry} className={'flex items-center space-x-2'}>
                                <FontAwesomeIcon icon={faSyncAlt} className={'mr-2'} />
                                <span>R&eacute;essayer</span>
                            </Button>
                        )}
                        <Button
                            isSecondary
                            onClick={() => (window.location.href = '/')}
                            className={'flex items-center space-x-2'}
                        >
                            <FontAwesomeIcon icon={faHome} className={'mr-2'} />
                            <span>Retour &agrave; l&apos;accueil</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </PageContentBlock>
);

type ServerErrorProps = (Omit<PropsWithBack, 'image' | 'title'> | Omit<PropsWithRetry, 'image' | 'title'>) & {
    title?: string;
};

const ServerError = ({ title, ...props }: ServerErrorProps) => (
    <ScreenBlock title={title || 'Une erreur est survenue'} image={ServerErrorSvg} {...props} />
);

const NotFound = ({ title, message, onBack }: Partial<Pick<ScreenBlockProps, 'title' | 'message' | 'onBack'>>) => (
    <ScreenBlock
        title={title || '404 - Introuvable'}
        image={NotFoundSvg}
        message={message || 'La ressource ou le serveur demand\u00e9 est introuvable.'}
        onBack={onBack}
    />
);

export { ServerError, NotFound };
export default ScreenBlock;
