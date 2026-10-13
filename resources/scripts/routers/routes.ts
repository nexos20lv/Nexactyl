import React, { lazy } from 'react';
import ServerConsole from '@/components/server/console/ServerConsoleContainer';
import DatabasesContainer from '@/components/server/databases/DatabasesContainer';
import ScheduleContainer from '@/components/server/schedules/ScheduleContainer';
import UsersContainer from '@/components/server/users/UsersContainer';
import BackupContainer from '@/components/server/backups/BackupContainer';
import NetworkContainer from '@/components/server/network/NetworkContainer';
import StartupContainer from '@/components/server/startup/StartupContainer';
import FileManagerContainer from '@/components/server/files/FileManagerContainer';
import SettingsContainer from '@/components/server/settings/SettingsContainer';
import AccountOverviewContainer from '@/components/dashboard/AccountOverviewContainer';
import AccountApiContainer from '@/components/dashboard/AccountApiContainer';
import AccountSSHContainer from '@/components/dashboard/ssh/AccountSSHContainer';
import ActivityLogContainer from '@/components/dashboard/activity/ActivityLogContainer';
import ServerActivityLogContainer from '@/components/server/ServerActivityLogContainer';
import {
    faTerminal,
    faFolderOpen,
    faDatabase,
    faClock,
    faUsers,
    faArchive,
    faNetworkWired,
    faPlayCircle,
    faCubes,
    faBolt,
    faCog,
    faHistory,
    faUser,
    faKey,
} from '@fortawesome/free-solid-svg-icons';

const VersionContainer = lazy(() => import('@/components/server/versions/VersionContainer'));
const BoosterStoreContainer = lazy(() => import('@/components/server/store/BoosterStoreContainer'));
const FileEditContainer = lazy(() => import('@/components/server/files/FileEditContainer'));
const ScheduleEditContainer = lazy(() => import('@/components/server/schedules/ScheduleEditContainer'));

export interface RouteDefinition {
    path: string;
    name: string | undefined;
    component: React.ComponentType;
    exact?: boolean;
    icon?: any;
    category?: string;
}

export interface ServerRouteDefinition extends RouteDefinition {
    permission: string | string[] | null;
    minecraftOnly?: boolean;
}

interface Routes {
    account: RouteDefinition[];
    server: ServerRouteDefinition[];
}

export default {
    account: [
        {
            path: '/',
            name: 'Mon Profil',
            icon: faUser,
            category: 'COMPTE',
            component: AccountOverviewContainer,
            exact: true,
        },
        {
            path: '/api',
            name: 'Clés API',
            icon: faKey,
            category: 'COMPTE',
            component: AccountApiContainer,
        },
        {
            path: '/ssh',
            name: 'Clés SSH',
            icon: faTerminal,
            category: 'COMPTE',
            component: AccountSSHContainer,
        },
        {
            path: '/activity',
            name: 'Activité',
            icon: faHistory,
            category: 'COMPTE',
            component: ActivityLogContainer,
        },
    ],
    server: [
        {
            path: '/',
            permission: null,
            name: 'Console',
            icon: faTerminal,
            category: 'GESTION',
            component: ServerConsole,
            exact: true,
        },
        {
            path: '/files',
            permission: 'file.*',
            name: 'Fichiers',
            icon: faFolderOpen,
            category: 'GESTION',
            component: FileManagerContainer,
        },
        {
            path: '/files/:action(edit|new)',
            permission: 'file.*',
            name: undefined,
            component: FileEditContainer,
        },
        {
            path: '/databases',
            permission: 'database.*',
            name: 'Bases de données',
            icon: faDatabase,
            category: 'GESTION',
            component: DatabasesContainer,
        },
        {
            path: '/schedules',
            permission: 'schedule.*',
            name: 'Tâches planifiées',
            icon: faClock,
            category: 'GESTION',
            component: ScheduleContainer,
        },
        {
            path: '/schedules/:id',
            permission: 'schedule.*',
            name: undefined,
            component: ScheduleEditContainer,
        },
        {
            path: '/users',
            permission: 'user.*',
            name: 'Utilisateurs',
            icon: faUsers,
            category: 'GESTION',
            component: UsersContainer,
        },
        {
            path: '/backups',
            permission: 'backup.*',
            name: 'Sauvegardes',
            icon: faArchive,
            category: 'GESTION',
            component: BackupContainer,
        },
        {
            path: '/network',
            permission: 'allocation.*',
            name: 'Réseau & Ports',
            icon: faNetworkWired,
            category: 'GESTION',
            component: NetworkContainer,
        },
        {
            path: '/startup',
            permission: 'startup.*',
            name: 'Démarrage & JVM',
            icon: faPlayCircle,
            category: 'GESTION',
            component: StartupContainer,
        },
        {
            path: '/versions',
            permission: 'startup.*',
            name: 'Versions & Mods',
            icon: faCubes,
            category: 'EXTENSIONS',
            minecraftOnly: true,
            component: VersionContainer,
        },
        {
            path: '/store',
            permission: null,
            name: 'Boutique Hardware',
            icon: faBolt,
            category: 'EXTENSIONS',
            component: BoosterStoreContainer,
        },
        {
            path: '/settings',
            permission: ['settings.*', 'file.sftp'],
            name: 'Paramètres',
            icon: faCog,
            category: 'CONFIGURATION',
            component: SettingsContainer,
        },
        {
            path: '/activity',
            permission: 'activity.*',
            name: 'Activité',
            icon: faHistory,
            category: 'CONFIGURATION',
            component: ServerActivityLogContainer,
        },
    ],
} as Routes;
