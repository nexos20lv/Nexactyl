/* eslint-disable no-control-regex */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ITerminalOptions, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SearchBarAddon } from 'xterm-addon-search-bar';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { ScrollDownHelperAddon } from '@/plugins/XtermScrollDownHelperAddon';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { usePermissions } from '@/plugins/usePermissions';
import { theme as th } from 'twin.macro';
import useEventListener from '@/plugins/useEventListener';
import { debounce } from 'debounce';
import { usePersistedState } from '@/plugins/usePersistedState';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import classNames from 'classnames';
import { ChevronDoubleRightIcon } from '@heroicons/react/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBroom, faPause, faPlay, faBolt, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './style.module.css';
import { Unicode11Addon } from 'xterm-addon-unicode11';

const terminalTheme = {
    background: '#07060b',
    cursor: '#a855f7',
    cursorAccent: '#ffffff',
    black: '#0f0e17',
    red: '#f43f5e',
    green: '#10b981',
    yellow: '#f59e0b',
    blue: '#6366f1',
    magenta: '#d946ef',
    cyan: '#06b6d4',
    white: '#e2e8f0',
    brightBlack: '#475569',
    brightRed: '#fb7185',
    brightGreen: '#34d399',
    brightYellow: '#fbbf24',
    brightBlue: '#818cf8',
    brightMagenta: '#e879f9',
    brightCyan: '#22d3ee',
    brightWhite: '#ffffff',
    selection: 'rgba(168, 85, 247, 0.35)',
};

const terminalProps: ITerminalOptions = {
    disableStdin: true,
    cursorStyle: 'underline',
    allowTransparency: true,
    fontSize: 12,
    fontFamily: th('fontFamily.mono'),
    rows: 30,
    theme: terminalTheme,
};

type LogLevel = 'all' | 'info' | 'warn' | 'error' | 'crash';

