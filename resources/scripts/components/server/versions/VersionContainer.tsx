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
import { faCheckCircle, faCube, faDownload, faPuzzlePiece, faSearch } from '@fortawesome/free-solid-svg-icons';

interface ModHit {
    project_id: string;
    slug: string;
    title: string;
    description: string;
    icon_url?: string;
    downloads: number;
}

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addFlash, clearFlashes } = useFlash();

    const [activeTab, setActiveTab] = useState<'versions' | 'mods'>('versions');
    const [loader, setLoader] = useState('paper');
    const [versions, setVersions] = useState<string[]>([]);
    const [selectedVersion, setSelectedVersion] = useState('');
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [installing, setInstalling] = useState(false);

    // Mod browser state
    const [searchQuery, setSearchQuery] = useState('');
    const [modResults, setModResults] = useState<ModHit[]>([]);
    const [searchingMods, setSearchingMods] = useState(false);
    const [installingModId, setInstallingModId] = useState<string | null>(null);

    // Fetch versions when loader changes
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
            .catch((err) => {
                console.error(err);
                setVersions(['1.21.1', '1.20.4', '1.19.4', '1.18.2', '1.16.5']);
                setSelectedVersion('1.21.1');
            })
            .finally(() => setLoadingVersions(false));
    }, [loader, uuid]);

    // Install server version
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
                    message: data.message || 'Installation en cours par Wings.',
                });
            })
            .catch((err) => {
                console.error(err);
                addFlash({
                    key: 'version-manager',
                    type: 'error',
                    message: err?.response?.data?.error || "Erreur lors de l'installation.",
                });
            })
            .finally(() => setInstalling(false));
    };

    // Search mods on Modrinth
    const onSearchMods = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSearchingMods(true);
        http.get(
            `/api/client/servers/${uuid}/mods/search?query=${encodeURIComponent(
                searchQuery
            )}&loader=${loader}&version=${selectedVersion}&limit=16`
        )
            .then(({ data }) => {
                setModResults(data.hits || []);
            })
            .catch((err) => {
                console.error(err);
                setModResults([]);
            })
            .finally(() => setSearchingMods(false));
    };

    // Auto-search mods when switching to mods tab
    useEffect(() => {
        if (activeTab === 'mods' && modResults.length === 0) {
            onSearchMods();
        }
    }, [activeTab]);

    // Install single mod/plugin
    const onInstallMod = (projectId: string, title: string) => {
        setInstallingModId(projectId);
        clearFlashes('version-manager');

        http.post(`/api/client/servers/${uuid}/mods/install`, {
            project_id: projectId,
            loader,
            version: selectedVersion,
        })
            .then(({ data }) => {
                addFlash({
                    key: 'version-manager',
                    type: 'success',
                    message: `Le fichier ${data.filename} a été téléchargé avec succès dans ${data.directory}.`,
                });
            })
            .catch((err) => {
                console.error(err);
                addFlash({
                    key: 'version-manager',
                    type: 'error',
                    message: err?.response?.data?.error || `Impossible d'installer ${title}.`,
                });
            })
            .finally(() => setInstallingModId(null));
    };

    // Compute Java LTS recommendation
    const getJavaRecommendation = (ver: string) => {
        if (ver.startsWith('26') || ver.startsWith('1.21') || ver.startsWith('1.20.5') || ver.startsWith('1.20.6'))
            return 'Java 21 (Recommandé LTS)';
        if (ver.startsWith('1.18') || ver.startsWith('1.19') || ver.startsWith('1.20')) return 'Java 17 (LTS)';
        return 'Java 8 ou 11 (LTS)';
    };

    return (
        <ServerContentBlock title={'Versions & Modloader'}>
            <FlashMessageRender byKey={'version-manager'} css={tw`mb-4`} />

            {/* Segmented Subtab Switcher */}
            <div css={tw`flex gap-2 mb-6 border-b border-white/[0.08] pb-3`}>
                <button
                    onClick={() => setActiveTab('versions')}
                    css={[
                        tw`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2`,
                        activeTab === 'versions'
                            ? tw`bg-violet-600/20 text-violet-300 border border-violet-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]`
                            : tw`text-neutral-400 hover:text-neutral-200 bg-neutral-800/40 border border-transparent`,
                    ]}
                >
                    <FontAwesomeIcon icon={faCube} /> Moteur & Versions Minecraft
                </button>
                <button
                    onClick={() => setActiveTab('mods')}
                    css={[
                        tw`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2`,
                        activeTab === 'mods'
                            ? tw`bg-violet-600/20 text-violet-300 border border-violet-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]`
                            : tw`text-neutral-400 hover:text-neutral-200 bg-neutral-800/40 border border-transparent`,
                    ]}
                >
                    <FontAwesomeIcon icon={faPuzzlePiece} /> Catalogue Modrinth (Mods & Plugins)
                </button>
            </div>

            {activeTab === 'versions' && (
                <div css={tw`grid grid-cols-1 lg:grid-cols-3 gap-6`}>
                    {/* Left: Engine Selector */}
                    <div css={tw`lg:col-span-2 space-y-6`}>
                        <div css={tw`bg-neutral-800/80 border border-white/[0.06] rounded-xl p-5 shadow-sm`}>
                            <h3 css={tw`text-base font-semibold text-neutral-100 mb-1`}>
                                1. Choisir le Moteur (Server Software)
                            </h3>
                            <p css={tw`text-xs text-neutral-400 mb-4`}>
                                Sélectionnez le type de serveur adapté à vos besoins (mods ou plugins).
                            </p>

                            <div css={tw`grid grid-cols-1 sm:grid-cols-2 gap-3`}>
                                {[
                                    {
                                        id: 'paper',
                                        title: 'Paper',
                                        tag: 'Plugins',
                                        desc: 'Performances optimales, compatible Spigot/Bukkit plugins.',
                                    },
                                    {
                                        id: 'purpur',
                                        title: 'Purpur',
                                        tag: 'Plugins + Config',
                                        desc: 'Fork Paper personnalisable avec ajouts gameplay.',
                                    },
                                    {
                                        id: 'fabric',
                                        title: 'Fabric',
                                        tag: 'Mods',
                                        desc: 'Modloader nouvelle génération ultra rapide et léger.',
                                    },
                                    {
                                        id: 'vanilla',
                                        title: 'Vanilla',
                                        tag: 'Officiel',
                                        desc: 'Serveur officiel pur Mojang sans modificateur.',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setLoader(item.id)}
                                        css={[
                                            tw`p-4 rounded-lg cursor-pointer border transition-all duration-150 relative overflow-hidden`,
                                            loader === item.id
                                                ? tw`bg-neutral-800 border-violet-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]`
                                                : tw`bg-neutral-900/60 border-white/[0.05] hover:border-white/[0.15] hover:bg-neutral-800/60`,
                                        ]}
                                    >
                                        <div css={tw`flex justify-between items-center mb-1`}>
                                            <span css={tw`font-semibold text-neutral-100 text-sm`}>{item.title}</span>
                                            <span
                                                css={tw`text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 font-mono border border-violet-500/20`}
                                            >
                                                {item.tag}
                                            </span>
                                        </div>
                                        <p css={tw`text-xs text-neutral-400 leading-relaxed`}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Version Picker Box */}
                        <div css={tw`bg-neutral-800/80 border border-white/[0.06] rounded-xl p-5 shadow-sm`}>
                            <h3 css={tw`text-base font-semibold text-neutral-100 mb-1`}>
                                2. Sélectionner la Version Minecraft
                            </h3>
                            <p css={tw`text-xs text-neutral-400 mb-4`}>
                                Choisissez la version exacte à installer sur votre serveur.
                            </p>

                            {loadingVersions ? (
                                <div css={tw`py-8 flex justify-center items-center`}>
                                    <Spinner size={'small'} />
                                    <span css={tw`ml-3 text-sm text-neutral-400`}>
                                        Chargement des versions {loader}...
                                    </span>
                                </div>
                            ) : (
                                <div css={tw`space-y-4`}>
                                    <div>
                                        <label
                                            css={tw`block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2`}
                                        >
                                            Version Minecraft
                                        </label>
                                        <select
                                            value={selectedVersion}
                                            onChange={(e) => setSelectedVersion(e.target.value)}
                                            css={tw`w-full bg-[#0b0914] border border-white/[0.1] text-neutral-100 rounded-lg px-3 py-2.5 text-sm font-mono focus:border-violet-500 outline-none`}
                                        >
                                            {versions.map((ver) => (
                                                <option key={ver} value={ver}>
                                                    {ver}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div
                                        css={tw`bg-[#0b0914] border border-white/[0.06] rounded-lg p-3 flex items-center justify-between`}
                                    >
                                        <span css={tw`text-xs text-neutral-400`}>Environnement Java requis :</span>
                                        <span
                                            css={tw`text-xs font-mono font-semibold text-violet-300 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20`}
                                        >
                                            {getJavaRecommendation(selectedVersion)}
                                        </span>
                                    </div>

                                    <div css={tw`pt-2 flex justify-end`}>
                                        <Button
                                            type={'button'}
                                            onClick={onInstallVersion}
                                            disabled={installing || !selectedVersion}
                                            css={tw`bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2`}
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

                    {/* Right Info Card */}
                    <div
                        css={tw`bg-neutral-800/80 border border-white/[0.06] rounded-xl p-5 shadow-sm h-auto space-y-4`}
                    >
                        <div css={tw`flex items-center gap-2 text-violet-400 text-sm font-semibold`}>
                            <FontAwesomeIcon icon={faCheckCircle} /> Informations & Bonnes Pratiques
                        </div>
                        <p css={tw`text-xs text-neutral-300 leading-relaxed`}>
                            Le changement de version télécharge directement le binaire officiel <code>server.jar</code>{' '}
                            dans la racine de votre conteneur.
                        </p>
                        <ul css={tw`text-xs text-neutral-400 space-y-2 list-disc list-inside`}>
                            <li>Vos mondes et configurations existants sont conservés.</li>
                            <li>Un redémarrage du serveur applique le nouveau jar.</li>
                            <li>
                                Pensez à faire une sauvegarde avant de rétrograder une version (ex: 1.21 vers 1.20).
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'mods' && (
                <div css={tw`space-y-4`}>
                    {/* Search Bar */}
                    <form onSubmit={onSearchMods} css={tw`flex gap-3`}>
                        <div css={tw`relative flex-1`}>
                            <input
                                type={'text'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Rechercher un mod ou plugin pour ${loader} ${selectedVersion}...`}
                                css={tw`w-full bg-[#0b0914] border border-white/[0.1] text-neutral-100 rounded-lg px-4 py-2.5 text-sm pl-10 focus:border-violet-500 outline-none`}
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                css={tw`absolute left-3.5 top-3.5 text-neutral-500 text-xs`}
                            />
                        </div>
                        <Button
                            type={'submit'}
                            disabled={searchingMods}
                            css={tw`bg-violet-600 hover:bg-violet-500 text-white px-5 rounded-lg text-sm font-semibold`}
                        >
                            {searchingMods ? <Spinner size={'small'} /> : 'Rechercher'}
                        </Button>
                    </form>

                    {/* Results Grid */}
                    {searchingMods ? (
                        <div css={tw`py-12 flex justify-center items-center`}>
                            <Spinner size={'large'} />
                        </div>
                    ) : (
                        <div css={tw`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                            {modResults.map((mod) => (
                                <div
                                    key={mod.project_id}
                                    css={tw`bg-neutral-800/80 border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-violet-500/30 transition-all`}
                                >
                                    <div>
                                        <div css={tw`flex items-start gap-3 mb-2`}>
                                            {mod.icon_url ? (
                                                <img
                                                    src={mod.icon_url}
                                                    alt={mod.title}
                                                    css={tw`w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/[0.08]`}
                                                />
                                            ) : (
                                                <div
                                                    css={tw`w-10 h-10 rounded-lg bg-neutral-700/60 flex items-center justify-center text-violet-400 font-bold flex-shrink-0`}
                                                >
                                                    <FontAwesomeIcon icon={faPuzzlePiece} />
                                                </div>
                                            )}
                                            <div css={tw`overflow-hidden`}>
                                                <h4 css={tw`font-semibold text-neutral-100 text-sm truncate`}>
                                                    {mod.title}
                                                </h4>
                                                <span css={tw`text-[11px] text-neutral-400`}>
                                                    {mod.downloads.toLocaleString()} téléchargements
                                                </span>
                                            </div>
                                        </div>
                                        <p css={tw`text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-3`}>
                                            {mod.description}
                                        </p>
                                    </div>

                                    <Button
                                        type={'button'}
                                        onClick={() => onInstallMod(mod.project_id, mod.title)}
                                        disabled={installingModId === mod.project_id}
                                        css={tw`w-full bg-neutral-700/60 hover:bg-violet-600 hover:text-white text-violet-300 text-xs py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2`}
                                    >
                                        {installingModId === mod.project_id ? (
                                            <Spinner size={'small'} />
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faDownload} /> + Installer 1-clic
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
