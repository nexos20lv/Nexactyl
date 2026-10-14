import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faCrown,
    faListUl,
    faBan,
    faSyncAlt,
    faPlus,
    faShoePrints,
    faComments,
    faCheck,
} from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/elements/Button';
import Modal from '@/components/elements/Modal';
import Spinner from '@/components/elements/Spinner';
import {
    getServerMinecraftPlayers,
    executeMinecraftPlayerAction,
    MinecraftPlayersResponse,
} from '@/api/server/minecraft';
import { httpErrorToHuman } from '@/api/http';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [data, setData] = useState<MinecraftPlayersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<'online' | 'ops' | 'whitelist' | 'banned'>('online');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Modals
    const [actionModal, setActionModal] = useState<{
        open: boolean;
        action: 'kick' | 'ban' | 'teleport' | 'whisper' | 'add';
        player: string;
        targetList?: 'op' | 'whitelist' | 'ban';
    }>({ open: false, action: 'kick', player: '' });
    const [modalInput, setModalInput] = useState('');
    const [modalSubmitting, setModalSubmitting] = useState(false);

    const loadPlayers = (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        getServerMinecraftPlayers(uuid)
            .then((res) => {
                setData(res);
                setErrorMessage(null);
            })
            .catch((err) => setErrorMessage(httpErrorToHuman(err)))
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        loadPlayers();
        const interval = setInterval(() => loadPlayers(true), 12000);
        return () => clearInterval(interval);
    }, [uuid]);

    const handleAction = async (
        action: any,
        player: string,
        extra?: { reason?: string; target?: string; message?: string; gamemode?: any }
    ) => {
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const res = await executeMinecraftPlayerAction(uuid, {
                action,
                player,
                ...extra,
            });
            setSuccessMessage(res.message);
            // Refresh state after slight delay
            setTimeout(() => loadPlayers(true), 600);
        } catch (err) {
            setErrorMessage(httpErrorToHuman(err));
        }
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalSubmitting(true);

        try {
            if (actionModal.action === 'kick') {
                await handleAction('kick', actionModal.player, { reason: modalInput });
            } else if (actionModal.action === 'ban') {
                await handleAction('ban', actionModal.player, { reason: modalInput });
            } else if (actionModal.action === 'teleport') {
                await handleAction('teleport', actionModal.player, { target: modalInput });
            } else if (actionModal.action === 'whisper') {
                await handleAction('whisper', actionModal.player, { message: modalInput });
            } else if (actionModal.action === 'add') {
                if (actionModal.targetList === 'op') {
                    await handleAction('op', modalInput);
                } else if (actionModal.targetList === 'whitelist') {
                    await handleAction('whitelist_add', modalInput);
                } else if (actionModal.targetList === 'ban') {
                    await handleAction('ban', modalInput);
                }
            }
            setActionModal({ open: false, action: 'kick', player: '' });
            setModalInput('');
        } catch (err) {
            setErrorMessage(httpErrorToHuman(err));
        } finally {
            setModalSubmitting(false);
        }
    };

    if (loading && !data) {
        return (
            <PageContentBlock title={'Gestion des Joueurs'}>
                <div className={'flex justify-center items-center py-20'}>
                    <Spinner size={'large'} />
                </div>
            </PageContentBlock>
        );
    }

    const onlinePlayers = data?.online || [];
    const ops = data?.ops || [];
    const whitelist = data?.whitelist || [];
    const banned = data?.banned || [];

    return (
        <PageContentBlock title={'Gestion des Joueurs'}>
            <div className={'space-y-6'}>
                {/* Header Banner */}
                <div
                    className={
                        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e0c18]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden'
                    }
                >
                    <div
                        className={
                            'absolute -top-16 -right-16 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none'
                        }
                    />
                    <div>
                        <div className={'flex items-center gap-2.5'}>
                            <div
                                className={
                                    'w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30'
                                }
                            >
                                <FontAwesomeIcon icon={faUsers} />
                            </div>
                            <h2 className={'text-lg font-bold text-white tracking-tight'}>
                                Gestionnaire des Joueurs en Direct
                            </h2>
                        </div>
                        <p className={'text-xs text-neutral-400 mt-1 max-w-xl'}>
                            Gérez les joueurs connectés, les administrateurs OP, la whitelist et les sanctions en 1
                            clic.
                        </p>
                    </div>

                    <div className={'flex items-center gap-2'}>
                        <Button
                            isSecondary
                            type={'button'}
                            disabled={refreshing}
                            onClick={() => loadPlayers(true)}
                            className={'text-xs'}
                        >
                            <FontAwesomeIcon icon={faSyncAlt} spin={refreshing} className={'mr-1.5'} />
                            Actualiser
                        </Button>
                        <Button
                            type={'button'}
                            onClick={() => {
                                setModalInput('');
                                setActionModal({
                                    open: true,
                                    action: 'add',
                                    player: '',
                                    targetList: tab === 'ops' ? 'op' : tab === 'banned' ? 'ban' : 'whitelist',
                                });
                            }}
                            className={'text-xs'}
                        >
                            <FontAwesomeIcon icon={faPlus} className={'mr-1.5'} />
                            Ajouter un joueur
                        </Button>
                    </div>
                </div>

                {/* Notifications */}
                {successMessage && (
                    <div
                        className={
                            'px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 shadow-sm'
                        }
                    >
                        <FontAwesomeIcon icon={faCheck} className={'text-emerald-400'} />
                        <span>{successMessage}</span>
                    </div>
                )}
                {errorMessage && (
                    <div
                        className={
                            'px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs shadow-sm'
                        }
                    >
                        {errorMessage}
                    </div>
                )}

                {/* Apple Segmented Control Tabs */}
                <div
                    className={
                        'flex flex-wrap gap-1 p-1.5 rounded-2xl bg-[#0e0c18]/80 border border-white/5 backdrop-blur-md'
                    }
                >
                    <button
                        type={'button'}
                        onClick={() => setTab('online')}
                        className={
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
                            (tab === 'online'
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white')
                        }
                    >
                        <span
                            className={
                                'w-2 h-2 rounded-full ' +
                                (data?.server_online ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500')
                            }
                        />
                        <span>
                            En ligne ({data?.online_count ?? 0}/{data?.max_players ?? 0})
                        </span>
                    </button>
                    <button
                        type={'button'}
                        onClick={() => setTab('ops')}
                        className={
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
                            (tab === 'ops' ? 'bg-violet-600 text-white shadow-md' : 'text-neutral-400 hover:text-white')
                        }
                    >
                        <FontAwesomeIcon icon={faCrown} className={'text-amber-400 text-xs'} />
                        <span>Opérateurs ({ops.length})</span>
                    </button>
                    <button
                        type={'button'}
                        onClick={() => setTab('whitelist')}
                        className={
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
                            (tab === 'whitelist'
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white')
                        }
                    >
                        <FontAwesomeIcon icon={faListUl} className={'text-xs'} />
                        <span>Liste Blanche ({whitelist.length})</span>
                    </button>
                    <button
                        type={'button'}
                        onClick={() => setTab('banned')}
                        className={
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
                            (tab === 'banned'
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white')
                        }
                    >
                        <FontAwesomeIcon icon={faBan} className={'text-rose-400 text-xs'} />
                        <span>Bannis ({banned.length})</span>
                    </button>
                </div>

                {/* List Container */}
                <div
                    className={
                        'p-6 sm:p-8 rounded-3xl bg-[#0e0c18]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl'
                    }
                >
                    {/* TAB: ONLINE PLAYERS */}
                    {tab === 'online' && (
                        <div>
                            {onlinePlayers.length === 0 ? (
                                <div className={'py-12 text-center text-neutral-400 text-xs'}>
                                    <div
                                        className={
                                            'w-12 h-12 rounded-2xl bg-neutral-900 mx-auto flex items-center justify-center text-neutral-500 mb-3'
                                        }
                                    >
                                        <FontAwesomeIcon icon={faUsers} className={'text-lg'} />
                                    </div>
                                    <p className={'font-semibold text-neutral-300'}>
                                        Aucun joueur connecté actuellement
                                    </p>
                                    <p className={'text-neutral-500 text-[11px] mt-1'}>
                                        Les joueurs apparaîtront ici dès leur connexion au serveur.
                                    </p>
                                </div>
                            ) : (
                                <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                                    {onlinePlayers.map((player) => {
                                        const isOp = ops.some(
                                            (o) => o.name.toLowerCase() === player.name.toLowerCase()
                                        );
                                        return (
                                            <div
                                                key={player.name}
                                                className={
                                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-violet-500/30 transition-all group'
                                                }
                                            >
                                                <div className={'flex items-center gap-3 min-w-0'}>
                                                    <img
                                                        src={`https://minotar.net/helm/${player.name}/48.png`}
                                                        alt={player.name}
                                                        className={
                                                            'w-10 h-10 rounded-xl bg-neutral-950 border border-white/10 shrink-0 object-cover shadow-sm'
                                                        }
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                'https://minotar.net/helm/Steve/48.png';
                                                        }}
                                                    />
                                                    <div className={'min-w-0'}>
                                                        <div className={'flex items-center gap-2'}>
                                                            <span className={'text-sm font-bold text-white truncate'}>
                                                                {player.name}
                                                            </span>
                                                            {isOp && (
                                                                <span
                                                                    className={
                                                                        'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                                    }
                                                                >
                                                                    OP
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={'text-[10px] text-emerald-400 font-medium'}>
                                                            Connecté
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Bar */}
                                                <div className={'flex items-center gap-1.5 shrink-0'}>
                                                    <button
                                                        type={'button'}
                                                        title={isOp ? 'Retirer OP' : 'Donner OP'}
                                                        onClick={() => handleAction(isOp ? 'deop' : 'op', player.name)}
                                                        className={
                                                            'p-2 rounded-xl text-xs ' +
                                                            (isOp
                                                                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                                                : 'bg-neutral-800 text-neutral-400 hover:text-amber-300 hover:bg-neutral-700')
                                                        }
                                                    >
                                                        <FontAwesomeIcon icon={faCrown} />
                                                    </button>
                                                    <button
                                                        type={'button'}
                                                        title={'Kicker'}
                                                        onClick={() => {
                                                            setModalInput('');
                                                            setActionModal({
                                                                open: true,
                                                                action: 'kick',
                                                                player: player.name,
                                                            });
                                                        }}
                                                        className={
                                                            'p-2 rounded-xl text-xs bg-neutral-800 text-neutral-400 hover:text-amber-400 hover:bg-neutral-700'
                                                        }
                                                    >
                                                        <FontAwesomeIcon icon={faShoePrints} />
                                                    </button>
                                                    <button
                                                        type={'button'}
                                                        title={'Bannir'}
                                                        onClick={() => {
                                                            setModalInput('');
                                                            setActionModal({
                                                                open: true,
                                                                action: 'ban',
                                                                player: player.name,
                                                            });
                                                        }}
                                                        className={
                                                            'p-2 rounded-xl text-xs bg-neutral-800 text-neutral-400 hover:text-rose-400 hover:bg-neutral-700'
                                                        }
                                                    >
                                                        <FontAwesomeIcon icon={faBan} />
                                                    </button>
                                                    <button
                                                        type={'button'}
                                                        title={'Message Privé'}
                                                        onClick={() => {
                                                            setModalInput('');
                                                            setActionModal({
                                                                open: true,
                                                                action: 'whisper',
                                                                player: player.name,
                                                            });
                                                        }}
                                                        className={
                                                            'p-2 rounded-xl text-xs bg-neutral-800 text-neutral-400 hover:text-violet-300 hover:bg-neutral-700'
                                                        }
                                                    >
                                                        <FontAwesomeIcon icon={faComments} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: OPS */}
                    {tab === 'ops' && (
                        <div>
                            {ops.length === 0 ? (
                                <div className={'py-12 text-center text-neutral-400 text-xs'}>
                                    <p className={'font-semibold text-neutral-300'}>Aucun opérateur configuré</p>
                                    <p className={'text-neutral-500 text-[11px] mt-1'}>
                                        Ajoutez un opérateur avec le bouton ci-dessus.
                                    </p>
                                </div>
                            ) : (
                                <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                                    {ops.map((op) => (
                                        <div
                                            key={op.uuid || op.name}
                                            className={
                                                'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-white/5'
                                            }
                                        >
                                            <div className={'flex items-center gap-3 min-w-0'}>
                                                <img
                                                    src={`https://minotar.net/helm/${op.name}/48.png`}
                                                    alt={op.name}
                                                    className={
                                                        'w-10 h-10 rounded-xl bg-neutral-950 border border-white/10 shrink-0 object-cover'
                                                    }
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://minotar.net/helm/Steve/48.png';
                                                    }}
                                                />
                                                <div className={'min-w-0'}>
                                                    <div className={'flex items-center gap-2'}>
                                                        <span className={'text-sm font-bold text-white truncate'}>
                                                            {op.name}
                                                        </span>
                                                        <span
                                                            className={
                                                                'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                            }
                                                        >
                                                            Niveau {op.level ?? 4}
                                                        </span>
                                                    </div>
                                                    <span className={'text-[10px] text-neutral-500 font-mono truncate'}>
                                                        {op.uuid}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                isSecondary
                                                type={'button'}
                                                onClick={() => handleAction('deop', op.name)}
                                                className={'text-xs hover:border-rose-500/50 hover:text-rose-300'}
                                            >
                                                Retirer OP
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: WHITELIST */}
                    {tab === 'whitelist' && (
                        <div>
                            {whitelist.length === 0 ? (
                                <div className={'py-12 text-center text-neutral-400 text-xs'}>
                                    <p className={'font-semibold text-neutral-300'}>La liste blanche est vide</p>
                                    <p className={'text-neutral-500 text-[11px] mt-1'}>
                                        Ajoutez des joueurs autorisés pour restreindre l&apos;accès.
                                    </p>
                                </div>
                            ) : (
                                <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                                    {whitelist.map((w) => (
                                        <div
                                            key={w.uuid || w.name}
                                            className={
                                                'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-white/5'
                                            }
                                        >
                                            <div className={'flex items-center gap-3 min-w-0'}>
                                                <img
                                                    src={`https://minotar.net/helm/${w.name}/48.png`}
                                                    alt={w.name}
                                                    className={
                                                        'w-10 h-10 rounded-xl bg-neutral-950 border border-white/10 shrink-0 object-cover'
                                                    }
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://minotar.net/helm/Steve/48.png';
                                                    }}
                                                />
                                                <div className={'min-w-0'}>
                                                    <span className={'text-sm font-bold text-white truncate'}>
                                                        {w.name}
                                                    </span>
                                                    <span
                                                        className={
                                                            'text-[10px] text-neutral-500 block font-mono truncate'
                                                        }
                                                    >
                                                        {w.uuid}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                isSecondary
                                                type={'button'}
                                                onClick={() => handleAction('whitelist_remove', w.name)}
                                                className={'text-xs hover:border-rose-500/50 hover:text-rose-300'}
                                            >
                                                Retirer
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: BANNED */}
                    {tab === 'banned' && (
                        <div>
                            {banned.length === 0 ? (
                                <div className={'py-12 text-center text-neutral-400 text-xs'}>
                                    <p className={'font-semibold text-neutral-300'}>Aucun joueur banni</p>
                                    <p className={'text-neutral-500 text-[11px] mt-1'}>
                                        Les sanctions appliquées sur le serveur apparaîtront ici.
                                    </p>
                                </div>
                            ) : (
                                <div className={'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                                    {banned.map((b) => (
                                        <div
                                            key={b.uuid || b.name}
                                            className={
                                                'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/60 border border-white/5'
                                            }
                                        >
                                            <div className={'flex items-center gap-3 min-w-0'}>
                                                <img
                                                    src={`https://minotar.net/helm/${b.name}/48.png`}
                                                    alt={b.name}
                                                    className={
                                                        'w-10 h-10 rounded-xl bg-neutral-950 border border-white/10 shrink-0 object-cover'
                                                    }
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://minotar.net/helm/Steve/48.png';
                                                    }}
                                                />
                                                <div className={'min-w-0'}>
                                                    <span className={'text-sm font-bold text-white truncate'}>
                                                        {b.name}
                                                    </span>
                                                    <span className={'text-[10px] text-rose-400 block truncate'}>
                                                        Raison : {b.reason || 'Banni par un opérateur'}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                isSecondary
                                                type={'button'}
                                                onClick={() => handleAction('pardon', b.name)}
                                                className={'text-xs hover:border-emerald-500/50 hover:text-emerald-300'}
                                            >
                                                Pardonner
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Kick, Ban, Whisper, Add */}
            {actionModal.open && (
                <Modal
                    visible={actionModal.open}
                    onDismissed={() => setActionModal({ open: false, action: 'kick', player: '' })}
                >
                    <form onSubmit={handleModalSubmit} className={'space-y-4'}>
                        <h3 className={'text-base font-bold text-white'}>
                            {actionModal.action === 'kick' && `Kicker le joueur ${actionModal.player}`}
                            {actionModal.action === 'ban' && `Bannir le joueur ${actionModal.player}`}
                            {actionModal.action === 'teleport' && `Téléporter ${actionModal.player}`}
                            {actionModal.action === 'whisper' && `Message privé à ${actionModal.player}`}
                            {actionModal.action === 'add' && `Ajouter un joueur`}
                        </h3>

                        <div className={'space-y-2'}>
                            <label className={'text-xs font-medium text-neutral-300 block'}>
                                {actionModal.action === 'kick' && 'Raison du kick (optionnel) :'}
                                {actionModal.action === 'ban' && 'Raison du bannissement (optionnel) :'}
                                {actionModal.action === 'teleport' && 'Cible (Pseudo du joueur cible) :'}
                                {actionModal.action === 'whisper' && 'Message à envoyer :'}
                                {actionModal.action === 'add' && 'Pseudo Minecraft du joueur :'}
                            </label>
                            <input
                                type={'text'}
                                required={actionModal.action === 'add' || actionModal.action === 'whisper'}
                                value={modalInput}
                                onChange={(e) => setModalInput(e.target.value)}
                                placeholder={
                                    actionModal.action === 'add'
                                        ? 'Ex: Notched'
                                        : actionModal.action === 'whisper'
                                        ? 'Bonjour, merci de respecter les règles !'
                                        : 'Raison...'
                                }
                                className={
                                    'w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-violet-500'
                                }
                            />
                        </div>

                        <div className={'flex justify-end gap-2 pt-2'}>
                            <Button
                                isSecondary
                                type={'button'}
                                onClick={() => setActionModal({ open: false, action: 'kick', player: '' })}
                                className={'text-xs'}
                            >
                                Annuler
                            </Button>
                            <Button type={'submit'} disabled={modalSubmitting} className={'text-xs'}>
                                {modalSubmitting ? 'Validation...' : 'Confirmer'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </PageContentBlock>
    );
};
