import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEthernet,
    faHdd,
    faMemory,
    faMicrochip,
    faServer,
    faGlobe,
    faChevronRight,
    faCopy,
    faCheck,
    faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import copy from 'copy-to-clipboard';
import { usePrivacyMode } from '@/plugins/usePrivacyMode';

type Timer = ReturnType<typeof setInterval>;

interface Props {
    server: Server;
    className?: string;
}

const ServerCard = ({ server, className }: Props) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [copied, setCopied] = useState(false);
    const [hideIp] = usePrivacyMode();

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended || server.isNodeUnderMaintenance) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            if (interval.current) clearInterval(interval.current);
        };
    }, [isSuspended, server.isNodeUnderMaintenance]);

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Illimité';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Illimité';
    const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Illimité';

    const memoryPercent =
        server.limits.memory > 0 && stats
            ? Math.min(100, Math.round((stats.memoryUsageInBytes / (server.limits.memory * 1024 * 1024)) * 100))
            : 0;

    const diskPercent =
        server.limits.disk > 0 && stats
            ? Math.min(100, Math.round((stats.diskUsageInBytes / (server.limits.disk * 1024 * 1024)) * 100))
            : 0;

    const defaultAlloc = server.allocations.find((a) => a.isDefault);
    const allocString =
        server.subdomain ||
        (defaultAlloc ? `${defaultAlloc.alias || ip(defaultAlloc.ip)}:${defaultAlloc.port}` : 'N/A');

    const isRunning = stats?.status === 'running';
    const isOffline = !stats || stats?.status === 'offline';

    const onCopyAddress = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (allocString && allocString !== 'N/A') {
            copy(allocString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Link
            to={`/server/${server.id}`}
            style={{
                transition:
                    'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease',
            }}
            className={`group block bg-[#0e0c18] border border-white/[0.08] hover:border-violet-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_26px_rgba(124,58,237,0.2)] hover:-translate-y-1 active:scale-[0.99] active:translate-y-0 no-underline relative ${
                className || ''
            }`}
        >
            {/* Top Status Accent Bar */}
            <div
                className={`h-1 w-full transition-colors ${
                    isRunning
                        ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                        : isOffline
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                }`}
            />

            {/* Apollo Card Header Banner */}
            <div className='relative bg-gradient-to-r from-violet-950/60 via-purple-950/30 to-[#0e0c18] px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between overflow-hidden'>
                {/* Background decorative glow */}
                <div className='absolute -top-6 -left-6 w-24 h-24 bg-violet-600/10 rounded-full blur-xl pointer-events-none' />

                <div className='flex items-center gap-3 min-w-0 z-10'>
                    <div className='w-11 h-11 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all'>
                        <FontAwesomeIcon icon={faServer} className='text-base' />
                    </div>
                    <div className='flex flex-col min-w-0'>
                        <span className='font-bold text-neutral-100 text-sm sm:text-base tracking-tight group-hover:text-violet-300 transition-colors truncate'>
                            {server.name}
                        </span>
                        <div className='flex items-center gap-1.5 mt-0.5'>
                            <span className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-neutral-400'>
                                {server.node || 'Node 1'}
                            </span>
                            {server.description && (
                                <span className='text-neutral-500 text-[11px] truncate max-w-[140px]'>
                                    {server.description}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className='shrink-0 z-10 ml-2'>
                    {isRunning ? (
                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'>
                            <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                            En ligne
                        </span>
                    ) : isOffline ? (
                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'>
                            <span className='w-1.5 h-1.5 rounded-full bg-rose-400' />
                            Hors ligne
                        </span>
                    ) : (
                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'>
                            <span className='w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse' />
                            {stats?.status}
                        </span>
                    )}
                </div>
            </div>

            {/* Card Content & Metrics */}
            <div className='p-4 space-y-3.5'>
                {/* Allocation / Address with Copy & Privacy Blur */}
                <div className='flex items-center justify-between gap-2 bg-[#141222] border border-white/[0.06] hover:border-violet-500/30 rounded-xl px-3 py-2 transition-colors'>
                    <div className='flex items-center gap-2 min-w-0'>
                        <FontAwesomeIcon
                            icon={server.subdomain ? faGlobe : faEthernet}
                            className='text-xs text-violet-400 shrink-0'
                        />
                        <span
                            className={`font-mono text-xs text-neutral-300 truncate select-all ${
                                hideIp ? 'filter blur-[5px] select-none' : ''
                            } transition-all duration-200`}
                            title={hideIp ? 'Adresse masquée (Mode Streamer)' : allocString}
                        >
                            {allocString}
                        </span>
                    </div>

                    <button
                        type='button'
                        onClick={onCopyAddress}
                        title={copied ? 'Copié !' : "Copier l'adresse"}
                        className='shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-violet-600/20 text-neutral-400 hover:text-violet-300 transition-colors'
                    >
                        <FontAwesomeIcon
                            icon={copied ? faCheck : faCopy}
                            className={`text-[11px] ${copied ? 'text-emerald-400' : ''}`}
                        />
                    </button>
                </div>

                {/* Resource Meters */}
                {stats && !isSuspended && !server.isNodeUnderMaintenance ? (
                    <div className='space-y-2.5 pt-1'>
                        {/* CPU */}
                        <div>
                            <div className='flex items-center justify-between text-xs mb-1'>
                                <span className='text-neutral-400 flex items-center gap-1.5 text-[11px] font-medium'>
                                    <FontAwesomeIcon icon={faMicrochip} className='text-violet-400 text-[10px]' />
                                    CPU
                                </span>
                                <span className='font-mono font-semibold text-neutral-200 text-xs'>
                                    {stats.cpuUsagePercent.toFixed(1)}%{' '}
                                    <span className='text-neutral-500 font-normal text-[10px]'>/ {cpuLimit}</span>
                                </span>
                            </div>
                            <div className='w-full bg-[#1b182b] rounded-full h-1.5 overflow-hidden'>
                                <div
                                    className='bg-gradient-to-r from-violet-600 to-fuchsia-500 h-full rounded-full transition-all duration-300'
                                    style={{ width: `${Math.min(100, stats.cpuUsagePercent)}%` }}
                                />
                            </div>
                        </div>

                        {/* RAM */}
                        <div>
                            <div className='flex items-center justify-between text-xs mb-1'>
                                <span className='text-neutral-400 flex items-center gap-1.5 text-[11px] font-medium'>
                                    <FontAwesomeIcon icon={faMemory} className='text-violet-400 text-[10px]' />
                                    RAM
                                </span>
                                <span className='font-mono font-semibold text-neutral-200 text-xs'>
                                    {bytesToString(stats.memoryUsageInBytes)}{' '}
                                    <span className='text-neutral-500 font-normal text-[10px]'>/ {memoryLimit}</span>
                                </span>
                            </div>
                            <div className='w-full bg-[#1b182b] rounded-full h-1.5 overflow-hidden'>
                                <div
                                    className='bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-300'
                                    style={{ width: `${memoryPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* DISK */}
                        <div>
                            <div className='flex items-center justify-between text-xs mb-1'>
                                <span className='text-neutral-400 flex items-center gap-1.5 text-[11px] font-medium'>
                                    <FontAwesomeIcon icon={faHdd} className='text-violet-400 text-[10px]' />
                                    SSD
                                </span>
                                <span className='font-mono font-semibold text-neutral-200 text-xs'>
                                    {bytesToString(stats.diskUsageInBytes)}{' '}
                                    <span className='text-neutral-500 font-normal text-[10px]'>/ {diskLimit}</span>
                                </span>
                            </div>
                            <div className='w-full bg-[#1b182b] rounded-full h-1.5 overflow-hidden'>
                                <div
                                    className='bg-gradient-to-r from-violet-600 to-purple-500 h-full rounded-full transition-all duration-300'
                                    style={{ width: `${diskPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='py-4 text-center'>
                        <span className='text-xs text-neutral-500 font-mono'>
                            {isSuspended
                                ? 'Serveur suspendu'
                                : server.isNodeUnderMaintenance
                                ? 'Node en maintenance'
                                : 'Serveur hors ligne'}
                        </span>
                    </div>
                )}
            </div>

            {/* Apollo Card Footer / Action */}
            <div className='px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-violet-300 group-hover:text-white transition-colors'>
                <span className='flex items-center gap-2'>
                    <FontAwesomeIcon icon={faTerminal} className='text-[11px] text-violet-400' />
                    Console & Gestion
                </span>
                <FontAwesomeIcon
                    icon={faChevronRight}
                    className='text-[10px] text-neutral-500 group-hover:text-violet-300 group-hover:translate-x-1 transition-all'
                />
            </div>
        </Link>
    );
};

export default memo(ServerCard);
