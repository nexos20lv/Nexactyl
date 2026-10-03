import useFlash from '@/plugins/useFlash';
import { Button } from '@/elements/button';
import { FormEvent, useState } from 'react';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { processCreditCheckoutSession } from '@/api/routes/account/billing/orders/process';
import { Product } from '@/api/definitions/account/billing';
import { ServerContext } from '@/state/server';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { Alert } from '@/elements/alert';

export default ({ product }: { product: Product }) => {
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();

    const settings = useStoreState(s => s.everest.data!.billing);
    const user = useStoreState(s => s.user.data!);
    const updateUserData = useStoreActions(actions => actions.user.updateUserData);
    const server = ServerContext.useStoreState(state => state.server.data!);
    const setServer = ServerContext.useStoreActions(actions => actions.server.setServerFromState);
    const [loading, setLoading] = useState<boolean>(false);

    const userCredits = user.credits ?? 0;
    const renewalCost = Number(product.price);
    const hasEnoughCredits = userCredits >= renewalCost;

    const handleSubmit = async (event: FormEvent) => {
        clearFlashes('server:billing:payment');
        setLoading(true);
        event.preventDefault();

        processCreditCheckoutSession(product.id, undefined, Number(server.internalId))
            .then(updatedServer => {
                updateUserData({ credits: Math.max(0, userCredits - renewalCost) });
                setServer(state => ({
                    ...state,
                    renewalDate: updatedServer.renewalDate,
                    status: updatedServer.status,
                }));
                addFlash({
                    key: 'server:billing:payment',
                    type: 'success',
                    message: `Votre serveur a été renouvelé avec succès pour ${days} jours supplémentaires !`,
                });
            })
            .catch(error => clearAndAddHttpError({ key: 'server:billing:payment', error }))
            .finally(() => setLoading(false));
    };

    const days = settings.renewal.days;
    const updatedRenewalDate = new Date(server.renewalDate!.getTime() + days * 24 * 60 * 60 * 1000);

    return (
        <form onSubmit={handleSubmit}>
            <SpinnerOverlay visible={loading} />
            <FlashMessageRender byKey={'server:billing:payment'} className={'mb-4'} />
            <p className={'mb-4'}>
                Renouveler votre serveur maintenant ajoutera {days} jours supplémentaires, fixant votre date de renouvellement au{' '}
                {new Date(updatedRenewalDate).toLocaleDateString()} (+{days} jours).
            </p>

            <div className={'p-4 rounded-lg bg-neutral-900 border border-neutral-850 mb-4'}>
                <div className={'flex justify-between items-center text-sm'}>
                    <span className={'text-neutral-400'}>Coût du renouvellement :</span>
                    <span className={'font-mono font-bold text-neutral-100'}>{renewalCost.toFixed(2)} crédits</span>
                </div>
                <div className={'flex justify-between items-center text-sm mt-1'}>
                    <span className={'text-neutral-400'}>Votre solde de crédits :</span>
                    <span className={`font-mono font-bold ${hasEnoughCredits ? 'text-green-400' : 'text-red-400'}`}>
                        {userCredits.toFixed(2)} crédits
                    </span>
                </div>
            </div>

            {!(settings.credits?.enabled ?? true) ? (
                <div className={'flex flex-col items-end gap-2'}>
                    <Alert type={'warning'} className={'text-left w-full'}>
                        Le système de paiement par crédits est actuellement désactivé. Les renouvellements ne sont pas disponibles pour le moment.
                    </Alert>
                    <Button disabled size={Button.Sizes.Large} className={'mt-2'}>
                        <FontAwesomeIcon icon={faCoins} className={'mr-2'} /> Renouvellements désactivés
                    </Button>
                </div>
            ) : !hasEnoughCredits ? (
                <div className={'flex flex-col items-end gap-2'}>
                    <Alert type={'warning'} className={'text-left w-full'}>
                        Solde de crédits insuffisant pour renouveler ce serveur ({renewalCost.toFixed(2)} crédits requis). Veuillez contacter un administrateur pour ajouter des crédits à votre compte.
                    </Alert>
                    <Button disabled size={Button.Sizes.Large} className={'mt-2'}>
                        <FontAwesomeIcon icon={faCoins} className={'mr-2'} /> Solde insuffisant
                    </Button>
                </div>
            ) : (
                <div className={'text-right'}>
                    <Button className={'mt-2'} size={Button.Sizes.Large} type={'submit'}>
                        <FontAwesomeIcon icon={faCoins} className={'mr-2'} /> Renouveler avec mes crédits ({renewalCost.toFixed(2)})
                    </Button>
                </div>
            )}
        </form>
    );
};
