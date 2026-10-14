import React, { useEffect, useState } from 'react';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRedo, faStop, faSkull } from '@fortawesome/free-solid-svg-icons';

interface PowerButtonProps {
    className?: string;
}

export default ({ className }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const killable = status === 'stopping';
    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        e.preventDefault();
        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    return (
        <div className={`flex items-center gap-2.5 sm:gap-3 ${className || ''}`}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={"Forcer l'arrêt du processus"}
                confirm={'Continuer'}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                Forcer l&apos;arrêt immédiat peut entraîner la perte de données non sauvegardées sur le conteneur.
            </Dialog.Confirm>

            <Can action={'control.start'}>
                <button
                    type='button'
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                    style={{
                        transition:
                            'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    className={`flex-1 h-10 sm:h-11 flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-semibold select-none cursor-pointer ${
                        status === 'offline'
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_14px_rgba(16,185,129,0.35)] active:scale-[0.97]'
                            : 'bg-white/[0.04] text-neutral-500 border border-white/[0.05] cursor-not-allowed opacity-40 shadow-none'
                    }`}
                >
                    <FontAwesomeIcon icon={faPlay} className='text-[10px]' />
                    <span>Démarrer</span>
                </button>
            </Can>

            <Can action={'control.restart'}>
                <button
                    type='button'
                    disabled={!status || status === 'offline'}
                    onClick={onButtonClick.bind(this, 'restart')}
                    style={{
                        transition:
                            'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    className={`flex-1 h-10 sm:h-11 flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-semibold select-none cursor-pointer ${
                        status && status !== 'offline'
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_14px_rgba(124,58,237,0.35)] active:scale-[0.97]'
                            : 'bg-white/[0.04] text-neutral-500 border border-white/[0.05] cursor-not-allowed opacity-40 shadow-none'
                    }`}
                >
                    <FontAwesomeIcon icon={faRedo} className='text-[10px]' />
                    <span>Redémarrer</span>
                </button>
            </Can>

            <Can action={'control.stop'}>
                <button
                    type='button'
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                    style={{
                        transition:
                            'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    className={`flex-1 h-10 sm:h-11 flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-semibold select-none cursor-pointer ${
                        status !== 'offline'
                            ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_14px_rgba(244,63,94,0.35)] active:scale-[0.97]'
                            : 'bg-white/[0.04] text-neutral-500 border border-white/[0.05] cursor-not-allowed opacity-40 shadow-none'
                    }`}
                >
                    <FontAwesomeIcon icon={killable ? faSkull : faStop} className='text-[10px]' />
                    <span>{killable ? "Forcer l'arrêt" : 'Arrêter'}</span>
                </button>
            </Can>
        </div>
    );
};
