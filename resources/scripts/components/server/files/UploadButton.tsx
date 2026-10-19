import axios, { AxiosProgressEvent } from 'axios';
import getFileUploadUrl from '@/api/server/files/getFileUploadUrl';
import createDirectory from '@/api/server/files/createDirectory';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import React, { useEffect, useRef } from 'react';
import { ModalMask } from '@/components/elements/Modal';
import Fade from '@/components/elements/Fade';
import useEventListener from '@/plugins/useEventListener';
import { useFlashKey } from '@/plugins/useFlash';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import { ServerContext } from '@/state/server';
import { WithClassname } from '@/components/types';
import Portal from '@/components/elements/Portal';
import { CloudUploadIcon } from '@heroicons/react/outline';
import { useSignal } from '@preact/signals-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';

interface UploadItem {
    file: File;
    subPath: string;
}

function isFileOrDirectory(event: DragEvent): boolean {
    if (!event.dataTransfer?.types) {
        return false;
    }

    return event.dataTransfer.types.some((value) => value.toLowerCase() === 'files');
}

async function extractFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<UploadItem[]> {
    const items = dataTransfer.items;
    if (!items || !items.length) {
        return Array.from(dataTransfer.files || []).map((f) => ({ file: f, subPath: '' }));
    }

    const results: UploadItem[] = [];

    async function traverseEntry(entry: any, currentPath = ''): Promise<void> {
        if (entry.isFile) {
            const file = await new Promise<File>((resolve, reject) => entry.file(resolve, reject));
            results.push({ file, subPath: currentPath });
        } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            const readEntries = (): Promise<any[]> =>
                new Promise((resolve, reject) => dirReader.readEntries(resolve, reject));

            let entries = await readEntries();
            while (entries.length > 0) {
                for (const sub of entries) {
                    await traverseEntry(sub, currentPath ? `${currentPath}/${entry.name}` : entry.name);
                }
                entries = await readEntries();
            }
        }
    }

    const promises: Promise<void>[] = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
        if (entry) {
            promises.push(traverseEntry(entry));
        } else if (item.kind === 'file') {
            const f = item.getAsFile();
            if (f) results.push({ file: f, subPath: '' });
        }
    }

    await Promise.all(promises);
    return results.length > 0 ? results : Array.from(dataTransfer.files || []).map((f) => ({ file: f, subPath: '' }));
}

