import React, { memo, useCallback, useState } from 'react';
import isEqual from 'react-fast-compare';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired, faStar } from '@fortawesome/free-solid-svg-icons';
import InputSpinner from '@/components/elements/InputSpinner';
import { Textarea } from '@/components/elements/Input';
import Can from '@/components/elements/Can';
import { Button } from '@/components/elements/button/index';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Allocation } from '@/api/server/getServer';
import styled from 'styled-components/macro';
import { debounce } from 'debounce';
import setServerAllocationNotes from '@/api/server/network/setServerAllocationNotes';
import { useFlashKey } from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import CopyOnClick from '@/components/elements/CopyOnClick';
import DeleteAllocationButton from '@/components/server/network/DeleteAllocationButton';
import setPrimaryServerAllocation from '@/api/server/network/setPrimaryServerAllocation';
import getServerAllocations from '@/api/swr/getServerAllocations';
import { ip } from '@/lib/formatters';
import Code from '@/components/elements/Code';

const Label = styled.label`
    ${tw`uppercase text-2xs mt-1 text-violet-400 font-semibold block px-1 select-none tracking-wider`}
`;

interface Props {
    allocation: Allocation;
}

const AllocationRow = ({ allocation }: Props) => {
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = getServerAllocations();

    const onNotesChanged = useCallback((id: number, notes: string) => {
        mutate((data) => data?.map((a) => (a.id === id ? { ...a, notes } : a)), false);
    }, []);

    const setAllocationNotes = debounce((notes: string) => {
        setLoading(true);
        clearFlashes();

        setServerAllocationNotes(uuid, allocation.id, notes)
            .then(() => onNotesChanged(allocation.id, notes))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    }, 750);

    const setPrimaryAllocation = () => {
        clearFlashes();
        mutate((data) => data?.map((a) => ({ ...a, isDefault: a.id === allocation.id })), false);

        setPrimaryServerAllocation(uuid, allocation.id).catch((error) => {
            clearAndAddHttpError(error);
            mutate();
        });
    };

    return (
        <GreyRowBox $hoverable={false} className={'flex-wrap md:flex-nowrap mt-2.5 items-center'}>
            <div className={'flex items-center w-full md:w-auto'}>
                <div className={'pl-2 pr-5 text-violet-400 text-lg'}>
                    <FontAwesomeIcon icon={faNetworkWired} />
                </div>
                <div className={'mr-5 flex-1 md:w-44'}>
                    {allocation.alias ? (
                        <CopyOnClick text={allocation.alias}>
                            <Code dark className={'w-44 truncate font-mono text-sm text-violet-200'}>
                                {allocation.alias}
                            </Code>
                        </CopyOnClick>
                    ) : (
                        <CopyOnClick text={ip(allocation.ip)}>
                            <Code dark className={'font-mono text-sm text-neutral-200'}>
                                {ip(allocation.ip)}
                            </Code>
                        </CopyOnClick>
                    )}
                    <Label>{allocation.alias ? "Nom d'hôte" : 'Adresse IP'}</Label>
                </div>
                <div className={'w-20 md:w-28 overflow-hidden'}>
                    <CopyOnClick text={allocation.port.toString()}>
                        <Code dark className={'font-mono text-sm text-violet-300 font-bold'}>
                            {allocation.port}
                        </Code>
                    </CopyOnClick>
                    <Label>Port</Label>
                </div>
            </div>
            <div className={'mt-4 w-full md:mt-0 md:flex-1 md:w-auto'}>
                <InputSpinner visible={loading}>
                    <Textarea
                        className={
                            'bg-neutral-900/90 hover:border-violet-500/30 border-neutral-700/60 rounded-xl text-xs py-2 px-3'
                        }
                        placeholder={'Ajouter une note pour ce port...'}
                        defaultValue={allocation.notes || undefined}
                        onChange={(e) => setAllocationNotes(e.currentTarget.value)}
                    />
                </InputSpinner>
            </div>
            <div className={'flex justify-end items-center space-x-3 mt-4 w-full md:mt-0 md:w-56'}>
                {allocation.isDefault ? (
                    <span
                        className={
                            'px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/30 flex items-center gap-1.5'
                        }
                    >
                        <FontAwesomeIcon icon={faStar} className={'text-yellow-300 text-xs'} />
                        Principal
                    </span>
                ) : (
                    <>
                        <Can action={'allocation.delete'}>
                            <DeleteAllocationButton allocation={allocation.id} />
                        </Can>
                        <Can action={'allocation.update'}>
                            <Button.Text
                                size={Button.Sizes.Small}
                                onClick={setPrimaryAllocation}
                                className={'!text-violet-300 hover:!text-white'}
                            >
                                Définir Principal
                            </Button.Text>
                        </Can>
                    </>
                )}
            </div>
        </GreyRowBox>
    );
};

export default memo(AllocationRow, isEqual);
