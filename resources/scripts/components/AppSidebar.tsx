import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTerminal,
    faChevronLeft,
    faCoins,
    faSignOutAlt,
    faExternalLinkAlt,
    faServer,
    faBolt,
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Server } from '@/api/server/getServer';
import routes from '@/routers/routes';
import Can from '@/components/elements/Can';
import http from '@/api/http';
import Avatar from '@/components/Avatar';

interface Props {
    context: 'dashboard' | 'server';
    server?: Server;
    onCloseMobile?: () => void;
}

const AppSidebar: React.FC<Props> = ({ context, server, onCloseMobile }) => {
    const user = useStoreState((state: ApplicationStore) => state.user.data);
    const rootAdmin = user?.rootAdmin ?? false;
    const credits = user?.credits ?? 0;
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error valid navigation
            window.location = '/';
        });
    };

    const serverCategories = ['GESTION', 'MINECRAFT', 'RÉSEAU', 'EXTENSIONS', 'CONFIGURATION'];

    return (
        <aside
            style={{
                background: 'rgba(8, 7, 14, 0.95)',
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            }}
            className='w-64 h-full border-r border-white/[0.06] flex flex-col justify-between select-none shadow-2xl'
        >
            {/* Top Brand */}
            <div className='shrink-0'>
                <div className='flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]'>
                    <div className='w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600/30 to-purple-800/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]'>
                        <FontAwesomeIcon icon={faTerminal} className='text-sm' />
                    </div>
                    <div className='flex flex-col'>
                        <div className='flex items-center gap-1.5'>
                            <span className='font-extrabold tracking-tight text-sm text-neutral-100'>NXSLab</span>
                            <span className='text-[9px] uppercase font-bold bg-violet-600/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.2 rounded-full'>
                                PRO
                            </span>
                        </div>
                        <span className='text-[10px] text-neutral-500 font-mono'>Gaming Cloud v1.12</span>
                    </div>
                </div>

                {/* Server Quick Info & Back Button */}
                {context === 'server' && server && (
                    <div className='p-3 border-b border-white/[0.06] bg-white/[0.02]'>
                        <Link
                            to='/'
                            onClick={onCloseMobile}
                            style={{
                                transition:
                                    'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                            }}
                            className='flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.06] rounded-xl transition-all mb-2.5 no-underline'
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className='text-[10px]' />
                            <span>Tous mes serveurs</span>
                        </Link>
                        <div className='p-3 rounded-2xl bg-[#0e0c18] border border-white/[0.07] shadow-sm'>
                            <div className='flex items-center justify-between mb-1'>
                                <span
                                    className='text-xs font-bold text-neutral-100 truncate max-w-[140px]'
                                    title={server.name}
                                >
                                    {server.name}
                                </span>
                                <span className='flex h-2 w-2 relative'>
                                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
                                    <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500' />
                                </span>
                            </div>
                            <div className='flex items-center justify-between text-[10px] text-neutral-400 font-mono'>
                                <span>Node: {server.node}</span>
                                {server.isMinecraft && (
                                    <span className='text-violet-300 bg-violet-600/15 px-2 py-0.5 rounded-full border border-violet-500/30 text-[9px] font-semibold'>
                                        Minecraft
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Links Area */}
            <div className='flex-1 overflow-y-auto py-3 px-2 space-y-4'>
                {context === 'server' && server ? (
                    serverCategories.map((cat) => {
                        const catRoutes = routes.server.filter((r) => {
                            if (!r.name) return false;
                            if (r.category !== cat) return false;
                            if (r.minecraftOnly && !server.isMinecraft) return false;
                            return true;
                        });

                        if (catRoutes.length === 0) return null;

                        return (
                            <div key={cat} className='space-y-0.5'>
                                <div className='text-[10px] font-bold text-neutral-400 tracking-wider uppercase px-3 py-1 opacity-75'>
                                    {cat}
                                </div>
                                {catRoutes.map((route) => {
                                    const path =
                                        route.path === '/'
                                            ? `/server/${server.id}`
                                            : `/server/${server.id}/${route.path.replace(/^\//, '')}`;

                                    const content = (
                                        <NavLink
                                            key={route.path}
                                            to={path}
                                            exact={route.exact}
                                            onClick={onCloseMobile}
                                            activeClassName='bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]'
                                            style={{
                                                transition:
                                                    'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                                            }}
                                            className='flex items-center justify-between px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all active:scale-[0.98] group no-underline'
                                        >
                                            <div className='flex items-center gap-2.5 truncate'>
                                                {route.icon && (
                                                    <FontAwesomeIcon
                                                        icon={route.icon}
                                                        className='w-4 text-center text-neutral-400 group-hover:text-violet-300 transition-colors'
                                                    />
                                                )}
                                                <span className='truncate'>{route.name}</span>
                                            </div>
                                            {route.path === '/store' && (
                                                <span className='text-[9px] font-bold uppercase tracking-wider bg-violet-600/30 text-violet-300 border border-violet-500/40 px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.3)]'>
                                                    BOOST
                                                </span>
                                            )}
                                        </NavLink>
                                    );

                                    return route.permission ? (
                                        <Can key={route.path} action={route.permission} matchAny>
                                            {content}
                                        </Can>
                                    ) : (
                                        content
                                    );
                                })}
                            </div>
                        );
                    })
                ) : (
                    <div className='space-y-4'>
                        <div className='space-y-0.5'>
                            <div className='text-[10px] font-bold text-neutral-400 tracking-wider uppercase px-3 py-1 opacity-75'>
                                PRINCIPAL
                            </div>
                            <NavLink
                                to='/'
                                exact
                                onClick={onCloseMobile}
                                activeClassName='bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]'
                                style={{
                                    transition:
                                        'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                                }}
                                className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all active:scale-[0.98] group no-underline'
                            >
                                <FontAwesomeIcon
                                    icon={faServer}
                                    className='w-4 text-center text-neutral-400 group-hover:text-violet-300 transition-colors'
                                />
                                <span>Mes Serveurs</span>
                            </NavLink>
                        </div>

                        <div className='space-y-0.5'>
                            <div className='text-[10px] font-bold text-neutral-400 tracking-wider uppercase px-3 py-1 opacity-75'>
                                MON COMPTE
                            </div>
                            {routes.account.map((route) => (
                                <NavLink
                                    key={route.path}
                                    to={`/account/${route.path}`.replace('//', '/')}
                                    exact={route.exact}
                                    onClick={onCloseMobile}
                                    activeClassName='bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]'
                                    style={{
                                        transition:
                                            'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                                    }}
                                    className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all active:scale-[0.98] group no-underline'
                                >
                                    {route.icon && (
                                        <FontAwesomeIcon
                                            icon={route.icon}
                                            className='w-4 text-center text-neutral-400 group-hover:text-violet-300 transition-colors'
                                        />
                                    )}
                                    <span>{route.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Credits & User Profile */}
            <div className='shrink-0 border-t border-white/[0.06] bg-[#06050a] p-3 space-y-2.5'>
                {/* Credits Card */}
                <div className='p-2.5 rounded-2xl bg-gradient-to-r from-violet-950/40 to-purple-950/20 border border-violet-500/30 flex items-center justify-between shadow-sm'>
                    <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 text-xs'>
                            <FontAwesomeIcon icon={faCoins} />
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-[10px] text-neutral-400 font-medium'>Solde de Crédits</span>
                            <span className='text-xs font-bold text-violet-300 font-mono'>
                                {credits.toLocaleString()} cr
                            </span>
                        </div>
                    </div>
                    {context === 'server' && server && (
                        <Link
                            to={`/server/${server.id}/store`}
                            onClick={onCloseMobile}
                            style={{
                                transition:
                                    'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                            }}
                            className='text-[10px] font-bold bg-violet-600 hover:bg-violet-500 active:scale-95 text-white px-2.5 py-1 rounded-lg transition-colors shadow-sm flex items-center gap-1 no-underline'
                        >
                            <FontAwesomeIcon icon={faBolt} className='text-[9px]' />
                            <span>Store</span>
                        </Link>
                    )}
                </div>

                {/* User Row */}
                <div className='flex items-center justify-between pt-1'>
                    <Link
                        to='/account'
                        title='Gérer mon compte & photo de profil'
                        className='flex items-center gap-2.5 min-w-0 group hover:opacity-95 no-underline transition-opacity'
                    >
                        <div className='w-8 h-8 rounded-xl overflow-hidden border border-violet-500/30 group-hover:border-violet-500/70 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.35)] shrink-0 transition-all'>
                            <Avatar.User />
                        </div>
                        <div className='flex flex-col min-w-0'>
                            <span className='text-xs font-semibold text-neutral-200 group-hover:text-white truncate transition-colors'>
                                {user?.username}
                            </span>
                            <span className='text-[10px] text-neutral-500 group-hover:text-violet-400/80 transition-colors'>
                                {rootAdmin ? 'Administrateur' : 'Client'}
                            </span>
                        </div>
                    </Link>
                    <div className='flex items-center gap-1 shrink-0'>
                        {rootAdmin && (
                            <a
                                href='/admin'
                                title='Panel Administration'
                                style={{
                                    transition:
                                        'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                                }}
                                className='p-1.5 rounded-lg text-neutral-400 hover:text-violet-300 hover:bg-violet-500/10 active:scale-90 transition-all'
                            >
                                <FontAwesomeIcon icon={faExternalLinkAlt} className='text-xs' />
                            </a>
                        )}
                        <button
                            type='button'
                            onClick={onTriggerLogout}
                            disabled={isLoggingOut}
                            title='Déconnexion'
                            style={{
                                transition:
                                    'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                            }}
                            className='p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all cursor-pointer'
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className='text-xs' />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AppSidebar;
