import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {


    faPlus,
    faPowerOff,
    faTrash,
    faXmarkCircle,
    faNetworkWired,
    faServer,
    faClock,
    faArrowUpRightFromSquare,

    faIdBadge,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { ServerPowerState, ServerStats, type Server } from '@definitions/server';
import { getServerResourceUsage } from '@/api/routes/server';
import { useStoreState } from '@/state/hooks';
import classNames from 'classnames';
import { removeServerFromGroup } from '@/api/routes/server/groups';
import { type ServerGroup } from '@definitions/server';
import { VisibleDialog } from './groups/ServerGroupDialog';
import useFlash from '@/plugins/useFlash';
import { timeUntil } from '../server/billing/ServerBillingContainer';
import CopyOnClick from '@/elements/CopyOnClick';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';
import { useChart } from '@/components/server/console/chart';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export function statusToColor(state?: ServerPowerState): string {
    switch (state) {
        case 'running':
            return 'text-emerald-400';
        case 'starting':
            return 'text-sky-400';
        case 'stopping':
            return 'text-amber-400';
        default:
            return 'text-red-400';
    }
}

export function statusToBg(state?: ServerPowerState): string {
    switch (state) {
        case 'running':
            return 'bg-emerald-500/10 border-emerald-500/20';
        case 'starting':
            return 'bg-sky-500/10 border-sky-500/20';
        case 'stopping':
            return 'bg-amber-500/10 border-amber-500/20';
        default:
            return 'bg-red-500/10 border-red-500/20';
    }
}

export function statusToLabel(state?: ServerPowerState): string {
    switch (state) {
        case 'running':
            return 'Online';
        case 'starting':
            return 'Starting';
        case 'stopping':
            return 'Stopping';
        default:
            return 'Offline';
    }
}

/** Animated pulsing dot indicator */
const StatusDot = ({ state }: { state?: ServerPowerState }) => {
    const isRunning = state === 'running';
    const isStarting = state === 'starting';
    const isStopping = state === 'stopping';

    const bgClass = isRunning
        ? 'bg-emerald-400'
        : isStarting
        ? 'bg-sky-400'
        : isStopping
        ? 'bg-amber-400'
        : 'bg-red-500';
    const glowClass = isRunning
        ? 'shadow-[0_0_12px_rgba(52,211,153,0.8)]'
        : isStarting
        ? 'shadow-[0_0_12px_rgba(56,189,248,0.8)]'
        : isStopping
        ? 'shadow-[0_0_12px_rgba(251,191,36,0.8)]'
        : 'shadow-[0_0_8px_rgba(239,68,68,0.6)]';

    return (
        <span className={'relative flex h-3 w-3'}>
            {(isRunning || isStarting) && (
                <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${bgClass}`}
                />
            )}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${bgClass} ${glowClass}`} />
        </span>
    );
};

/** Resource sparkline */
const ResourceSparkline = ({
    value,
    label,
    chartData,
    chartOptions,
}: {
    value: number;
    label: string;
    chartData: any;
    chartOptions: any;
}) => {
    const clamped = Math.min(Math.max(value, 0), 100);

    return (
        <div className={'flex w-full min-w-0 flex-col gap-1'}>
            <div className={'flex items-center justify-between gap-2'}>
                <span className={'flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400'}>
                    {label}
                </span>
                <span
                    className={classNames(
                        'font-mono text-xs font-semibold tabular-nums',
                        clamped >= 90 ? 'text-red-400' : clamped >= 70 ? 'text-amber-400' : 'text-gray-200',
                    )}
                >
                    {clamped.toFixed(0)}%
                </span>
            </div>
            <div className={'relative h-8 w-full'}>
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

type Timer = ReturnType<typeof setInterval>;

const sparklineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
        x: { display: false },
        y: { display: false, min: 0, max: 100 },
    },
    elements: { point: { radius: 0 }, line: { tension: 0.25, borderWidth: 2 } },
    layout: { padding: 0 },
};

export default ({
    server,
    group,
    setOpen,
}: {
    server: Server;
    group?: ServerGroup;
    setOpen: React.Dispatch<React.SetStateAction<VisibleDialog>>;
}) => {
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();
    const [stats, setStats] = useState<ServerStats>();
    const colors = useStoreState(state => state.theme.data!.colors);
    const billingEnabled = useStoreState(state => state.everest.data!.billing.enabled);
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [removed, setRemoved] = useState(false);

    const cpuChart = useChart('CPU', { sets: 1, options: sparklineOptions });
    const ramChart = useChart('RAM', { sets: 1, options: sparklineOptions });

    const onDelete = () => {
        clearFlashes();
        removeServerFromGroup(group!.id, server.uuid)
            .then(() => {
                addFlash({ type: 'success', key: 'dashboard:groups', message: 'Server removed from group.' });
                setOpen({ open: 'none', serverId: undefined });
                setRemoved(true);
            })
            .catch(error => clearAndAddHttpError({ key: 'dashboard:groups', error }));
    };

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then(data => setStats(data))
            .catch(error => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;
        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });
        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const cpuUsed =
        server.limits.cpu === 0
            ? stats?.cpuUsagePercent ?? 0
            : (stats?.cpuUsagePercent ?? 0) / (server.limits.cpu / 100);
    const memoryUsed = ((stats?.memoryUsageInBytes ?? 0) / 1024 / 1024 / server.limits.memory) * 100;

    useEffect(() => {
        cpuChart.push(cpuUsed);
        ramChart.push(memoryUsed);
    }, [cpuUsed, memoryUsed]);

    const powerState: ServerPowerState | undefined = stats?.status;
    const isOfflineOrSuspended = !!server.status || stats?.status === 'offline';
    const isTransferring = server.isTransferring;

    const allocation = server.allocations[0];
    const renewal = server.renewalDate ? timeUntil(server.renewalDate) : null;

    const hasGroup = group && group.id === server.groupId && !removed;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.2 }}
            className={classNames(
                'group relative my-2 w-full rounded-xl border transition-all duration-300',
                'hover:border-white/15 hover:shadow-lg hover:shadow-black/30',
                'border-white/5',
            )}
            style={{ backgroundColor: colors.sidebar }}
        >
            {/* Top accent line matching server status */}
            <div
                className={classNames(
                    'absolute top-0 left-3 right-3 h-px rounded-full transition-all duration-500',
                    powerState === 'running'
                        ? 'bg-emerald-500/50'
                        : powerState === 'starting'
                        ? 'bg-sky-500/50'
                        : powerState === 'stopping'
                        ? 'bg-amber-500/50'
                        : 'bg-red-500/30',
                )}
            />

            <div className={'flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:p-5'}>
                <div className={'flex min-w-0 flex-1 items-start gap-3'}>
                    <div className={'relative mt-0.5 flex-shrink-0'}>
                        <div
                            className={classNames(
                                'flex h-10 w-10 items-center justify-center rounded-lg border',
                                isSuspended ? 'border-red-500/20 bg-red-500/10' : statusToBg(powerState),
                            )}
                        >
                            <FontAwesomeIcon
                                icon={isSuspended ? faXmarkCircle : faServer}
                                className={classNames(
                                    'text-base',
                                    isSuspended ? 'text-red-400' : statusToColor(powerState),
                                )}
                            />
                        </div>
                        <div className={'absolute -bottom-0.5 -right-0.5'}>
                            <StatusDot state={isSuspended ? undefined : powerState} />
                        </div>
                    </div>
                    <div className={'min-w-0 flex-1'}>
                        <div className={'mb-1 flex flex-wrap items-center gap-2'}>
                            <Link
                                to={`/server/${server.id}`}
                                className={
                                    'max-w-xs truncate text-sm font-semibold text-white transition-colors duration-200 hover:text-white/80'
                                }
                            >
                                {server.name}
                            </Link>
                            <span
                                className={classNames(
                                    'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                                    isSuspended
                                        ? 'border-red-500/20 bg-red-500/10 text-red-400'
                                        : isTransferring
                                        ? 'border-violet-500/20 bg-violet-500/10 text-violet-400'
                                        : statusToBg(powerState) + ' ' + statusToColor(powerState),
                                )}
                            >
                                {isSuspended
                                    ? 'Suspended'
                                    : isTransferring
                                    ? 'Transferring'
                                    : statusToLabel(powerState)}
                            </span>
                            {hasGroup ? (
                                <span
                                    className={
                                        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium'
                                    }
                                >
                                    <span
                                        className={'h-1.5 w-1.5 rounded-full'}
                                        style={{ backgroundColor: group.color }}
                                    />
                                    <span style={{ color: group.color }}>{group.name}</span>
                                    <button
                                        onClick={onDelete}
                                        className={
                                            'ml-0.5 text-gray-600 transition-colors duration-150 hover:text-red-400'
                                        }
                                        title={'Remove from group'}
                                    >
                                        <FontAwesomeIcon icon={faTrash} size={'xs'} />
                                    </button>
                                </span>
                            ) : (
                                <button
                                    onClick={() => setOpen({ open: 'add', serverId: server.uuid })}
                                    className={
                                        'hidden items-center gap-1 rounded-full border border-dashed border-gray-700 px-2 py-0.5 text-xs text-gray-600 transition-all duration-200 hover:border-gray-500 hover:bg-white/5 hover:text-gray-300 xl:inline-flex'
                                    }
                                >
                                    <FontAwesomeIcon icon={faPlus} size={'xs'} />
                                    Group
                                </button>
                            )}
                        </div>
                        <div className={'flex flex-wrap items-center gap-x-3 gap-y-1'}>
                            {allocation && (
                                <CopyOnClick text={`${allocation.ip}:${allocation.port}`}>
                                    <span
                                        className={
                                            'flex cursor-pointer items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-300'
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={faNetworkWired}
                                            size={'xs'}
                                            className={'text-gray-600'}
                                        />
                                        <span className={'font-mono'}>
                                            {allocation.alias || allocation.ip}:{allocation.port}
                                        </span>
                                    </span>
                                </CopyOnClick>
                            )}
                            {billingEnabled && renewal && (
                                <span className={'flex items-center gap-1.5 text-xs text-gray-500'}>
                                    <FontAwesomeIcon icon={faClock} size={'xs'} className={'text-gray-600'} />
                                    <span>
                                        Renews in{' '}
                                        <span
                                            className={classNames(
                                                'font-medium',
                                                renewal.days <= 3 ? 'text-amber-400' : 'text-gray-400',
                                            )}
                                        >
                                            {renewal.days}d {renewal.hours}h
                                        </span>
                                    </span>
                                </span>
                            )}
                            <CopyOnClick text={server.uuid}>
                                <span
                                    className={
                                        'flex cursor-pointer items-center gap-1.5 text-xs text-gray-600 transition-colors hover:text-gray-400'
                                    }
                                >
                                    <FontAwesomeIcon icon={faIdBadge} size={'xs'} className={'text-gray-600'} />
                                    <span className={'font-mono opacity-60'}>
                                        {server.uuid.substring(0, 8)}&hellip;
                                    </span>
                                </span>
                            </CopyOnClick>
                        </div>
                    </div>
                </div>
                <div className={'w-full flex-shrink-0 lg:w-72 xl:w-80'}>
                    {isOfflineOrSuspended ? (
                        <div
                            className={classNames(
                                'flex h-full min-h-[52px] items-center justify-center gap-3 rounded-lg border px-4 py-3',
                                isSuspended ? 'border-red-500/10 bg-red-500/5' : 'border-white/5 bg-white/5',
                            )}
                        >
                            <FontAwesomeIcon
                                icon={isSuspended ? faXmarkCircle : faPowerOff}
                                className={isSuspended ? 'text-red-400' : 'text-gray-500'}
                                size={'sm'}
                            />
                            <span className={'text-sm text-gray-500'}>
                                {isTransferring
                                    ? 'Transfer in progress…'
                                    : isSuspended
                                    ? 'This server is suspended'
                                    : `Server is ${server.status ?? 'offline'}`}
                            </span>
                        </div>
                    ) : (
                        <div
                            className={
                                'flex justify-between gap-y-3 gap-x-5 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3'
                            }
                        >
                            <ResourceSparkline
                                value={Number(cpuUsed?.toFixed(1) ?? 0)}
                                label={'CPU'}
                                chartData={cpuChart.props.data}
                                chartOptions={cpuChart.props.options}
                            />
                            <ResourceSparkline
                                value={Number(memoryUsed.toFixed(1))}
                                label={'Memory'}
                                chartData={ramChart.props.data}
                                chartOptions={ramChart.props.options}
                            />
                        </div>
                    )}
                </div>
                <div className={'hidden flex-shrink-0 items-center xl:flex'}>
                    <Link
                        to={`/server/${server.id}`}
                        className={
                            'flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-gray-600 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }
                    >
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} size={'xs'} />
                        Manage
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};
