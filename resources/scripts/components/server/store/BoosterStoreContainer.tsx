import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBolt,
    faMemory,
    faMicrochip,
    faHdd,
    faArchive,
    faCoins,
    faCheckCircle,
    faHistory,
} from '@fortawesome/free-solid-svg-icons';
import http from '@/api/http';
import Spinner from '@/components/elements/Spinner';
import Button from '@/components/elements/Button';
import useFlash from '@/plugins/useFlash';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { bytesToString, mbToBytes } from '@/lib/formatters';

interface Tier {
    amount: number;
    cost: number;
    label: string;
}

interface Catalog {
    ram: Record<number, Tier>;
    cpu: Record<number, Tier>;
    disk: Record<number, Tier>;
    backups: Record<number, Tier>;
}

interface BoosterRecord {
    id: number;
    server_id: number;
    type: string;
    amount: number;
    cost: number;
    created_at: string;
}

interface StoreData {
    credits: number;
    catalog: Catalog;
    server_limits: {
        memory: number;
        cpu: number;
        disk: number;
        backups: number;
    };
    boosters: BoosterRecord[];
}

const BoosterStoreContainer = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const updateUserData = useStoreActions((actions: any) => actions.user.updateUserData);
    const settings = useStoreState((state: ApplicationStore) => state.settings.data);
    const currencyName = settings?.currencyName || 'Crédits';
    const currencySymbol = settings?.currencySymbol || 'cr';
    const { addFlash, clearFlashes } = useFlash();

    const [loading, setLoading] = useState(true);
    const [storeData, setStoreData] = useState<StoreData | null>(null);

    // Selected tiers for each resource type
    const [selectedRamTier, setSelectedRamTier] = useState<number>(1);
    const [selectedCpuTier, setSelectedCpuTier] = useState<number>(1);
    const [selectedDiskTier, setSelectedDiskTier] = useState<number>(1);
    const [selectedBackupTier, setSelectedBackupTier] = useState<number>(1);

    const [applying, setApplying] = useState<string | null>(null);

    const loadStore = () => {
        http.get(`/api/client/servers/${uuid}/store/balance`)
            .then(({ data }) => {
                setStoreData(data);
                updateUserData({ credits: data.credits });
            })
            .catch((err) => {
                console.error(err);
                addFlash({
                    key: 'store',
                    type: 'error',
                    message: 'Impossible de charger la boutique hardware.',
                });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        clearFlashes('store');
        loadStore();
    }, [uuid]);

    const handleApply = (type: 'ram' | 'cpu' | 'disk' | 'backups', tier: number) => {
        if (!storeData) return;
        const item = storeData.catalog[type][tier];
        if (!item) return;

        if (storeData.credits < item.cost) {
            addFlash({
                key: 'store',
                type: 'error',
                message: `Solde insuffisant ! Vous disposez de ${storeData.credits} ${currencyName} (${item.cost} requis).`,
            });
            return;
        }

        setApplying(type);
        clearFlashes('store');

        http.post(`/api/client/servers/${uuid}/store/apply`, { type, tier })
            .then(({ data }) => {
                addFlash({
                    key: 'store',
                    type: 'success',
                    message: data.message || `Booster ${item.label} activé avec succès !`,
                });
                loadStore();
            })
            .catch((err) => {
                console.error(err);
                addFlash({
                    key: 'store',
                    type: 'error',
                    message: err.response?.data?.error || "Erreur lors de l'application du booster.",
                });
            })
            .finally(() => setApplying(null));
    };

    if (loading || !storeData) {
        return (
            <ServerContentBlock title={'Boutique Hardware'}>
                <div className='flex items-center justify-center p-12'>
                    <Spinner size={'large'} centered />
                </div>
            </ServerContentBlock>
        );
    }

    const { credits, catalog, server_limits: limits, boosters } = storeData;

    return (
        <ServerContentBlock title={'Boutique Hardware'} showFlashKey={'store'}>
            {/* Header Banner */}
            <div className='bg-[#0b0914] border border-[#1f1d2e] rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden'>
                <div className='absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none' />
                <div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6'>
                    <div>
                        <div className='flex items-center gap-2 mb-2'>
                            <span className='px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-300 border border-violet-500/30 flex items-center gap-1.5'>
                                <FontAwesomeIcon icon={faBolt} className='text-violet-400' />
                                <span>Boosters Haute Performance</span>
                            </span>
                            <span className='px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5'>
                                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                                <span>Hot-Sync Wings Actif</span>
                            </span>
                        </div>
                        <h1 className='text-2xl font-extrabold text-neutral-100 mb-1'>
                            Boutique Hardware & Évolutions
                        </h1>
                        <p className='text-sm text-neutral-400 max-w-2xl leading-relaxed'>
                            Augmentez la RAM, le CPU, le stockage NVMe ou les quotas de sauvegardes de votre conteneur
                            en direct. Les modifications sont appliquées instantanément aux cgroups Docker sans aucun
                            redémarrage.
                        </p>
                    </div>

                    <div className='shrink-0 bg-[#120f20] border border-[#25213b] rounded-xl p-4 flex items-center gap-4 shadow-inner'>
                        <div className='w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xl shadow-[0_0_15px_rgba(139,92,246,0.3)]'>
                            <FontAwesomeIcon icon={faCoins} />
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-xs text-neutral-400 uppercase tracking-wider font-medium'>
                                Vos {currencyName}
                            </span>
                            <span className='text-2xl font-bold font-mono text-neutral-100'>
                                {credits.toLocaleString()}{' '}
                                <span className='text-violet-400 text-sm font-sans'>{currencySymbol}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of 4 Interactive Hardware Cards */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
                {/* 1. RAM Card */}
                {catalog.ram && (
                    <div className='bg-[#0b0914] border border-[#1f1d2e] hover:border-violet-500/40 rounded-xl p-6 flex flex-col justify-between transition-all duration-200 shadow-md'>
                        <div>
                            <div className='flex items-center justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-400'>
                                        <FontAwesomeIcon icon={faMemory} />
                                    </div>
                                    <div>
                                        <h3 className='font-bold text-neutral-100 text-base'>Mémoire RAM Dédiée</h3>
                                        <span className='text-xs text-neutral-400'>
                                            DDR4 / DDR5 ECC Haute Fréquence
                                        </span>
                                    </div>
                                </div>
                                <span className='text-xs font-mono bg-neutral-900/80 border border-[#222033] px-2.5 py-1 rounded text-neutral-300'>
                                    Actuel :{' '}
                                    {limits.memory !== 0 ? bytesToString(mbToBytes(limits.memory)) : 'Illimité'}
                                </span>
                            </div>

                            {/* Tier Selector Pills */}
                            <div className='space-y-1.5 mb-4'>
                                <label className='text-[11px] font-semibold text-neutral-400 uppercase tracking-wider'>
                                    Sélectionner un palier :
                                </label>
                                <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                    {Object.entries(catalog.ram).map(([tierStr, tier]) => {
                                        const tierNum = Number(tierStr);
                                        const isSelected = selectedRamTier === tierNum;
                                        return (
                                            <button
                                                key={tierNum}
                                                type='button'
                                                onClick={() => setSelectedRamTier(tierNum)}
                                                className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                                                    isSelected
                                                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-[0_0_10px_rgba(139,92,246,0.25)]'
                                                        : 'bg-neutral-900/50 border-[#201d32] text-neutral-400 hover:text-neutral-200 hover:border-[#353050]'
                                                }`}
                                            >
                                                <div className='font-bold'>{tier.amount / 1024} Go</div>
                                                <div className='text-[10px] text-violet-400 font-mono'>
                                                    {tier.cost} {currencySymbol}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preview Before / After */}
                            {catalog.ram[selectedRamTier] && (
                                <div className='bg-[#120f20] border border-[#201c35] rounded-lg p-3 mb-4 flex items-center justify-between text-xs'>
                                    <span className='text-neutral-400'>Allocation finale :</span>
                                    <div className='flex items-center gap-2 font-mono'>
                                        <span className='text-neutral-400'>
                                            {limits.memory !== 0 ? bytesToString(mbToBytes(limits.memory)) : '0'}
                                        </span>
                                        <span className='text-violet-400 font-bold'>➔</span>
                                        <span className='text-emerald-400 font-bold'>
                                            {bytesToString(
                                                mbToBytes(limits.memory + catalog.ram[selectedRamTier].amount)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='border-t border-[#181622] pt-4 flex items-center justify-between gap-4'>
                            <div>
                                <span className='text-[11px] text-neutral-400 block'>Prix du Booster</span>
                                <span className='font-mono font-bold text-lg text-neutral-100'>
                                    {catalog.ram[selectedRamTier]?.cost}{' '}
                                    <span className='text-violet-400 text-xs'>{currencyName}</span>
                                </span>
                            </div>
                            <Button
                                type='button'
                                onClick={() => handleApply('ram', selectedRamTier)}
                                disabled={applying === 'ram' || credits < (catalog.ram[selectedRamTier]?.cost || 0)}
                                className='bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center gap-2'
                            >
                                {applying === 'ram' ? <Spinner size={'small'} /> : 'Appliquer le Booster RAM'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* 2. CPU Card */}
                {catalog.cpu && (
                    <div className='bg-[#0b0914] border border-[#1f1d2e] hover:border-violet-500/40 rounded-xl p-6 flex flex-col justify-between transition-all duration-200 shadow-md'>
                        <div>
                            <div className='flex items-center justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-400'>
                                        <FontAwesomeIcon icon={faMicrochip} />
                                    </div>
                                    <div>
                                        <h3 className='font-bold text-neutral-100 text-base'>Processeur vCPU</h3>
                                        <span className='text-xs text-neutral-400'>
                                            Coeurs Haute Fréquence & Calcul
                                        </span>
                                    </div>
                                </div>
                                <span className='text-xs font-mono bg-neutral-900/80 border border-[#222033] px-2.5 py-1 rounded text-neutral-300'>
                                    Actuel : {limits.cpu !== 0 ? `${limits.cpu}%` : 'Illimité'}
                                </span>
                            </div>

                            {/* Tier Selector Pills */}
                            <div className='space-y-1.5 mb-4'>
                                <label className='text-[11px] font-semibold text-neutral-400 uppercase tracking-wider'>
                                    Sélectionner un palier :
                                </label>
                                <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                    {Object.entries(catalog.cpu).map(([tierStr, tier]) => {
                                        const tierNum = Number(tierStr);
                                        const isSelected = selectedCpuTier === tierNum;
                                        return (
                                            <button
                                                key={tierNum}
                                                type='button'
                                                onClick={() => setSelectedCpuTier(tierNum)}
                                                className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                                                    isSelected
                                                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-[0_0_10px_rgba(139,92,246,0.25)]'
                                                        : 'bg-neutral-900/50 border-[#201d32] text-neutral-400 hover:text-neutral-200 hover:border-[#353050]'
                                                }`}
                                            >
                                                <div className='font-bold'>+{tier.amount}%</div>
                                                <div className='text-[10px] text-violet-400 font-mono'>
                                                    {tier.cost} {currencySymbol}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preview Before / After */}
                            {catalog.cpu[selectedCpuTier] && (
                                <div className='bg-[#120f20] border border-[#201c35] rounded-lg p-3 mb-4 flex items-center justify-between text-xs'>
                                    <span className='text-neutral-400'>Puissance finale :</span>
                                    <div className='flex items-center gap-2 font-mono'>
                                        <span className='text-neutral-400'>{limits.cpu}%</span>
                                        <span className='text-violet-400 font-bold'>➔</span>
                                        <span className='text-emerald-400 font-bold'>
                                            {limits.cpu + catalog.cpu[selectedCpuTier].amount}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='border-t border-[#181622] pt-4 flex items-center justify-between gap-4'>
                            <div>
                                <span className='text-[11px] text-neutral-400 block'>Prix du Booster</span>
                                <span className='font-mono font-bold text-lg text-neutral-100'>
                                    {catalog.cpu[selectedCpuTier]?.cost}{' '}
                                    <span className='text-violet-400 text-xs'>{currencyName}</span>
                                </span>
                            </div>
                            <Button
                                type='button'
                                onClick={() => handleApply('cpu', selectedCpuTier)}
                                disabled={applying === 'cpu' || credits < (catalog.cpu[selectedCpuTier]?.cost || 0)}
                                className='bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center gap-2'
                            >
                                {applying === 'cpu' ? <Spinner size={'small'} /> : 'Appliquer le Booster CPU'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* 3. Disk NVMe Card */}
                {catalog.disk && (
                    <div className='bg-[#0b0914] border border-[#1f1d2e] hover:border-violet-500/40 rounded-xl p-6 flex flex-col justify-between transition-all duration-200 shadow-md'>
                        <div>
                            <div className='flex items-center justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-400'>
                                        <FontAwesomeIcon icon={faHdd} />
                                    </div>
                                    <div>
                                        <h3 className='font-bold text-neutral-100 text-base'>Disque NVMe PCIe 4.0</h3>
                                        <span className='text-xs text-neutral-400'>Stockage I/O Ultra-Rapide</span>
                                    </div>
                                </div>
                                <span className='text-xs font-mono bg-neutral-900/80 border border-[#222033] px-2.5 py-1 rounded text-neutral-300'>
                                    Actuel : {limits.disk !== 0 ? bytesToString(mbToBytes(limits.disk)) : 'Illimité'}
                                </span>
                            </div>

                            {/* Tier Selector Pills */}
                            <div className='space-y-1.5 mb-4'>
                                <label className='text-[11px] font-semibold text-neutral-400 uppercase tracking-wider'>
                                    Sélectionner un palier :
                                </label>
                                <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                    {Object.entries(catalog.disk).map(([tierStr, tier]) => {
                                        const tierNum = Number(tierStr);
                                        const isSelected = selectedDiskTier === tierNum;
                                        return (
                                            <button
                                                key={tierNum}
                                                type='button'
                                                onClick={() => setSelectedDiskTier(tierNum)}
                                                className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                                                    isSelected
                                                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-[0_0_10px_rgba(139,92,246,0.25)]'
                                                        : 'bg-neutral-900/50 border-[#201d32] text-neutral-400 hover:text-neutral-200 hover:border-[#353050]'
                                                }`}
                                            >
                                                <div className='font-bold'>+{Math.round(tier.amount / 1024)} Go</div>
                                                <div className='text-[10px] text-violet-400 font-mono'>
                                                    {tier.cost} {currencySymbol}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preview Before / After */}
                            {catalog.disk[selectedDiskTier] && (
                                <div className='bg-[#120f20] border border-[#201c35] rounded-lg p-3 mb-4 flex items-center justify-between text-xs'>
                                    <span className='text-neutral-400'>Espace final :</span>
                                    <div className='flex items-center gap-2 font-mono'>
                                        <span className='text-neutral-400'>
                                            {limits.disk !== 0 ? bytesToString(mbToBytes(limits.disk)) : '0'}
                                        </span>
                                        <span className='text-violet-400 font-bold'>➔</span>
                                        <span className='text-emerald-400 font-bold'>
                                            {bytesToString(
                                                mbToBytes(limits.disk + catalog.disk[selectedDiskTier].amount)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='border-t border-[#181622] pt-4 flex items-center justify-between gap-4'>
                            <div>
                                <span className='text-[11px] text-neutral-400 block'>Prix du Booster</span>
                                <span className='font-mono font-bold text-lg text-neutral-100'>
                                    {catalog.disk[selectedDiskTier]?.cost}{' '}
                                    <span className='text-violet-400 text-xs'>{currencyName}</span>
                                </span>
                            </div>
                            <Button
                                type='button'
                                onClick={() => handleApply('disk', selectedDiskTier)}
                                disabled={applying === 'disk' || credits < (catalog.disk[selectedDiskTier]?.cost || 0)}
                                className='bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center gap-2'
                            >
                                {applying === 'disk' ? <Spinner size={'small'} /> : 'Appliquer le Booster NVMe'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* 4. Backup Slots Card */}
                {catalog.backups && (
                    <div className='bg-[#0b0914] border border-[#1f1d2e] hover:border-violet-500/40 rounded-xl p-6 flex flex-col justify-between transition-all duration-200 shadow-md'>
                        <div>
                            <div className='flex items-center justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-400'>
                                        <FontAwesomeIcon icon={faArchive} />
                                    </div>
                                    <div>
                                        <h3 className='font-bold text-neutral-100 text-base'>Sauvegardes Cloud</h3>
                                        <span className='text-xs text-neutral-400'>
                                            Snapshots & Restauration 1-Clic
                                        </span>
                                    </div>
                                </div>
                                <span className='text-xs font-mono bg-neutral-900/80 border border-[#222033] px-2.5 py-1 rounded text-neutral-300'>
                                    Actuel : {limits.backups ?? 0} slots
                                </span>
                            </div>

                            {/* Tier Selector Pills */}
                            <div className='space-y-1.5 mb-4'>
                                <label className='text-[11px] font-semibold text-neutral-400 uppercase tracking-wider'>
                                    Sélectionner un palier :
                                </label>
                                <div className='grid grid-cols-3 gap-2'>
                                    {Object.entries(catalog.backups).map(([tierStr, tier]) => {
                                        const tierNum = Number(tierStr);
                                        const isSelected = selectedBackupTier === tierNum;
                                        return (
                                            <button
                                                key={tierNum}
                                                type='button'
                                                onClick={() => setSelectedBackupTier(tierNum)}
                                                className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                                                    isSelected
                                                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-[0_0_10px_rgba(139,92,246,0.25)]'
                                                        : 'bg-neutral-900/50 border-[#201d32] text-neutral-400 hover:text-neutral-200 hover:border-[#353050]'
                                                }`}
                                            >
                                                <div className='font-bold'>+{tier.amount} Slots</div>
                                                <div className='text-[10px] text-violet-400 font-mono'>
                                                    {tier.cost} {currencySymbol}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preview Before / After */}
                            {catalog.backups[selectedBackupTier] && (
                                <div className='bg-[#120f20] border border-[#201c35] rounded-lg p-3 mb-4 flex items-center justify-between text-xs'>
                                    <span className='text-neutral-400'>Slots finaux :</span>
                                    <div className='flex items-center gap-2 font-mono'>
                                        <span className='text-neutral-400'>{limits.backups ?? 0}</span>
                                        <span className='text-violet-400 font-bold'>➔</span>
                                        <span className='text-emerald-400 font-bold'>
                                            {(limits.backups ?? 0) + catalog.backups[selectedBackupTier].amount} slots
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='border-t border-[#181622] pt-4 flex items-center justify-between gap-4'>
                            <div>
                                <span className='text-[11px] text-neutral-400 block'>Prix du Booster</span>
                                <span className='font-mono font-bold text-lg text-neutral-100'>
                                    {catalog.backups[selectedBackupTier]?.cost}{' '}
                                    <span className='text-violet-400 text-xs'>{currencyName}</span>
                                </span>
                            </div>
                            <Button
                                type='button'
                                onClick={() => handleApply('backups', selectedBackupTier)}
                                disabled={
                                    applying === 'backups' || credits < (catalog.backups[selectedBackupTier]?.cost || 0)
                                }
                                className='bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center gap-2'
                            >
                                {applying === 'backups' ? <Spinner size={'small'} /> : 'Ajouter les Sauvegardes'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Booster History Card */}
            {boosters && boosters.length > 0 && (
                <div className='bg-[#0b0914] border border-[#1f1d2e] rounded-xl p-6 shadow-md'>
                    <div className='flex items-center gap-2.5 mb-4'>
                        <FontAwesomeIcon icon={faHistory} className='text-violet-400' />
                        <h3 className='font-bold text-neutral-100 text-base'>Historique des Boosters sur ce Serveur</h3>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left text-xs'>
                            <thead>
                                <tr className='border-b border-[#1f1d2e] text-neutral-400 font-mono uppercase text-[11px]'>
                                    <th className='py-2.5 px-3'>Type</th>
                                    <th className='py-2.5 px-3'>Montant Alloué</th>
                                    <th className='py-2.5 px-3'>Coût</th>
                                    <th className='py-2.5 px-3'>Date</th>
                                    <th className='py-2.5 px-3 text-right'>Statut</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-[#181624]'>
                                {boosters.map((b) => (
                                    <tr key={b.id} className='hover:bg-neutral-900/30 transition-colors'>
                                        <td className='py-2.5 px-3 font-medium text-neutral-200 uppercase font-mono'>
                                            {b.type}
                                        </td>
                                        <td className='py-2.5 px-3 text-neutral-300 font-mono'>
                                            {b.type === 'ram' ? `+${b.amount / 1024} Go RAM` : ''}
                                            {b.type === 'cpu' ? `+${b.amount}% CPU` : ''}
                                            {b.type === 'disk' ? `+${Math.round(b.amount / 1024)} Go NVMe` : ''}
                                            {b.type === 'backups' ? `+${b.amount} Sauvegardes` : ''}
                                        </td>
                                        <td className='py-2.5 px-3 font-mono text-violet-300 font-bold'>
                                            {b.cost} {currencySymbol}
                                        </td>
                                        <td className='py-2.5 px-3 text-neutral-400'>
                                            {new Date(b.created_at).toLocaleString()}
                                        </td>
                                        <td className='py-2.5 px-3 text-right'>
                                            <span className='inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20'>
                                                <FontAwesomeIcon icon={faCheckCircle} className='text-[10px]' />
                                                Actif
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </ServerContentBlock>
    );
};

export default BoosterStoreContainer;
