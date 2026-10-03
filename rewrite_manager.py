import os

content = """import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import tw from 'twin.macro';
import { ServerContext } from '@/state/server';
import PageContentBlock from '@/elements/PageContentBlock';
import { Button } from '@/elements/button/index';
import useFlash from '@/plugins/useFlash';
import http from '@/api/http';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPuzzlePiece, faCubes, faBoxOpen, faSearch, faServer } from '@fortawesome/free-solid-svg-icons';
import Input from '@/elements/Input';
import Spinner from '@/elements/Spinner';
import Select from '@/elements/Select';

interface ModrinthResult {
    project_id: string; title: string; description: string; icon_url: string; author: string;
}

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, addFlash } = useFlash();
    const [activeTab, setActiveTab] = useState<'versions' | 'plugins' | 'mods' | 'modpacks'>('versions');
    
    const [query, setQuery] = useState('');
    const [mcVersion, setMcVersion] = useState('1.20.1');
    const [loader, setLoader] = useState<'paper'|'fabric'|'forge'|'spigot'>('paper');
    
    const [software, setSoftware] = useState<'paper'|'purpur'|'vanilla'|'fabric'>('paper');
    const [installing, setInstalling] = useState<string | null>(null);

    // Fetch Versions
    const { data: mcVersions, isValidating: loadingVersions } = useSWR(
        [`versions_${software}`],
        async () => {
            if (software === 'paper') {
                const res = await fetch('https://api.papermc.io/v2/projects/paper');
                const data = await res.json();
                return data.versions.reverse();
            } else if (software === 'purpur') {
                const res = await fetch('https://api.purpurmc.org/v2/purpur');
                const data = await res.json();
                return data.versions.reverse();
            } else if (software === 'vanilla') {
                const res = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json');
                const data = await res.json();
                return data.versions.filter((v: any) => v.type === 'release').map((v: any) => v.id);
            } else if (software === 'fabric') {
                const res = await fetch('https://meta.fabricmc.net/v2/versions/game');
                const data = await res.json();
                return data.filter((v: any) => v.stable).map((v: any) => v.version);
            }
            return [];
        },
        { revalidateOnFocus: false }
    );

    const { data: modrinthData, isValidating: loadingMods } = useSWR(
        [`modrinth_${activeTab}_${query}_${mcVersion}_${loader}`],
        async () => {
            if (activeTab === 'versions') return null;
            if (query.length < 2 && query.length > 0) return { hits: [] };
            const type = activeTab === 'plugins' ? 'plugin' : activeTab === 'mods' ? 'mod' : 'modpack';
            let facets = `[["project_type:${type}"],["versions:${mcVersion}"]]`;
            if (activeTab === 'mods' && loader !== 'paper' && loader !== 'spigot') {
                facets = `[["project_type:mod"],["versions:${mcVersion}"],["categories:${loader}"]]`;
            } else if (activeTab === 'plugins' && (loader === 'paper' || loader === 'spigot')) {
                facets = `[["project_type:plugin"],["versions:${mcVersion}"],["categories:${loader}"]]`;
            }
            const res = await fetch(`https://api.modrinth.com/v2/search?query=${query}&facets=${facets}&limit=20`);
            return await res.json();
        }
    );

    const installVersion = async (version: string) => {
        if (!window.confirm(`Voulez-vous vraiment installer ${software} ${version} ? Cela remplacera server.jar !`)) return;
        setInstalling(version);
        clearFlashes('mods');
        try {
            let url = '';
            if (software === 'paper') {
                const bRes = await fetch(`https://api.papermc.io/v2/projects/paper/versions/${version}`);
                const bData = await bRes.json();
                const latest = bData.builds[bData.builds.length - 1];
                url = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${latest}/downloads/paper-${version}-${latest}.jar`;
            } else if (software === 'purpur') {
                url = `https://api.purpurmc.org/v2/purpur/${version}/latest/download`;
            } else if (software === 'vanilla') {
                const mRes = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest.json');
                const mData = await mRes.json();
                const vMeta = mData.versions.find((v: any) => v.id === version);
                const dRes = await fetch(vMeta.url);
                const dData = await dRes.json();
                url = dData.downloads.server.url;
            } else if (software === 'fabric') {
                const lRes = await fetch('https://meta.fabricmc.net/v2/versions/loader');
                const lData = await lRes.json();
                const iRes = await fetch('https://meta.fabricmc.net/v2/versions/installer');
                const iData = await iRes.json();
                url = `https://meta.fabricmc.net/v2/versions/loader/${version}/${lData[0].version}/${iData[0].version}/server/jar`;
            }
            
            await http.post(`/api/client/servers/${uuid}/files/pull`, {
                url, directory: '/', filename: 'server.jar', foreground: true, use_header: false,
            });
            addFlash({ key: 'mods', type: 'success', message: `${software} ${version} installé avec succès (server.jar).` });
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
                const fbRes = await fetch(`https://api.modrinth.com/v2/project/${project_id}/version?game_versions=["${mcVersion}"]`);
                const fbVersions = await fbRes.json();
                if (!fbVersions || fbVersions.length === 0) throw new Error('Aucune version compatible.');
                versions.push(fbVersions[0]);
            }
            const file = versions[0].files[0];
            const directory = activeTab === 'plugins' ? '/plugins' : '/mods';
            await http.post(`/api/client/servers/${uuid}/files/pull`, {
                url: file.url, directory, filename: file.filename, foreground: true, use_header: false,
            });
            addFlash({ key: 'mods', type: 'success', message: `${title} installé dans ${directory} !` });
        } catch (e: any) {
            addFlash({ key: 'mods', type: 'error', message: `Erreur: ${e.message}` });
        }
        setInstalling(null);
    };

    return (
        <PageContentBlock title={'Versions & Plugins'} showFlashKey={'mods'}>
            <div css={tw`flex items-center mb-6`}>
                <h1 css={tw`text-2xl font-bold text-gray-50 flex items-center`}><FontAwesomeIcon icon={faCubes} css={tw`mr-3`} /> Gestionnaire Minecraft</h1>
            </div>
            
            <div css={tw`flex space-x-4 mb-6 border-b border-gray-700 pb-2 overflow-x-auto`}>
                <button onClick={() => { setActiveTab('versions'); setQuery(''); }} css={[tw`px-4 py-2 text-sm font-semibold transition-colors duration-200`, activeTab === 'versions' ? tw`text-blue-400 border-b-2 border-blue-400` : tw`text-gray-400 hover:text-gray-200`]}>
                    <FontAwesomeIcon icon={faServer} css={tw`mr-2`} /> Versions
                </button>
                <button onClick={() => { setActiveTab('plugins'); setQuery(''); }} css={[tw`px-4 py-2 text-sm font-semibold transition-colors duration-200`, activeTab === 'plugins' ? tw`text-blue-400 border-b-2 border-blue-400` : tw`text-gray-400 hover:text-gray-200`]}>
                    <FontAwesomeIcon icon={faPuzzlePiece} css={tw`mr-2`} /> Plugins
                </button>
                <button onClick={() => { setActiveTab('mods'); setQuery(''); }} css={[tw`px-4 py-2 text-sm font-semibold transition-colors duration-200`, activeTab === 'mods' ? tw`text-blue-400 border-b-2 border-blue-400` : tw`text-gray-400 hover:text-gray-200`]}>
                    <FontAwesomeIcon icon={faBoxOpen} css={tw`mr-2`} /> Mods
                </button>
                <button onClick={() => { setActiveTab('modpacks'); setQuery(''); }} css={[tw`px-4 py-2 text-sm font-semibold transition-colors duration-200`, activeTab === 'modpacks' ? tw`text-blue-400 border-b-2 border-blue-400` : tw`text-gray-400 hover:text-gray-200`]}>
                    <FontAwesomeIcon icon={faCubes} css={tw`mr-2`} /> Modpacks
                </button>
            </div>

            {activeTab === 'versions' ? (
                <div css={tw`mb-6`}>
                    <Select value={software} onChange={(e) => setSoftware(e.target.value as any)} css={tw`w-full md:w-64 mb-4`}>
                        <option value="paper">Paper (Recommandé)</option>
                        <option value="purpur">Purpur (Optimisé)</option>
                        <option value="fabric">Fabric (Mods)</option>
                        <option value="vanilla">Vanilla (Classique)</option>
                    </Select>
                    {loadingVersions ? (
                        <div css={tw`w-full flex justify-center py-10`}><Spinner size={'large'} /></div>
                    ) : (
                        <div css={tw`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4`}>
                            {mcVersions?.map((version: string) => (
                                <div key={version} css={tw`bg-gray-800 rounded-lg p-4 flex flex-col items-center border border-gray-700 shadow-sm`}>
                                    <h3 css={tw`text-lg font-bold text-gray-100 mb-3`}>{version}</h3>
                                    <Button size={Button.Sizes.Small} css={tw`w-full`} onClick={() => installVersion(version)} disabled={installing === version} isLoading={installing === version}>
                                        Installer
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div css={tw`flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6 relative`}>
                        <div css={tw`flex-1 relative`}>
                            <FontAwesomeIcon icon={faSearch} css={tw`absolute left-4 top-3.5 text-gray-400`} />
                            <Input placeholder={`Rechercher des ${activeTab}...`} value={query} onChange={(e) => setQuery(e.target.value)} css={tw`w-full pl-10 py-3 bg-gray-800 border-gray-700 shadow-md`} />
                        </div>
                        <Select value={mcVersion} onChange={(e) => setMcVersion(e.target.value)} css={tw`w-full md:w-48`}>
                            <option value="1.20.4">1.20.4</option>
                            <option value="1.20.1">1.20.1</option>
                            <option value="1.19.4">1.19.4</option>
                            <option value="1.18.2">1.18.2</option>
                            <option value="1.16.5">1.16.5</option>
                            <option value="1.12.2">1.12.2</option>
                            <option value="1.8.9">1.8.9</option>
                        </Select>
                        <Select value={loader} onChange={(e) => setLoader(e.target.value as any)} css={tw`w-full md:w-48`}>
                            <option value="paper">Paper / Spigot</option>
                            <option value="fabric">Fabric</option>
                            <option value="forge">Forge</option>
                        </Select>
                    </div>

                    {loadingMods && !modrinthData ? (
                        <div css={tw`w-full flex justify-center py-10`}><Spinner size={'large'} /></div>
                    ) : (
                        <div css={tw`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                            {modrinthData?.hits?.map((project: ModrinthResult) => (
                                <div key={project.project_id} css={tw`bg-gray-800 rounded-lg p-4 flex flex-col border border-gray-700`}>
                                    <div css={tw`flex items-start mb-3`}>
                                        {project.icon_url ? <img src={project.icon_url} css={tw`w-12 h-12 rounded mr-4`} /> : <div css={tw`w-12 h-12 rounded bg-gray-700 mr-4`} />}
                                        <div>
                                            <h3 css={tw`text-lg font-bold text-gray-100`}>{project.title}</h3>
                                            <span css={tw`text-xs text-gray-400`}>par {project.author}</span>
                                        </div>
                                    </div>
                                    <p css={tw`text-sm text-gray-300 flex-grow mb-4 line-clamp-3`}>{project.description}</p>
                                    <Button size={Button.Sizes.Small} css={tw`w-full mt-auto`} onClick={() => installProject(project.project_id, project.title)} disabled={installing === project.project_id} isLoading={installing === project.project_id}>
                                        <FontAwesomeIcon icon={faDownload} css={tw`mr-2`} /> Installer
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </PageContentBlock>
    );
};
"""

with open('/var/www/pterodactyl/resources/scripts/components/server/mods/ModManagerContainer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ModManagerContainer.tsx rewritten!")
