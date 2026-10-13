import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch, useLocation } from 'react-router-dom';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import PermissionRoute from '@/components/elements/PermissionRoute';
import routes from '@/routers/routes';
import AppSidebar from '@/components/AppSidebar';
import AppHeader from '@/components/AppHeader';

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();

    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [error, setError] = useState('');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const server = ServerContext.useStoreState((state) => state.server.data);
    const id = server?.id;
    const uuid = server?.uuid;
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);

    const to = (value: string, url = false) => {
        if (value === '/') {
            return url ? match.url : match.path;
        }
        return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    useEffect(
        () => () => {
            clearServerState();
        },
        []
    );

    useEffect(() => {
        setError('');

        getServer(match.params.id).catch((err) => {
            console.error(err);
            setError(httpErrorToHuman(err));
        });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            {!uuid || !id ? (
                error ? (
                    <ServerError message={error} />
                ) : (
                    <Spinner size={'large'} centered />
                )
            ) : (
                <div className='min-h-screen bg-[#07060a] text-neutral-200'>
                    {/* Desktop Fixed Sidebar */}
                    <div className='hidden md:block fixed top-0 left-0 bottom-0 z-40'>
                        <AppSidebar context='server' server={server} />
                    </div>

                    {/* Mobile Drawer Sidebar */}
                    {mobileSidebarOpen && (
                        <div className='md:hidden fixed inset-0 z-50 flex'>
                            <div
                                className='fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity'
                                onClick={() => setMobileSidebarOpen(false)}
                            />
                            <div className='relative z-50'>
                                <AppSidebar
                                    context='server'
                                    server={server}
                                    onCloseMobile={() => setMobileSidebarOpen(false)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Top Header */}
                    <AppHeader
                        context='server'
                        server={server}
                        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    />

                    {/* Main Content Area */}
                    <div className='md:pl-64 pt-14 min-h-screen'>
                        <InstallListener />
                        <TransferListener />
                        <WebsocketHandler />
                        {inConflictState &&
                        (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                            <ConflictStateRenderer />
                        ) : (
                            <ErrorBoundary>
                                <TransitionRouter>
                                    <Switch location={location}>
                                        {routes.server.map(
                                            ({ path, permission, minecraftOnly, component: Component }) => {
                                                if (minecraftOnly && !server?.isMinecraft) {
                                                    return null;
                                                }
                                                return (
                                                    <PermissionRoute
                                                        key={path}
                                                        permission={permission}
                                                        path={to(path)}
                                                        exact
                                                    >
                                                        <Spinner.Suspense>
                                                            <Component />
                                                        </Spinner.Suspense>
                                                    </PermissionRoute>
                                                );
                                            }
                                        )}
                                        <Route path={'*'}>
                                            <NotFound />
                                        </Route>
                                    </Switch>
                                </TransitionRouter>
                            </ErrorBoundary>
                        )}
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};
