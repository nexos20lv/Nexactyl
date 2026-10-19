import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCube,
    faFileAlt,
    faFileArchive,
    faFileCode,
    faFileImport,
    faFolder,
    faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import { encodePathSegments } from '@/helpers';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import React, { memo } from 'react';
import { FileObject } from '@/api/server/files/loadDirectory';
import FileDropdownMenu from '@/components/server/files/FileDropdownMenu';
import { ServerContext } from '@/state/server';
import { NavLink, useRouteMatch } from 'react-router-dom';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';
import SelectFileCheckbox from '@/components/server/files/SelectFileCheckbox';
import { usePermissions } from '@/plugins/usePermissions';
import { join } from 'pathe';
import { bytesToString } from '@/lib/formatters';
import styles from './style.module.css';

const Clickable: React.FC<{ file: FileObject }> = memo(({ file, children }) => {
    const [canRead] = usePermissions(['file.read']);
    const [canReadContents] = usePermissions(['file.read-content']);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const match = useRouteMatch();

    return (file.isFile && (!file.isEditable() || !canReadContents)) || (!file.isFile && !canRead) ? (
        <div className={styles.details}>{children}</div>
    ) : (
        <NavLink
            className={styles.details}
            to={`${match.url}${file.isFile ? '/edit' : ''}#${encodePathSegments(join(directory, file.name))}`}
        >
            {children}
        </NavLink>
    );
}, isEqual);

const getFileIcon = (file: FileObject) => {
    if (!file.isFile) {
        return <FontAwesomeIcon icon={faFolder} css={tw`text-violet-400 text-lg`} />;
    }
    if (file.isSymlink) {
        return <FontAwesomeIcon icon={faFileImport} css={tw`text-cyan-400 text-lg`} />;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'jar' || ext === 'war') {
        return <FontAwesomeIcon icon={faCube} css={tw`text-fuchsia-400 text-lg`} />;
    }
    if (['json', 'yml', 'yaml', 'toml', 'properties', 'env', 'ini', 'conf', 'cfg', 'xml'].includes(ext)) {
        return <FontAwesomeIcon icon={faFileCode} css={tw`text-indigo-400 text-lg`} />;
    }
    if (['sh', 'bash', 'bat', 'cmd', 'ps1'].includes(ext)) {
        return <FontAwesomeIcon icon={faTerminal} css={tw`text-emerald-400 text-lg`} />;
    }
    if (file.isArchiveType() || ['zip', 'tar', 'gz', 'tgz', 'rar', '7z'].includes(ext)) {
        return <FontAwesomeIcon icon={faFileArchive} css={tw`text-amber-400 text-lg`} />;
    }
    if (['log', 'txt', 'md'].includes(ext)) {
        return <FontAwesomeIcon icon={faFileAlt} css={tw`text-neutral-400 text-lg`} />;
    }
    return <FontAwesomeIcon icon={faFileAlt} css={tw`text-neutral-400 text-lg`} />;
};

const FileObjectRow = ({ file }: { file: FileObject }) => (
    <div
        className={styles.file_row}
        key={file.name}
        onContextMenu={(e) => {
            e.preventDefault();
            window.dispatchEvent(
                new CustomEvent(`pterodactyl:files:ctx:${file.key}`, {
                    detail: { x: e.clientX, y: e.clientY },
                })
            );
        }}
    >
        <div className={'pl-4 pr-1.5 flex items-center flex-shrink-0'}>
            <SelectFileCheckbox name={file.name} />
        </div>
        <Clickable file={file}>
            <div className={'flex-none mr-3 w-5 text-center flex items-center justify-center'}>{getFileIcon(file)}</div>
            <div className={'flex-1 font-medium text-neutral-200 truncate group-hover:text-white'}>{file.name}</div>
            {file.isFile && (
                <div className={'mr-4 hidden sm:block flex-shrink-0'}>
                    <span
                        className={
                            'text-xs font-mono bg-neutral-800/80 border border-white/5 px-2 py-0.5 rounded-md text-neutral-300'
                        }
                    >
                        {bytesToString(file.size)}
                    </span>
                </div>
            )}
            <div
                className={'w-1/5 text-right mr-4 hidden md:block text-xs text-neutral-400 flex-shrink-0'}
                title={file.modifiedAt.toString()}
            >
                {Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
                    ? format(file.modifiedAt, 'MMM do, yyyy h:mma')
                    : formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
            </div>
        </Clickable>
        <div className={'pr-3 flex items-center flex-shrink-0'}>
            <FileDropdownMenu file={file} />
        </div>
    </div>
);

export default memo(FileObjectRow, (prevProps, nextProps) => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { isArchiveType, isEditable, ...prevFile } = prevProps.file;
    const { isArchiveType: nextIsArchiveType, isEditable: nextIsEditable, ...nextFile } = nextProps.file;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return isEqual(prevFile, nextFile);
});
