import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGamepad,
    faUsers,
    faGlobeAmericas,
    faTachometerAlt,
    faPalette,
    faSave,
    faSpinner,
    faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Button from '@/components/elements/Button';
import Switch from '@/components/elements/Switch';
import { getServerMinecraftConfig, updateServerMinecraftConfig, MinecraftProperties } from '@/api/server/minecraft';
import { httpErrorToHuman } from '@/api/http';
import Spinner from '@/components/elements/Spinner';

const colorPalette = [
    { code: '§0', name: 'Noir', hex: '#000000', textLight: true },
    { code: '§1', name: 'Bleu foncé', hex: '#0000AA', textLight: true },
    { code: '§2', name: 'Vert foncé', hex: '#00AA00', textLight: true },
    { code: '§3', name: 'Aqua foncé', hex: '#00AAAA', textLight: true },
    { code: '§4', name: 'Rouge foncé', hex: '#AA0000', textLight: true },
    { code: '§5', name: 'Violet', hex: '#AA00AA', textLight: true },
    { code: '§6', name: 'Or', hex: '#FFAA00', textLight: false },
    { code: '§7', name: 'Gris clair', hex: '#AAAAAA', textLight: false },
    { code: '§8', name: 'Gris foncé', hex: '#555555', textLight: true },
    { code: '§9', name: 'Bleu', hex: '#5555FF', textLight: true },
    { code: '§a', name: 'Vert clair', hex: '#55FF55', textLight: false },
    { code: '§b', name: 'Aqua', hex: '#55FFFF', textLight: false },
    { code: '§c', name: 'Rouge clair', hex: '#FF5555', textLight: false },
    { code: '§d', name: 'Rose', hex: '#FF55FF', textLight: false },
    { code: '§e', name: 'Jaune', hex: '#FFFF55', textLight: false },
    { code: '§f', name: 'Blanc', hex: '#FFFFFF', textLight: false },
];

const formatPalette = [
    { code: '§l', name: 'Gras (Bold)' },
    { code: '§o', name: 'Italique' },
    { code: '§n', name: 'Souligné' },
    { code: '§m', name: 'Barré' },
    { code: '§r', name: 'Reset' },
];

