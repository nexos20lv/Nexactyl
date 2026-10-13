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
import {
    faCheckCircle,
    faCube,
    faDownload,
    faFire,
    faLayerGroup,
    faPuzzlePiece,
    faSearch,
    faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';

interface LoaderItem {
    id: string;
    name: string;
    category: string;
    tag: string;
    badge_color: string;
    description: string;
    default?: boolean;
}

interface ModHit {
    project_id: string;
    slug: string;
    title: string;
    description: string;
    icon_url?: string;
    downloads: number;
    author: string;
    source: 'modrinth' | 'curseforge';
}

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addFlash, clearFlashes } = useFlash();

    const [activeTab, setActiveTab] = useState<'versions' | 'mods'>('versions');

    // Engine Loaders
    const [loaders, setLoaders] = useState<LoaderItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loader, setLoader] = useState('paper');

    // Versions
    const [versions, setVersions] = useState<string[]>([]);
    const [selectedVersion, setSelectedVersion] = useState('');
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [installing, setInstalling] = useState(false);

    // Mod & Plugin Browser (Modrinth + CurseForge)
    const [modSource, setModSource] = useState<'modrinth' | 'curseforge'>('modrinth');
    const [searchQuery, setSearchQuery] = useState('');
    const [modResults, setModResults] = useState<ModHit[]>([]);
    const [searchingMods, setSearchingMods] = useState(false);
    const [installingModId, setInstallingModId] = useState<string | null>(null);

    // Fetch Loaders on Mount
    useEffect(() => {
        http.get(`/api/client/servers/${uuid}/versions/loaders`)
            .then(({ data }) => {
                if (data.loaders && data.loaders.length > 0) {
                    setLoaders(data.loaders);
                }
            })
            .catch(() => {
                // Fallback default loaders
                setLoaders([
                    {
                        id: 'paper',
                        name: 'Paper',
                        category: 'Plugins & Performance',
                        tag: 'Recommandé',
                        badge_color: 'violet',
                        description: 'Moteur haute performance n°1 compatible plugins Spigot/Bukkit.',
                    },
                    {
                        id: 'purpur',
                        name: 'Purpur',
                        category: 'Plugins & Performance',
                        tag: 'Ultra Opti',
                        badge_color: 'fuchsia',
                        description: 'Fork de Paper hautement optimisé avec configurations de gameplay avancées.',
                    },
                    {
                        id: 'spigot',
                        name: 'Spigot',
                        category: 'Plugins & Performance',
                        tag: 'Classique',
                        badge_color: 'amber',
                        description: 'Moteur historique pour plugins Bukkit et Spigot.',
                    },
                    {
                        id: 'neoforge',
                        name: 'NeoForge',
                        category: 'Modded (Mods)',
                        tag: 'Moderne 1.20.2+',
                        badge_color: 'cyan',
                        description: 'Le successeur officiel et moderne de Forge pour les versions récentes.',
                    },
                    {
                        id: 'fabric',
                        name: 'Fabric',
                        category: 'Modded (Mods)',
                        tag: 'Ultra Léger',
                        badge_color: 'emerald',
                        description: 'Modloader nouvelle génération ultra rapide et modulaire (Sodium, Lithium).',
                    },
                    {
                        id: 'forge',
                        name: 'Minecraft Forge',
                        category: 'Modded (Mods)',
                        tag: 'Modpacks Standard',
                        badge_color: 'blue',
                        description: 'Le modloader le plus populaire pour les gros modpacks (1.7.10 -> 1.20.x).',
                    },
                    {
                        id: 'legacyfabric',
                        name: 'Legacy Fabric',
                        category: 'Modded (Mods)',
                        tag: 'Rétro 1.8 - 1.12',
                        badge_color: 'indigo',
                        description: 'Moteur Fabric optimisé pour les versions historiques (1.8.9, 1.12.2).',
                    },
                    {
                        id: 'mohist',
                        name: 'Mohist',
                        category: 'Hybride (Mods + Plugins)',
                        tag: 'Forge + Paper',
                        badge_color: 'rose',
                        description:
                            'Moteur hybride permettant de lancer des mods Forge ET des plugins Paper ensemble.',
                    },
                    {
                        id: 'velocity',
                        name: 'Velocity',
                        category: 'Réseau & Proxy',
                        tag: 'Proxy Haute Vitesse',
                        badge_color: 'purple',
                        description: 'Le proxy nouvelle génération de PaperMC pour interconnecter vos serveurs.',
                    },
                    {
                        id: 'vanilla',
                        name: 'Vanilla',
                        category: 'Officiel',
                        tag: 'Pur Mojang',
                        badge_color: 'gray',
                        description: 'Serveur officiel pur Mojang sans modificateur.',
                    },
                ]);
            });
    }, [uuid]);

    // Fetch Versions when Loader Changes
    useEffect(() => {
        setLoadingVersions(true);
        http.get(`/api/client/servers/${uuid}/versions/list?loader=${loader}`)
            .then(({ data }) => {
                const list = data.versions || [];
                setVersions(list);
                if (list.length > 0) {
                    setSelectedVersion(list[0]);
                }
            })
            .catch(() => {
                setVersions(['1.21.1', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2']);
                setSelectedVersion('1.21.1');
            })
            .finally(() => setLoadingVersions(false));
    }, [loader, uuid]);

    // Install Server Version
    const onInstallVersion = () => {
        if (!selectedVersion) return;
        setInstalling(true);
        clearFlashes('version-manager');

        http.post(`/api/client/servers/${uuid}/versions/install`, {
            loader,
            version: selectedVersion,
        })
            .then(({ data }) => {
                addFlash({
                    key: 'version-manager',
                    type: 'success',
                    message: data.message || `Le serveur ${loader} ${selectedVersion} a été installé avec succès.`,
                });
            })
            .catch((err) => {
                addFlash({
                    key: 'version-manager',
                    type: 'error',
                    message: err?.response?.data?.error || "Erreur lors de l'installation du moteur.",
                });
            })
            .finally(() => setInstalling(false));
    };

    // Search Mods & Plugins (Supports Modrinth & CurseForge)
    const onSearchMods = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSearchingMods(true);
        http.get(
            `/api/client/servers/${uuid}/mods/search?source=${modSource}&query=${encodeURIComponent(
                searchQuery
            )}&loader=${loader}&version=${selectedVersion}&limit=24`
        )
            .then(({ data }) => {
                setModResults(data.hits || []);
            })
            .catch(() => {
                setModResults([]);
            })
            .finally(() => setSearchingMods(false));
    };

    // Trigger search when tab or source changes
    useEffect(() => {
        if (activeTab === 'mods') {
            onSearchMods();
        }
    }, [activeTab, modSource]);

    // Install Single Mod/Plugin
    const onInstallMod = (mod: ModHit) => {
        setInstallingModId(mod.project_id);
        clearFlashes('version-manager');

        http.post(`/api/client/servers/${uuid}/mods/install`, {
            project_id: mod.project_id,
            loader,
            version: selectedVersion,
            source: mod.source,
        })
            .then(({ data }) => {
                addFlash({
                    key: 'version-manager',
                    type: 'success',
                    message: `Le fichier ${data.filename} a été installé avec succès dans ${data.directory} (via ${
                        mod.source === 'curseforge' ? 'CurseForge' : 'Modrinth'
                    }).`,
                });
            })
            .catch((err) => {
                addFlash({
                    key: 'version-manager',
                    type: 'error',
                    message: err?.response?.data?.error || `Impossible d'installer ${mod.title}.`,
                });
            })
            .finally(() => setInstallingModId(null));
    };

    // Recommended Java version
    const getJavaRecommendation = (ver: string) => {
        if (ver.startsWith('26') || ver.startsWith('1.21') || ver.startsWith('1.20.5') || ver.startsWith('1.20.6'))
            return 'Java 21 (Recommandé LTS)';
        if (ver.startsWith('1.18') || ver.startsWith('1.19') || ver.startsWith('1.20')) return 'Java 17 (LTS)';
        if (ver.startsWith('1.17')) return 'Java 16';
        return 'Java 8 ou 11 (LTS Rétro)';
    };

    // Filter categories
    const categories = [
        { id: 'all', label: 'Tous les Moteurs' },
        { id: 'Plugins & Performance', label: 'Plugins & Optimisé' },
        { id: 'Modded (Mods)', label: 'Modded & Modpacks' },
        { id: 'Hybride (Mods + Plugins)', label: 'Hybride (Mods + Plugins)' },
        { id: 'Réseau & Proxy', label: 'Proxy' },
        { id: 'Officiel', label: 'Officiel' },
    ];

    const filteredLoaders = loaders.filter((item) => selectedCategory === 'all' || item.category === selectedCategory);

    return (
        <ServerContentBlock title={'Versions & Modloader'}>
            <FlashMessageRender byKey={'version-manager'} css={tw`mb-4`} />

            {/* Subtab Switcher */}
            <div className={'flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-[#25213b] pb-3'}>
                <div className={'flex items-center gap-2'}>
                    <button
                        onClick={() => setActiveTab('versions')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                            activeTab === 'versions'
                                ? 'bg-violet-600/25 text-violet-200 border border-violet-500/50 shadow-lg shadow-violet-950/30'
                                : 'text-neutral-400 hover:text-neutral-200 bg-[#0e0c18] border border-white/5'
                        }`}
                    >
                        <FontAwesomeIcon icon={faCube} className={'text-violet-400'} />
                        <span>Moteurs & Versions (.jar)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('mods')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                            activeTab === 'mods'
                                ? 'bg-violet-600/25 text-violet-200 border border-violet-500/50 shadow-lg shadow-violet-950/30'
                                : 'text-neutral-400 hover:text-neutral-200 bg-[#0e0c18] border border-white/5'
                        }`}
                    >
                        <FontAwesomeIcon icon={faPuzzlePiece} className={'text-fuchsia-400'} />
                        <span>Boutique Mods & Plugins</span>
                    </button>
                </div>

                <div className={'text-xs font-mono text-neutral-400 flex items-center gap-2'}>
                    <span>Moteur Actif :</span>
                    <span
                        className={
                            'px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 font-bold uppercase'
                        }
                    >
                        {loader} {selectedVersion}
                    </span>
                </div>
            </div>

            {/* TAB 1: SERVER SOFTWARE ENGINES & VERSIONS */}
            {activeTab === 'versions' && (
                <div className={'grid grid-cols-1 lg:grid-cols-3 gap-6'}>
                    {/* Left: Engine Selection */}
                    <div className={'lg:col-span-2 space-y-5'}>
                        {/* Category filter pills */}
                        <div className={'flex flex-wrap items-center gap-1.5'}>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-violet-600 text-white font-semibold shadow-sm'
                                            : 'bg-[#0e0c18] text-neutral-400 hover:text-neutral-200 border border-white/5'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Engines Grid */}
                        <div className={'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
                            {filteredLoaders.map((item) => {
                                const isSelected = loader === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setLoader(item.id)}
                                        className={`p-4 rounded-2xl cursor-pointer border transition-all duration-150 relative overflow-hidden flex flex-col justify-between ${
                                            isSelected
                                                ? 'bg-[#151128] border-violet-500 ring-2 ring-violet-500/20 shadow-xl shadow-violet-950/30'
                                                : 'bg-[#0e0c18] border-white/5 hover:border-violet-500/30 hover:bg-[#131022]'
                                        }`}
                                    >
                                        <div className={'flex items-start justify-between gap-2 mb-2'}>
                                            <div className={'flex items-center gap-2.5'}>
                                                <div
                                                    className={
                                                        'w-8 h-8 rounded-lg bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-400 text-sm'
                                                    }
                                                >
                                                    <FontAwesomeIcon icon={faCube} />
                                                </div>
                                                <div>
                                                    <h4 className={'font-bold text-white text-sm'}>{item.name}</h4>
                                                    <span
                                                        className={
                                                            'text-[10px] text-neutral-400 uppercase tracking-wider'
                                                        }
                                                    >
                                                        {item.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                className={
                                                    'text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold'
                                                }
                                            >
                                                {item.tag}
                                            </span>
                                        </div>

                                        <p className={'text-xs text-neutral-400 leading-relaxed mb-3'}>
                                            {item.description}
                                        </p>

                                        <div
                                            className={
                                                'flex items-center justify-between pt-2 border-t border-white/5 text-[11px]'
                                            }
                                        >
                                            <span className={'text-neutral-500 font-mono'}>Binaire : server.jar</span>
                                            {isSelected ? (
                                                <span
                                                    className={'text-emerald-400 font-semibold flex items-center gap-1'}
                                                >
                                                    <FontAwesomeIcon icon={faCheckCircle} /> Sélectionné
                                                </span>
                                            ) : (
                                                <span className={'text-neutral-400 hover:text-white'}>
                                                    Choisir &rarr;
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Version Picker Box */}
                        <div className={'bg-[#0e0c18] border border-[#25213b] rounded-2xl p-5 shadow-xl'}>
                            <h3 className={'text-base font-bold text-white mb-1 flex items-center gap-2'}>
                                <FontAwesomeIcon icon={faLayerGroup} className={'text-violet-400'} />
                                <span>2. Sélectionner la Version pour {loader.toUpperCase()}</span>
                            </h3>
                            <p className={'text-xs text-neutral-400 mb-4'}>
                                Choisissez la version exacte de Minecraft à déployer sur votre conteneur.
                            </p>

                            {loadingVersions ? (
                                <div className={'py-8 flex justify-center items-center'}>
                                    <Spinner size={'small'} />
                                    <span className={'ml-3 text-sm text-neutral-400'}>
                                        Chargement du catalogue {loader}...
                                    </span>
                                </div>
                            ) : (
                                <div className={'space-y-4'}>
                                    <div className={'grid grid-cols-1 sm:grid-cols-3 gap-3'}>
                                        <div className={'sm:col-span-2'}>
                                            <label
                                                className={
                                                    'block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2'
                                                }
                                            >
                                                Version Minecraft
                                            </label>
                                            <select
                                                value={selectedVersion}
                                                onChange={(e) => setSelectedVersion(e.target.value)}
                                                className={
                                                    'w-full bg-[#07060a] border border-neutral-700/80 text-white rounded-xl px-3.5 py-2.5 text-sm font-mono focus:border-violet-500 outline-none'
                                                }
                                            >
                                                {versions.map((ver) => (
                                                    <option key={ver} value={ver}>
                                                        {ver}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label
                                                className={
                                                    'block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2'
                                                }
                                            >
                                                Environnement JVM
                                            </label>
                                            <div
                                                className={
                                                    'h-10 px-3 bg-[#07060a] border border-neutral-700/80 rounded-xl flex items-center text-xs font-mono text-violet-300 truncate'
                                                }
                                            >
                                                {getJavaRecommendation(selectedVersion)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={'pt-2 flex justify-end'}>
                                        <Button
                                            type={'button'}
                                            onClick={onInstallVersion}
                                            disabled={installing || !selectedVersion}
                                            className={
                                                '!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-2'
                                            }
                                        >
                                            {installing ? (
                                                <Spinner size={'small'} />
                                            ) : (
                                                <FontAwesomeIcon icon={faDownload} />
                                            )}
                                            Installer {loader} {selectedVersion}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Info Box */}
                    <div className={'space-y-4'}>
                        <div className={'bg-[#0e0c18] border border-[#25213b] rounded-2xl p-5 shadow-xl space-y-4'}>
                            <div className={'flex items-center gap-2 text-violet-400 text-sm font-bold'}>
                                <FontAwesomeIcon icon={faShieldAlt} />
                                <span>Installation Automatique & Sécurisée</span>
                            </div>
                            <p className={'text-xs text-neutral-300 leading-relaxed'}>
                                Le module VersionManager télécharge directement le binaire officiel sous le nom{' '}
                                <code>server.jar</code> dans la racine de votre conteneur.
                            </p>
                            <div
                                className={
                                    'p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-xs text-violet-200'
                                }
                            >
                                <strong>Conservation des données :</strong> Vos maps (world), plugins, configs et
                                sauvegardes existants ne sont pas écrasés.
                            </div>
                            <ul className={'text-xs text-neutral-400 space-y-2 list-disc list-inside leading-relaxed'}>
                                <li>Compatible avec tous les modpacks et plugins.</li>
                                <li>Prêt pour Java 8, Java 17 et Java 21 LTS.</li>
                                <li>Application immédiate après redémarrage du serveur.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: MODS & PLUGINS BROWSER (MODRINTH & CURSEFORGE) */}
            {activeTab === 'mods' && (
                <div className={'space-y-5'}>
                    {/* Source Selector & Search Bar */}
                    <div className={'bg-[#0e0c18] border border-[#25213b] rounded-2xl p-4 shadow-xl space-y-4'}>
                        <div className={'flex flex-wrap items-center justify-between gap-3'}>
                            <div className={'flex items-center gap-2'}>
                                <span className={'text-xs text-neutral-400 font-semibold'}>Source :</span>
                                <button
                                    type={'button'}
                                    onClick={() => setModSource('modrinth')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                        modSource === 'modrinth'
                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                                            : 'bg-[#141124] text-neutral-400 hover:text-white border border-white/5'
                                    }`}
                                >
                                    <span className={'w-2 h-2 rounded-full bg-emerald-300'} />
                                    Modrinth (Open Source)
                                </button>
                                <button
                                    type={'button'}
                                    onClick={() => setModSource('curseforge')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                        modSource === 'curseforge'
                                            ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                                            : 'bg-[#141124] text-neutral-400 hover:text-white border border-white/5'
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faFire} className={'text-amber-300'} />
                                    CurseForge (Modpacks & Rétro)
                                </button>
                            </div>

                            <div className={'text-xs font-mono text-neutral-400'}>
                                Filtre : <span className={'text-white font-semibold'}>{loader}</span> &bull;{' '}
                                <span className={'text-violet-300 font-semibold'}>
                                    {selectedVersion || 'Toutes versions'}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={onSearchMods} className={'flex gap-3'}>
                            <div className={'relative flex-1'}>
                                <input
                                    type={'text'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`Rechercher parmi les millions de mods & plugins sur ${
                                        modSource === 'curseforge' ? 'CurseForge' : 'Modrinth'
                                    } (ex: JEI, EssentialsX, WorldEdit, Lithium)...`}
                                    className={
                                        'w-full bg-[#07060a] border border-neutral-700/80 text-white rounded-xl px-4 py-2.5 text-sm pl-10 focus:border-violet-500 outline-none'
                                    }
                                />
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className={'absolute left-3.5 top-3.5 text-neutral-500 text-xs'}
                                />
                            </div>
                            <Button
                                type={'submit'}
                                disabled={searchingMods}
                                className={
                                    '!bg-violet-600 hover:!bg-violet-500 text-white px-5 rounded-xl text-sm font-semibold'
                                }
                            >
                                {searchingMods ? <Spinner size={'small'} /> : 'Rechercher'}
                            </Button>
                        </form>
                    </div>

                    {/* Results Grid */}
                    {searchingMods ? (
                        <div className={'py-16 flex flex-col justify-center items-center'}>
                            <Spinner size={'large'} />
                            <p className={'text-sm text-neutral-400 mt-4'}>
                                Interrogation du catalogue {modSource === 'curseforge' ? 'CurseForge' : 'Modrinth'} en
                                cours...
                            </p>
                        </div>
                    ) : modResults.length === 0 ? (
                        <div className={'text-center py-16 bg-[#0e0c18] border border-white/5 rounded-2xl'}>
                            <FontAwesomeIcon icon={faPuzzlePiece} className={'text-neutral-600 text-4xl mb-3'} />
                            <p className={'text-sm text-neutral-300 font-semibold'}>
                                Aucun résultat pour cette recherche.
                            </p>
                            <p className={'text-xs text-neutral-500 mt-1'}>
                                Essayez un autre mot-clé ou basculez entre Modrinth et CurseForge.
                            </p>
                        </div>
                    ) : (
                        <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
                            {modResults.map((mod) => (
                                <div
                                    key={`${mod.source}-${mod.project_id}`}
                                    className={
                                        'bg-[#0e0c18] border border-[#25213b] rounded-2xl p-4 flex flex-col justify-between shadow-xl hover:border-violet-500/40 transition-all duration-150'
                                    }
                                >
                                    <div>
                                        <div className={'flex items-start gap-3 mb-2'}>
                                            {mod.icon_url ? (
                                                <img
                                                    src={mod.icon_url}
                                                    alt={mod.title}
                                                    className={
                                                        'w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-white/10 shadow-sm'
                                                    }
                                                />
                                            ) : (
                                                <div
                                                    className={
                                                        'w-11 h-11 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold flex-shrink-0'
                                                    }
                                                >
                                                    <FontAwesomeIcon icon={faPuzzlePiece} />
                                                </div>
                                            )}
                                            <div className={'overflow-hidden flex-1'}>
                                                <div className={'flex items-center justify-between gap-1'}>
                                                    <h4
                                                        className={'font-bold text-white text-sm truncate'}
                                                        title={mod.title}
                                                    >
                                                        {mod.title}
                                                    </h4>
                                                    <span
                                                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold flex-shrink-0 ${
                                                            mod.source === 'curseforge'
                                                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                        }`}
                                                    >
                                                        {mod.source}
                                                    </span>
                                                </div>
                                                <div
                                                    className={
                                                        'text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5'
                                                    }
                                                >
                                                    <span>Par {mod.author}</span>
                                                    <span>&bull;</span>
                                                    <span>{mod.downloads.toLocaleString()} dl</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className={'text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-4'}>
                                            {mod.description || 'Aucune description fournie.'}
                                        </p>
                                    </div>

                                    <Button
                                        type={'button'}
                                        onClick={() => onInstallMod(mod)}
                                        disabled={installingModId === mod.project_id}
                                        className={
                                            'w-full !bg-[#151128] hover:!bg-violet-600 hover:!text-white text-violet-300 text-xs py-2 rounded-xl font-semibold border border-violet-500/30 transition-all flex items-center justify-center gap-2 shadow-sm'
                                        }
                                    >
                                        {installingModId === mod.project_id ? (
                                            <Spinner size={'small'} />
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faDownload} />
                                                <span>+ Installer 1-clic</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </ServerContentBlock>
    );
};
