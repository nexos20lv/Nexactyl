import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faEllipsisH, faLock, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { format, formatDistanceToNow } from 'date-fns';
import Spinner from '@/components/elements/Spinner';
import { bytesToString } from '@/lib/formatters';
import Can from '@/components/elements/Can';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import BackupContextMenu from '@/components/server/backups/BackupContextMenu';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import getServerBackups from '@/api/swr/getServerBackups';
import { ServerBackup } from '@/api/server/types';
import { SocketEvent } from '@/components/server/events';

interface Props {
    backup: ServerBackup;
    className?: string;
}

export default ({ backup, className }: Props) => {
    const { mutate } = getServerBackups();

    useWebsocketEvent(`${SocketEvent.BACKUP_COMPLETED}:${backup.uuid}` as SocketEvent, (data) => {
        try {
            const parsed = JSON.parse(data);

            mutate(
                (data) => ({
                    ...data,
                    items: data.items.map((b) =>
                        b.uuid !== backup.uuid
                            ? b
                            : {
                                  ...b,
                                  isSuccessful: parsed.is_successful || true,
                                  checksum: (parsed.checksum_type || '') + ':' + (parsed.checksum || ''),
                                  bytes: parsed.file_size || 0,
                                  completedAt: new Date(),
                              }
                    ),
                }),
                false
            );
        } catch (e) {
            console.warn(e);
        }
    });

    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`} className={className}>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`mr-4 flex-none`}>
                    {backup.completedAt !== null ? (
                        backup.isLocked ? (
                            <div
                                css={tw`w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/25 flex items-center justify-center text-amber-400`}
                            >
                                <FontAwesomeIcon icon={faLock} />
                            </div>
                        ) : (
                            <div
                                css={tw`w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-center text-violet-400`}
                            >
                                <FontAwesomeIcon icon={faArchive} />
                            </div>
                        )
                    ) : (
                        <div css={tw`w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center`}>
                            <Spinner size={'small'} />
                        </div>
                    )}
                </div>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center text-sm mb-1`}>
                        {backup.completedAt !== null && !backup.isSuccessful && (
                            <span
                                css={tw`bg-rose-500/20 py-0.5 px-2.5 rounded-lg text-rose-300 text-xs font-semibold border border-rose-500/30 mr-2 flex items-center gap-1`}
                            >
                                <FontAwesomeIcon icon={faExclamationCircle} css={tw`text-xs`} />
                                Échec
                            </span>
                        )}
                        {backup.completedAt !== null && backup.isSuccessful && (
                            <span
                                css={tw`bg-emerald-500/20 py-0.5 px-2.5 rounded-lg text-emerald-300 text-xs font-semibold border border-emerald-500/30 mr-2 flex items-center gap-1`}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} css={tw`text-xs`} />
                                Prête
                            </span>
                        )}
                        <p css={tw`font-semibold text-neutral-200 truncate`}>{backup.name}</p>
                        {backup.completedAt !== null && backup.isSuccessful && (
                            <span
                                css={tw`ml-3 text-xs font-mono bg-neutral-800/80 px-2 py-0.5 rounded text-neutral-300 hidden sm:inline`}
                            >
                                {bytesToString(backup.bytes)}
                            </span>
                        )}
                    </div>
                    <p css={tw`text-2xs text-neutral-400 font-mono truncate`}>
                        {backup.checksum || 'En cours de calcul...'}
                    </p>
                </div>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-8 md:text-right`}>
                <p
                    title={format(backup.createdAt, 'dd/MM/yyyy HH:mm:ss')}
                    css={tw`text-xs text-neutral-300 font-medium`}
                >
                    {formatDistanceToNow(backup.createdAt, { includeSeconds: true, addSuffix: true })}
                </p>
                <p css={tw`text-2xs text-neutral-400 uppercase tracking-wider mt-0.5`}>Création</p>
            </div>
            <Can action={['backup.download', 'backup.restore', 'backup.delete']} matchAny>
                <div css={tw`mt-4 md:mt-0 ml-4`}>
                    {!backup.completedAt ? (
                        <div css={tw`p-2 invisible`}>
                            <FontAwesomeIcon icon={faEllipsisH} />
                        </div>
                    ) : (
                        <BackupContextMenu backup={backup} />
                    )}
                </div>
            </Can>
        </GreyRowBox>
    );
};
