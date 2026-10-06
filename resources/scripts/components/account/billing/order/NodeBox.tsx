import { useStoreState } from '@/state/hooks';
import { Dispatch, SetStateAction } from 'react';
import GreyRowBox from '@/elements/GreyRowBox';
import Money from '@/elements/billing/Money';
import { CheckCircleIcon, ServerIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import { type Node } from '@definitions/account/billing';

interface Props {
    node: Node;
    selected: number | undefined;
    setSelected: Dispatch<SetStateAction<number>>;
    disabled?: boolean;
}

export default ({ node, selected, setSelected, disabled }: Props) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <div
            onClick={() => !disabled && setSelected(Number(node.id))}
            className={classNames('relative', disabled && 'cursor-not-allowed opacity-50')}
        >
            <GreyRowBox>
                {!disabled && (
                    <CheckCircleIcon
                        className={classNames(
                            'absolute top-2 right-2 h-5 w-5 transition-colors duration-500',
                            selected === Number(node.id) ? 'text-green-500' : 'text-gray-500',
                        )}
                    />
                )}
                <ServerIcon className={'mr-2 h-8 w-8'} style={{ color: colors.primary }} />
                <p className={'font-semibold text-gray-200'}>
                    {node.name}{' '}
                    <span className={'ml-2 text-sm font-medium italic text-gray-400'}>
                        <code>{node.fqdn}</code> - {disabled ? 'Available for paid servers only' : 'available'}
                    </span>
                    {!disabled && node.deploymentFee > 0 && (
                        <span className={'mt-0.5 block text-xs text-yellow-400'}>
                            + <Money value={node.deploymentFee} /> one-time deployment fee
                        </span>
                    )}
                </p>
            </GreyRowBox>
        </div>
    );
};
