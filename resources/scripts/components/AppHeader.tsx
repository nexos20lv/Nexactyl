import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronRight, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Server } from '@/api/server/getServer';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import { useLocation } from 'react-router-dom';

interface Props {
    context: 'dashboard' | 'server';
    server?: Server;
    onToggleMobileSidebar?: () => void;
}

const AppHeader: React.FC<Props> = ({ context, server, onToggleMobileSidebar }) => {
    const user = useStoreState((state: ApplicationStore) => state.user.data);
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
                startup: 'Démarrage & JVM',
                versions: 'Versions & Mods',
                store: 'Boutique Hardware',
                settings: 'Paramètres',
                activity: 'Activité',
            };
            return titles[sub] || sub;
        }
        return 'Tableau de bord';
    };

    return (
        <header className='fixed top-0 left-0 md:left-64 right-0 h-14 bg-[#08070e]/85 backdrop-blur-md border-b border-[#1a1728] px-4 md:px-6 flex items-center justify-between z-30 select-none'>
            {/* Left: Mobile Toggle & Breadcrumbs */}
            <div className='flex items-center gap-3'>
                {onToggleMobileSidebar && (
                    <button
                        type='button'
                        onClick={onToggleMobileSidebar}
                        className='md:hidden p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors'
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                )}

                <div className='flex items-center gap-2 text-xs'>
                    <span className='text-neutral-500 font-mono'>Accueil</span>
                    <FontAwesomeIcon icon={faChevronRight} className='text-[9px] text-neutral-600' />
                    {context === 'server' && server ? (
                        <>
                            <span className='text-neutral-400 font-medium truncate max-w-[120px] sm:max-w-[200px]'>
                                {server.name}
                            </span>
                            <FontAwesomeIcon icon={faChevronRight} className='text-[9px] text-neutral-600' />
                            <span className='text-violet-400 font-semibold'>{getPageTitle()}</span>
                        </>
                    ) : (
                        <span className='text-violet-400 font-semibold'>{getPageTitle()}</span>
                    )}
                </div>
            </div>

            {/* Right: Search, Node Status, Admin */}
            <div className='flex items-center gap-3'>
                <SearchContainer />

                <div className='hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900/60 border border-[#1f1d2e] text-[11px] font-mono text-neutral-400'>
                    <span className='h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse' />
                    <span>{server ? server.node : 'Système Opérationnel'}</span>
                </div>

                {rootAdmin && (
                    <a
                        href='/admin'
                        className='hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-medium transition-all'
                    >
                        <FontAwesomeIcon icon={faShieldAlt} className='text-[11px]' />
                        <span>Admin CP</span>
                    </a>
                )}
            </div>
        </header>
    );
};

export default AppHeader;
