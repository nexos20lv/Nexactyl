import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-neutral-400 px-5 cursor-pointer transition-all duration-150`};

        &:active,
        &:hover {
            ${tw`text-neutral-100 bg-neutral-900/60`};
        }

        &:active,
        &:hover,
        &.active {
            box-shadow: inset 0 -2px ${theme`colors.violet.500`.toString()};
            ${tw`text-violet-300`};
        }
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div className={'w-full bg-[#0b0914] border-b border-white/[0.08] shadow-lg overflow-x-auto'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto w-full flex items-center h-[3.5rem] max-w-[1200px] px-4'}>
                <div id={'logo'} className={'flex-1 flex items-center gap-3'}>
                    <div
                        className={
                            'w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 font-bold text-sm shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                        }
                    >
                        ⚡
                    </div>
                    <Link
                        to={'/'}
                        className={
                            'text-xl font-header font-semibold no-underline text-neutral-100 hover:text-white transition-colors duration-150 tracking-tight'
                        }
                    >
                        {name || 'PTERODACTYL'}
                        <span className={'text-violet-400'}>.</span>
                    </Link>
                </div>
                <RightNavigation className={'flex h-full items-center justify-center'}>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Administration'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Mon Compte'}>
                        <NavLink to={'/account'}>
                            <span className={'flex items-center w-5 h-5 ring-1 ring-violet-500/30 rounded-full'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
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
