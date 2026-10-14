import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import reinstallServer from '@/api/server/reinstallServer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const skipScripts = ServerContext.useStoreState((state) => state.server.data!.skipScripts);
    const [modalVisible, setModalVisible] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const reinstall = () => {
        clearFlashes('settings');
        reinstallServer(uuid)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: 'Your server has begun the reinstallation process.',
                });
            })
            .catch((error) => {
                console.error(error);

                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
            })
            .then(() => setModalVisible(false));
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    if (skipScripts) {
        return (
            <TitledGreyBox title={'Reinstall Server'}>
                <p css={tw`text-sm`}>
                    Reinstalling this server has been disabled because it is configured to skip its egg&apos;s install
                    script. If you would like to reinstall this server, contact a server administrator.
                </p>
            </TitledGreyBox>
        );
    }

    return (
        <TitledGreyBox icon={faRedo} title={'Réinstaller le serveur'} css={tw`relative`}>
            <Dialog.Confirm
                open={modalVisible}
                title={'Confirmer la réinstallation du serveur'}
                confirm={'Oui, réinstaller le serveur'}
                onClose={() => setModalVisible(false)}
                onConfirmed={reinstall}
            >
                La réinstallation forcée du serveur arrêtera le serveur et certains fichiers pourront être écrasés ou
                supprimés. Êtes-vous sûr de vouloir continuer ?
            </Dialog.Confirm>
            <p css={tw`text-sm`}>
                La réinstallation du serveur l&apos;arrêtera et relancera le script d&apos;installation officiel.&nbsp;
                <strong css={tw`font-medium text-rose-300`}>
                    Certains fichiers peuvent être modifiés ou supprimés lors de ce processus, assurez-vous de posséder
                    une sauvegarde récente avant de procéder.
                </strong>
            </p>
            <div css={tw`mt-6 text-right`}>
                <Button.Danger variant={Button.Variants.Secondary} onClick={() => setModalVisible(true)}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className='mr-2 text-xs' />
                    Réinstaller le serveur
                </Button.Danger>
            </div>
        </TitledGreyBox>
    );
};