export default ({ className }: WithClassname) => {
    const fileUploadInput = useRef<HTMLInputElement>(null);

    const visible = useSignal(false);
    const timeouts = useSignal<NodeJS.Timeout[]>([]);

    const { mutate } = useFileManagerSwr();
    const { clearAndAddHttpError } = useFlashKey('files');

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { clearFileUploads, removeFileUpload, pushFileUpload, setUploadProgress } = ServerContext.useStoreActions(
        (actions) => actions.files
    );

    useEventListener(
        'dragenter',
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isFileOrDirectory(e)) {
                visible.value = true;
            }
        },
        { capture: true }
    );

    useEventListener('dragexit', () => (visible.value = false), { capture: true });

    useEventListener('keydown', () => (visible.value = false));

    useEffect(() => {
        return () => timeouts.value.forEach(clearTimeout);
    }, []);

    const onUploadProgress = (data: AxiosProgressEvent, name: string) => {
        setUploadProgress({ name, loaded: data.loaded });
    };

    const processUploadItems = async (items: UploadItem[]) => {
        clearAndAddHttpError();

        // 1. Collect and create all unique subdirectories in order
        const createdDirs = new Set<string>();
        for (const item of items) {
            if (!item.subPath) continue;

            const segments = item.subPath.split('/');
            let currentAccum = '';
            for (const seg of segments) {
                const parentDir = currentAccum
                    ? directory
                        ? `${directory}/${currentAccum}`
                        : `/${currentAccum}`
                    : directory;
                currentAccum = currentAccum ? `${currentAccum}/${seg}` : seg;

                if (!createdDirs.has(currentAccum)) {
                    createdDirs.add(currentAccum);
                    try {
                        await createDirectory(uuid, parentDir, seg);
                    } catch {
                        // Directory may already exist, ignore and continue
                    }
                }
            }
        }

        // 2. Upload files in batches
        const uploadPromises = items.map((item) => {
            const controller = new AbortController();
            const displayName = item.subPath ? `${item.subPath}/${item.file.name}` : item.file.name;
            const targetDir = item.subPath
                ? directory
                    ? `${directory}/${item.subPath}`
                    : `/${item.subPath}`
                : directory;

            pushFileUpload({
                name: displayName,
                data: { abort: controller, loaded: 0, total: item.file.size },
            });

            return () =>
                getFileUploadUrl(uuid).then((url) =>
                    axios
                        .post(
                            url,
                            { files: item.file },
                            {
                                signal: controller.signal,
                                headers: { 'Content-Type': 'multipart/form-data' },
                                params: { directory: targetDir },
                                onUploadProgress: (data) => onUploadProgress(data, displayName),
                            }
                        )
                        .then(() => timeouts.value.push(setTimeout(() => removeFileUpload(displayName), 500)))
                );
        });

        // Run batches with up to 4 concurrent uploads
        const concurrency = 4;
        const queue = [...uploadPromises];
        const active: Promise<any>[] = [];

        async function runNext(): Promise<void> {
            if (queue.length === 0) return;
            const task = queue.shift()!;
            const p = task().then(() => {
                active.splice(active.indexOf(p), 1);
            });
            active.push(p);
            if (queue.length > 0 && active.length < concurrency) {
                runNext();
            }
            await p;
            if (queue.length > 0) {
                await runNext();
            }
        }

        const workers = Array.from({ length: Math.min(concurrency, queue.length) }, () => runNext());
        try {
            await Promise.all(workers);
            await mutate();
        } catch (error) {
            clearFileUploads();
            clearAndAddHttpError(error as Error);
        }
    };

    return (
        <>
            <Portal>
                <Fade appear in={visible.value} timeout={75} key={'upload_modal_mask'} unmountOnExit>
                    <ModalMask
                        onClick={() => (visible.value = false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            visible.value = false;
                            if (!e.dataTransfer) return;

                            const items = await extractFilesFromDataTransfer(e.dataTransfer);
                            if (items.length > 0) {
                                processUploadItems(items);
                            }
                        }}
                    >
                        <div className={'w-full flex items-center justify-center pointer-events-none'}>
                            <div
                                className={
                                    'flex items-center space-x-4 bg-[#0e0c18] border border-violet-500/30 ring-4 ring-violet-500/20 rounded-2xl p-6 mx-10 max-w-sm shadow-2xl text-violet-400'
                                }
                            >
                                <CloudUploadIcon className={'w-10 h-10 flex-shrink-0 animate-bounce'} />
                                <div>
                                    <p className={'font-header text-base text-neutral-100 font-bold'}>
                                        Déposez vos fichiers ou dossiers
                                    </p>
                                    <p className={'text-xs text-neutral-400 mt-0.5'}>
                                        Les dossiers et sous-dossiers seront automatiquement explorés et téléversés.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ModalMask>
                </Fade>
            </Portal>
            <input
                type={'file'}
                ref={fileUploadInput}
                css={tw`hidden`}
                onChange={(e) => {
                    if (!e.currentTarget.files) return;

                    const items: UploadItem[] = Array.from(e.currentTarget.files).map((file) => ({
                        file,
                        subPath: '',
                    }));
                    processUploadItems(items);
                    if (fileUploadInput.current) {
                        fileUploadInput.current.files = null;
                    }
                }}
                multiple
            />
            <Button className={className} onClick={() => fileUploadInput.current && fileUploadInput.current.click()}>
                <FontAwesomeIcon icon={faCloudUploadAlt} css={tw`mr-2 text-xs`} />
                Upload
            </Button>
        </>
    );
};
