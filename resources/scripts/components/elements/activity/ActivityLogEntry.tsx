import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Translate from '@/components/elements/Translate';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ActivityLog } from '@definitions/user';
import ActivityLogMetaButton from '@/components/elements/activity/ActivityLogMetaButton';
import { FolderOpenIcon, TerminalIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import style from './style.module.css';
import Avatar from '@/components/Avatar';
import useLocationHash from '@/plugins/useLocationHash';
import { getObjectKeys, isObject } from '@/lib/objects';

interface Props {
    activity: ActivityLog;
    children?: React.ReactNode;
}

function wrapProperties(value: unknown): any {
    if (value === null || typeof value === 'string' || typeof value === 'number') {
        return `<strong>${String(value)}</strong>`;
    }

    if (isObject(value)) {
        return getObjectKeys(value).reduce((obj, key) => {
            if (key === 'count' || (typeof key === 'string' && key.endsWith('_count'))) {
                return { ...obj, [key]: value[key] };
            }
            return { ...obj, [key]: wrapProperties(value[key]) };
        }, {} as Record<string, unknown>);
    }

    if (Array.isArray(value)) {
        return value.map(wrapProperties);
    }

    return value;
}

export default ({ activity, children }: Props) => {
    const { pathTo } = useLocationHash();
    const actor = activity.relationships.actor;
    const properties = wrapProperties(activity.properties);

    return (
        <div
            className={
                'grid grid-cols-10 py-3.5 px-4 border-b border-[#1f1d2e] last:border-0 hover:bg-[#141124]/50 transition-colors duration-150 group items-center'
            }
        >
            <div className={'hidden sm:flex sm:col-span-1 items-center justify-center select-none'}>
                <div
                    className={
                        'flex items-center w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/25 overflow-hidden shadow-inner'
                    }
                >
                    <Avatar name={actor?.uuid || 'system'} />
                </div>
            </div>
            <div className={'col-span-10 sm:col-span-9 flex items-center justify-between'}>
                <div className={'flex-1 px-2 sm:px-0'}>
                    <div className={'flex items-center flex-wrap gap-2 text-neutral-100'}>
                        <Tooltip placement={'top'} content={actor?.email || 'System User'}>
                            <span className={'font-semibold text-white'}>{actor?.username || 'System'}</span>
                        </Tooltip>
                        <span className={'text-neutral-600 text-xs'}>&bull;</span>
                        <Link
                            to={`#${pathTo({ event: activity.event })}`}
                            className={
                                'text-xs font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded hover:bg-violet-500/25 hover:text-violet-200 transition-colors'
                            }
                        >
                            {activity.event}
                        </Link>
                        <div className={classNames(style.icons, 'group-hover:text-neutral-300')}>
                            {activity.isApi && (
                                <Tooltip placement={'top'} content={'Using API Key'}>
                                    <TerminalIcon />
                                </Tooltip>
                            )}
                            {activity.event.startsWith('server:sftp.') && (
                                <Tooltip placement={'top'} content={'Using SFTP'}>
                                    <FolderOpenIcon />
                                </Tooltip>
                            )}
                            {children}
                        </div>
                    </div>
                    <p className={style.description}>
                        <Translate ns={'activity'} values={properties} i18nKey={activity.event.replace(':', '.')} />
                    </p>
                    <div className={'mt-1.5 flex items-center text-xs text-neutral-400'}>
                        {activity.ip && (
                            <span
                                className={
                                    'font-mono bg-[#141124] border border-[#25213b] px-1.5 py-0.5 rounded text-neutral-300 mr-2'
                                }
                            >
                                {activity.ip}
                            </span>
                        )}
                        <Tooltip placement={'right'} content={format(activity.timestamp, 'MMM do, yyyy H:mm:ss')}>
                            <span className={'text-neutral-500'}>
                                {formatDistanceToNowStrict(activity.timestamp, { addSuffix: true })}
                            </span>
                        </Tooltip>
                    </div>
                </div>
                {activity.hasAdditionalMetadata && <ActivityLogMetaButton meta={activity.properties} />}
            </div>
        </div>
    );
};
