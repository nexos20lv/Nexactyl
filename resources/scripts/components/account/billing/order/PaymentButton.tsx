import { FormEvent, useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { Product } from '@definitions/account/billing';
import { processCreditCheckoutSession } from '@/api/routes/account/billing/orders/process';
import { Alert } from '@/elements/alert';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';

interface Props {
    node: number;
    product: Product;
    vars: Map<string, string>;
    discount_code?: string | undefined;
    egg?: number;
    total: number;
}

export interface BillingServerVariables {
    key: string;
    value: string;
}

export default (data: Props) => {
    const [loading, setLoading] = useState(false);
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();
    const navigate = useNavigate();
    const user = useStoreState(state => state.user.data!);
    const creditsEnabled = useStoreState(state => state.everest?.data?.billing?.credits?.enabled ?? true);
    const updateUserData = useStoreActions(actions => actions.user.updateUserData);

    const eggMissing = data.product.eggId === null && !data.egg;
    const userCredits = user.credits ?? 0;
    const hasEnoughCredits = userCredits >= data.total;

    const handleSubmit = async (event: FormEvent) => {
        clearFlashes('account:billing:order');
        setLoading(true);
        event.preventDefault();

        const variables: BillingServerVariables[] = Array.from(data.vars, ([key, value]) => ({ key, value }));

        processCreditCheckoutSession(data.product.id, data.node, undefined, variables, data.discount_code, data.egg)
            .then(server => {
                updateUserData({ credits: Math.max(0, userCredits - data.total) });
                addFlash({
                    key: 'dashboard',
                    type: 'success',
                    message: `Votre serveur "${server.name}" a été commandé et déployé avec succès avec vos crédits !`,
                });
                navigate('/');
            })
            .catch(error => clearAndAddHttpError({ key: 'account:billing:order', error }))
            .finally(() => setLoading(false));
    };

    return (
        <form onSubmit={handleSubmit}>
            <SpinnerOverlay visible={loading} />
            <FlashMessageRender byKey={'account:billing:order'} className={'mb-4'} />
            {!creditsEnabled ? (
                <div className={'flex flex-col items-end gap-2'}>
                    <Alert type={'warning'} className={'text-left'}>
                        Le système de paiement par crédits est actuellement désactivé par l&apos;administrateur. Les commandes ne sont pas disponibles pour le moment.
                    </Alert>
                    <Button disabled size={Button.Sizes.Large}>
                        <FontAwesomeIcon icon={faCoins} className={'mr-2'} /> Paiements désactivés
                    </Button>
                </div>
            ) : isNaN(data.node) ? (
                <Alert type={'warning'}>Un nœud valide doit être sélectionné pour continuer votre commande.</Alert>
            ) : eggMissing ? (
                <Alert type={'warning'}>Un egg doit être sélectionné pour continuer votre commande.</Alert>
            ) : !hasEnoughCredits ? (
                <div className={'flex flex-col items-end gap-2'}>
                    <Alert type={'warning'} className={'text-left'}>
                        Solde insuffisant : Vous avez <span className={'font-bold'}>{userCredits.toFixed(2)}</span> crédits, mais cette commande coûte <span className={'font-bold'}>{data.total.toFixed(2)}</span> crédits. Veuillez contacter un administrateur pour créditer votre compte.
                    </Alert>
                    <Button disabled size={Button.Sizes.Large}>
                        <FontAwesomeIcon icon={faCoins} className={'mr-2'} /> Solde insuffisant
                    </Button>
                </div>
            ) : (
                <div className={'text-right'}>
                    <p className={'text-xs text-neutral-400 mb-2'}>
                        Solde actuel : <span className={'font-mono text-green-400 font-semibold'}>{userCredits.toFixed(2)} crédits</span> (reste après achat : {(userCredits - data.total).toFixed(2)} crédits)
                    </p>
                    <Button size={Button.Sizes.Large} type={'submit'}>
                        <FontAwesomeIcon icon={faCoins} className={'mr-2'} /> Payer avec mes crédits ({data.total.toFixed(2)})
                    </Button>
                </div>
            )}
        </form>
    );
};
