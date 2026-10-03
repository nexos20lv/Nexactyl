import { useStoreState } from '@/state/hooks';

interface Props {
    value: number;
    suffix?: string;
    className?: string;
    accent?: boolean;
}

export default ({ value, suffix, className, accent }: Props) => {
    const { colors } = useStoreState(state => state.theme.data!);

    let formattedSuffix = suffix || '';
    if (formattedSuffix.trim() === '/mo' || formattedSuffix.trim() === '/ mo') {
        formattedSuffix = ' / mois';
    }

    return (
        <span className={className} style={accent ? { color: colors.primary } : undefined}>
            {value.toFixed(2)} crédits{formattedSuffix}
        </span>
    );
};
