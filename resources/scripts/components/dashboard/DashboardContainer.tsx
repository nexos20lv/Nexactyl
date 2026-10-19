import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import ServerCard from '@/components/dashboard/ServerCard';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faList, faSearch, faTimes, faEye, faEyeSlash, faServer } from '@fortawesome/free-solid-svg-icons';
import { usePrivacyMode } from '@/plugins/usePrivacyMode';

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const [layout, setLayout] = usePersistedState<'grid' | 'rows'>('nexactyl:dashboard:layout', 'grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [hideIp, setHideIp] = usePrivacyMode();

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Reset page when switching admin filter
        setPage(1);
    }, [showOnlyAdmin]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    const activeLayout = layout || 'grid';

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            {/* Apollo Dashboard Control Bar */}
            <div className='bg-[#0b0914]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-6 shadow-xl'>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    {/* Left: Section Header & Server Count */}
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]'>
                            <FontAwesomeIcon icon={faServer} className='text-sm' />
                        </div>
                        <div>
                            <div className='flex items-center gap-2.5'>
                                <h1 className='text-lg sm:text-xl font-bold text-white tracking-tight'>
                                    {showOnlyAdmin ? 'Tous les Serveurs' : 'Vos Serveurs'}
                                </h1>
                                {servers && (
                                    <span className='px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30'>
                                        {servers.pagination.total}{' '}
                                        {servers.pagination.total === 1 ? 'serveur' : 'serveurs'}
                                    </span>
                                )}
                            </div>
                            <p className='text-xs text-neutral-400 mt-0.5 hidden sm:block'>
                                Gérez, surveillez et contrôlez vos instances de serveurs en temps réel.
                            </p>
                        </div>
                    </div>

                    {/* Right: Search, Privacy Mode & Layout Switcher */}
                    <div className='flex items-center flex-wrap gap-2.5 sm:gap-3'>
                        {/* Instant Search Bar */}
                        <div className='relative flex-1 sm:flex-initial sm:min-w-[220px]'>
                            <FontAwesomeIcon
                                icon={faSearch}
                                className='absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none'
                            />
                            <input
                                type='text'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder='Rechercher un serveur...'
                                className='w-full bg-[#131122] border border-white/[0.08] focus:border-violet-500/60 rounded-xl pl-8 pr-8 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all'
                            />
                            {searchTerm && (
                                <button
                                    type='button'
                                    onClick={() => setSearchTerm('')}
                                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors'
                                >
                                    <FontAwesomeIcon icon={faTimes} className='text-xs' />
                                </button>
                            )}
                        </div>

                        {/* Hide IP / Privacy Mode Toggle */}
                        <button
                            type='button'
                            onClick={() => setHideIp((prev) => !prev)}
                            title={hideIp ? 'Mode Streamer actif (IPs masquées)' : 'Mode Streamer inactif'}
                            className={`h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                                hideIp
                                    ? 'bg-violet-600/20 border-violet-500/40 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.25)]'
                                    : 'bg-white/[0.04] border-white/[0.07] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06]'
                            }`}
                        >
                            <FontAwesomeIcon icon={hideIp ? faEyeSlash : faEye} className='text-xs' />
                            <span className='hidden md:inline'>{hideIp ? 'IPs Masquées' : 'IPs Visibles'}</span>
                        </button>

                        {/* Layout Switcher (Grid vs List) */}
                        <div className='flex items-center bg-[#131122] border border-white/[0.08] rounded-xl p-0.5 shadow-inner'>
                            <button
                                type='button'
                                onClick={() => setLayout('grid')}
                                title='Affichage Grille'
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    activeLayout === 'grid'
                                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.45)]'
                                        : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                            >
                                <FontAwesomeIcon icon={faThLarge} className='text-xs' />
                            </button>
                            <button
                                type='button'
                                onClick={() => setLayout('rows')}
                                title='Affichage Liste'
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    activeLayout === 'rows'
                                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.45)]'
                                        : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                            >
                                <FontAwesomeIcon icon={faList} className='text-xs' />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Admin Switcher Bar */}
                {rootAdmin && (
                    <div className='mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs'>
                        <span className='text-neutral-400 flex items-center gap-2'>
                            <span className='w-2 h-2 rounded-full bg-violet-400' />
                            Afficher tous les serveurs du système (Vue Administrateur)
                        </span>
                        <div className='flex items-center gap-2'>
                            <span className='text-[11px] font-medium text-neutral-400 uppercase tracking-wider hidden sm:inline'>
                                {showOnlyAdmin ? 'Tous les serveurs' : 'Mes serveurs'}
                            </span>
                            <Switch
                                name={'show_all_servers'}
                                defaultChecked={showOnlyAdmin}
                                onChange={() => setShowOnlyAdmin((s) => !s)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Servers Listing */}
            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) => {
                        const filteredItems = items.filter((server) => {
                            if (!searchTerm) return true;
                            const query = searchTerm.toLowerCase();
                            const matchName = server.name.toLowerCase().includes(query);
                            const matchDesc = server.description?.toLowerCase().includes(query);
                            const matchNode = server.node?.toLowerCase().includes(query);
                            const matchSubdomain = server.subdomain?.toLowerCase().includes(query);
                            const matchAlloc = server.allocations.some(
                                (a) => (a.alias || a.ip).toLowerCase().includes(query) || String(a.port).includes(query)
                            );
                            return matchName || matchDesc || matchNode || matchSubdomain || matchAlloc;
                        });

                        if (items.length === 0) {
                            return (
                                <div className='bg-[#0e0c18] border border-white/[0.08] rounded-2xl p-8 text-center my-6'>
                                    <div className='w-12 h-12 rounded-2xl bg-white/[0.04] text-neutral-400 flex items-center justify-center mx-auto mb-3 text-lg'>
                                        <FontAwesomeIcon icon={faServer} />
                                    </div>
                                    <p className='text-sm text-neutral-300 font-medium'>
                                        {showOnlyAdmin
                                            ? 'Aucun autre serveur à afficher.'
                                            : 'Aucun serveur associé à votre compte.'}
                                    </p>
                                </div>
                            );
                        }

                        if (filteredItems.length === 0) {
                            return (
                                <div className='bg-[#0e0c18] border border-white/[0.08] rounded-2xl p-8 text-center my-6'>
                                    <div className='w-12 h-12 rounded-2xl bg-violet-600/15 text-violet-300 flex items-center justify-center mx-auto mb-3 text-lg'>
                                        <FontAwesomeIcon icon={faSearch} />
                                    </div>
                                    <h3 className='text-base font-bold text-white mb-1'>Aucun serveur trouvé</h3>
                                    <p className='text-xs text-neutral-400 max-w-sm mx-auto mb-4'>
                                        Aucun serveur ne correspond au filtre &quot;{searchTerm}&quot;. Vérifiez
                                        l&apos;orthographe ou réinitialisez la recherche.
                                    </p>
                                    <button
                                        type='button'
                                        onClick={() => setSearchTerm('')}
                                        className='px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all'
                                    >
                                        Effacer la recherche
                                    </button>
                                </div>
                            );
                        }

                        return activeLayout === 'grid' ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                                {filteredItems.map((server) => (
                                    <ServerCard key={server.uuid} server={server} />
                                ))}
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {filteredItems.map((server) => (
                                    <ServerRow key={server.uuid} server={server} />
                                ))}
                            </div>
                        );
                    }}
                </Pagination>
            )}
        </PageContentBlock>
    );
};
