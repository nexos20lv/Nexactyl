import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/elements/Button';

interface State {
    hasError: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
class ErrorBoundary extends React.Component<{}, State> {
    state: State = {
        hasError: false,
    };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.error(error);
    }

    render() {
        return this.state.hasError ? (
            <div className={'flex items-center justify-center w-full my-6 p-4'}>
                <div
                    className={
                        'flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-xl bg-[#0e0c18] border border-red-500/30 rounded-2xl p-5 shadow-xl'
                    }
                >
                    <div className={'flex items-center space-x-3 text-red-400'}>
                        <div
                            className={
                                'w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0'
                            }
                        >
                            <FontAwesomeIcon icon={faExclamationTriangle} className={'text-red-400 text-lg'} />
                        </div>
                        <div>
                            <h4 className={'text-sm font-semibold text-white'}>Erreur de rendu de l&apos;interface</h4>
                            <p className={'text-xs text-neutral-400 mt-0.5'}>
                                Une exception inattendue a &eacute;t&eacute; intercept&eacute;e. Veuillez
                                rafra&icirc;chir la vue.
                            </p>
                        </div>
                    </div>
                    <Button
                        size={'xsmall'}
                        onClick={() => window.location.reload()}
                        className={'whitespace-nowrap flex-shrink-0'}
                    >
                        <FontAwesomeIcon icon={faSyncAlt} className={'mr-1.5'} />
                        Actualiser
                    </Button>
                </div>
            </div>
        ) : (
            this.props.children
        );
    }
}

export default ErrorBoundary;
