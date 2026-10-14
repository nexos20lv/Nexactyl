import React, { useEffect, useRef, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Field, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { object, string } from 'yup';
import debounce from 'debounce';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import InputSpinner from '@/components/elements/InputSpinner';
import getServers from '@/api/getServers';
import { Server } from '@/api/server/getServer';
import { ApplicationStore } from '@/state';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import { ip } from '@/lib/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faGlobe, faEthernet } from '@fortawesome/free-solid-svg-icons';

type Props = RequiredModalProps;

interface Values {
    term: string;
}

const ServerResult = styled(Link)`
    ${tw`flex items-center p-3.5 rounded-2xl no-underline transition-all`};
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);

    &:hover {
        background: rgba(124, 58, 237, 0.15);
        border-color: rgba(139, 92, 246, 0.4);
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    }

    &:active {
        transform: scale(0.99);
    }

    &:not(:last-of-type) {
        ${tw`mb-2`};
    }
`;

const SearchWatcher = () => {
    const { values, submitForm } = useFormikContext<Values>();

    useEffect(() => {
        if (values.term.length >= 3) {
            submitForm();
        }
    }, [values.term]);

    return null;
};

export default ({ ...props }: Props) => {
    const ref = useRef<HTMLInputElement>(null);
    const isAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [servers, setServers] = useState<Server[]>([]);
    const { clearAndAddHttpError, clearFlashes } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes
    );

    const search = debounce(({ term }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('search');

        getServers({ query: term, type: isAdmin ? 'admin-all' : undefined })
            .then((servers) => setServers(servers.items.filter((_, index) => index < 5)))
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ key: 'search', error });
            })
            .then(() => setSubmitting(false))
            .then(() => ref.current?.focus());
    }, 500);

    useEffect(() => {
        if (props.visible) {
            if (ref.current) ref.current.focus();
        }
    }, [props.visible]);

    const InputWithRef = (props: any) => <Input autoFocus {...props} ref={ref} />;

    return (
        <Formik
            onSubmit={search}
            validationSchema={object().shape({
                term: string().min(3, 'Saisissez au moins 3 caractères pour lancer la recherche.'),
            })}
            initialValues={{ term: '' } as Values}
        >
            {({ isSubmitting }) => (
                <Modal {...props}>
                    <Form>
                        <FormikFieldWrapper
                            name={'term'}
                            label={'Recherche rapide Spotlight'}
                            description={'Recherchez par nom de serveur, UUID ou adresse IP'}
                        >
                            <SearchWatcher />
                            <InputSpinner visible={isSubmitting}>
                                <Field
                                    as={InputWithRef}
                                    name={'term'}
                                    placeholder={'ex: Skyblock, 127.0.0.1, survival...'}
                                />
                            </InputSpinner>
                        </FormikFieldWrapper>
                    </Form>
                    {servers.length > 0 && (
                        <div css={tw`mt-5`}>
                            {servers.map((server) => (
                                <ServerResult
                                    key={server.uuid}
                                    to={`/server/${server.id}`}
                                    onClick={() => props.onDismissed()}
                                >
                                    <div
                                        css={tw`w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs mr-3 flex-shrink-0`}
                                    >
                                        <FontAwesomeIcon icon={faServer} />
                                    </div>
                                    <div css={tw`flex-1 mr-4 min-w-0`}>
                                        <p css={tw`text-sm font-semibold text-neutral-100 tracking-tight truncate`}>
                                            {server.name}
                                        </p>
                                        <p
                                            css={tw`mt-0.5 text-xs text-neutral-400 font-mono flex items-center gap-1.5`}
                                        >
                                            <FontAwesomeIcon
                                                icon={server.subdomain ? faGlobe : faEthernet}
                                                className='text-[10px] text-violet-400'
                                            />
                                            <span className='truncate'>
                                                {server.subdomain ||
                                                    server.allocations
                                                        .filter((alloc) => alloc.isDefault)
                                                        .map((allocation) => (
                                                            <span key={allocation.ip + allocation.port.toString()}>
                                                                {allocation.alias || ip(allocation.ip)}:
                                                                {allocation.port}
                                                            </span>
                                                        ))}
                                            </span>
                                        </p>
                                    </div>
                                    <div css={tw`flex-none text-right`}>
                                        <span
                                            css={tw`text-xs py-1 px-2.5 bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-full font-mono`}
                                        >
                                            {server.node}
                                        </span>
                                    </div>
                                </ServerResult>
                            ))}
                        </div>
                    )}
                </Modal>
            )}
        </Formik>
    );
};
