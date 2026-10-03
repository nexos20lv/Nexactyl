import { Product } from '@/api/definitions/account/billing';
import { getUpgradeCharge, getUpgradeOptions, processUpgrade } from '@/api/routes/server/billing';
import { Alert } from '@/elements/alert';
import { Button } from '@/elements/button';
import ContentBox from '@/elements/ContentBox';
import { Dialog } from '@/elements/dialog';
import FlashMessageRender from '@/elements/FlashMessageRender';
import PageContentBlock from '@/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';
import { ServerContext } from '@/state/server';
import {
    faShoppingBag,
    faMicrochip,
    faMemory,
    faHdd,
    faArchive,
    faDatabase,
    faEthernet,
    IconDefinition,
    faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreActions } from '@/state/hooks';
import { faCoins } from '@fortawesome/free-solid-svg-icons';

interface LimitProps {
    icon: IconDefinition;
    limit: ReactElement;
}

const LimitBox = ({ icon, limit }: LimitProps) => (
    <div className={'text-gray-400 mt-1'}>
        <FontAwesomeIcon icon={icon} className={'w-4 h-4 mr-2'} />
        {limit}
    </div>
);

export default () => {
    const settings = useStoreState(state => state.everest.data!.billing);
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();
    const { colors } = useStoreState(state => state.theme.data!);
    const user = useStoreState(state => state.user.data!);
    const updateUserData = useStoreActions(actions => actions.user.updateUserData);
    const server = ServerContext.useStoreState(state => state.server.data!);
    const navigate = useNavigate();

    const [open, setOpen] = useState<Product | null>();
    const [options, setOptions] = useState<Product[]>();
    const [charge, setCharge] = useState<number | null>();
    const [loading, setLoading] = useState<boolean>(false);

    const userCredits = user?.credits ?? 0;
    const upgradeCost = charge ?? 0;
    const hasEnoughCredits = userCredits >= upgradeCost;

    useEffect(() => {
        clearFlashes();

        getUpgradeOptions(server.id)
            .then(setOptions)
            .catch(error => clearAndAddHttpError({ key: 'server:billing:upgrade', error }));
    }, []);

    useEffect(() => {
        if (open) {
            getUpgradeCharge(server.id, open.id)
                .then(data => setCharge(data))
                .catch(error => clearAndAddHttpError({ key: 'server:billing:upgrade', error }));
        }
    }, [open]);

    const submit = () => {
        if (open) {
            clearFlashes('server:billing:upgrade');
            setLoading(true);
            processUpgrade(server.id, open.id)
                .then(() => {
                    updateUserData({ credits: Math.max(0, userCredits - upgradeCost) });
                    addFlash({
                        key: 'server:billing',
                        type: 'success',
                        message: `Serveur mis à niveau vers "${open.name}" avec succès !`,
                    });
                    navigate(`/server/${server.id}/billing`);
                })
                .catch(error => clearAndAddHttpError({ key: 'server:billing:upgrade', error }))
                .finally(() => setLoading(false));
        }
    };

    return (
        <PageContentBlock
            title={'Options de mise à niveau'}
            header
            description={'Consultez votre offre actuelle et passez à une offre supérieure.'}
        >
            {open && (
                <Dialog
                    open
                    onClose={() => setOpen(null)}
                    title={`Confirmer la mise à niveau vers ${open.name} - ${open.price.toFixed(2)} crédits/mois`}
                >
                    Pour mettre à niveau votre serveur en cours de période, vous devez régler les frais au prorata indiqués ci-dessous avec vos crédits.
                    <div className={'my-3 w-full'}>
                        <code className={'px-2 py-1 w-full bg-black/50 rounded-lg'}>
                            {charge !== null ? (
                                <>
                                    {charge?.toFixed(2)} crédits
                                </>
                            ) : (
                                <FontAwesomeIcon icon={faSpinner} className={'animate-spin'} />
                            )}
                        </code>
                        <span className={'ml-2 italic text-gray-400'}>frais unique de mise à niveau déduit de votre solde</span>
                    </div>

                    <div className={'p-3 rounded-lg bg-neutral-900 border border-neutral-850 mb-3'}>
                        <div className={'flex justify-between items-center text-sm'}>
                            <span className={'text-neutral-400'}>Votre solde de crédits :</span>
                            <span className={`font-mono font-bold ${hasEnoughCredits ? 'text-green-400' : 'text-red-400'}`}>
                                {userCredits.toFixed(2)} crédits
                            </span>
                        </div>
                    </div>

                    {!(settings.credits?.enabled ?? true) ? (
                        <Alert type={'warning'} className={'mb-3'}>
                            Le système de paiement par crédits est actuellement désactivé par l&apos;administrateur.
                        </Alert>
                    ) : !hasEnoughCredits && charge !== null ? (
                        <Alert type={'warning'} className={'mb-3'}>
                            Solde insuffisant : vous disposez de {userCredits.toFixed(2)} crédits, mais cette mise à niveau nécessite {upgradeCost.toFixed(2)} crédits. Veuillez contacter un administrateur.
                        </Alert>
                    ) : null}

                    Puis, à partir du {new Date(server.renewalDate!).toLocaleDateString()}, le renouvellement sera de{' '}
                    {open.price} crédits/mois.
                    <div className={'mt-4 text-right'}>
                        <Button onClick={submit} disabled={!(settings.credits?.enabled ?? true) || charge === null || !hasEnoughCredits || loading}>
                            <FontAwesomeIcon icon={faCoins} className={'mr-2'} />
                            {!(settings.credits?.enabled ?? true)
                                ? 'Paiements désactivés'
                                : !hasEnoughCredits
                                ? 'Solde insuffisant'
                                : 'Mettre à niveau maintenant'}
                        </Button>
                    </div>
                </Dialog>
            )}
            <FlashMessageRender byKey={'server:billing:upgrade'} />
            <div className={'grid grid-cols-1 xl:grid-cols-3 gap-4'}>
                {!options ||
                    (options.length === 0 && (
                        <Alert type={'info'} className={'xl:col-span-3'}>
                            Aucune offre de mise à niveau n'est disponible. Si vous souhaitez améliorer votre serveur, veuillez contacter un administrateur.
                        </Alert>
                    ))}
                {options?.map(product => (
                    <ContentBox key={product.id}>
                        <div className={'p-3 lg:p-6'}>
                            <div className={'flex justify-center'}>
                                {product.icon ? (
                                    <img src={product.icon} className={'w-16 h-16'} />
                                ) : (
                                    <FontAwesomeIcon
                                        icon={faShoppingBag}
                                        className={'w-12 h-12 m-2'}
                                        style={{ color: colors.primary }}
                                    />
                                )}
                            </div>
                            <p className={'text-3xl font-bold text-center mt-3'}>{product.name}</p>
                            <p className={'text-lg font-semibold text-center mt-1 mb-4 text-gray-400'}>
                                <span style={{ color: colors.primary }} className={'mr-1'}>
                                    {product.price.toFixed(2)} crédits
                                </span>
                                <span className={'text-base'}>/ mois</span>
                            </p>
                            <div className={'grid justify-center items-center'}>
                                <LimitBox icon={faMicrochip} limit={<>{product.limits.cpu}% CPU</>} />
                                <LimitBox icon={faMemory} limit={<>{product.limits.memory / 1024} Go de RAM</>} />
                                <LimitBox icon={faHdd} limit={<>{product.limits.disk / 1024} Go de Stockage</>} />
                                <div className={'border border-dashed border-gray-500 my-4'} />
                                {product.limits.backup ? (
                                    <LimitBox icon={faArchive} limit={<>{product.limits.backup} sauvegardes</>} />
                                ) : (
                                    <></>
                                )}
                                {product.limits.database ? (
                                    <LimitBox icon={faDatabase} limit={<>{product.limits.database} bases de données</>} />
                                ) : (
                                    <></>
                                )}
                                <LimitBox
                                    icon={faEthernet}
                                    limit={
                                        <>
                                            {product.limits.allocation} port{product.limits.allocation > 1 && 's'} réseau
                                        </>
                                    }
                                />
                            </div>
                            <div className={'text-center mt-6'} onClick={() => setOpen(product)}>
                                <Button size={Button.Sizes.Large} className={'w-full'}>
                                    Configure
                                </Button>
                            </div>
                        </div>
                    </ContentBox>
                ))}
            </div>
        </PageContentBlock>
    );
};
