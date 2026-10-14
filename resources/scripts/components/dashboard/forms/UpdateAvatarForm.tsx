import React, { useRef, useState } from 'react';
import { useStoreActions, useStoreState } from '@/state/hooks';
import Avatar from '@/components/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUpload, faLink, faTrashAlt, faCheck, faSpinner, faImage } from '@fortawesome/free-solid-svg-icons';
import { updateAccountAvatarFile, updateAccountAvatarUrl, deleteAccountAvatar } from '@/api/account/updateAvatar';
import { httpErrorToHuman } from '@/api/http';
import Button from '@/components/elements/Button';

export default () => {
    const user = useStoreState((state) => state.user.data);
    const updateUserData = useStoreActions((actions) => actions.user.updateUserData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<'upload' | 'url'>('upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [customUrl, setCustomUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState<boolean>(false);

    if (!user) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage('Le fichier dépasse la taille maximale autorisée (5 Mo).');
                return;
            }
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
            setErrorMessage(null);
            setSuccessMessage(null);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) {
                setErrorMessage('Veuillez déposer une image valide (PNG, JPG, WEBP, GIF).');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage('Le fichier dépasse la taille maximale autorisée (5 Mo).');
                return;
            }
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
            setErrorMessage(null);
            setSuccessMessage(null);
        }
    };

    const handleSaveFile = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const res = await updateAccountAvatarFile(selectedFile);
            updateUserData({ avatarUrl: res.avatarUrl });
            setSuccessMessage('Photo de profil mise à jour avec succès !');
            setSelectedFile(null);
            setFilePreview(null);
        } catch (err) {
            setErrorMessage(httpErrorToHuman(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUrl = async () => {
        if (!customUrl.trim()) {
            setErrorMessage('Veuillez saisir une URL valide.');
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const res = await updateAccountAvatarUrl(customUrl.trim());
            updateUserData({ avatarUrl: res.avatarUrl });
            setSuccessMessage('Photo de profil mise à jour avec succès !');
            setCustomUrl('');
        } catch (err) {
            setErrorMessage(httpErrorToHuman(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!user.avatarUrl) return;
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await deleteAccountAvatar();
            updateUserData({ avatarUrl: null });
            setSelectedFile(null);
            setFilePreview(null);
            setCustomUrl('');
            setSuccessMessage('Photo de profil personnalisée supprimée. Avatar par défaut restauré.');
        } catch (err) {
            setErrorMessage(httpErrorToHuman(err));
        } finally {
            setLoading(false);
        }
    };

    // Live preview avatar URL
    const activePreview = filePreview || (mode === 'url' && customUrl.trim() ? customUrl.trim() : user.avatarUrl);

    return (
        <div
            className={
                'bg-[#0e0c18]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden'
            }
        >
            {/* Ambient subtle glow */}
            <div
                className={
                    'absolute -top-24 -right-24 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none'
                }
            />

            <div className={'flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8'}>
                {/* Avatar Preview Squircle */}
                <div className={'flex flex-col items-center gap-3 shrink-0'}>
                    <div className={'relative group'}>
                        <div
                            className={
                                'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-2 ring-violet-500/30 shadow-xl bg-neutral-900 flex items-center justify-center transition-all duration-300 group-hover:ring-violet-500/60'
                            }
                        >
                            {activePreview ? (
                                <img
                                    src={activePreview}
                                    alt={'Avatar Preview'}
                                    className={'w-full h-full object-cover'}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <Avatar.User />
                            )}
                        </div>

                        {/* Camera badge */}
                        <button
                            type={'button'}
                            onClick={() => fileInputRef.current?.click()}
                            title={'Sélectionner une image'}
                            style={{
                                transition:
                                    'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                            }}
                            className={
                                'absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg active:scale-90 border-2 border-[#0e0c18]'
                            }
                        >
                            <FontAwesomeIcon icon={faCamera} className={'text-xs'} />
                        </button>
                    </div>

                    <div className={'text-center'}>
                        <span
                            className={
                                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ' +
                                (user.avatarUrl
                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                    : 'bg-neutral-800 text-neutral-400 border border-white/5')
                            }
                        >
                            <span
                                className={
                                    'w-1.5 h-1.5 rounded-full ' +
                                    (user.avatarUrl ? 'bg-violet-400 animate-pulse' : 'bg-neutral-500')
                                }
                            />
                            {user.avatarUrl ? 'Avatar Personnalisé' : 'Avatar Standard'}
                        </span>
                    </div>
                </div>

                {/* Form Controls */}
                <div className={'flex-1 min-w-0 w-full'}>
                    <div className={'flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4'}>
                        <div>
                            <h3 className={'text-lg font-bold text-white tracking-tight'}>Photo de profil (PFP)</h3>
                            <p className={'text-xs text-neutral-400 mt-0.5'}>
                                Personnalisez votre photo de profil visible sur toute la plateforme NXSLab.
                            </p>
                        </div>

                        {/* Mode Segmented Control */}
                        <div
                            className={
                                'inline-flex p-1 rounded-xl bg-neutral-900/80 border border-white/5 self-start sm:self-auto'
                            }
                        >
                            <button
                                type={'button'}
                                onClick={() => setMode('upload')}
                                className={
                                    'px-3 py-1 text-xs font-medium rounded-lg transition-all ' +
                                    (mode === 'upload'
                                        ? 'bg-violet-600 text-white shadow-sm'
                                        : 'text-neutral-400 hover:text-white')
                                }
                            >
                                <FontAwesomeIcon icon={faUpload} className={'mr-1.5 text-[10px]'} />
                                Téléverser
                            </button>
                            <button
                                type={'button'}
                                onClick={() => setMode('url')}
                                className={
                                    'px-3 py-1 text-xs font-medium rounded-lg transition-all ' +
                                    (mode === 'url'
                                        ? 'bg-violet-600 text-white shadow-sm'
                                        : 'text-neutral-400 hover:text-white')
                                }
                            >
                                <FontAwesomeIcon icon={faLink} className={'mr-1.5 text-[10px]'} />
                                Lien direct
                            </button>
                        </div>
                    </div>

                    {/* Mode Content */}
                    {mode === 'upload' ? (
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={
                                'border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ' +
                                (dragActive
                                    ? 'border-violet-500 bg-violet-600/10'
                                    : 'border-white/10 hover:border-violet-500/40 bg-neutral-900/40 hover:bg-neutral-900/60')
                            }
                        >
                            <input
                                ref={fileInputRef}
                                type={'file'}
                                accept={'image/png,image/jpeg,image/webp,image/gif'}
                                onChange={handleFileChange}
                                className={'hidden'}
                            />
                            <div className={'flex flex-col items-center justify-center gap-2'}>
                                <div
                                    className={
                                        'w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center'
                                    }
                                >
                                    <FontAwesomeIcon icon={faImage} className={'text-sm'} />
                                </div>
                                <div className={'text-xs text-neutral-300'}>
                                    {selectedFile ? (
                                        <span className={'font-semibold text-violet-300'}>
                                            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} Ko)
                                        </span>
                                    ) : (
                                        <>
                                            <span className={'text-violet-400 font-semibold'}>
                                                Cliquez pour choisir
                                            </span>{' '}
                                            ou glissez une image ici
                                        </>
                                    )}
                                </div>
                                <span className={'text-[10px] text-neutral-500'}>
                                    PNG, JPG, WEBP ou GIF (Max. 5 Mo)
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className={'space-y-2'}>
                            <label className={'text-xs font-medium text-neutral-300 block'}>
                                URL directe de l&apos;image :
                            </label>
                            <input
                                type={'url'}
                                placeholder={'https://exemple.com/mon-avatar.png'}
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                className={
                                    'w-full px-4 py-2.5 rounded-xl bg-neutral-900/80 border border-white/10 text-neutral-100 text-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-neutral-600'
                                }
                            />
                            <p className={'text-[10px] text-neutral-500'}>
                                Vous pouvez coller le lien d&apos;un avatar Discord, Imgur, Gravatar ou tout lien HTTPS
                                public.
                            </p>
                        </div>
                    )}

                    {/* Messages */}
                    {errorMessage && (
                        <div
                            className={
                                'mt-3 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs'
                            }
                        >
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div
                            className={
                                'mt-3 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2'
                            }
                        >
                            <FontAwesomeIcon icon={faCheck} className={'text-emerald-400'} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className={'flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/5'}>
                        {mode === 'upload' ? (
                            <Button
                                type={'button'}
                                disabled={!selectedFile || loading}
                                onClick={handleSaveFile}
                                className={'text-xs'}
                            >
                                {loading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className={'mr-2'} />
                                        Enregistrement...
                                    </>
                                ) : (
                                    'Enregistrer la photo'
                                )}
                            </Button>
                        ) : (
                            <Button
                                type={'button'}
                                disabled={!customUrl.trim() || loading}
                                onClick={handleSaveUrl}
                                className={'text-xs'}
                            >
                                {loading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin className={'mr-2'} />
                                        Enregistrement...
                                    </>
                                ) : (
                                    "Appliquer l'URL"
                                )}
                            </Button>
                        )}

                        {user.avatarUrl && (
                            <Button
                                isSecondary
                                type={'button'}
                                disabled={loading}
                                onClick={handleDelete}
                                className={'text-xs hover:border-rose-500/50 hover:text-rose-300'}
                            >
                                <FontAwesomeIcon icon={faTrashAlt} className={'mr-1.5 text-[11px]'} />
                                Réinitialiser l&apos;avatar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
