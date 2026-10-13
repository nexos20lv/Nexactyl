import React from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import RenameServerBox from '@/components/server/settings/RenameServerBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { ip } from '@/lib/formatters';
import { Button } from '@/components/elements/button/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTerminal, faInfoCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);

    return (
        <ServerContentBlock title={'Paramètres du Serveur'}>
            <FlashMessageRender byKey={'settings'} css={tw`mb-4`} />
            <div css={tw`md:flex gap-8`}>
                <div css={tw`w-full md:flex-1 space-y-6`}>
                    <Can action={'file.sftp'}>
                        <TitledGreyBox icon={faTerminal} title={'Connexion SFTP Directe'}>
                            <div className={'space-y-4'}>
                                <div>
                                    <Label>Adresse SFTP</Label>
                                    <CopyOnClick text={`sftp://${ip(sftp.ip)}:${sftp.port}`}>
                                        <Input type={'text'} value={`sftp://${ip(sftp.ip)}:${sftp.port}`} readOnly />
                                    </CopyOnClick>
                                </div>
                                <div>
                                    <Label>Nom d&apos;utilisateur</Label>
                                    <CopyOnClick text={`${username}.${id}`}>
                                        <Input type={'text'} value={`${username}.${id}`} readOnly />
                                    </CopyOnClick>
                                </div>
                                <div
                                    css={tw`p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/20 flex items-center justify-between gap-4`}
                                >
                                    <p css={tw`text-xs text-neutral-300`}>
                                        Votre mot de passe SFTP est identique au mot de passe de votre compte NXSLab.
                                    </p>
                                    <a
                                        href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`}
                                        css={tw`flex-none no-underline`}
                                    >
                                        <Button.Text
                                            variant={Button.Variants.Secondary}
                                            className={'flex items-center gap-2 !text-violet-300 hover:!text-white'}
                                        >
                                            <FontAwesomeIcon icon={faExternalLinkAlt} css={tw`text-xs`} />
                                            Lancer SFTP
                                        </Button.Text>
                                    </a>
                                </div>
                            </div>
                        </TitledGreyBox>
                    </Can>
                    <TitledGreyBox icon={faInfoCircle} title={'Informations Système & Débogage'}>
                        <div css={tw`flex items-center justify-between text-sm py-2 border-b border-white/5`}>
                            <p css={tw`text-neutral-400`}>Noeud (Node)</p>
                            <code
                                css={tw`font-mono bg-neutral-900 border border-violet-500/20 text-violet-300 rounded-lg py-1 px-2.5 text-xs`}
                            >
                                {node}
                            </code>
                        </div>
                        <CopyOnClick text={uuid}>
                            <div css={tw`flex items-center justify-between text-sm pt-3 cursor-pointer`}>
                                <p css={tw`text-neutral-400`}>Identifiant Unique (UUID)</p>
                                <code
                                    css={tw`font-mono bg-neutral-900 border border-violet-500/20 text-neutral-300 hover:text-white rounded-lg py-1 px-2.5 text-xs`}
                                >
                                    {uuid}
                                </code>
                            </div>
                        </CopyOnClick>
                    </TitledGreyBox>
                </div>
                <div css={tw`w-full mt-6 md:mt-0 md:flex-1 space-y-6`}>
                    <Can action={'settings.rename'}>
                        <RenameServerBox />
                    </Can>
                    <Can action={'settings.reinstall'}>
                        <ReinstallServerBox />
                    </Can>
                </div>
            </div>
        </ServerContentBlock>
    );
};