const stripAnsi = (str: string): string =>
    str.replace(/[][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

const matchesFilter = (raw: string, filter: LogLevel): boolean => {
    if (filter === 'all') return true;
    const clean = stripAnsi(raw);
    if (filter === 'info') return /\[.*INFO.*\]|INFO:/i.test(clean);
    if (filter === 'warn') return /\[.*WARN.*\]|WARN:|WARNING/i.test(clean);
    if (filter === 'error') return /\[.*ERROR.*\]|ERROR:|Exception|Caused by|Error:/i.test(clean);
    if (filter === 'crash') return /crash|FATAL|OutOfMemory|Shutting down server|Stopping server/i.test(clean);
    return false;
};

export default () => {
    const TERMINAL_PRELUDE = '\u001b[1m\u001b[38;2;168;85;247mnxs@cloud~ \u001b[0m';
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminal = useMemo(() => new Terminal({ ...terminalProps }), []);
    const fitAddon = useMemo(() => new FitAddon(), []);
    const searchAddon = useMemo(() => new SearchAddon(), []);
    const searchBar = useMemo(() => new SearchBarAddon({ searchAddon }), [searchAddon]);
    const webLinksAddon = useMemo(() => new WebLinksAddon(), []);
    const unicode11Addon = useMemo(() => new Unicode11Addon(), []);
    const scrollDownHelperAddon = useMemo(() => new ScrollDownHelperAddon(), []);

    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const [canSendCommands] = usePermissions(['control.console']);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
    const isMinecraft = ServerContext.useStoreState((state) => Boolean(state.server.data!.isMinecraft));
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);

    const [history, setHistory] = usePersistedState<string[]>(`${serverId}:command_history`, []);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Advanced Console States
    const [filter, setFilter] = useState<LogLevel>('all');
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    const [customCommands, setCustomCommands] = usePersistedState<string[]>(`${serverId}:quick_commands`, []);
    const [showAddCommand, setShowAddCommand] = useState(false);
    const [newCmdInput, setNewCmdInput] = useState('');
    const [counts, setCounts] = useState({ info: 0, warn: 0, error: 0, crash: 0 });

    const logsBufferRef = useRef<string[]>([]);
    const filterRef = useRef<LogLevel>('all');
    filterRef.current = filter;

    const zIndex = `
    .xterm-search-bar__addon {
        z-index: 20;
    }`;

    const appendLog = (formattedLine: string) => {
        // Keep max 1500 lines in memory
        logsBufferRef.current.push(formattedLine);
        if (logsBufferRef.current.length > 1500) {
            logsBufferRef.current.shift();
        }

        // Update counts
        const clean = stripAnsi(formattedLine);
        if (/\[.*INFO.*\]|INFO:/i.test(clean)) setCounts((c) => ({ ...c, info: c.info + 1 }));
        if (/\[.*WARN.*\]|WARN:|WARNING/i.test(clean)) setCounts((c) => ({ ...c, warn: c.warn + 1 }));
        if (/\[.*ERROR.*\]|ERROR:|Exception|Caused by|Error:/i.test(clean))
            setCounts((c) => ({ ...c, error: c.error + 1 }));
        if (/crash|FATAL|OutOfMemory/i.test(clean)) setCounts((c) => ({ ...c, crash: c.crash + 1 }));

        if (matchesFilter(formattedLine, filterRef.current)) {
            terminal.writeln(formattedLine);
        }
    };

    const handleConsoleOutput = (line: string, prelude = false) => {
        const full = (prelude ? TERMINAL_PRELUDE : '') + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m';
        appendLog(full);
    };

    const handleTransferStatus = (status: string) => {
        if (status === 'failure') {
            appendLog(TERMINAL_PRELUDE + 'Transfer has failed.\u001b[0m');
        }
    };

    const handleDaemonErrorOutput = (line: string) => {
        appendLog(TERMINAL_PRELUDE + '\u001b[1m\u001b[41m' + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m');
    };

    const handlePowerChangeEvent = (state: string) => {
        appendLog(TERMINAL_PRELUDE + 'Server marked as ' + state + '...\u001b[0m');
    };

    const applyFilter = (newFilter: LogLevel) => {
        setFilter(newFilter);
        filterRef.current = newFilter;
        terminal.clear();
        const matching = logsBufferRef.current.filter((l) => matchesFilter(l, newFilter));
        matching.forEach((l) => terminal.writeln(l));
    };

    const clearTerminal = () => {
        terminal.clear();
        logsBufferRef.current = [];
        setCounts({ info: 0, warn: 0, error: 0, crash: 0 });
    };

    const executeCommand = (cmd: string) => {
        if (!instance || !connected) return;

        if (cmd.endsWith(' ') || cmd.endsWith(':')) {
            if (inputRef.current) {
                inputRef.current.value = cmd;
                inputRef.current.focus();
            }
            return;
        }

        setHistory((prevHistory) => [cmd, ...(prevHistory || [])].slice(0, 32));
        setHistoryIndex(-1);
        instance.send('send command', cmd);
    };

    const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            const newIndex = Math.min(historyIndex + 1, history!.length - 1);
            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
            e.preventDefault();
        }

        if (e.key === 'ArrowDown') {
            const newIndex = Math.max(historyIndex - 1, -1);
            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
        }

        const command = e.currentTarget.value;
        if (e.key === 'Enter' && command.length > 0) {
            executeCommand(command);
            e.currentTarget.value = '';
        }
    };

    const addCustomCommand = () => {
        const clean = newCmdInput.trim();
        if (clean && !(customCommands || []).includes(clean)) {
            setCustomCommands([...(customCommands || []), clean]);
        }
        setNewCmdInput('');
        setShowAddCommand(false);
    };

    const removeCustomCommand = (cmdToRemove: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCustomCommands((customCommands || []).filter((c) => c !== cmdToRemove));
    };

    useEffect(() => {
        if (connected && ref.current && !terminal.element) {
            terminal.loadAddon(fitAddon);
            terminal.loadAddon(searchAddon);
            terminal.loadAddon(searchBar);
            terminal.loadAddon(webLinksAddon);
            terminal.loadAddon(unicode11Addon);
            terminal.loadAddon(scrollDownHelperAddon);

            terminal.open(ref.current);
            terminal.unicode.activeVersion = '11';

            fitAddon.fit();
            searchBar.addNewStyle(zIndex);

            terminal.attachCustomKeyEventHandler((e: KeyboardEvent) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    document.execCommand('copy');
                    return false;
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    e.preventDefault();
                    searchBar.show();
                    return false;
                } else if (e.key === 'Escape') {
                    searchBar.hidden();
                }
                return true;
            });
        }
    }, [terminal, connected]);

    useEventListener(
        'resize',
        debounce(() => {
            if (terminal.element) {
                fitAddon.fit();
            }
        }, 100)
    );

    useEffect(() => {
        const listeners: Record<string, (s: string) => void> = {
            [SocketEvent.STATUS]: handlePowerChangeEvent,
            [SocketEvent.CONSOLE_OUTPUT]: handleConsoleOutput,
            [SocketEvent.INSTALL_OUTPUT]: handleConsoleOutput,
            [SocketEvent.TRANSFER_LOGS]: handleConsoleOutput,
            [SocketEvent.TRANSFER_STATUS]: handleTransferStatus,
            [SocketEvent.DAEMON_MESSAGE]: (line) => handleConsoleOutput(line, true),
            [SocketEvent.DAEMON_ERROR]: handleDaemonErrorOutput,
        };

        if (connected && instance) {
            if (!isTransferring) {
                terminal.clear();
            }

            Object.keys(listeners).forEach((key: string) => {
                instance.addListener(key, listeners[key]);
            });
            instance.send(SocketRequest.SEND_LOGS);
        }

        return () => {
            if (instance) {
                Object.keys(listeners).forEach((key: string) => {
                    instance.removeListener(key, listeners[key]);
                });
            }
        };
    }, [connected, instance]);

    // Quick Command Presets
    const defaultMinecraftCommands = [
        { label: 'tps', cmd: 'tps', desc: 'Performance du serveur' },
        { label: 'list', cmd: 'list', desc: 'Joueurs connectés' },
        { label: 'save-all', cmd: 'save-all', desc: 'Sauvegarder le monde' },
        { label: 'whitelist', cmd: 'whitelist list', desc: 'Statut whitelist' },
        { label: 'say...', cmd: 'say ', desc: 'Message dans le chat' },
        { label: 'op...', cmd: 'op ', desc: 'Donner opérateur' },
    ];

    const defaultGenericCommands = [
        { label: 'status', cmd: 'status', desc: "Statut de l'application" },
        { label: 'help', cmd: 'help', desc: 'Commandes disponibles' },
        { label: 'uptime', cmd: 'uptime', desc: "Temps d'exécution" },
        { label: 'version', cmd: 'version', desc: 'Version actuelle' },
    ];

    const quickActions = isMinecraft ? defaultMinecraftCommands : defaultGenericCommands;

    return (
        <div className={classNames(styles.terminal, 'relative w-full')}>
            <SpinnerOverlay visible={!connected} size={'large'} />

            {/* Apollo Terminal Top Control Bar: Filters & Tools */}
            <div className='bg-[#0b0914] border border-white/[0.08] border-b-0 rounded-t-2xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs select-none'>
                {/* Left: Log Filter Pills */}
                <div className='flex items-center gap-1.5 flex-wrap'>
                    <button
                        type='button'
                        onClick={() => applyFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                            filter === 'all'
                                ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                                : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                        }`}
                    >
                        TOUS
                    </button>
                    <button
                        type='button'
                        onClick={() => applyFilter('info')}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                            filter === 'info'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                                : 'bg-white/[0.04] text-neutral-400 hover:text-sky-300'
                        }`}
                    >
                        INFO {counts.info > 0 && <span className='text-[10px] opacity-75'>({counts.info})</span>}
                    </button>
                    <button
                        type='button'
                        onClick={() => applyFilter('warn')}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                            filter === 'warn'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                : 'bg-white/[0.04] text-neutral-400 hover:text-amber-300'
                        }`}
                    >
                        WARN {counts.warn > 0 && <span className='text-[10px] opacity-75'>({counts.warn})</span>}
                    </button>
                    <button
                        type='button'
                        onClick={() => applyFilter('error')}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                            filter === 'error'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                                : 'bg-white/[0.04] text-neutral-400 hover:text-rose-300'
                        }`}
                    >
                        ERROR {counts.error > 0 && <span className='text-[10px] opacity-75'>({counts.error})</span>}
                    </button>
                    <button
                        type='button'
                        onClick={() => applyFilter('crash')}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                            filter === 'crash'
                                ? 'bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/50 shadow-sm'
                                : 'bg-white/[0.04] text-neutral-400 hover:text-fuchsia-300'
                        }`}
                    >
                        CRASH {counts.crash > 0 && <span className='text-[10px] opacity-75'>({counts.crash})</span>}
                    </button>
                </div>

                {/* Right: Search, AutoScroll, Clear */}
                <div className='flex items-center gap-1.5'>
                    <button
                        type='button'
                        onClick={() => searchBar.show()}
                        title='Rechercher dans les logs (Ctrl+F)'
                        className='px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-violet-600/20 text-neutral-400 hover:text-violet-300 transition-colors flex items-center gap-1 text-[11px] font-medium'
                    >
                        <FontAwesomeIcon icon={faSearch} className='text-[10px]' />
                        <span className='hidden sm:inline'>Rechercher</span>
                    </button>
                    <button
                        type='button'
                        onClick={() => setAutoScroll((prev) => !prev)}
                        title={autoScroll ? 'Défilement automatique actif' : 'Défilement automatique en pause'}
                        className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium ${
                            autoScroll
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                    >
                        <FontAwesomeIcon icon={autoScroll ? faPlay : faPause} className='text-[9px]' />
                        <span className='hidden sm:inline'>{autoScroll ? 'Auto-scroll' : 'Pause'}</span>
                    </button>
                    <button
                        type='button'
                        onClick={clearTerminal}
                        title='Effacer le terminal'
                        className='px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 transition-colors flex items-center gap-1 text-[11px] font-medium'
                    >
                        <FontAwesomeIcon icon={faBroom} className='text-[10px]' />
                        <span className='hidden sm:inline'>Effacer</span>
                    </button>
                </div>
            </div>

            {/* Terminal Container */}
            <div
                className={classNames(styles.container, styles.overflows_container, {
                    'rounded-b': !canSendCommands,
                })}
                style={{ borderTop: 0 }}
            >
                <div className={'h-full'}>
                    <div id={styles.terminal} ref={ref} />
                </div>
            </div>

            {/* Quick Actions Bar */}
            {canSendCommands && (
                <div className='bg-[#090812] border-x border-white/[0.08] px-3 py-1.5 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs select-none'>
                    <div className='flex items-center gap-1 text-violet-400 font-semibold text-[11px] shrink-0'>
                        <FontAwesomeIcon icon={faBolt} className='text-[10px]' />
                        <span className='hidden sm:inline'>Actions :</span>
                    </div>

                    <div className='flex items-center gap-1.5 flex-nowrap'>
                        {/* Default smart commands */}
                        {quickActions.map(({ label, cmd, desc }) => (
                            <button
                                key={cmd}
                                type='button'
                                onClick={() => executeCommand(cmd)}
                                title={desc}
                                className='px-2.5 py-0.5 rounded-md bg-white/[0.04] hover:bg-violet-600/25 border border-white/[0.06] hover:border-violet-500/40 text-neutral-300 hover:text-white font-mono text-[11px] whitespace-nowrap active:scale-95 transition-all'
                            >
                                {label}
                            </button>
                        ))}

                        {/* User custom quick commands */}
                        {(customCommands || []).map((cmd) => (
                            <div
                                key={cmd}
                                className='inline-flex items-center rounded-md bg-violet-950/40 border border-violet-500/30 text-violet-200 font-mono text-[11px] pl-2 pr-1 py-0.5 whitespace-nowrap'
                            >
                                <span
                                    onClick={() => executeCommand(cmd)}
                                    className='cursor-pointer hover:text-white mr-1'
                                    title={`Exécuter: ${cmd}`}
                                >
                                    {cmd}
                                </span>
                                <button
                                    type='button'
                                    onClick={(e) => removeCustomCommand(cmd, e)}
                                    title='Supprimer ce raccourci'
                                    className='text-neutral-500 hover:text-rose-400 text-[10px] p-0.5'
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        ))}

                        {/* Add Custom Command Button */}
                        {showAddCommand ? (
                            <div className='inline-flex items-center gap-1'>
                                <input
                                    type='text'
                                    value={newCmdInput}
                                    onChange={(e) => setNewCmdInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomCommand()}
                                    placeholder='cmd...'
                                    className='w-20 px-1.5 py-0.5 bg-neutral-900 border border-violet-500/50 rounded text-[11px] font-mono text-white focus:outline-none'
                                    autoFocus
                                />
                                <button
                                    type='button'
                                    onClick={addCustomCommand}
                                    className='px-1.5 py-0.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold'
                                >
                                    OK
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setShowAddCommand(false)}
                                    className='text-neutral-500 hover:text-white text-[10px] p-0.5'
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type='button'
                                onClick={() => setShowAddCommand(true)}
                                title='Ajouter un raccourci de commande personnalisé'
                                className='px-1.5 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white text-[10px] transition-colors'
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Input Line */}
            {canSendCommands && (
                <div className={classNames('relative', styles.overflows_container)}>
                    <input
                        ref={inputRef}
                        className={classNames('peer', styles.command_input)}
                        type={'text'}
                        placeholder={"Entrez une commande console... (Flèche Haut/Bas pour l'historique)"}
                        aria-label={'Console command input.'}
                        disabled={!instance || !connected}
                        onKeyDown={handleCommandKeyDown}
                        autoCorrect={'off'}
                        autoCapitalize={'none'}
                    />
                    <div
                        className={classNames(
                            'text-gray-100 peer-focus:text-violet-400 peer-focus:animate-pulse',
                            styles.command_icon
                        )}
                    >
                        <ChevronDoubleRightIcon className={'w-4 h-4'} />
                    </div>
                </div>
            )}
        </div>
    );
};
