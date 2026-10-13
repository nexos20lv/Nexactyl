import React, { useState } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import Spinner from '@/components/elements/Spinner';
import routes from '@/routers/routes';
import AppSidebar from '@/components/AppSidebar';
import AppHeader from '@/components/AppHeader';

export default () => {
    const location = useLocation();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className='min-h-screen bg-[#07060a] text-neutral-200'>
            {/* Desktop Fixed Sidebar */}
            <div className='hidden md:block fixed top-0 left-0 bottom-0 z-40'>
                <AppSidebar context='dashboard' />
            </div>

            {/* Mobile Drawer Sidebar */}
            {mobileSidebarOpen && (
                <div className='md:hidden fixed inset-0 z-50 flex'>
                    <div
                        className='fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity'
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                    <div className='relative z-50'>
                        <AppSidebar context='dashboard' onCloseMobile={() => setMobileSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Top Header */}
            <AppHeader context='dashboard' onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

            {/* Main Content Area */}
            <div className='md:pl-64 pt-14 min-h-screen'>
                <TransitionRouter>
                    <React.Suspense fallback={<Spinner centered />}>
                        <Switch location={location}>
                            <Route path={'/'} exact>
                                <DashboardContainer />
                            </Route>
                            {routes.account.map(({ path, component: Component }) => (
                                <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                                    <Component />
                                </Route>
                            ))}
                            <Route path={'*'}>
                                <NotFound />
                            </Route>
                        </Switch>
                    </React.Suspense>
                </TransitionRouter>
            </div>
        </div>
    );
};
