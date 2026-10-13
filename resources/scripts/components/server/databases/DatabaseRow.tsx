import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faEye, faTrashAlt, faKey } from '@fortawesome/free-solid-svg-icons';
import { ServerDatabase } from '@/api/server/databases/getServerDatabases';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import deleteServerDatabase from '@/api/server/databases/deleteServerDatabase';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import RotatePasswordButton from '@/components/server/databases/RotatePasswordButton';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import GreyRowBox from '@/components/elements/GreyRowBox';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface Props {
    database: ServerDatabase;
    className?: string;
}

export default ({ database, className }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);
    const [connectionVisible, setConnectionVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions((actions) => actions.databases.appendDatabase);
    const removeDatabase = ServerContext.useStoreActions((actions) => actions.databases.removeDatabase);

    const jdbcConnectionString = `jdbc:mysql://${database.username}${
        database.password ? `:${encodeURIComponent(database.password)}` : ''
    }@${database.connectionString}/${database.name}`;

    const schema = object().shape({
        confirm: string()
            .required('Le nom de la base de données doit être confirmé.')
            .oneOf([database.name.split('_', 2)[1], database.name], 'Le nom de la base de données est incorrect.'),
    });

    const submit = (values: { confirm: string }, { setSubmitting }: FormikHelpers<{ confirm: string }>) => {
        clearFlashes();
        deleteServerDatabase(uuid, database.id)
            .then(() => {
                setVisible(false);
                setTimeout(() => removeDatabase(database.id), 150);
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                addError({ key: 'database:delete', message: httpErrorToHuman(error) });
            });
    };

    return (
        <>
            <Formik onSubmit={submit} initialValues={{ confirm: '' }} validationSchema={schema} isInitialValid={false}>
                {({ isSubmitting, isValid, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            setVisible(false);
                            resetForm();
                        }}
                    >
                        <FlashMessageRender byKey={'database:delete'} css={tw`mb-6`} />
                        <h2 css={tw`text-2xl font-bold text-white mb-4`}>Confirmation de suppression</h2>
                        <p css={tw`text-sm text-neutral-300 leading-relaxed`}>
                            La suppression d&apos;une base de données est définitive et irréversible. Toutes les données
                            de&nbsp;
                            <strong css={tw`text-violet-300`}>{database.name}</strong> seront définitivement détruites.
                        </p>
                        <Form css={tw`m-0 mt-6`}>
                            <Field
                                type={'text'}
                                id={'confirm_name'}
                                name={'confirm'}
                                label={'Confirmer le nom'}
                                description={'Entrez le nom de la base de données pour confirmer.'}
                            />
                            <div css={tw`mt-6 flex justify-end gap-3`}>
                                <Button type={'button'} isSecondary onClick={() => setVisible(false)}>
                                    Annuler
                                </Button>
                                <Button type={'submit'} color={'red'} disabled={!isValid}>
                                    Supprimer définitivement
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                )}
            </Formik>
            <Modal visible={connectionVisible} onDismissed={() => setConnectionVisible(false)}>
                <FlashMessageRender byKey={'database-connection-modal'} css={tw`mb-6`} />
                <h3 css={tw`mb-6 text-xl font-bold text-white flex items-center gap-2`}>
                    <FontAwesomeIcon icon={faKey} css={tw`text-violet-400`} />
                    Identifiants de connexion MySQL
                </h3>
                <div css={tw`space-y-4`}>
                    <div>
                        <Label>Hôte & Port (Endpoint)</Label>
                        <CopyOnClick text={database.connectionString}>
                            <Input type={'text'} readOnly value={database.connectionString} />
                        </CopyOnClick>
                    </div>
                    <div>
                        <Label>Connexions autorisées depuis</Label>
                        <Input type={'text'} readOnly value={database.allowConnectionsFrom} />
                    </div>
                    <div>
                        <Label>Nom d&apos;utilisateur</Label>
                        <CopyOnClick text={database.username}>
                            <Input type={'text'} readOnly value={database.username} />
                        </CopyOnClick>
                    </div>
                    <Can action={'database.view_password'}>
                        <div>
                            <Label>Mot de passe</Label>
                            <CopyOnClick text={database.password} showInNotification={false}>
                                <Input type={'text'} readOnly value={database.password} />
                            </CopyOnClick>
                        </div>
                    </Can>
                    <div>
                        <Label>URL de connexion JDBC</Label>
                        <CopyOnClick text={jdbcConnectionString} showInNotification={false}>
                            <Input type={'text'} readOnly value={jdbcConnectionString} />
                        </CopyOnClick>
                    </div>
                </div>
                <div css={tw`mt-8 flex justify-end items-center gap-3`}>
                    <Can action={'database.update'}>
                        <RotatePasswordButton databaseId={database.id} onUpdate={appendDatabase} />
                    </Can>
                    <Button isSecondary onClick={() => setConnectionVisible(false)}>
                        Fermer
                    </Button>
                </div>
            </Modal>
            <GreyRowBox $hoverable={false} className={className} css={tw`mb-2.5 items-center`}>
                <div
                    css={tw`w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-center text-violet-400 hidden sm:flex mr-4 flex-none`}
                >
                    <FontAwesomeIcon icon={faDatabase} />
                </div>
                <div css={tw`flex-1 truncate mr-4`}>
                    <CopyOnClick text={database.name}>
                        <p
                            css={tw`text-base font-semibold text-white truncate hover:text-violet-300 transition-colors cursor-pointer`}
                        >
                            {database.name}
                        </p>
                    </CopyOnClick>
                    <p css={tw`text-2xs text-violet-400 font-mono mt-0.5`}>MySQL 8.0</p>
                </div>
                <div css={tw`ml-4 text-center hidden md:block`}>
                    <CopyOnClick text={database.connectionString}>
                        <p css={tw`text-xs font-mono text-neutral-300 hover:text-white cursor-pointer`}>
                            {database.connectionString}
                        </p>
                    </CopyOnClick>
                    <p css={tw`mt-0.5 text-2xs text-neutral-400 uppercase select-none tracking-wider`}>Hôte</p>
                </div>
                <div css={tw`ml-6 text-center hidden lg:block`}>
                    <p css={tw`text-xs text-neutral-300 font-mono`}>{database.allowConnectionsFrom}</p>
                    <p css={tw`mt-0.5 text-2xs text-neutral-400 uppercase select-none tracking-wider`}>
                        Connexions depuis
                    </p>
                </div>
                <div css={tw`ml-6 text-center hidden md:block`}>
                    <CopyOnClick text={database.username}>
                        <p css={tw`text-xs font-mono text-neutral-300 hover:text-white cursor-pointer`}>
                            {database.username}
                        </p>
                    </CopyOnClick>
                    <p css={tw`mt-0.5 text-2xs text-neutral-400 uppercase select-none tracking-wider`}>Utilisateur</p>
                </div>
                <div css={tw`ml-auto flex items-center gap-2 pl-4`}>
                    <Button isSecondary onClick={() => setConnectionVisible(true)}>
                        <FontAwesomeIcon icon={faEye} fixedWidth />
                    </Button>
                    <Can action={'database.delete'}>
                        <Button color={'red'} isSecondary onClick={() => setVisible(true)}>
                            <FontAwesomeIcon icon={faTrashAlt} fixedWidth />
                        </Button>
                    </Can>
                </div>
            </GreyRowBox>
        </>
    );
};
