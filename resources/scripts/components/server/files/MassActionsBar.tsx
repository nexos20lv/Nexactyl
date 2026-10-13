import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import Fade from '@/components/elements/Fade';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';
import compressFiles from '@/api/server/files/compressFiles';
import { ServerContext } from '@/state/server';
import deleteFiles from '@/api/server/files/deleteFiles';
import RenameFileModal from '@/components/server/files/RenameFileModal';
import Portal from '@/components/elements/Portal';
import { Dialog } from '@/components/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArchive, faLevelUpAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const MassActionsBar = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showMove, setShowMove] = useState(false);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const selectedFiles = ServerContext.useStoreState((state) => state.files.selectedFiles);
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);

    useEffect(() => {
        if (!loading) setLoadingMessage('');
    }, [loading]);

    const onClickCompress = () => {
        setLoading(true);
        clearFlashes('files');
        setLoadingMessage('Archivage en cours...');

        compressFiles(uuid, directory, selectedFiles)
            .then(() => mutate())
            .then(() => setSelectedFiles([]))
            .catch((error) => clearAndAddHttpError({ key: 'files', error }))
            .then(() => setLoading(false));
    };

    const onClickConfirmDeletion = () => {
        setLoading(true);
        setShowConfirm(false);
        clearFlashes('files');
        setLoadingMessage('Suppression en cours...');

        deleteFiles(uuid, directory, selectedFiles)
            .then(() => {
                mutate((files) => files.filter((f) => selectedFiles.indexOf(f.name) < 0), false);
                setSelectedFiles([]);
            })
            .catch((error) => {
                mutate();
                clearAndAddHttpError({ key: 'files', error });
            })
            .then(() => setLoading(false));
    };

    return (
        <>
            <div css={tw`pointer-events-none fixed bottom-0 z-20 left-0 right-0 flex justify-center`}>
                <SpinnerOverlay visible={loading} size={'large'} fixed>
                    {loadingMessage}
                </SpinnerOverlay>
                <Dialog.Confirm
                    title={'Supprimer les fichiers'}
                    open={showConfirm}
                    confirm={'Supprimer'}
                    onClose={() => setShowConfirm(false)}
                    onConfirmed={onClickConfirmDeletion}
                >
                    <p className={'mb-2'}>
                        Êtes-vous sûr de vouloir supprimer&nbsp;
                        <span className={'font-semibold text-white'}>{selectedFiles.length} fichier(s)</span> ? Cette
                        action est irréversible.
                    </p>
                    {selectedFiles.slice(0, 15).map((file) => (
                        <li key={file} className={'text-xs text-neutral-400 font-mono'}>
                            {file}
                        </li>
                    ))}
                    {selectedFiles.length > 15 && (
                        <li className={'text-xs text-neutral-500'}>et {selectedFiles.length - 15} autre(s)</li>
                    )}
                </Dialog.Confirm>
                {showMove && (
                    <RenameFileModal
                        files={selectedFiles}
                        visible
                        appear
                        useMoveTerminology
                        onDismissed={() => setShowMove(false)}
                    />
                )}
                <Portal>
                    <div className={'pointer-events-none fixed bottom-0 mb-8 flex justify-center w-full z-50'}>
                        <Fade timeout={75} in={selectedFiles.length > 0} unmountOnExit>
                            <div
                                className={
                                    'flex items-center gap-3 pointer-events-auto rounded-2xl px-5 py-3 bg-[#0e0c18]/95 border border-violet-500/30 backdrop-blur-md shadow-2xl shadow-violet-950/40'
                                }
                            >
                                <span css={tw`text-xs font-semibold text-violet-300 mr-2`}>
                                    {selectedFiles.length} sélectionné(s)
                                </span>
                                <Button onClick={() => setShowMove(true)}>
                                    <FontAwesomeIcon icon={faLevelUpAlt} css={tw`mr-2 text-xs`} />
                                    Déplacer
                                </Button>
                                <Button onClick={onClickCompress}>
                                    <FontAwesomeIcon icon={faFileArchive} css={tw`mr-2 text-xs`} />
                                    Archiver
                                </Button>
                                <Button.Danger variant={Button.Variants.Secondary} onClick={() => setShowConfirm(true)}>
                                    <FontAwesomeIcon icon={faTrashAlt} css={tw`mr-2 text-xs`} />
                                    Supprimer
                                </Button.Danger>
                            </div>
                        </Fade>
                    </div>
                </Portal>
            </div>
        </>
    );
};

export default MassActionsBar;
