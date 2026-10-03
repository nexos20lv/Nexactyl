import { useServerFromRoute } from '@/api/routes/admin/servers';
import OrdersTable from '@/components/admin/modules/billing/orders/OrdersTable';
import AdminBox from '@/elements/AdminBox';
import { Alert } from '@/elements/alert';
import Label from '@/elements/Label';
import Spinner from '@/elements/Spinner';
import { useStoreState } from '@/state/hooks';
import { faCashRegister } from '@fortawesome/free-solid-svg-icons';
import EditServerBillingDialog from './EditServerBillingDialog';

function timeUntil(targetDate: Date | string) {
    const date = targetDate instanceof Date ? targetDate : new Date(targetDate);

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    return {
        days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diffMs / (1000 * 60 * 60)) % 24),
    };
}

export default () => {
    const { data: server } = useServerFromRoute();
    const billing = useStoreState(state => state.everest.data!.billing);

    // Get configurable renewal settings
    const renewalDays = billing.renewal?.days || 30;

    if (!server) return null;

    const product = server.relationships.product;

    return (
        <div>
            {!billing.enabled && (
                <Alert type={'danger'}>
                    The Billing Module is currently disabled. Any changes made here will not have effect unless the
                    module is enabled again.
                </Alert>
            )}
            <div className={'mt-4 grid lg:grid-cols-4 gap-4'}>
                <AdminBox title={'Détails de Facturation'} icon={faCashRegister} className={'relative'}>
                    <div className={'grid gap-y-4'}>
                        <div>
                            <Label>Nom et Coût de l'Offre</Label>
                            <p className={'text-gray-400'}>
                                {!server.billingProductId ? (
                                    'Aucun'
                                ) : !product ? (
                                    <Spinner size={'small'} centered />
                                ) : (
                                    <>
                                        {product.name} - {product.price} crédits tous les {renewalDays} jours
                                    </>
                                )}
                            </p>
                        </div>
                        <div>
                            <Label>Prochain Renouvellement</Label>
                            <p className={'text-gray-400'}>
                                {!server.renewalDate ? (
                                    'Aucun'
                                ) : (
                                    <>
                                        {new Date(server.renewalDate).toLocaleDateString()}
                                        {' - dans '}
                                        {timeUntil(server.renewalDate).days} jours et {timeUntil(server.renewalDate).hours}{' '}
                                        heures
                                    </>
                                )}
                            </p>
                        </div>
                        <div>
                            <Label>Limites de Ressources</Label>
                            <p className={'text-gray-400'}>
                                {!server.billingProductId ? (
                                    'Aucun'
                                ) : !product ? (
                                    <Spinner size={'small'} centered />
                                ) : (
                                    <>
                                        {product.limits.cpu}% CPU &bull; {product.limits.memory / 1024} Go RAM &bull;{' '}
                                        {product.limits.disk / 1024} Go Stockage
                                    </>
                                )}
                            </p>
                        </div>
                        <div className={'absolute top-2 right-2'}>
                            <EditServerBillingDialog server={server} />
                        </div>
                    </div>
                </AdminBox>
                <div className={'lg:col-span-3'}>
                    <OrdersTable minimal name={server.uuid.slice(0, 8)} />
                </div>
            </div>
        </div>
    );
};
