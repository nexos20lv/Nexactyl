import os

content = """import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import tw from 'twin.macro';
import { ServerContext } from '@/state/server';
import PageContentBlock from '@/elements/PageContentBlock';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { Button } from '@/elements/button/index';
import useFlash from '@/plugins/useFlash';
import http from '@/api/http';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPuzzlePiece, faCubes, faBoxOpen, faSearch, faServer, faCog } from '@fortawesome/free-solid-svg-icons';
import Input from '@/elements/Input';
import Spinner from '@/elements/Spinner';
import Select from '@/elements/Select';

interface ModrinthResult {
    project_id: string;
    title: string;
    description: string;
    icon_url: string;
    author: string;
}

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, addFlash } = useFlash();
    const [activeTab, setActiveTab] = useState<'versions' | 'plugins' | 'mods' | 'modpacks'>('versions');
    
    // Search states
    const [query, setQuery] = useState('');
    const [mcVersion, setMcVersion] = useState('1.20.1');
    const [loader, setLoader] = useState<'paper'|'fabric'|'forge'|'spigot'>('paper');
    
    const [installing, setInstalling] = useState<string | null>(null);

    // Fetch PaperMC Versions
    const { data: paperVersions, isValidating: loadingVersions } = useSWR(
        'papermc_versions',
        async () => {
            const res = await fetch('https://api.papermc.io/v2/projects/paper');
            const data = await res.json();
            return data.versions.reverse(); // Newest first
        },
        { revalidateOnFocus: false }
    );

    // Fetch Modrinth
    const { data: modrinthData, isValidating: loadingMods } = useSWR(
        [`modrinth_${activeTab}_${query}_${mcVersion}_${loader}`],
        async () => {
            if (activeTab === 'versions') return null;
            if (query.length < 2 && query.length > 0) return { hits: [] };
            
            const type = activeTab === 'plugins' ? 'plugin' : activeTab === 'mods' ? 'mod' : 'modpack';
            
            let facets = `[["project_type:${type}"],["versions:${mcVersion}"]]`;
            // Add loader facet if it's mods or plugins
            if (activeTab === 'mods' && loader !== 'paper' && loader !== 'spigot') {
                facets = `[["project_type:mod"],["versions:${mcVersion}"],["categories:${loader}"]]`;
            } else if (activeTab === 'plugins') {
                // For plugins, typically paper/spigot
                if (loader === 'paper' || loader === 'spigot') {
                    facets = `[["project_type:plugin"],["versions:${mcVersion}"],["categories:${loader}"]]`;
                }
            }

            const res = await fetch(`https://api.modrinth.com/v2/search?query=${query}&facets=${facets}&limit=20`);
            return await res.json();
        }
    );

    const installVersion = async (version: string) => {
        if (!window.confirm(`Voulez-vous vraiment installer Paper ${version} ? Cela remplacera votre fichier server.jar actuel !`)) return;
        setInstalling(version);
        clearFlashes('mods');
        try {
            // Get latest build
            const buildRes = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}`);
            const buildData = await buildRes.json();
            const latestBuild = buildData.builds[buildData.builds.length - 1];
            
            const url = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${latestBuild}/downloads/paper-${version}-${latestBuild}.jar`;
            
            await http.post(`/api/client/servers/${uuid}/files/pull`, {
                url,
                directory: '/',
                filename: 'server.jar',
                foreground: true,
                use_header: false,
            });
            
            addFlash({ key: 'mods', type: 'success', message: `Paper ${version} a été installé avec succès (server.jar) ! Redémarrez votre serveur.` });
        } catch (e: any) {
            addFlash({ key: 'mods', type: 'error', message: `Erreur: ${e.message}` });
        }
        setInstalling(null);
    };

    const installProject = async (project_id: string, title: string) => {
        setInstalling(project_id);
        clearFlashes('mods');
        try {
            const verRes = await fetch(`https://api.modrinth.com/v2/project/${project_id}/version?loaders=["${loader}"]&game_versions=["${mcVersion}"]`);
            const versions = await verRes.json();
            if (!versions || versions.length === 0) {
                // fallback without strict loader if plugin
                const fbRes = await fetch(`https://api.modrinth.com/v2/project/${project_id}/version?game_versions=["${mcVersion}"]`);
                const fbVersions = await fbRes.json();
                if (!fbVersions || fbVersions.length === 0) throw new Error('Aucune version compatible trouvée pour ce mod/plugin.');
                versions.push(fbVersions[0]);
            }
            
            const file = versions[0].files[0];
            const url = file.url;
            const filename = file.filename;
            
            let directory = '/';
            if (activeTab === 'plugins') directory = '/plugins';
            if (activeTab === 'mods') directory = '/mods';
            
            await http.post(`/api/client/servers/${uuid}/files/pull`, {
                url,
                directory,
                filename,
                foreground: true,
                use_header: false,
            });
            
            addFlash({ key: 'mods', type: 'success', message: `${title} a été installé avec succès dans ${directory} !` });
        } catch (e: any) {
            addFlash({ key: 'mods', type: 'error', message: `Erreur: ${e.message}` });
        }
        setInstalling(null);
    };

    return (
        <PageContentBlock title={'Versions & Plugins'} showFlashKey={'mods'}>
            <div css={tw`flex items-center justify-between mb-4`}>
                <h1 css={tw`text-2xl font-bold text-gray-50 flex items-center`}>
                    <FontAwesomeIcon icon={faCubes} css={tw`mr-3`} />
                    Gestionnaire Minecraft
                </h1>
            </div>
            
            <div css={tw`flex space-x-4 mb-6 border-b border-gray-700 pb-2`}>
                <button
                    onClick={() => { setActiveTab('versions'); setQuery(''); }}
                    css={[tw`px-4 py-2 text-sm font-semibold transition-colors duration-200`, activeTab === 'versions' ? tw`text-blue-400 border-b-2 border-blue-400` : tw`text-gray-400 hover:text-gray-200`]}
                >
                    <FontAwesomeIcon icon={faServer} css={tw`mr-2`} /> Versions (Paper)
                </button>
                <button
                    onClick={() => { setActiveTab('plugins'); setQuery(''); }}
                    css={[tw`px-4 py-2 text-sm font-semibold transition-colors duration-200`, activeTab === 'plugins' ? tw`text-blue-400 border-b-2 border-blue-400` : tw`text-gray-400 hover:text-gray-200`]}
                >
                    <FontAwesomeIcon icon={faPuzzlePiece} css={tw`mr-2`} /> Plugins
                </button>
                <button
                    onClick={() => { setActiveTab('mods'); setQuery(''); }}
                    css={[tw`px-4 py-2 text-sm font-semibold transition-colors duration-200`, activeTab === 'mods' ? tw`text-blue-400 border-b-2 border-blue-400` : tw`text-gray-400 hover:text-gray-200`]}
                >
                    <FontAwesomeIcon icon={faBoxOpen} css={tw`mr-2`} /> Mods
                </button>
                <button
                    onClick={() => { setActiveTab('modpacks'); setQuery(''); }}
                    css={[tw`px-4 py-2 text-sm font-semibold transition-colors duration-200`, activeTab === 'modpacks' ? tw`text-blue-400 border-b-2 border-blue-400` : tw`text-gray-400 hover:text-gray-200`]}
                >
                    <FontAwesomeIcon icon={faCubes} css={tw`mr-2`} /> Modpacks
                </button>
            </div>

            {activeTab !== 'versions' && (
                <div css={tw`flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6 relative`}>
                    <div css={tw`flex-1 relative`}>
                        <FontAwesomeIcon icon={faSearch} css={tw`absolute left-4 top-3.5 text-gray-400`} />
                        <Input
                            placeholder={`Rechercher des ${activeTab}...`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            css={tw`w-full pl-10 py-3 bg-gray-800 border-gray-700 shadow-md`}
                        />
                    </div>
                    <div css={tw`w-full md:w-48`}>
                        <Select value={mcVersion} onChange={(e) => setMcVersion(e.target.value)}>
                            <option value="1.20.4">Minecraft 1.20.4</option>
                            <option value="1.20.1">Minecraft 1.20.1</option>
                            <option value="1.19.4">Minecraft 1.19.4</option>
                            <option value="1.18.2">Minecraft 1.18.2</option>
                            <option value="1.16.5">Minecraft 1.16.5</option>
                            <option value="1.12.2">Minecraft 1.12.2</option>
                            <option value="1.8.9">Minecraft 1.8.9</option>
                        </Select>
                    </div>
                    <div css={tw`w-full md:w-48`}>
                        <Select value={loader} onChange={(e) => setLoader(e.target.value as any)}>
                            <option value="paper">Paper / Spigot</option>
                            <option value="fabric">Fabric</option>
                            <option value="forge">Forge</option>
                        </Select>
                    </div>
                </div>
            )}

            {(loadingVersions || loadingMods) && (!paperVersions && !modrinthData) ? (
                <div css={tw`w-full flex justify-center py-10`}>
                    <Spinner size={'large'} />
                </div>
            ) : activeTab === 'versions' ? (
                <div css={tw`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4`}>
                    {paperVersions?.map((version: string) => (
                        <div key={version} css={tw`bg-gray-800 rounded-lg p-4 flex flex-col items-center border border-gray-700 shadow-sm hover:border-gray-600 transition-colors`}>
                            <h3 css={tw`text-xl font-bold text-gray-100 mb-4`}>{version}</h3>
                            <Button
                                size={Button.Sizes.Small}
                                css={tw`w-full mt-auto`}
                                onClick={() => installVersion(version)}
                                disabled={installing === version}
                                isLoading={installing === version}
                            >
                                <FontAwesomeIcon icon={faDownload} css={tw`mr-2`} /> Installer
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div css={tw`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                    {modrinthData?.hits?.map((project: ModrinthResult) => (
                        <div key={project.project_id} css={tw`bg-gray-800 rounded-lg p-4 flex flex-col border border-gray-700 shadow-sm hover:border-gray-600 transition-colors`}>
                            <div css={tw`flex items-start mb-3`}>
                                {project.icon_url ? (
                                    <img src={project.icon_url} alt={project.title} css={tw`w-12 h-12 rounded bg-gray-700 mr-4`} />
                                ) : (
                                    <div css={tw`w-12 h-12 rounded bg-gray-700 mr-4 flex items-center justify-center`}>
                                        <FontAwesomeIcon icon={faPuzzlePiece} css={tw`text-xl text-gray-500`} />
                                    </div>
                                )}
                                <div>
                                    <h3 css={tw`text-lg font-bold text-gray-100 leading-tight`}>{project.title}</h3>
                                    <span css={tw`text-xs text-gray-400`}>par {project.author}</span>
                                </div>
                            </div>
                            <p css={tw`text-sm text-gray-300 flex-grow mb-4 line-clamp-3`}>{project.description}</p>
                            <Button
                                size={Button.Sizes.Small}
                                css={tw`w-full mt-auto`}
                                onClick={() => installProject(project.project_id, project.title)}
                                disabled={installing === project.project_id}
                                isLoading={installing === project.project_id}
                            >
                                <FontAwesomeIcon icon={faDownload} css={tw`mr-2`} /> Installer
                            </Button>
                        </div>
                    ))}
                    {modrinthData?.hits?.length === 0 && (
                        <div css={tw`col-span-full text-center text-gray-400 py-10`}>
                            Aucun résultat trouvé.
                        </div>
                    )}
                </div>
            )}
        </PageContentBlock>
    );
};
"""

with open('/var/www/pterodactyl/resources/scripts/components/server/mods/ModManagerContainer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ModManagerContainer.tsx generated with Versions support!")
