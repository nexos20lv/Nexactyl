import React, { memo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBoxOpen,
    faCopy,
    faEllipsisH,
    faFileArchive,
    faFileCode,
    faFileDownload,
    faLevelUpAlt,
    faPencilAlt,
    faTrashAlt,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import RenameFileModal from '@/components/server/files/RenameFileModal';
import { ServerContext } from '@/state/server';
import { join } from 'pathe';
import deleteFiles from '@/api/server/files/deleteFiles';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import copyFile from '@/api/server/files/copyFile';
import Can from '@/components/elements/Can';
import getFileDownloadUrl from '@/api/server/files/getFileDownloadUrl';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import { FileObject } from '@/api/server/files/loadDirectory';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import DropdownMenu, { DropdownButtonRow } from '@/components/elements/DropdownMenu';
import useEventListener from '@/plugins/useEventListener';
import compressFiles from '@/api/server/files/compressFiles';
import decompressFiles from '@/api/server/files/decompressFiles';
import isEqual from 'react-fast-compare';
import ChmodFileModal from '@/components/server/files/ChmodFileModal';
import { Dialog } from '@/components/elements/dialog';

type ModalType = 'rename' | 'move' | 'chmod';

const Row = ({
    icon,
    title,
    danger,
    onClick,
}: {
    icon: IconDefinition;
    title: string;
    danger?: boolean;
    onClick: (e: React.MouseEvent<any, MouseEvent>) => void;
}) => (
    <DropdownButtonRow danger={danger} onClick={onClick}>
        <FontAwesomeIcon icon={icon} css={tw`text-xs`} fixedWidth />
        <span css={tw`ml-2.5`}>{title}</span>
    </DropdownButtonRow>
);

const FileDropdownMenu = ({ file }: { file: FileObject }) => {
    const onClickRef = useRef<DropdownMenu>(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [modal, setModal] = useState<ModalType | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = useFileManagerSwr();
    const { clearAndAddHttpError, clearFlashes } = useFlash();
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    useEventListener(`pterodactyl:files:ctx:${file.key}`, (e: CustomEvent) => {
        if (onClickRef.current) {
            onClickRef.current.triggerMenu(e.detail);
        }
    });

    const doDeletion = () => {
        clearFlashes('files');

        // Immediately update UI optimistically
        mutate((files) => files.filter((f) => f.key !== file.key), false);

        deleteFiles(uuid, directory, [file.name]).catch((error) => {
            mutate();
            clearAndAddHttpError({ key: 'files', error });
        });
    };

    const doCopy = () => {
        setShowSpinner(true);
        clearFlashes('files');

        copyFile(uuid, join(directory, file.name))
            .then(() => mutate())
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setShowSpinner(false));
    };

    const doDownload = () => {
        setShowSpinner(true);
        clearFlashes('files');

        getFileDownloadUrl(uuid, join(directory, file.name))
            .then((url) => {
                // @ts-expect-error this is valid
                window.location = url;
            })
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setShowSpinner(false));
    };

    const doArchive = () => {
        setShowSpinner(true);
        clearFlashes('files');

        compressFiles(uuid, directory, [file.name])
            .then(() => mutate())
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setShowSpinner(false));
    };

    const doUnarchive = () => {
        setShowSpinner(true);
        clearFlashes('files');

        decompressFiles(uuid, directory, file.name)
            .then(() => mutate())
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setShowSpinner(false));
    };

    return (
        <>
            <Dialog.Confirm
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                title={`Supprimer ${file.isFile ? 'le fichier' : 'le dossier'}`}
                confirm={'Supprimer'}
                onConfirmed={doDeletion}
            >
                Vous ne pourrez pas récupérer le contenu de&nbsp;
                <span className={'font-semibold text-white'}>{file.name}</span> une fois supprimé.
            </Dialog.Confirm>

            {modal === 'chmod' && (
                <ChmodFileModal
                    visible
                    appear
                    files={[{ file: file.name, mode: file.modeBits }]}
                    onDismissed={() => setModal(null)}
                />
            )}

            {(modal === 'rename' || modal === 'move') && (
                <RenameFileModal
                    visible
                    appear
                    files={[file.name]}
                    useMoveTerminology={modal === 'move'}
                    onDismissed={() => setModal(null)}
                />
            )}

            <SpinnerOverlay visible={showSpinner} fixed size={'large'} />

            <DropdownMenu
                ref={onClickRef}
                renderToggle={(onClick) => (
                    <button
                        type={'button'}
                        aria-label={'Actions sur le fichier'}
                        title={'Actions'}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClick(e);
                        }}
                        className={
                            'p-1.5 w-8 h-8 rounded-xl text-neutral-400 hover:text-white hover:bg-violet-600/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-0 bg-transparent outline-none focus:ring-1 focus:ring-violet-500/50'
                        }
                    >
                        <FontAwesomeIcon icon={faEllipsisH} className={'text-sm'} />
                    </button>
                )}
            >
                <div className={'space-y-0.5'}>
                    <Can action={'file.update'}>
                        <Row onClick={() => setModal('rename')} icon={faPencilAlt} title={'Renommer'} />
                        <Row onClick={() => setModal('move')} icon={faLevelUpAlt} title={'Déplacer'} />
                        <Row onClick={() => setModal('chmod')} icon={faFileCode} title={'Permissions'} />
                    </Can>
                    {file.isFile && (
                        <Can action={'file.create'}>
                            <Row onClick={doCopy} icon={faCopy} title={'Dupliquer'} />
                        </Can>
                    )}
                    {file.isArchiveType() ? (
                        <Can action={'file.create'}>
                            <Row onClick={doUnarchive} icon={faBoxOpen} title={'Désarchiver'} />
                        </Can>
                    ) : (
                        <Can action={'file.archive'}>
                            <Row onClick={doArchive} icon={faFileArchive} title={'Compresser'} />
                        </Can>
                    )}
                    {file.isFile && <Row onClick={doDownload} icon={faFileDownload} title={'Télécharger'} />}
                    <Can action={'file.delete'}>
                        <Row onClick={() => setShowConfirmation(true)} icon={faTrashAlt} title={'Supprimer'} danger />
                    </Can>
                </div>
            </DropdownMenu>
        </>
    );
};

export default memo(FileDropdownMenu, isEqual);
