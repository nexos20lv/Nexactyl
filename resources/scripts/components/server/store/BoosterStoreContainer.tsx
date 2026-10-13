import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import tw from 'twin.macro';
import http from '@/api/http';
import Spinner from '@/components/elements/Spinner';
import { Button } from '@/components/elements/button/index';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faCoins, faHdd, faMicrochip, faMemory } from '@fortawesome/free-solid-svg-icons';
import { bytesToString, mbToBytes } from '@/lib/formatters';

interface Limits {
    memory: number;
    cpu: number;
    disk: number;
}

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addFlash, clearFlashes } = useFlash();

    const [credits, setCredits] = useState<number>(2500);
    const [limits, setLimits] = useState<Limits>({ memory: 0, cpu: 0, disk: 0 });
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);

    const fetchStore = () => {
        setLoading(true);
        http.get(`/api/client/servers/${uuid}/store/balance`)
            .then(({ data }) => {
                setCredits(data.credits ?? 2500);
                if (data.server_limits) {
                    setLimits(data.server_limits);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStore();
    }, [uuid]);

    const onApplyBooster = (type: 'ram' | 'cpu' | 'disk', cost: number, title: string) => {
        if (credits < cost) {
            addFlash({
                key: 'store-booster',
                type: 'error',
                message: `Solde insuffisant pour ${title}. Il vous faut ${cost} Coins.`,
            });
            return;
        }

        setApplying(type);
        clearFlashes('store-booster');

        http.post(`/api/client/servers/${uuid}/store/boosters/apply`, { type })
            .then(({ data }) => {
                setCredits(data.remaining_credits);
                if (data.new_limits) {
                    setLimits(data.new_limits);
                }
                addFlash({
                    key: 'store-booster',
                    type: 'success',
                    message: data.message || `Booster ${title} appliqué sans interruption au conteneur !`,
                });
            })
            .catch((err) => {
                console.error(err);
                addFlash({
                    key: 'store-booster',
                    type: 'error',
                    message: err?.response?.data?.error || `Erreur lors de l'activation du booster ${title}.`,
                });
            })
            .finally(() => setApplying(null));
    };

    return (
        <ServerContentBlock title={'Boutique de Boosters Matériels'}>
            <FlashMessageRender byKey={'store-booster'} css={tw`mb-4`} />

            {/* Top Bar with Wallet */}
            <div
                css={tw`bg-neutral-800/80 border border-white/[0.06] rounded-xl p-5 mb-6 flex justify-between items-center shadow-sm`}
            >
                <div>
                    <h2 css={tw`text-lg font-bold text-neutral-100 flex items-center gap-2`}>
                        <FontAwesomeIcon icon={faBolt} css={tw`text-violet-400`} /> Améliorations Matérielles à Chaud
                    </h2>
                    <p css={tw`text-xs text-neutral-400 mt-1`}>
                        Les boosters sont injectés en direct dans le conteneur Docker via Wings sans redémarrer le
                        serveur.
                    </p>
                </div>

                <div css={tw`flex items-center gap-3`}>
                    <div
                        css={tw`bg-[#0b0914] border border-violet-500/30 px-4 py-2 rounded-lg flex items-center gap-2.5 shadow-inner`}
                    >
                        <FontAwesomeIcon icon={faCoins} css={tw`text-yellow-400 text-sm`} />
                        <div>
                            <span css={tw`text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold`}>
                                Solde Disponible
                            </span>
                            <span css={tw`text-base font-mono font-bold text-neutral-100`}>
                                {credits.toLocaleString()} <span css={tw`text-violet-400 text-xs`}>Coins</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div css={tw`py-12 flex justify-center`}>
                    <Spinner size={'large'} />
                </div>
            ) : (
                <div css={tw`grid grid-cols-1 md:grid-cols-3 gap-6`}>
                    {/* RAM Card */}
                    <div
                        css={tw`bg-neutral-800/80 border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-violet-500/30 transition-all`}
                    >
                        <div>
                            <div css={tw`flex justify-between items-center mb-3`}>
                                <div
                                    css={tw`w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400`}
                                >
                                    <FontAwesomeIcon icon={faMemory} />
                                </div>
                                <span css={tw`text-xs font-mono text-neutral-400 bg-neutral-900/60 px-2 py-1 rounded`}>
                                    Actuel :{' '}
                                    {limits.memory !== 0 ? bytesToString(mbToBytes(limits.memory)) : 'Illimité'}
                                </span>
                            </div>

                            <h3 css={tw`font-bold text-neutral-100 text-base mb-1`}>+1 GB RAM DDR4/ECC</h3>
                            <p css={tw`text-xs text-neutral-400 leading-relaxed mb-4`}>
                                Alloue 1024 MiB de mémoire vive supplémentaire pour fluidifier les serveurs Minecraft
                                chargés.
                            </p>
                        </div>

                        <div>
                            <div css={tw`border-t border-white/[0.06] pt-3 mb-3 flex justify-between items-center`}>
                                <span css={tw`text-xs text-neutral-400`}>Coût du Booster</span>
                                <span css={tw`font-mono font-bold text-neutral-100 text-sm`}>
                                    250 <span css={tw`text-violet-400 text-xs`}>Coins</span>
                                </span>
                            </div>
                            <Button
                                type={'button'}
                                onClick={() => onApplyBooster('ram', 250, '+1 GB RAM')}
                                disabled={applying === 'ram'}
                                css={tw`w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2`}
                            >
                                {applying === 'ram' ? <Spinner size={'small'} /> : <>Activer le Booster</>}
                            </Button>
                        </div>
                    </div>

                    {/* CPU Card */}
                    <div
                        css={tw`bg-neutral-800/80 border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-violet-500/30 transition-all`}
                    >
                        <div>
                            <div css={tw`flex justify-between items-center mb-3`}>
                                <div
                                    css={tw`w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400`}
                                >
                                    <FontAwesomeIcon icon={faMicrochip} />
                                </div>
                                <span css={tw`text-xs font-mono text-neutral-400 bg-neutral-900/60 px-2 py-1 rounded`}>
                                    Actuel : {limits.cpu !== 0 ? `${limits.cpu}%` : 'Illimité'}
                                </span>
                            </div>

                            <h3 css={tw`font-bold text-neutral-100 text-base mb-1`}>+50% vCPU Core</h3>
                            <p css={tw`text-xs text-neutral-400 leading-relaxed mb-4`}>
                                Augmente la puissance de calcul allouée pour les entités, redstone et chunks.
                            </p>
                        </div>

                        <div>
                            <div css={tw`border-t border-white/[0.06] pt-3 mb-3 flex justify-between items-center`}>
                                <span css={tw`text-xs text-neutral-400`}>Coût du Booster</span>
                                <span css={tw`font-mono font-bold text-neutral-100 text-sm`}>
                                    300 <span css={tw`text-violet-400 text-xs`}>Coins</span>
                                </span>
                            </div>
                            <Button
                                type={'button'}
                                onClick={() => onApplyBooster('cpu', 300, '+50% CPU')}
                                disabled={applying === 'cpu'}
                                css={tw`w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2`}
                            >
                                {applying === 'cpu' ? <Spinner size={'small'} /> : <>Activer le Booster</>}
                            </Button>
                        </div>
                    </div>

                    {/* Disk Card */}
                    <div
                        css={tw`bg-neutral-800/80 border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-violet-500/30 transition-all`}
                    >
                        <div>
                            <div css={tw`flex justify-between items-center mb-3`}>
                                <div
                                    css={tw`w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400`}
                                >
                                    <FontAwesomeIcon icon={faHdd} />
                                </div>
                                <span css={tw`text-xs font-mono text-neutral-400 bg-neutral-900/60 px-2 py-1 rounded`}>
                                    Actuel : {limits.disk !== 0 ? bytesToString(mbToBytes(limits.disk)) : 'Illimité'}
                                </span>
                            </div>

                            <h3 css={tw`font-bold text-neutral-100 text-base mb-1`}>+20 GB SSD NVMe</h3>
                            <p css={tw`text-xs text-neutral-400 leading-relaxed mb-4`}>
                                Espace disque haute performance supplémentaire pour sauvegarder plus de mondes et
                                modpacks.
                            </p>
                        </div>

                        <div>
                            <div css={tw`border-t border-white/[0.06] pt-3 mb-3 flex justify-between items-center`}>
                                <span css={tw`text-xs text-neutral-400`}>Coût du Booster</span>
                                <span css={tw`font-mono font-bold text-neutral-100 text-sm`}>
                                    150 <span css={tw`text-violet-400 text-xs`}>Coins</span>
                                </span>
                            </div>
                            <Button
                                type={'button'}
                                onClick={() => onApplyBooster('disk', 150, '+20 GB SSD')}
                                disabled={applying === 'disk'}
                                css={tw`w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2`}
                            >
                                {applying === 'disk' ? <Spinner size={'small'} /> : <>Activer le Booster</>}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </ServerContentBlock>
    );
};
