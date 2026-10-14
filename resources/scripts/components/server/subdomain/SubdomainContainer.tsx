import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGlobe,
    faCopy,
    faTrashAlt,
    faCheck,
    faSpinner,
    faBolt,
    faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import CopyOnClick from '@/components/elements/CopyOnClick';
import {
    getServerSubdomain,
    updateServerSubdomain,
    deleteServerSubdomain,
    SubdomainResponse,
} from '@/api/server/minecraft';
import { httpErrorToHuman } from '@/api/http';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [data, setData] = useState<SubdomainResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [subdomainInput, setSubdomainInput] = useState('');
    const [domainSelect, setDomainSelect] = useState('nxslab.in');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadSubdomain = () => {
        setLoading(true);
        getServerSubdomain(uuid)
            .then((res) => {
                setData(res);
                if (res.subdomain) {
                    setSubdomainInput(res.subdomain.subdomain);
                    setDomainSelect(res.subdomain.domain);
                }
            })
            .catch((err) => setErrorMessage(httpErrorToHuman(err)))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadSubdomain();
    }, [uuid]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subdomainInput.trim()) return;

        setSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const res = await updateServerSubdomain(uuid, subdomainInput.trim(), domainSelect);
            setSuccessMessage(res.message);
            loadSubdomain();
        } catch (err) {
            setErrorMessage(httpErrorToHuman(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!data?.subdomain) return;
        setSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await deleteServerSubdomain(uuid);
            setSuccessMessage('Sous-domaine supprimé avec succès.');
            setSubdomainInput('');
            loadSubdomain();
        } catch (err) {
            setErrorMessage(httpErrorToHuman(err));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !data) {
        return (
            <PageContentBlock title={'Sous-domaine Personnalisé'}>
                <div className={'flex justify-center items-center py-20'}>
                    <Spinner size={'large'} />
                </div>
            </PageContentBlock>
        );
    }

    const currentSub = data?.subdomain;
    const fullAddress = currentSub ? `${currentSub.subdomain}.${currentSub.domain}` : '';
    const allocation = data?.allocation;

    return (
        <PageContentBlock title={'Sous-domaine Personnalisé'}>
            <div className={'space-y-6 max-w-4xl mx-auto'}>
                {/* Header Banner */}
                <div
                    className={
                        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0e0c18]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden'
                    }
                >
                    <div
                        className={
                            'absolute -top-16 -right-16 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none'
                        }
                    />
                    <div>
                        <div className={'flex items-center gap-2.5'}>
                            <div
                                className={
                                    'w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30'
                                }
                            >
                                <FontAwesomeIcon icon={faGlobe} />
                            </div>
                            <h2 className={'text-lg font-bold text-white tracking-tight'}>
                                Sous-domaine Gratuit Personnalisé
                            </h2>
                        </div>
                        <p className={'text-xs text-neutral-400 mt-1'}>
                            Connectez-vous à votre serveur avec une adresse mémorisable sans devoir retenir le port
                            numérique.
                        </p>
                    </div>
                </div>

                {/* Notifications */}
                {successMessage && (
                    <div
                        className={
                            'px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 shadow-sm'
                        }
                    >
                        <FontAwesomeIcon icon={faCheck} className={'text-emerald-400'} />
                        <span>{successMessage}</span>
                    </div>
                )}
                {errorMessage && (
                    <div
                        className={
                            'px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs shadow-sm'
                        }
                    >
                        {errorMessage}
                    </div>
                )}

                {/* Active Subdomain Card */}
                {currentSub ? (
                    <div
                        className={
                            'p-6 sm:p-8 rounded-3xl bg-[#0e0c18]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl space-y-6'
                        }
                    >
                        <div
                            className={
                                'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5'
                            }
                        >
                            <div>
                                <span
                                    className={
                                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2'
                                    }
                                >
                                    <span className={'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'} />
                                    Sous-domaine Actif
                                </span>
                                <h3 className={'text-xl font-extrabold text-white font-mono tracking-tight'}>
                                    {fullAddress}
                                </h3>
                            </div>

                            <div className={'flex items-center gap-2'}>
                                <CopyOnClick text={fullAddress}>
                                    <Button type={'button'} className={'text-xs'}>
                                        <FontAwesomeIcon icon={faCopy} className={'mr-1.5'} />
                                        Copier l&apos;adresse
                                    </Button>
                                </CopyOnClick>
                                <Button
                                    isSecondary
                                    type={'button'}
                                    disabled={submitting}
                                    onClick={handleDelete}
                                    className={'text-xs hover:border-rose-500/50 hover:text-rose-300'}
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} className={'mr-1.5 text-[11px]'} />
                                    Supprimer
                                </Button>
                            </div>
                        </div>

                        {/* Technical Details Cards */}
                        <div className={'grid grid-cols-1 sm:grid-cols-3 gap-4'}>
                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-1'}>
                                <span
                                    className={
                                        'text-[10px] font-medium text-neutral-400 uppercase tracking-wider block'
                                    }
                                >
                                    Port de jeu
                                </span>
                                <span className={'text-sm font-bold text-violet-300 font-mono'}>{currentSub.port}</span>
                            </div>
                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-1'}>
                                <span
                                    className={
                                        'text-[10px] font-medium text-neutral-400 uppercase tracking-wider block'
                                    }
                                >
                                    Cible Hôte (Target)
                                </span>
                                <span className={'text-sm font-bold text-neutral-200 font-mono truncate block'}>
                                    {currentSub.target}
                                </span>
                            </div>
                            <div className={'p-4 rounded-2xl bg-neutral-900/50 border border-white/5 space-y-1'}>
                                <span
                                    className={
                                        'text-[10px] font-medium text-neutral-400 uppercase tracking-wider block'
                                    }
                                >
                                    Type de Redirection
                                </span>
                                <span className={'text-sm font-bold text-neutral-200'}>SRV TCP Minecraft</span>
                            </div>
                        </div>

                        <div
                            className={
                                'p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-xs text-neutral-300 flex items-start gap-3'
                            }
                        >
                            <FontAwesomeIcon icon={faInfoCircle} className={'text-violet-400 mt-0.5 shrink-0'} />
                            <div>
                                <p className={'font-semibold text-white'}>Comment vos joueurs se connectent ?</p>
                                <p className={'text-neutral-400 text-[11px] mt-0.5'}>
                                    Dans Minecraft Java Edition, entrez simplement{' '}
                                    <span className={'text-violet-300 font-mono font-bold'}>{fullAddress}</span> dans le
                                    champ Adresse du serveur. Aucun numéro de port n&apos;est nécessaire.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Create Subdomain Form */
                    <div
                        className={
                            'p-6 sm:p-8 rounded-3xl bg-[#0e0c18]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl'
                        }
                    >
                        <form onSubmit={handleSave} className={'space-y-6'}>
                            <div>
                                <h3 className={'text-base font-bold text-white'}>Choisir un nom de sous-domaine</h3>
                                <p className={'text-xs text-neutral-400 mt-1'}>
                                    Votre sous-domaine sera immédiatement assigné au port{' '}
                                    <span className={'text-violet-400 font-mono font-bold'}>
                                        {allocation?.port || 'actif'}
                                    </span>{' '}
                                    de ce serveur.
                                </p>
                            </div>

                            <div className={'flex flex-col sm:flex-row items-stretch gap-2'}>
                                <input
                                    type={'text'}
                                    required
                                    pattern={'^[a-zA-Z0-9_-]+$'}
                                    placeholder={'mon-serveur'}
                                    value={subdomainInput}
                                    onChange={(e) =>
                                        setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                                    }
                                    className={
                                        'flex-1 px-4 py-3 rounded-2xl bg-neutral-950 border border-white/10 text-neutral-100 text-sm font-mono focus:outline-none focus:border-violet-500'
                                    }
                                />
                                <div
                                    className={
                                        'flex items-center px-4 py-3 rounded-2xl bg-neutral-900 border border-white/10 text-neutral-400 font-mono text-sm shrink-0'
                                    }
                                >
                                    .nxslab.in
                                </div>
                            </div>

                            <div className={'flex justify-end pt-2'}>
                                <Button
                                    type={'submit'}
                                    disabled={submitting || !subdomainInput.trim()}
                                    className={'text-xs'}
                                >
                                    {submitting ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} spin className={'mr-2'} />
                                            Création en cours...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faBolt} className={'mr-2'} />
                                            Activer le sous-domaine
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </PageContentBlock>
    );
};