const parseMinecraftMotd = (motd: string): React.ReactNode => {
    if (!motd) return <span className='text-neutral-400'>A Minecraft Server</span>;

    const colorMap: Record<string, string> = {
        '0': '#000000',
        '1': '#0000AA',
        '2': '#00AA00',
        '3': '#00AAAA',
        '4': '#AA0000',
        '5': '#AA00AA',
        '6': '#FFAA00',
        '7': '#AAAAAA',
        '8': '#555555',
        '9': '#5555FF',
        a: '#55FF55',
        b: '#55FFFF',
        c: '#FF5555',
        d: '#FF55FF',
        e: '#FFFF55',
        f: '#FFFFFF',
    };

    const lines = motd.split(/\\n|\n/);

    return (
        <div className='space-y-1 font-mono text-xs sm:text-sm leading-relaxed'>
            {lines.map((line, lineIdx) => {
                const parts: React.ReactNode[] = [];
                let currentColor = '#FFFFFF';
                let isBold = false;
                let isItalic = false;
                let isUnderline = false;
                let isStrikethrough = false;

                const tokens = line.split('§');
                tokens.forEach((token, tokenIdx) => {
                    if (tokenIdx === 0) {
                        if (token) parts.push(<span key={0}>{token}</span>);
                        return;
                    }

                    const code = token.charAt(0).toLowerCase();
                    const text = token.slice(1);

                    if (colorMap[code]) {
                        currentColor = colorMap[code];
                        isBold = false;
                        isItalic = false;
                        isUnderline = false;
                        isStrikethrough = false;
                    } else if (code === 'l') {
                        isBold = true;
                    } else if (code === 'o') {
                        isItalic = true;
                    } else if (code === 'n') {
                        isUnderline = true;
                    } else if (code === 'm') {
                        isStrikethrough = true;
                    } else if (code === 'r') {
                        currentColor = '#FFFFFF';
                        isBold = false;
                        isItalic = false;
                        isUnderline = false;
                        isStrikethrough = false;
                    }

                    if (text) {
                        parts.push(
                            <span
                                key={tokenIdx}
                                style={{
                                    color: currentColor,
                                    fontWeight: isBold ? 'bold' : 'normal',
                                    fontStyle: isItalic ? 'italic' : 'normal',
                                    textDecoration:
                                        `${isUnderline ? 'underline ' : ''}${
                                            isStrikethrough ? 'line-through' : ''
                                        }`.trim() || undefined,
                                    textShadow: '1px 1px 0px rgba(0,0,0,0.85), 2px 2px 0px rgba(0,0,0,0.5)',
                                }}
                            >
                                {text}
                            </span>
                        );
                    }
                });

                return (
                    <div key={lineIdx} className='min-h-[1.25rem]'>
                        {parts.length > 0 ? parts : <span style={{ color: '#FFFFFF' }}>&nbsp;</span>}
                    </div>
                );
            })}
        </div>
    );
};

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const brandName = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'NXSLab');
    const [properties, setProperties] = useState<MinecraftProperties>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState<'gameplay' | 'players' | 'world' | 'performance' | 'motd'>('gameplay');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getServerMinecraftConfig(uuid)
            .then((props) => setProperties(props))
            .catch((err) => setErrorMessage(httpErrorToHuman(err)))
            .finally(() => setLoading(false));
    }, [uuid]);

    const updateProp = (key: string, val: any) => {
        setProperties((prev) => ({ ...prev, [key]: val }));
        setSuccessMessage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const updated = await updateServerMinecraftConfig(uuid, properties);
            setProperties(updated);
            setSuccessMessage('Configuration enregistrée avec succès ! Redémarrez le serveur pour appliquer.');
        } catch (err) {
            setErrorMessage(httpErrorToHuman(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PageContentBlock title={'Configuration Minecraft'}>
                <div className={'flex justify-center items-center py-20'}>
                    <Spinner size={'large'} />
                </div>
            </PageContentBlock>
        );
    }

    return (
        <PageContentBlock title={'Configuration Minecraft'}>
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
                                <FontAwesomeIcon icon={faGamepad} />
                            </div>
                            <h2 className={'text-lg font-bold text-white tracking-tight'}>
                                Éditeur Visuel server.properties
                            </h2>
                        </div>
                        <p className={'text-xs text-neutral-400 mt-1 max-w-xl'}>
                            Modifiez les réglages de votre serveur Minecraft sans toucher au fichier brut. Redémarrage
                            requis après sauvegarde.
                        </p>
                    </div>

                    <Button
                        type={'button'}
                        disabled={saving}
                        onClick={handleSave}
                        className={'text-xs self-start sm:self-auto shrink-0'}
                    >
                        {saving ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className={'mr-2'} />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSave} className={'mr-2'} />
                                Enregistrer la configuration
                            </>
                        )}
                    </Button>
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
                        onClick={() => setTab('gameplay')}
                        className={
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
                            (tab === 'gameplay'
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white')
                        }
                    >
                        <FontAwesomeIcon icon={faGamepad} className={'text-xs'} />
                        <span>Gameplay & Règles</span>
                    </button>
                    <button
                        type={'button'}
                        onClick={() => setTab('players')}
                        className={
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
                            (tab === 'players'
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white')
                        }
                    >
                        <FontAwesomeIcon icon={faUsers} className={'text-xs'} />
                        <span>Accès & Joueurs</span>
                    </button>
                    <button
                        type={'button'}
                        onClick={() => setTab('world')}
                        className={
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
                            (tab === 'world'
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white')
                        }
                    >
                        <FontAwesomeIcon icon={faGlobeAmericas} className={'text-xs'} />
                        <span>Monde & Spawns</span>
                    </button>
                    <button
                        type={'button'}
                        onClick={() => setTab('performance')}
                        className={
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
                            (tab === 'performance'
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white')
                        }
                    >
                        <FontAwesomeIcon icon={faTachometerAlt} className={'text-xs'} />
                        <span>Performances</span>
                    </button>
                    <button
                        type={'button'}
                        onClick={() => setTab('motd')}
                        className={
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ' +
                            (tab === 'motd'
                                ? 'bg-violet-600 text-white shadow-md'
                                : 'text-neutral-400 hover:text-white')
                        }
                    >
                        <FontAwesomeIcon icon={faPalette} className={'text-xs'} />
                        <span>Message du Jour (MOTD)</span>
                    </button>
                </div>

                {/* Tab Content Cards */}
                <div
                    className={
                        'p-6 sm:p-8 rounded-3xl bg-[#0e0c18]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl space-y-6'
                    }
                >
                    {/* TAB: GAMEPLAY */}
                    {tab === 'gameplay' && (
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-6'}>
                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>Combats Joueurs (PvP)</h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Autoriser les joueurs à s&apos;attaquer mutuellement.
                                    </p>
                                </div>
                                <Switch
                                    name={'pvp'}
                                    defaultChecked={properties['pvp'] ?? true}
                                    onChange={() => updateProp('pvp', !properties['pvp'])}
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>Mode Hardcore</h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Bannissement automatique après la mort.
                                    </p>
                                </div>
                                <Switch
                                    name={'hardcore'}
                                    defaultChecked={properties['hardcore'] ?? false}
                                    onChange={() => updateProp('hardcore', !properties['hardcore'])}
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>Autoriser le Vol</h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Autoriser les mods de vol sans être kické.
                                    </p>
                                </div>
                                <Switch
                                    name={'allow-flight'}
                                    defaultChecked={properties['allow-flight'] ?? false}
                                    onChange={() => updateProp('allow-flight', !properties['allow-flight'])}
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>Forcer le Gamemode</h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Réassigner le gamemode par défaut à la connexion.
                                    </p>
                                </div>
                                <Switch
                                    name={'force-gamemode'}
                                    defaultChecked={properties['force-gamemode'] ?? false}
                                    onChange={() => updateProp('force-gamemode', !properties['force-gamemode'])}
                                />
                            </div>

                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2'}>
                                <label className={'text-xs font-medium text-neutral-300 block'}>
                                    Difficulté du jeu :
                                </label>
                                <select
                                    value={properties['difficulty'] || 'easy'}
                                    onChange={(e) => updateProp('difficulty', e.target.value)}
                                    className={
                                        'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-violet-500'
                                    }
                                >
                                    <option value={'peaceful'}>Paisible (Peaceful)</option>
                                    <option value={'easy'}>Facile (Easy)</option>
                                    <option value={'normal'}>Normal</option>
                                    <option value={'hard'}>Difficile (Hard)</option>
                                </select>
                            </div>

                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2'}>
                                <label className={'text-xs font-medium text-neutral-300 block'}>
                                    Mode de jeu par défaut (Gamemode) :
                                </label>
                                <select
                                    value={properties['gamemode'] || 'survival'}
                                    onChange={(e) => updateProp('gamemode', e.target.value)}
                                    className={
                                        'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-violet-500'
                                    }
                                >
                                    <option value={'survival'}>Survie (Survival)</option>
                                    <option value={'creative'}>Créatif (Creative)</option>
                                    <option value={'adventure'}>Aventure (Adventure)</option>
                                    <option value={'spectator'}>Spectateur (Spectator)</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {/* TAB: PLAYERS */}
                    {tab === 'players' && (
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-6'}>
                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>
                                        Mode En Ligne (Online Mode)
                                    </h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Désactivez pour autoriser les versions non-officielles (Cracks).
                                    </p>
                                </div>
                                <Switch
                                    name={'online-mode'}
                                    defaultChecked={properties['online-mode'] ?? true}
                                    onChange={() => updateProp('online-mode', !properties['online-mode'])}
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>
                                        Liste Blanche (Whitelist)
                                    </h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Restreindre l&apos;accès aux joueurs autorisés uniquement.
                                    </p>
                                </div>
                                <Switch
                                    name={'white-list'}
                                    defaultChecked={properties['white-list'] ?? false}
                                    onChange={() => updateProp('white-list', !properties['white-list'])}
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>Forcer la Whitelist</h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Kicker immédiatement les joueurs retirés de la liste blanche.
                                    </p>
                                </div>
                                <Switch
                                    name={'enforce-whitelist'}
                                    defaultChecked={properties['enforce-whitelist'] ?? false}
                                    onChange={() => updateProp('enforce-whitelist', !properties['enforce-whitelist'])}
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>
                                        Masquer les Joueurs en Ligne
                                    </h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Cacher la liste des pseudos dans le menu multijoueur.
                                    </p>
                                </div>
                                <Switch
                                    name={'hide-online-players'}
                                    defaultChecked={properties['hide-online-players'] ?? false}
                                    onChange={() =>
                                        updateProp('hide-online-players', !properties['hide-online-players'])
                                    }
                                />
                            </div>

                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2'}>
                                <label className={'text-xs font-medium text-neutral-300 block'}>
                                    Nombre Maximum de Joueurs (Slots) :
                                </label>
                                <input
                                    type={'number'}
                                    min={1}
                                    max={9999}
                                    value={properties['max-players'] ?? 20}
                                    onChange={(e) => updateProp('max-players', parseInt(e.target.value, 10))}
                                    className={
                                        'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-violet-500'
                                    }
                                />
                            </div>

                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2'}>
                                <label className={'text-xs font-medium text-neutral-300 block'}>
                                    Délai AFK avant Kick (Minutes, 0 = désactivé) :
                                </label>
                                <input
                                    type={'number'}
                                    min={0}
                                    value={properties['player-idle-timeout'] ?? 0}
                                    onChange={(e) => updateProp('player-idle-timeout', parseInt(e.target.value, 10))}
                                    className={
                                        'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-violet-500'
                                    }
                                />
                            </div>
                        </div>
                    )}
                    {/* TAB: WORLD */}
                    {tab === 'world' && (
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-6'}>
                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>Activer le Nether</h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Autoriser les portails et la dimension du Nether.
                                    </p>
                                </div>
                                <Switch
                                    name={'allow-nether'}
                                    defaultChecked={properties['allow-nether'] ?? true}
                                    onChange={() => updateProp('allow-nether', !properties['allow-nether'])}
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>
                                        Génération de Structures
                                    </h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Générer villages, forteresses et donjons.
                                    </p>
                                </div>
                                <Switch
                                    name={'generate-structures'}
                                    defaultChecked={properties['generate-structures'] ?? true}
                                    onChange={() =>
                                        updateProp('generate-structures', !properties['generate-structures'])
                                    }
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>
                                        Apparition des Monstres
                                    </h4>
                                    <p className={'text-xs text-neutral-500'}>Zombies, squelettes, creepers, etc.</p>
                                </div>
                                <Switch
                                    name={'spawn-monsters'}
                                    defaultChecked={properties['spawn-monsters'] ?? true}
                                    onChange={() => updateProp('spawn-monsters', !properties['spawn-monsters'])}
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>Apparition des Animaux</h4>
                                    <p className={'text-xs text-neutral-500'}>Vaches, cochons, moutons, poulets.</p>
                                </div>
                                <Switch
                                    name={'spawn-animals'}
                                    defaultChecked={properties['spawn-animals'] ?? true}
                                    onChange={() => updateProp('spawn-animals', !properties['spawn-animals'])}
                                />
                            </div>

                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2'}>
                                <label className={'text-xs font-medium text-neutral-300 block'}>
                                    Nom du Monde (Dossier) :
                                </label>
                                <input
                                    type={'text'}
                                    value={properties['level-name'] || 'world'}
                                    onChange={(e) => updateProp('level-name', e.target.value)}
                                    className={
                                        'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-violet-500'
                                    }
                                />
                            </div>

                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2'}>
                                <label className={'text-xs font-medium text-neutral-300 block'}>
                                    Graine de Génération (Seed) :
                                </label>
                                <input
                                    type={'text'}
                                    placeholder={'Laisser vide pour une seed aléatoire'}
                                    value={properties['level-seed'] || ''}
                                    onChange={(e) => updateProp('level-seed', e.target.value)}
                                    className={
                                        'w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-violet-500'
                                    }
                                />
                            </div>
                        </div>
                    )}
                    {/* TAB: PERFORMANCE */}
                    {tab === 'performance' && (
                        <div className={'grid grid-cols-1 md:grid-cols-2 gap-6'}>
                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2'}>
                                <div className={'flex justify-between items-center'}>
                                    <label className={'text-xs font-medium text-neutral-300'}>
                                        Distance de Vue (View Distance) :
                                    </label>
                                    <span className={'text-xs font-bold text-violet-400'}>
                                        {properties['view-distance'] ?? 10} chunks
                                    </span>
                                </div>
                                <input
                                    type={'range'}
                                    min={4}
                                    max={32}
                                    value={properties['view-distance'] ?? 10}
                                    onChange={(e) => updateProp('view-distance', parseInt(e.target.value, 10))}
                                    className={'w-full accent-violet-600'}
                                />
                                <p className={'text-[10px] text-neutral-500'}>
                                    Réduisez à 8-10 pour améliorer grandement les performances du serveur.
                                </p>
                            </div>

                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-2'}>
                                <div className={'flex justify-between items-center'}>
                                    <label className={'text-xs font-medium text-neutral-300'}>
                                        Distance de Simulation :
                                    </label>
                                    <span className={'text-xs font-bold text-violet-400'}>
                                        {properties['simulation-distance'] ?? 8} chunks
                                    </span>
                                </div>
                                <input
                                    type={'range'}
                                    min={3}
                                    max={32}
                                    value={properties['simulation-distance'] ?? 8}
                                    onChange={(e) => updateProp('simulation-distance', parseInt(e.target.value, 10))}
                                    className={'w-full accent-violet-600'}
                                />
                                <p className={'text-[10px] text-neutral-500'}>
                                    Rayon dans lequel les entités et machines s&apos;activent.
                                </p>
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>
                                        Blocs de Commande (Command Blocks)
                                    </h4>
                                    <p className={'text-xs text-neutral-500'}>
                                        Autoriser l&apos;exécution des blocs de commande.
                                    </p>
                                </div>
                                <Switch
                                    name={'enable-command-block'}
                                    defaultChecked={properties['enable-command-block'] ?? false}
                                    onChange={() =>
                                        updateProp('enable-command-block', !properties['enable-command-block'])
                                    }
                                />
                            </div>

                            <div
                                className={
                                    'flex items-center justify-between p-4 rounded-2xl bg-neutral-900/50 border border-white/5'
                                }
                            >
                                <div>
                                    <h4 className={'text-sm font-semibold text-neutral-200'}>Activer RCON</h4>
                                    <p className={'text-xs text-neutral-500'}>Accès de commande à distance.</p>
                                </div>
                                <Switch
                                    name={'enable-rcon'}
                                    defaultChecked={properties['enable-rcon'] ?? false}
                                    onChange={() => updateProp('enable-rcon', !properties['enable-rcon'])}
                                />
                            </div>
                        </div>
                    )}
                    {/* TAB: MOTD */}
                    {tab === 'motd' && (
                        <div className={'space-y-6'}>
                            {/* Live Multiplayer In-Game Preview Frame */}
                            <div>
                                <div className={'flex items-center justify-between mb-2'}>
                                    <h4
                                        className={
                                            'text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5'
                                        }
                                    >
                                        <FontAwesomeIcon icon={faGamepad} className={'text-xs'} />
                                        Simulateur Multijoueur Minecraft en Direct :
                                    </h4>
                                    <span className={'text-[11px] font-mono text-neutral-400'}>
                                        {properties['max-players'] ?? 20} slots alloués
                                    </span>
                                </div>
                                <div
                                    className={
                                        'p-4 sm:p-5 rounded-2xl bg-[#090812] border-2 border-white/[0.08] font-mono shadow-2xl relative overflow-hidden'
                                    }
                                >
                                    <div className={'flex items-start gap-4'}>
                                        {/* Server Icon */}
                                        <div
                                            className={
                                                'w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/30 to-purple-800/20 border border-violet-500/40 flex items-center justify-center shrink-0 text-violet-300 text-2xl shadow-lg'
                                            }
                                        >
                                            <FontAwesomeIcon icon={faGamepad} />
                                        </div>

                                        {/* Server Header & Real-time Colored MOTD */}
                                        <div className={'flex-1 min-w-0'}>
                                            <div className={'flex justify-between items-center mb-1.5'}>
                                                <span
                                                    className={
                                                        'font-bold text-white text-sm sm:text-base tracking-tight'
                                                    }
                                                >
                                                    Mon Serveur Minecraft
                                                </span>
                                                <div className={'flex items-center gap-2 text-right'}>
                                                    <span className={'text-[11px] font-mono text-neutral-400'}>
                                                        <span className={'text-emerald-400 font-bold'}>0</span> /{' '}
                                                        {properties['max-players'] ?? 20}
                                                    </span>
                                                    {/* 5-bar Ping Indicator */}
                                                    <div
                                                        className={'flex items-end gap-0.5 h-3.5'}
                                                        title={'Ping: 12ms (Excellent)'}
                                                    >
                                                        <span className={'w-1 h-1.5 bg-emerald-400 rounded-xs'} />
                                                        <span className={'w-1 h-2 bg-emerald-400 rounded-xs'} />
                                                        <span className={'w-1 h-2.5 bg-emerald-400 rounded-xs'} />
                                                        <span className={'w-1 h-3 bg-emerald-400 rounded-xs'} />
                                                        <span className={'w-1 h-3.5 bg-emerald-400 rounded-xs'} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rendered Colored MOTD */}
                                            <div className={'p-2.5 rounded-xl bg-black/60 border border-white/[0.05]'}>
                                                {parseMinecraftMotd(
                                                    properties['motd'] || `A Minecraft Server hosted on ${brandName}`
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Color Palette & Format Chips */}
                            <div className={'p-5 rounded-2xl bg-[#0d0b16] border border-white/[0.08] space-y-4'}>
                                <div>
                                    <h4 className={'text-xs font-semibold text-neutral-200 mb-1'}>
                                        Palette de Couleurs Minecraft (Cliquez pour insérer) :
                                    </h4>
                                    <div className={'flex flex-wrap gap-1.5 pt-1'}>
                                        {colorPalette.map((item) => (
                                            <button
                                                key={item.code}
                                                type={'button'}
                                                onClick={() =>
                                                    updateProp('motd', (properties['motd'] || '') + item.code)
                                                }
                                                style={{ backgroundColor: item.hex }}
                                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border border-white/20 active:scale-95 transition-all shadow-sm ${
                                                    item.textLight ? 'text-white' : 'text-neutral-900'
                                                }`}
                                                title={`${item.name} (${item.code})`}
                                            >
                                                {item.code} {item.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className={'text-xs font-semibold text-neutral-200 mb-1'}>
                                        Styles de Formatage & Outils :
                                    </h4>
                                    <div className={'flex flex-wrap items-center gap-1.5 pt-1'}>
                                        {formatPalette.map((item) => (
                                            <button
                                                key={item.code}
                                                type={'button'}
                                                onClick={() =>
                                                    updateProp('motd', (properties['motd'] || '') + item.code)
                                                }
                                                className={
                                                    'px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-violet-600/20 text-neutral-300 hover:text-white border border-white/[0.08] text-[11px] font-mono font-medium active:scale-95 transition-all'
                                                }
                                                title={item.name}
                                            >
                                                {item.code} {item.name}
                                            </button>
                                        ))}
                                        <button
                                            type={'button'}
                                            onClick={() => updateProp('motd', (properties['motd'] || '') + '\\n')}
                                            className={
                                                'px-3 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 text-[11px] font-mono font-semibold active:scale-95 transition-all'
                                            }
                                            title={'Ajouter un saut de ligne'}
                                        >
                                            + Saut de Ligne (\\n)
                                        </button>
                                        <button
                                            type={'button'}
                                            onClick={() => updateProp('motd', '')}
                                            className={
                                                'px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-medium active:scale-95 transition-all ml-auto'
                                            }
                                        >
                                            Effacer
                                        </button>
                                    </div>
                                </div>

                                {/* Raw MOTD Input */}
                                <div>
                                    <label className={'text-xs font-medium text-neutral-300 block mb-1.5'}>
                                        Code MOTD Brut :
                                    </label>
                                    <input
                                        type={'text'}
                                        value={properties['motd'] || ''}
                                        onChange={(e) => updateProp('motd', e.target.value)}
                                        placeholder={'Ex: §a§lMon Serveur §7| §eSurvie 1.21\\n§bRejoins-nous !'}
                                        className={
                                            'w-full px-4 py-3 rounded-xl bg-neutral-950 border border-white/10 text-neutral-100 text-xs font-mono focus:outline-none focus:border-violet-500 transition-colors'
                                        }
                                    />
                                </div>

                                {/* Ready-to-use Presets */}
                                <div className={'pt-2 border-t border-white/[0.06]'}>
                                    <span className={'text-[11px] font-medium text-neutral-400 block mb-2'}>
                                        Modèles Prédéfinis (Cliquez pour appliquer) :
                                    </span>
                                    <div className={'grid grid-cols-1 sm:grid-cols-3 gap-2.5'}>
                                        <button
                                            type={'button'}
                                            onClick={() =>
                                                updateProp(
                                                    'motd',
                                                    '§a§lMON SERVEUR §8» §eSurvie 1.21 §7| §bQuêtes & Économie\\n§7Rejoins-nous dès maintenant sur §dplay.monserveur.fr'
                                                )
                                            }
                                            className={
                                                'p-2.5 rounded-xl bg-white/[0.02] hover:bg-violet-600/15 border border-white/[0.06] hover:border-violet-500/30 text-left transition-all active:scale-[0.98]'
                                            }
                                        >
                                            <span className={'text-xs font-bold text-neutral-200 block'}>
                                                1. Survie & RPG
                                            </span>
                                            <span className={'text-[10px] text-neutral-500 truncate block mt-0.5'}>
                                                Vert & Or vibrant
                                            </span>
                                        </button>
                                        <button
                                            type={'button'}
                                            onClick={() =>
                                                updateProp(
                                                    'motd',
                                                    "§6§lFACTION PVP §8[§c1.21§8] §fOuverture Officielle !\\n§a§l+500€ DE LOTS §8• §e§lREJOINS L'AVENTURE !"
                                                )
                                            }
                                            className={
                                                'p-2.5 rounded-xl bg-white/[0.02] hover:bg-violet-600/15 border border-white/[0.06] hover:border-violet-500/30 text-left transition-all active:scale-[0.98]'
                                            }
                                        >
                                            <span className={'text-xs font-bold text-neutral-200 block'}>
                                                2. Faction & PvP
                                            </span>
                                            <span className={'text-[10px] text-neutral-500 truncate block mt-0.5'}>
                                                Orange & Rouge compétitif
                                            </span>
                                        </button>
                                        <button
                                            type={'button'}
                                            onClick={() =>
                                                updateProp(
                                                    'motd',
                                                    '§d§lMINI-JEUX §f& §b§lCRÉATIF §7• §a24/7 Sans Lag\\n§fServeur fluide §8| §eEvents chaque week-end §c❤'
                                                )
                                            }
                                            className={
                                                'p-2.5 rounded-xl bg-white/[0.02] hover:bg-violet-600/15 border border-white/[0.06] hover:border-violet-500/30 text-left transition-all active:scale-[0.98]'
                                            }
                                        >
                                            <span className={'text-xs font-bold text-neutral-200 block'}>
                                                3. Mini-Jeux & Créatif
                                            </span>
                                            <span className={'text-[10px] text-neutral-500 truncate block mt-0.5'}>
                                                Rose, Aqua & Cœur
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}{' '}
                </div>
            </div>
        </PageContentBlock>
    );
};
