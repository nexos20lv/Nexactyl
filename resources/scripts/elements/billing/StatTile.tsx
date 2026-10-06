import { ReactNode } from 'react';
import classNames from 'classnames';
import { useStoreState } from '@/state/hooks';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { hexToRgba } from '@/lib/helpers';

interface Props {
    icon: IconDefinition;
    label: string;
    value: ReactNode;
    caption?: ReactNode;
    className?: string;
}

export default ({ icon, label, value, caption, className }: Props) => {
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <div
            className={classNames('rounded-xl p-4 shadow-lg ring-1 ring-white/5', className)}
            style={{ backgroundColor: colors.secondary }}
        >
            <div className={'flex items-center justify-between'}>
                <p className={'text-xs font-semibold uppercase tracking-wide text-gray-400'}>{label}</p>
                <div
                    className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'}
                    style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
                >
                    <FontAwesomeIcon icon={icon} className={'h-3.5 w-3.5'} style={{ color: colors.primary }} />
                </div>
            </div>
            <p className={'mt-3 truncate font-header text-2xl font-bold text-neutral-100 lg:text-3xl'}>{value}</p>
            {caption && <p className={'mt-1 text-xs text-gray-500'}>{caption}</p>}
        </div>
    );
};
