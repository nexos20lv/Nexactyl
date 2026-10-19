import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt, faBook, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import { usePrivacyMode } from '@/plugins/usePrivacyMode';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-neutral-400 px-3.5 sm:px-4 cursor-pointer transition-all duration-150`};

        &:active,
        &:hover {
            ${tw`text-neutral-100 bg-white/[0.04]`};
        }

        &:active,
        &:hover,
        &.active {
            box-shadow: inset 0 -2px ${theme`colors.violet.500`.toString()};
            ${tw`text-violet-300`};
        }
    }
`;

const DiscordIcon = () => (
    <svg className='w-4 h-4 fill-current' viewBox='0 0 24 24'>
        <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' />
    </svg>
);

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [hideIp, setHideIp] = usePrivacyMode();

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div
            className={
                'sticky top-0 z-40 w-full backdrop-blur-md bg-[#0b0914]/85 border-b border-white/[0.08] shadow-lg'
            }
        >
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto w-full flex items-center h-[3.5rem] max-w-[1200px] px-4'}>
                {/* Brand / Logo */}
                <div id={'logo'} className={'flex items-center gap-3 mr-6'}>
                    <div
                        className={
                            'w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 font-bold text-sm shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        }
                    >
                        ⚡
                    </div>
                    <Link
                        to={'/'}
                        className={
                            'text-xl font-header font-bold no-underline text-neutral-100 hover:text-white transition-colors duration-150 tracking-tight'
                        }
                    >
                        {name || 'NEXACTYL'}
                        <span className={'text-violet-400'}>.</span>
                    </Link>
                </div>

                {/* Left Community & Docs Links */}
                <div className={'hidden md:flex items-center gap-1 text-xs'}>
                    <a
                        href={'https://discord.gg/pterodactyl'}
                        target={'_blank'}
                        rel={'noreferrer'}
                        className={
                            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all no-underline font-medium'
                        }
                    >
                        <DiscordIcon />
                        <span>Discord</span>
                    </a>
                    <a
                        href={'https://pterodactyl.io'}
                        target={'_blank'}
                        rel={'noreferrer'}
                        className={
                            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all no-underline font-medium'
                        }
                    >
                        <FontAwesomeIcon icon={faBook} className={'text-xs text-violet-400'} />
                        <span>Docs</span>
                    </a>
                </div>

                <div className={'flex-1'} />

                {/* Right Navigation & Tools */}
                <RightNavigation className={'flex h-full items-center justify-end'}>
                    <SearchContainer />

                    {/* Streamer / Privacy Mode Toggle */}
                    <Tooltip
                        placement={'bottom'}
                        content={hideIp ? 'Mode Streamer actif (IPs masquées)' : 'Activer Mode Streamer (Cacher IPs)'}
                    >
                        <button
                            type={'button'}
                            onClick={() => setHideIp((s) => !s)}
                            className={hideIp ? '!text-violet-400 !bg-violet-600/10' : ''}
                        >
                            <FontAwesomeIcon icon={hideIp ? faEyeSlash : faEye} />
                        </button>
                    </Tooltip>

                    {/* Dashboard */}
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>

                    {/* Admin Panel */}
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Administration'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}

                    {/* User Profile */}
                    <Tooltip placement={'bottom'} content={'Mon Compte'}>
                        <NavLink to={'/account'}>
                            <span
                                className={
                                    'flex items-center w-6 h-6 ring-1 ring-violet-500/40 rounded-full overflow-hidden'
                                }
                            >
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>

                    {/* Logout */}
                    <Tooltip placement={'bottom'} content={'Déconnexion'}>
                        <button onClick={onTriggerLogout} className={'hover:text-red-400'}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </div>
    );
};
