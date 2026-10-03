import { useEffect, useState } from 'react';
import { Dialog } from '@/elements/dialog';
import { Button } from '@/elements/button';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { updateSettings } from '@/api/routes/admin/billing';
import useFlash from '@/plugins/useFlash';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faGift, faPowerOff } from '@fortawesome/free-solid-svg-icons';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default ({ open, onClose }: Props) => {
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();
    const settings = useStoreState(s => s.everest.data!.billing);
    const updateEverest = useStoreActions(s => s.everest.updateEverest);

    const [enabled, setEnabled] = useState<boolean>(settings.credits?.enabled ?? true);
    const [starting, setStarting] = useState<string>((settings.credits?.starting ?? 0).toString());
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setEnabled(settings.credits?.enabled ?? true);
        setStarting((settings.credits?.starting ?? 0).toString());
    }, [settings.credits, open]);

    const parsedStarting = parseFloat(starting);
    const isValid = !isNaN(parsedStarting) && parsedStarting >= 0;

    const handleSubmit = async () => {
        if (!isValid) return;

        setLoading(true);
        clearFlashes('admin:billing:credits');

        try {
            await updateSettings('credits:enabled', enabled);
            await updateSettings('credits:starting', parsedStarting);

            updateEverest({
                billing: {
                    ...settings,
                    credits: {
                        enabled,
                        starting: parsedStarting,
                    },
                },
            });

            addFlash({
                key: 'admin:billing:credits',
                type: 'success',
                message: 'Les paramètres du système de crédits ont été enregistrés avec succès.',
            });
            onClose();
        } catch (error) {
            clearAndAddHttpError({
                key: 'admin:billing:credits',
                error,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={'Paramètres du système de crédits'}
            description={'Configurez l\'activation du système et les crédits offerts aux nouveaux utilisateurs.'}
        >
            <div className={'relative'}>
                <SpinnerOverlay visible={loading} />

                {/* System Toggle Section */}
                <div className={'p-4 bg-neutral-900/80 rounded-xl border border-neutral-800 mb-5'}>
                    <div className={'flex items-center justify-between'}>
                        <div>
                            <div className={'text-sm font-semibold text-white flex items-center gap-2'}>
                                <FontAwesomeIcon
                                    icon={faPowerOff}
                                    className={enabled ? 'text-green-400' : 'text-red-400'}
                                />
                                Statut du système de crédits
                            </div>
                            <p className={'text-xs text-neutral-400 mt-1'}>
                                {enabled
                                    ? 'Le système est actif : les clients voient leurs crédits et peuvent commander.'
                                    : 'Le système est inactif : les soldes sont masqués et les achats sont suspendus.'}
                            </p>
                        </div>
                        <button
                            type={'button'}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${
                                enabled
                                    ? 'bg-green-600/20 text-green-400 border-green-500/40 hover:bg-green-600/30'
                                    : 'bg-red-600/20 text-red-400 border-red-500/40 hover:bg-red-600/30'
                            }`}
                            onClick={() => setEnabled(prev => !prev)}
                        >
                            {enabled ? 'Activé' : 'Désactivé'}
                        </button>
                    </div>
                </div>

                {/* Starting Credits Section */}
                <div className={'mb-6'}>
                    <Label className={'flex items-center gap-1.5'}>
                        <FontAwesomeIcon icon={faGift} className={'text-purple-400'} />
                        Crédits offerts à l&apos;inscription (Nouveaux comptes)
                    </Label>
                    <p className={'text-xs text-neutral-400 mb-2.5'}>
                        Montant automatiquement crédité sur le solde de chaque nouvel utilisateur lors de la création de son compte (inscription web ou création par un admin).
                    </p>

                    <div className={'flex flex-wrap gap-2 mb-3'}>
                        {[0, 5, 10, 20, 50].map(val => (
                            <button
                                key={val}
                                type={'button'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                                    parsedStarting === val
                                        ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                                        : 'bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                                }`}
                                onClick={() => setStarting(val.toString())}
                            >
                                {val} crédits
                            </button>
                        ))}
                    </div>

                    <Input
                        type={'number'}
                        step={'0.01'}
                        min={'0'}
                        placeholder={'0.00'}
                        value={starting}
                        onChange={e => setStarting(e.target.value)}
                    />
                </div>

                {/* Footer Buttons */}
                <div className={'flex justify-end gap-3 pt-3 border-t border-neutral-800'}>
                    <Button.Text type={'button'} onClick={onClose} disabled={loading}>
                        Annuler
                    </Button.Text>
                    <Button
                        type={'button'}
                        disabled={loading || !isValid}
                        onClick={handleSubmit}
                    >
                        <FontAwesomeIcon icon={faCheck} className={'mr-1.5'} />
                        Enregistrer les modifications
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
