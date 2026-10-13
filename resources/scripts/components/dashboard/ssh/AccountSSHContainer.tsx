import React, { useEffect } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import FlashMessageRender from '@/components/FlashMessageRender';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { useSSHKeys } from '@/api/account/ssh-keys';
import { useFlashKey } from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import CreateSSHKeyForm from '@/components/dashboard/ssh/CreateSSHKeyForm';
import DeleteSSHKeyButton from '@/components/dashboard/ssh/DeleteSSHKeyButton';

export default () => {
    const { clearAndAddHttpError } = useFlashKey('account');
    const { data, isValidating, error } = useSSHKeys({
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <PageContentBlock title={'Clés SSH'}>
            <FlashMessageRender byKey={'account'} />
            <div css={tw`md:flex flex-nowrap my-10 gap-8`}>
                <ContentBox title={'Ajouter une clé SSH'} css={tw`flex-none w-full md:w-1/2`}>
                    <CreateSSHKeyForm />
                </ContentBox>
                <ContentBox title={'Clés SSH Enregistrées'} css={tw`flex-1 overflow-hidden mt-8 md:mt-0`}>
                    <SpinnerOverlay visible={!data && isValidating} />
                    {!data || !data.length ? (
                        <p css={tw`text-center text-sm text-neutral-400 py-8`}>
                            {!data ? 'Chargement...' : 'Aucune clé SSH enregistrée.'}
                        </p>
                    ) : (
                        data.map((key, index) => (
                            <GreyRowBox
                                key={key.fingerprint}
                                css={[tw`flex space-x-4 items-center`, index > 0 && tw`mt-2.5`]}
                            >
                                <div
                                    css={tw`w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-center text-violet-400 mr-2 flex-none`}
                                >
                                    <FontAwesomeIcon icon={faKey} />
                                </div>
                                <div css={tw`flex-1`}>
                                    <p css={tw`text-sm font-semibold text-white break-words`}>{key.name}</p>
                                    <p css={tw`text-xs mt-1 font-mono text-violet-300 truncate`}>
                                        SHA256:{key.fingerprint}
                                    </p>
                                    <p css={tw`text-2xs mt-0.5 text-neutral-400 uppercase tracking-wider`}>
                                        Ajoutée le :&nbsp;
                                        {format(key.createdAt, 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                <DeleteSSHKeyButton name={key.name} fingerprint={key.fingerprint} />
                            </GreyRowBox>
                        ))
                    )}
                </ContentBox>
            </div>
        </PageContentBlock>
    );
};
