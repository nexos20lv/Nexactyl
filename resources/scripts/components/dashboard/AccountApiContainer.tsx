import React, { useEffect, useState } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import CreateApiKeyForm from '@/components/dashboard/forms/CreateApiKeyForm';
import getApiKeys, { ApiKey } from '@/api/account/getApiKeys';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import deleteApiKey from '@/api/account/deleteApiKey';
import FlashMessageRender from '@/components/FlashMessageRender';
import { format } from 'date-fns';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Dialog } from '@/components/elements/dialog';
import { useFlashKey } from '@/plugins/useFlash';
import Code from '@/components/elements/Code';

export default () => {
    const [deleteIdentifier, setDeleteIdentifier] = useState('');
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const { clearAndAddHttpError } = useFlashKey('account');

    useEffect(() => {
        getApiKeys()
            .then((keys) => setKeys(keys))
            .then(() => setLoading(false))
            .catch((error) => clearAndAddHttpError(error));
    }, []);

    const doDeletion = (identifier: string) => {
        setLoading(true);

        clearAndAddHttpError();
        deleteApiKey(identifier)
            .then(() => setKeys((s) => [...(s || []).filter((key) => key.identifier !== identifier)]))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => {
                setLoading(false);
                setDeleteIdentifier('');
            });
    };

    return (
        <PageContentBlock title={'Clés API du Compte'}>
            <FlashMessageRender byKey={'account'} />
            <div css={tw`md:flex flex-nowrap my-10 gap-8`}>
                <ContentBox title={'Créer une clé API'} css={tw`flex-none w-full md:w-1/2`}>
                    <CreateApiKeyForm onKeyCreated={(key) => setKeys((s) => [...s!, key])} />
                </ContentBox>
                <ContentBox title={'Clés API Actives'} css={tw`flex-1 overflow-hidden mt-8 md:mt-0`}>
                    <SpinnerOverlay visible={loading} />
                    <Dialog.Confirm
                        title={'Supprimer la clé API'}
                        confirm={'Supprimer'}
                        open={!!deleteIdentifier}
                        onClose={() => setDeleteIdentifier('')}
                        onConfirmed={() => doDeletion(deleteIdentifier)}
                    >
                        Toutes les requêtes utilisant la clé <Code>{deleteIdentifier}</Code> seront immédiatement
                        invalidées.
                    </Dialog.Confirm>
                    {keys.length === 0 ? (
                        <p css={tw`text-center text-sm text-neutral-400 py-8`}>
                            {loading ? 'Chargement...' : 'Aucune clé API configurée pour ce compte.'}
                        </p>
                    ) : (
                        keys.map((key, index) => (
                            <GreyRowBox key={key.identifier} css={[tw`flex items-center`, index > 0 && tw`mt-2.5`]}>
                                <div
                                    css={tw`w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-center text-violet-400 mr-3 flex-none`}
                                >
                                    <FontAwesomeIcon icon={faKey} />
                                </div>
                                <div css={tw`flex-1 overflow-hidden`}>
                                    <p css={tw`text-sm font-semibold text-white break-words`}>{key.description}</p>
                                    <p css={tw`text-2xs text-neutral-400 font-mono mt-0.5`}>
                                        Dernière utilisation :&nbsp;
                                        {key.lastUsedAt ? format(key.lastUsedAt, 'dd/MM/yyyy HH:mm') : 'Jamais'}
                                    </p>
                                </div>
                                <p css={tw`text-sm ml-4 hidden md:block`}>
                                    <code
                                        css={tw`font-mono py-1 px-2 bg-neutral-900 border border-violet-500/20 text-violet-300 rounded-lg text-xs`}
                                    >
                                        {key.identifier}
                                    </code>
                                </p>
                                <button
                                    css={tw`ml-4 p-2 text-sm text-neutral-400 hover:text-rose-400 transition-colors`}
                                    onClick={() => setDeleteIdentifier(key.identifier)}
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </GreyRowBox>
                        ))
                    )}
                </ContentBox>
            </div>
        </PageContentBlock>
    );
};
