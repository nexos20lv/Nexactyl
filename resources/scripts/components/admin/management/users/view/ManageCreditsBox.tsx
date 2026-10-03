import tw from 'twin.macro';
import AdminBox from '@/elements/AdminBox';
import { Button } from '@/elements/button';
import { faCoins, faPlus, faMinus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { Context } from '@admin/management/users/UserRouter';
import { adjustUserCredits } from '@/api/routes/admin/users';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import SpinnerOverlay from '@/elements/SpinnerOverlay';

export default () => {
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const user = Context.useStoreState(state => state.user);
    const setUser = Context.useStoreActions(actions => actions.setUser);

    const handleAction = (action: 'add' | 'deduct' | 'set') => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            return;
        }

        clearFlashes('user:manage');
        setLoading(true);

        adjustUserCredits(user!.id, action, parsedAmount)
            .then(updatedUser => {
                setUser(updatedUser);
                setAmount('');
                addFlash({
                    key: 'user:manage',
                    type: 'success',
                    message: `Le solde de crédits de l'utilisateur a été mis à jour avec succès (${updatedUser.credits.toFixed(2)} crédits).`,
                });
            })
            .catch(error => {
                clearAndAddHttpError({
                    key: 'user:manage',
                    error,
                });
            })
            .finally(() => setLoading(false));
    };

    const currentCredits = user?.credits ?? 0;

    return (
        <div css={tw`h-auto flex flex-col md:col-span-2 xl:col-span-3`}>
            <AdminBox icon={faCoins} title={'Attribution des crédits'} css={tw`relative w-full`}>
                <SpinnerOverlay visible={loading} />
                <div className={'flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4'}>
                    <div>
                        <p className={'text-sm text-neutral-300'}>
                            Solde actuel de l&apos;utilisateur :
                        </p>
                        <div className={'text-3xl font-bold font-mono text-green-400 mt-1'}>
                            {currentCredits.toFixed(2)} <span className={'text-lg font-normal text-neutral-400'}>crédits</span>
                        </div>
                    </div>
                    <div className={'flex flex-wrap gap-2'}>
                        {[5, 10, 20, 50, 100].map(val => (
                            <button
                                key={val}
                                type={'button'}
                                className={'px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold text-neutral-200 transition-colors border border-neutral-700'}
                                onClick={() => setAmount(val.toString())}
                            >
                                +{val}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={'grid grid-cols-1 md:grid-cols-3 gap-4 items-end'}>
                    <div className={'md:col-span-1'}>
                        <Label>Montant</Label>
                        <Input
                            type={'number'}
                            step={'0.01'}
                            min={'0'}
                            placeholder={'Ex: 10.00'}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                    <div className={'md:col-span-2 flex flex-wrap gap-2'}>
                        <Button
                            type={'button'}
                            disabled={loading || !amount || parseFloat(amount) <= 0}
                            onClick={() => handleAction('add')}
                        >
                            <FontAwesomeIcon icon={faPlus} className={'mr-2'} /> Ajouter
                        </Button>
                        <Button.Danger
                            type={'button'}
                            disabled={loading || !amount || parseFloat(amount) <= 0}
                            onClick={() => handleAction('deduct')}
                        >
                            <FontAwesomeIcon icon={faMinus} className={'mr-2'} /> Retirer
                        </Button.Danger>
                        <Button.Text
                            type={'button'}
                            disabled={loading || amount === '' || isNaN(parseFloat(amount))}
                            onClick={() => handleAction('set')}
                        >
                            <FontAwesomeIcon icon={faCheck} className={'mr-2'} /> Définir le solde
                        </Button.Text>
                    </div>
                </div>
                <p css={tw`text-xs text-neutral-400 mt-3`}>
                    Attribution directe de crédits sans passer par Stripe. L&apos;utilisateur pourra utiliser ces crédits immédiatement pour commander ou renouveler ses serveurs.
                </p>
            </AdminBox>
        </div>
    );
};
