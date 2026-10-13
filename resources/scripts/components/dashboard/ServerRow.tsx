import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';

type Timer = ReturnType<typeof setInterval>;

const ServerRow = ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

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
    const allocString = defaultAlloc ? `${defaultAlloc.alias || ip(defaultAlloc.ip)}:${defaultAlloc.port}` : 'N/A';

    const isRunning = stats?.status === 'running';
    const isOffline = !stats || stats?.status === 'offline';

    return (
        <Link
            to={`/server/${server.id}`}
            className={`bg-[#0d0b16] border border-[#1f1d2e] hover:border-violet-500/50 rounded-xl p-4 transition-all duration-200 shadow-md hover:shadow-[0_4px_25px_rgba(139,92,246,0.15)] block relative overflow-hidden group mb-2.5 no-underline ${
                className || ''
            }`}
        >
            {/* Left status glow bar */}
            <div
                className={`w-1 absolute left-0 top-0 bottom-0 transition-colors ${
                    isRunning
                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                        : isOffline
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                }`}
            />

            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 pl-2'>
                {/* Left: Icon, Name, Status, Allocation */}
                <div className='flex items-center gap-3.5 min-w-0'>
                    <div className='w-11 h-11 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                        <FontAwesomeIcon icon={faServer} className='text-base' />
                    </div>

                    <div className='flex flex-col min-w-0'>
                        <div className='flex items-center gap-2'>
                            <span className='font-bold text-neutral-100 text-sm sm:text-base group-hover:text-violet-300 transition-colors truncate'>
                                {server.name}
                            </span>
                            {isRunning ? (
                                <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                                    En ligne
                                </span>
                            ) : isOffline ? (
                                <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-rose-400' />
                                    Hors ligne
                                </span>
                            ) : (
                                <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse' />
                                    {stats?.status}
                                </span>
                            )}
                        </div>

                        <div className='flex items-center gap-2 mt-1'>
                            <span className='inline-flex items-center gap-1.5 bg-neutral-900/80 border border-[#25213b] text-neutral-300 font-mono text-[11px] px-2.5 py-0.5 rounded'>
                                <FontAwesomeIcon icon={faEthernet} className='text-[10px] text-violet-400' />
                                {allocString}
                            </span>
                            {server.description && (
                                <span className='text-neutral-500 text-xs truncate max-w-xs hidden sm:inline'>
                                    {server.description}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Micro Resource Gauges & Chevron */}
                <div className='flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t lg:border-t-0 border-[#1f1d2e] pt-3 lg:pt-0'>
                    {stats && !isSuspended && !server.isNodeUnderMaintenance ? (
                        <div className='grid grid-cols-3 gap-4 sm:gap-6 text-xs'>
                            {/* CPU */}
                            <div className='flex flex-col min-w-[70px]'>
                                <div className='flex items-center justify-between text-[11px] mb-1'>
                                    <span className='text-neutral-400 flex items-center gap-1'>
                                        <FontAwesomeIcon icon={faMicrochip} className='text-violet-400 text-[10px]' />
                                        CPU
                                    </span>
                                    <span className='font-mono font-semibold text-neutral-200'>
                                        {stats.cpuUsagePercent.toFixed(1)}%
                                    </span>
                                </div>
                                <div className='w-full bg-[#1b182b] rounded-full h-1.5 overflow-hidden'>
                                    <div
                                        className='bg-gradient-to-r from-violet-600 to-fuchsia-500 h-full rounded-full transition-all duration-300'
                                        style={{ width: `${Math.min(100, stats.cpuUsagePercent)}%` }}
                                    />
                                </div>
                                <span className='text-[10px] text-neutral-500 font-mono mt-0.5 text-right'>
                                    / {cpuLimit}
                                </span>
                            </div>

                            {/* RAM */}
                            <div className='flex flex-col min-w-[80px]'>
                                <div className='flex items-center justify-between text-[11px] mb-1'>
                                    <span className='text-neutral-400 flex items-center gap-1'>
                                        <FontAwesomeIcon icon={faMemory} className='text-violet-400 text-[10px]' />
                                        RAM
                                    </span>
                                    <span className='font-mono font-semibold text-neutral-200'>
                                        {bytesToString(stats.memoryUsageInBytes)}
                                    </span>
                                </div>
                                <div className='w-full bg-[#1b182b] rounded-full h-1.5 overflow-hidden'>
                                    <div
                                        className='bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-300'
                                        style={{ width: `${memoryPercent}%` }}
                                    />
                                </div>
                                <span className='text-[10px] text-neutral-500 font-mono mt-0.5 text-right'>
                                    / {memoryLimit}
                                </span>
                            </div>

                            {/* DISK */}
                            <div className='flex flex-col min-w-[80px]'>
                                <div className='flex items-center justify-between text-[11px] mb-1'>
                                    <span className='text-neutral-400 flex items-center gap-1'>
                                        <FontAwesomeIcon icon={faHdd} className='text-violet-400 text-[10px]' />
                                        SSD
                                    </span>
                                    <span className='font-mono font-semibold text-neutral-200'>
                                        {bytesToString(stats.diskUsageInBytes)}
                                    </span>
                                </div>
                                <div className='w-full bg-[#1b182b] rounded-full h-1.5 overflow-hidden'>
                                    <div
                                        className='bg-gradient-to-r from-violet-600 to-purple-500 h-full rounded-full transition-all duration-300'
                                        style={{ width: `${diskPercent}%` }}
                                    />
                                </div>
                                <span className='text-[10px] text-neutral-500 font-mono mt-0.5 text-right'>
                                    / {diskLimit}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className='text-xs text-neutral-500 font-mono py-1'>
                            {isSuspended ? 'Suspendu' : server.isNodeUnderMaintenance ? 'Maintenance' : 'Hors ligne'}
                        </div>
                    )}

                    <div className='hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900/60 text-neutral-500 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-colors'>
                        <FontAwesomeIcon
                            icon={faChevronRight}
                            className='text-xs group-hover:translate-x-0.5 transition-transform'
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default memo(ServerRow);
