import { useStoreState } from '@/state/hooks';
import FeatureContainer from '@/elements/FeatureContainer';
import BillingSvg from '@/assets/images/themed/BillingSvg';
import { faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import ToggleFeatureButton from '@admin/modules/billing/ToggleFeatureButton';

export default () => {
    const primary = useStoreState(state => state.theme.data!.colors.primary);

    return (
        <FeatureContainer image={<BillingSvg color={primary} />} icon={faMoneyBillWave} title={'Système de Facturation & Crédits'}>
            Utilisez le système de facturation et de crédits pour vendre des serveurs, gérer les renouvellements et attribuer des crédits à vos utilisateurs directement depuis le panneau d&apos;administration. Consultez les commandes, gérez les catégories et produits, et suivez les soldes en toute simplicité.
            <p className={'text-right mt-2'}>
                <ToggleFeatureButton />
            </p>
        </FeatureContainer>
    );
};
