import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { array, number, object, string } from 'yup';

import {
    createNodeAllocationEntry as createAllocation,
    getNodeAllocationEntries as getAllocations,
    useNodeAllocationEntries as getAllocations2,
} from '@/api/routes/admin/nodes';
import { Button } from '@/elements/button';
import Field from '@/elements/Field';
import SelectField, { type Option } from '@/elements/SelectField';

interface Values {
    ips: string[];
    startPort?: number | undefined;
    endPort?: number | undefined;
    alias: string;
}

const distinct = (value: any, index: any, self: any) => {
    return self.indexOf(value) === index;
};

function CreateAllocationForm({ nodeId }: { nodeId: number }) {
    const [ips, setIPs] = useState<Option[]>([]);

    const { mutate } = getAllocations2(nodeId, ['server']);

    useEffect(() => {
        getAllocations(nodeId).then(allocations => {
            setIPs(
                allocations
                    .map(a => a.ip)
                    .filter(distinct)
                    .map(ip => {
                        return { value: ip, label: ip };
                    }),
            );
        });
    }, [nodeId]);

    const isValidIP = (inputValue: string): boolean => {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[1-2]?[0-9]|3[0-2]|[1-9]))?$/;
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))(\/(12[0-8]|1[0-1][0-9]|[1-9][0-9]|[1-9]))?$/;
        
        return ipv4Regex.test(inputValue) || ipv6Regex.test(inputValue);
    };

    const submit = ({ ips, startPort, endPort, alias }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        setSubmitting(false);

        ips.forEach(async ip => {
            const allocations = await createAllocation(nodeId, { ip, startPort, endPort, alias }, ['server']);
            await mutate(data => ({ ...data!, items: { ...data!.items!, ...allocations } }));
        });
    };

    return (
        <Formik<Values>
            onSubmit={submit}
            initialValues={{
                ips: [] as string[],
                startPort: undefined,
                endPort: undefined,
                alias: '',
            }}
            validationSchema={object().shape({
                ips: array(string()).required().min(1, 'You must select at least one ip address.'),
                startPort: number()
                    .required()
                    .min(1024, 'This port cannot be lower than 1024.')
                    .max(65535, 'This port cannot exceed 65535.'),
                endPort: number()
                    .nullable()
                    .min(1024, 'This port cannot be lower than 1024.')
                    .max(65535, 'This port cannot exceed 65535.'),
            })}
        >
            {({ isSubmitting, isValid }) => (
                <Form>
                    <SelectField
                        id={'ips'}
                        name={'ips'}
                        label={'IPs and CIDRs'}
                        options={ips}
                        isValidNewOption={isValidIP}
                        isMulti
                        isSearchable
                        isCreatable
                    />

                    <div css={tw`my-6 grid grid-cols-2 gap-2`}>
                        <Field id={'startPort'} name={'startPort'} label={'Start Port'} type={'text'} />
                        <Field id={'endPort'} name={'endPort'} label={'End Port'} type={'text'} />
                    </div>

                    <Field id={'alias'} name={'alias'} label={'Alias'} type={'text'} />

                    <div css={tw`w-full flex flex-row items-center mt-6`}>
                        <div css={tw`flex ml-auto`}>
                            <Button type={'submit'} disabled={isSubmitting || !isValid}>
                                Create Allocations
                            </Button>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}

export default CreateAllocationForm;
