import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faChevronRight,
    faShieldAlt,
    faHome,
    faServer,
    faTerminal,
    faFolderOpen,
    faDatabase,
    faClock,
    faUsers,
    faArchive,
    faNetworkWired,
    faGlobe,
    faPlayCircle,
    faCubes,
    faGamepad,
    faSlidersH,
    faBolt,
    faCog,
    faHistory,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Server } from '@/api/server/getServer';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import { useLocation, Link } from 'react-router-dom';

interface Props {
    context: 'dashboard' | 'server';
    server?: Server;
    onToggleMobileSidebar?: () => void;
}

const AppHeader: React.FC<Props> = ({ context, server, onToggleMobileSidebar }) => {
    const user = useStoreState((state: ApplicationStore) => state.user.data);
    const settings = useStoreState((state: ApplicationStore) => state.settings.data);
    const rootAdmin = user?.rootAdmin ?? false;
    const location = useLocation();

    // Determine current section title
    const getPageTitle = () => {
        if (context === 'dashboard') {
            if (location.pathname.startsWith('/account')) {
                return 'Mon Compte';
            }
            return 'Tableau de bord';
        }
        if (context === 'server') {
            const parts = location.pathname.split('/');
            const sub = parts[3];
            if (!sub) return 'Console';
            const titles: Record<string, string> = {
                files: 'Fichiers',
                databases: 'Bases de données',
                schedules: 'Tâches planifiées',
                users: 'Utilisateurs',
                backups: 'Sauvegardes',
                network: 'Réseau & Ports',
                subdomain: 'Sous-domaine',
                startup: 'Démarrage & JVM',
                versions: 'Versions & Mods',
                players: 'Joueurs',
                store: 'Boutique Hardware',
                settings: 'Paramètres',
                activity: 'Activité',
            };
            if (location.pathname.includes('/minecraft/config')) {
                return 'Configuration';
            }
            return titles[sub] || sub;
        }
        return 'Tableau de bord';
    };

    // Determine current section icon
    const getPageIcon = () => {
        if (context === 'dashboard') {
            if (location.pathname.startsWith('/account')) {
                return faUser;
            }
            return faServer;
        }
        if (context === 'server') {
            const parts = location.pathname.split('/');
            const sub = parts[3];
            if (!sub) return faTerminal;
            const icons: Record<string, any> = {
                files: faFolderOpen,
                databases: faDatabase,
                schedules: faClock,
                users: faUsers,
                backups: faArchive,
                network: faNetworkWired,
                subdomain: faGlobe,
                startup: faPlayCircle,
                versions: faCubes,
                players: faGamepad,
                store: faBolt,
                settings: faCog,
                activity: faHistory,
            };
            if (location.pathname.includes('/minecraft/config')) {
                return faSlidersH;
            }
            return icons[sub] || faTerminal;
        }
        return faServer;
    };

    return (
        <header
            style={{
                background: 'rgba(7, 6, 10, 0.82)',
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            }}
            className='fixed top-0 left-0 md:left-64 right-0 h-14 border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between z-30 select-none shadow-sm'
        >
            {/* Left: Mobile Toggle & Breadcrumbs */}
            <div className='flex items-center gap-3'>
                {onToggleMobileSidebar && (
                    <button
                        type='button'
                        onClick={onToggleMobileSidebar}
                        className='md:hidden p-2 rounded-xl text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 transition-all'
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                )}

                <div className='flex items-center gap-2 text-xs'>
                    <Link
                        to='/'
                        className='text-neutral-400 hover:text-neutral-200 transition-colors font-medium no-underline flex items-center gap-1.5'
                    >
                        <FontAwesomeIcon icon={faHome} className='text-[11px] text-violet-400' />
                        <span>{settings?.name || 'NXSLab'}</span>
                    </Link>
                    <FontAwesomeIcon icon={faChevronRight} className='text-[8px] text-neutral-600' />
                    {context === 'server' && server ? (
                        <>
                            <Link
                                to={`/server/${server.id}`}
                                className='text-neutral-400 hover:text-neutral-200 transition-colors font-medium truncate max-w-[120px] sm:max-w-[180px] no-underline flex items-center gap-1.5'
                            >
                                <FontAwesomeIcon icon={faServer} className='text-[10px] text-neutral-500' />
                                <span className='truncate'>{server.name}</span>
                            </Link>
                            <FontAwesomeIcon icon={faChevronRight} className='text-[8px] text-neutral-600' />
                            <span className='text-violet-400 font-semibold tracking-tight flex items-center gap-1.5'>
                                <FontAwesomeIcon icon={getPageIcon()} className='text-[11px]' />
                                <span>{getPageTitle()}</span>
                            </span>
                        </>
                    ) : (
                        <span className='text-violet-400 font-semibold tracking-tight flex items-center gap-1.5'>
                            <FontAwesomeIcon icon={getPageIcon()} className='text-[11px]' />
                            <span>{getPageTitle()}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Right: Search, Node Status, Admin */}
            <div className='flex items-center gap-3'>
                <SearchContainer />

                <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-neutral-300'>
                    <span className='h-2 w-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]' />
                    <span>{server ? server.node : 'Système Opérationnel'}</span>
                </div>

                {rootAdmin && (
                    <a
                        href='/admin'
                        style={{
                            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                        }}
                        className='hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600/15 hover:bg-violet-600/25 active:scale-95 text-violet-300 border border-violet-500/30 text-xs font-semibold shadow-sm no-underline'
                    >
                        <FontAwesomeIcon icon={faShieldAlt} className='text-[10px]' />
                        <span>Admin CP</span>
                    </a>
                )}
            </div>
        </header>
    );
};

export default AppHeader;
