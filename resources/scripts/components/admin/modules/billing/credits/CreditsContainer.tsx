import { useContext, useState } from 'react';
import tw from 'twin.macro';
import { Link } from 'react-router-dom';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { Button } from '@/elements/button';
import { RealFilters, useGetUsers, Context as UsersContext } from '@/api/routes/admin/users';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCoins,
    faExternalLinkAlt,
    faGift,
    faIdBadge,
    faSlidersH,
    faUser,
    faUsers,
    faWallet,
    faCog,
} from '@fortawesome/free-solid-svg-icons';
import AdminTable, {
    ContentWrapper,
    Loading,
    NoItems,
    Pagination,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    useTableHooks,
} from '@/elements/AdminTable';
import { useStoreState } from '@/state/hooks';
import Pill from '@/elements/Pill';
import FlashMessageRender from '@/elements/FlashMessageRender';
import AdjustCreditsModal from './AdjustCreditsModal';
import CreditSettingsModal from './CreditSettingsModal';
import { User } from '@/api/definitions/admin';

function CreditsTable() {
    const { data: users, error, isValidating, mutate } = useGetUsers();
    const { colors } = useStoreState(state => state.theme.data!);
    const creditsSettings = useStoreState(state => state.everest?.data?.billing?.credits);
    const creditsEnabled = creditsSettings?.enabled ?? true;
    const startingCredits = creditsSettings?.starting ?? 0;

    const { setPage, sort, sortDirection, setSort, setFilters } = useContext(UsersContext);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

    const length = users?.items?.length || 0;

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setPage(1);
                setFilters({
                    username: query,
                });
            }
            return resolve();
        });
    };

    // Calculate statistics
    const totalCredits = (users?.items || []).reduce((sum, u) => sum + (u.credits || 0), 0);
    const usersWithCredits = (users?.items || []).filter(u => (u.credits || 0) > 0).length;
    const totalUsers = users?.pagination?.total ?? length;

    const handleSuccess = (updatedUser: User) => {
        if (!users) return;
        mutate({
            ...users,
            items: users.items.map(u => (u.id === updatedUser.id ? updatedUser : u)),
        }, false);
    };

    return (
        <AdminContentBlock title={'Gestion des Crédits'}>
            <div className={'w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'}>
                <div>
                    <div className={'flex items-center gap-3'}>
                        <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Système de Crédits</h2>
                        {creditsEnabled ? (
                            <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30'}>
                                Système activé
                            </span>
                        ) : (
                            <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30'}>
                                Système désactivé
                            </span>
                        )}
                    </div>
                    <p className={'text-base text-neutral-400 mt-1'}>
                        Consultez et ajustez les soldes de crédits attribués à vos clients pour leurs achats et renouvellements.
                    </p>
                </div>
                <div className={'flex items-center gap-2'}>
                    <Button
                        size={Button.Sizes.Small}
                        type={'button'}
                        onClick={() => setSettingsOpen(true)}
                    >
                        <FontAwesomeIcon icon={faCog} className={'mr-1.5'} />
                        Paramètres des crédits
                    </Button>
                </div>
            </div>

            <FlashMessageRender byKey={'admin:billing:credits'} className={'mb-6'} />

            {/* Quick Stats Grid */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'}>
                <div
                    className={'p-5 rounded-xl shadow ring-1 ring-white/5 flex items-center justify-between'}
                    style={{ backgroundColor: colors.secondary }}
                >
                    <div>
                        <p className={'text-xs font-medium text-neutral-400'}>Crédits en circulation</p>
                        <h3 className={'text-2xl font-bold font-mono text-green-400 mt-1'}>
                            {totalCredits.toFixed(2)}
                        </h3>
                    </div>
                    <div className={'w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-xl'}>
                        <FontAwesomeIcon icon={faCoins} />
                    </div>
                </div>

                <div
                    className={'p-5 rounded-xl shadow ring-1 ring-white/5 flex items-center justify-between'}
                    style={{ backgroundColor: colors.secondary }}
                >
                    <div>
                        <p className={'text-xs font-medium text-neutral-400'}>Clients avec solde</p>
                        <h3 className={'text-2xl font-bold font-mono text-cyan-400 mt-1'}>
                            {usersWithCredits}
                        </h3>
                    </div>
                    <div className={'w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl'}>
                        <FontAwesomeIcon icon={faWallet} />
                    </div>
                </div>

                <div
                    className={'p-5 rounded-xl shadow ring-1 ring-white/5 flex items-center justify-between cursor-pointer hover:ring-purple-500/30 transition-all'}
                    style={{ backgroundColor: colors.secondary }}
                    onClick={() => setSettingsOpen(true)}
                >
                    <div>
                        <p className={'text-xs font-medium text-neutral-400'}>Crédits à l&apos;inscription</p>
                        <h3 className={'text-2xl font-bold font-mono text-purple-400 mt-1'}>
                            {startingCredits.toFixed(2)}
                        </h3>
                    </div>
                    <div className={'w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl'}>
                        <FontAwesomeIcon icon={faGift} />
                    </div>
                </div>

                <div
                    className={'p-5 rounded-xl shadow ring-1 ring-white/5 flex items-center justify-between'}
                    style={{ backgroundColor: colors.secondary }}
                >
                    <div>
                        <p className={'text-xs font-medium text-neutral-400'}>Total Utilisateurs</p>
                        <h3 className={'text-2xl font-bold font-mono text-neutral-200 mt-1'}>
                            {totalUsers}
                        </h3>
                    </div>
                    <div className={'w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 text-xl'}>
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                </div>
            </div>

            {/* User Credits Table */}
            <AdminTable>
                <ContentWrapper onSearch={onSearch}>
                    <Pagination data={users} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
                                    <TableHeader
                                        name={'ID'}
                                        direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('id')}
                                    />
                                    <TableHeader
                                        name={'Utilisateur'}
                                        direction={sort === 'username' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('username')}
                                    />
                                    <TableHeader
                                        name={'Email'}
                                        direction={sort === 'email' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('email')}
                                    />
                                    <TableHeader name={'Rôle'} />
                                    <TableHeader
                                        name={'Solde de Crédits'}
                                        direction={sort === 'credits' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('credits')}
                                    />
                                    <TableHeader name={'Actions'} />
                                </TableHead>
                                <TableBody>
                                    {users !== undefined &&
                                        users.items.length > 0 &&
                                        users.items.map(user => (
                                            <TableRow key={user.id}>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {user.id}
                                                    </code>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <div className={'flex items-center gap-2'}>
                                                        <span className={'font-semibold text-white'}>{user.username}</span>
                                                    </div>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-300 text-left whitespace-nowrap`}>
                                                    {user.email}
                                                </td>
                                                <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                    {user.isRootAdmin ? (
                                                        <Pill type={'warn'}>
                                                            <FontAwesomeIcon icon={faIdBadge} className={'my-auto mr-1'} size={'sm'} />
                                                            Admin
                                                        </Pill>
                                                    ) : (
                                                        <Pill type={'unknown'}>
                                                            <FontAwesomeIcon icon={faUser} className={'my-auto mr-1'} size={'sm'} />
                                                            Client
                                                        </Pill>
                                                    )}
                                                </td>
                                                <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                    <span className={'font-mono font-bold text-green-400 bg-green-950/40 px-2.5 py-1 rounded-lg border border-green-800/40 text-sm inline-block'}>
                                                        {(user.credits ?? 0).toFixed(2)} Crédits
                                                    </span>
                                                </td>
                                                <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                    <div className={'flex items-center gap-2'}>
                                                        <Button
                                                            size={Button.Sizes.Small}
                                                            type={'button'}
                                                            onClick={() => setSelectedUser(user)}
                                                        >
                                                            <FontAwesomeIcon icon={faSlidersH} className={'mr-1.5'} />
                                                            Ajuster
                                                        </Button>
                                                        <Link to={`/admin/users/view/${user.id}`}>
                                                            <Button.Text size={Button.Sizes.Small} type={'button'}>
                                                                <FontAwesomeIcon icon={faExternalLinkAlt} className={'mr-1'} />
                                                                Profil
                                                            </Button.Text>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>

                            {users === undefined || (error && isValidating) ? (
                                <Loading />
                            ) : length < 1 ? (
                                <NoItems />
                            ) : null}
                        </div>
                    </Pagination>
                </ContentWrapper>
            </AdminTable>

            <AdjustCreditsModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onSuccess={handleSuccess}
            />

            <CreditSettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
        </AdminContentBlock>
    );
}

export default () => {
    const hooks = useTableHooks<RealFilters>();

    return (
        <UsersContext.Provider value={hooks}>
            <CreditsTable />
        </UsersContext.Provider>
    );
};
