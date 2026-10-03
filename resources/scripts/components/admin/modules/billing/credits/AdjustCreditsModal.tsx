import { useEffect, useState } from 'react';
import { User } from '@/api/definitions/admin';
import { Dialog } from '@/elements/dialog';
import { Button } from '@/elements/button';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { adjustUserCredits } from '@/api/routes/admin/users';
import useFlash from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faSliders } from '@fortawesome/free-solid-svg-icons';

interface Props {
    user: User | null;
    onClose: () => void;
    onSuccess: (updatedUser: User) => void;
}

type ActionType = 'add' | 'deduct' | 'set';

export default ({ user, onClose, onSuccess }: Props) => {
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();
    const [action, setAction] = useState<ActionType>('add');
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setAmount('');
        setAction('add');
    }, [user]);

    if (!user) return null;

    const parsedAmount = parseFloat(amount);
    const isValid = !isNaN(parsedAmount) && parsedAmount >= 0 && (action === 'set' || parsedAmount > 0);

    let previewBalance = user.credits;
    if (!isNaN(parsedAmount) && parsedAmount >= 0) {
        if (action === 'add') {
            previewBalance = user.credits + parsedAmount;
        } else if (action === 'deduct') {
            previewBalance = Math.max(0, user.credits - parsedAmount);
        } else if (action === 'set') {
            previewBalance = parsedAmount;
        }
    }

    const handleSubmit = async () => {
        if (!isValid) return;

        setLoading(true);
        clearFlashes('admin:billing:credits');

        try {
            const updatedUser = await adjustUserCredits(user.id, action, parsedAmount);
            addFlash({
                key: 'admin:billing:credits',
                type: 'success',
                message: `Le solde de crédits de ${user.username} a été mis à jour avec succès (${updatedUser.credits.toFixed(2)} crédits).`,
            });
            onSuccess(updatedUser);
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
            open={!!user}
            onClose={onClose}
            title={`Ajuster les crédits : ${user.username}`}
            description={`Gérez le solde de crédits de l'utilisateur ${user.email}`}
        >
            <div className={'relative'}>
                <SpinnerOverlay visible={loading} />

                {/* Current Balance Box */}
                <div className={'p-4 bg-neutral-900/80 rounded-xl border border-neutral-800 flex items-center justify-between mb-5'}>
                    <div>
                        <div className={'text-xs font-semibold text-neutral-400 uppercase tracking-wider'}>Solde Actuel</div>
                        <div className={'text-2xl font-bold font-mono text-green-400 mt-0.5'}>
                            {user.credits.toFixed(2)} <span className={'text-sm font-normal text-neutral-400'}>crédits</span>
                        </div>
                    </div>
                    {isValid && amount !== '' && (
                        <div className={'text-right'}>
                            <div className={'text-xs font-semibold text-neutral-400 uppercase tracking-wider'}>Nouveau Solde Prévisionnel</div>
                            <div className={'text-2xl font-bold font-mono text-cyan-400 mt-0.5'}>
                                {previewBalance.toFixed(2)} <span className={'text-sm font-normal text-neutral-400'}>crédits</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Selector */}
                <div className={'mb-4'}>
                    <Label>Type d&apos;opération</Label>
                    <div className={'grid grid-cols-3 gap-2 mt-1.5'}>
                        <button
                            type={'button'}
                            className={`flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150 border ${
                                action === 'add'
                                    ? 'bg-green-600/20 text-green-400 border-green-500/50 shadow-sm'
                                    : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                            }`}
                            onClick={() => setAction('add')}
                        >
                            <FontAwesomeIcon icon={faPlus} className={'mr-1.5 text-xs'} />
                            Ajouter
                        </button>
                        <button
                            type={'button'}
                            className={`flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150 border ${
                                action === 'deduct'
                                    ? 'bg-red-600/20 text-red-400 border-red-500/50 shadow-sm'
                                    : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                            }`}
                            onClick={() => setAction('deduct')}
                        >
                            <FontAwesomeIcon icon={faMinus} className={'mr-1.5 text-xs'} />
                            Déduire
                        </button>
                        <button
                            type={'button'}
                            className={`flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150 border ${
                                action === 'set'
                                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-sm'
                                    : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                            }`}
                            onClick={() => setAction('set')}
                        >
                            <FontAwesomeIcon icon={faSliders} className={'mr-1.5 text-xs'} />
                            Définir
                        </button>
                    </div>
                </div>

                {/* Quick Add Presets */}
                <div className={'mb-4'}>
                    <div className={'flex items-center justify-between mb-1.5'}>
                        <Label>Montants rapides</Label>
                    </div>
                    <div className={'flex flex-wrap gap-2'}>
                        {[5, 10, 20, 50, 100].map(val => (
                            <button
                                key={val}
                                type={'button'}
                                className={'px-3 py-1.5 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors border border-neutral-700'}
                                onClick={() => setAmount(val.toString())}
                            >
                                {val} crédits
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount input */}
                <div className={'mb-6'}>
                    <Label>Montant ({action === 'set' ? 'Nouveau solde' : 'Crédits à appliquer'})</Label>
                    <Input
                        type={'number'}
                        step={'0.01'}
                        min={'0'}
                        placeholder={'0.00'}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Footer Buttons */}
                <div className={'flex justify-end gap-3 pt-2 border-t border-neutral-800'}>
                    <Button.Text type={'button'} onClick={onClose} disabled={loading}>
                        Annuler
                    </Button.Text>
                    <Button
                        type={'button'}
                        disabled={loading || !isValid}
                        onClick={handleSubmit}
                        color={action === 'deduct' ? 'red' : 'primary'}
                    >
                        {action === 'add' && 'Ajouter les crédits'}
                        {action === 'deduct' && 'Déduire les crédits'}
                        {action === 'set' && 'Définir le solde'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
