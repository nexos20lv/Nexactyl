import AdminBox from '@/elements/AdminBox';
import { Button } from '@/elements/button';
import { Link } from 'react-router-dom';
import ToggleFeatureButton from './ToggleFeatureButton';
import { faArrowsUpDown, faCoins, faDollar, faExchange, faGavel, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStoreActions, useStoreState } from '@/state/hooks';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import Select from '@/elements/Select';
import currencyDictionary from '@/assets/currency';
import ExportConfigButton from './config/ExportConfigButton';
import FlashMessageRender from '@/elements/FlashMessageRender';
import ImportConfigButton from './config/ImportConfigButton';
import { updateSettings } from '@/api/routes/admin/billing';
import BillingLinksForm from '@admin/modules/billing/BillingLinksForm';
import { useState } from 'react';

export default () => {
    const settings = useStoreState(s => s.everest.data!.billing);
    const updateEverest = useStoreActions(s => s.everest.updateEverest);

    const [startingCredits, setStartingCredits] = useState<string>(
        (settings.credits?.starting ?? 0).toString()
    );
    const [savingStarting, setSavingStarting] = useState(false);

    const submit = async (key: string, value: boolean | string) => {
        await updateSettings(key, value).then(() => {
            updateEverest({ billing: { ...settings, [key]: value } });
        });
    };

    const toggleCreditsEnabled = async () => {
        const next = !(settings.credits?.enabled ?? true);
        await updateSettings('credits:enabled', next).then(() => {
            updateEverest({
                billing: {
                    ...settings,
                    credits: {
                        ...settings.credits,
                        enabled: next,
                        starting: settings.credits?.starting ?? 0,
                    },
                },
            });
        });
    };

    const saveStartingCredits = async () => {
        const parsed = parseFloat(startingCredits);
        if (isNaN(parsed) || parsed < 0) return;
        setSavingStarting(true);
        await updateSettings('credits:starting', parsed).then(() => {
            updateEverest({
                billing: {
                    ...settings,
                    credits: {
                        ...settings.credits,
                        enabled: settings.credits?.enabled ?? true,
                        starting: parsed,
                    },
                },
            });
            setSavingStarting(false);
        });
    };

    const handleCurrencyChange = async (event: any) => {
        const code: string = event.target.value.toUpperCase();
        const symbol: string = currencyDictionary[code]!.symbol;

        submit('currency:code', code).then(() => {
            submit('currency:symbol', symbol);
        });
    };

    return (
        <div className={'grid lg:grid-cols-3 gap-4'}>
            <AdminBox title={'Primary Currency'} icon={faDollar}>
                Choose a primary currency to charge users.
                <div className={'mt-4'}>
                    <Label>Currency Code / Name</Label>
                    <Select onChange={handleCurrencyChange}>
                        {Object.keys(currencyDictionary).map(code => (
                            <option
                                key={code}
                                value={code}
                                onChange={() => console.log('hello')}
                                selected={code === settings.currency.code.toUpperCase()}
                            >
                                {code} - {currencyDictionary[code]!.name}
                            </option>
                        ))}
                    </Select>
                </div>
            </AdminBox>
            <AdminBox title={'Allow Self Upgrades'} icon={faArrowsUpDown}>
                <p className={'text-sm'}>
                    Having this service enabled means users can upgrade and downgrade to different products within their
                    existing category. A bill will automatically be generated if users with to upgrade before their
                    renewal is due, to ensure that they will pay for the usage of the upgraded plan. The user will not
                    be able to then change their plan for another 30 days after a change to prevent abuse.
                </p>
                <p className={'text-gray-400 mt-2'}>
                    This service is currently&nbsp;
                    <span className={settings.allow_upgrades ? 'text-green-500' : 'text-red-500'}>
                        {settings.allow_upgrades ? 'enabled' : 'disabled'}
                    </span>
                    .
                </p>
                <div className={'text-right mt-2'}>
                    <Button.Text onClick={() => submit('allow_upgrades', !settings.allow_upgrades)}>
                        {settings.allow_upgrades ? 'Disable' : 'Enable'}
                    </Button.Text>
                </div>
            </AdminBox>
            <AdminBox title={'Import/Export Configuration'} icon={faExchange}>
                <FlashMessageRender byKey={'billing:config'} className={'mb-2'} />
                Use the below options to either export your current billing configurations, or use the Import button to
                import a pre-created set of categories and products to Nexactyl.
                <div className={'text-right mt-3'}>
                    <ExportConfigButton />
                    <ImportConfigButton />
                </div>
            </AdminBox>
            <AdminBox title={'Système de crédits'} icon={faCoins}>
                <p className={'text-sm'}>
                    Le système de facturation utilise le solde de crédits des utilisateurs au lieu de Stripe. Vous pouvez activer ou désactiver les crédits et définir le montant offert à chaque nouvel utilisateur.
                </p>
                <p className={'text-gray-400 mt-3 text-sm'}>
                    Le système de crédits est actuellement&nbsp;
                    <span className={settings.credits?.enabled ?? true ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                        {settings.credits?.enabled ?? true ? 'activé' : 'désactivé'}
                    </span>
                    .
                </p>
                <div className={'text-right mt-2'}>
                    <Button.Text size={Button.Sizes.Small} onClick={toggleCreditsEnabled}>
                        {settings.credits?.enabled ?? true ? 'Désactiver' : 'Activer'}
                    </Button.Text>
                </div>

                <div className={'mt-4 pt-3 border-t border-neutral-800'}>
                    <Label>Crédits de bienvenue (création de compte)</Label>
                    <p className={'text-xs text-neutral-400 mb-2'}>
                        Montant automatiquement attribué lors de l&apos;inscription d&apos;un nouvel utilisateur.
                    </p>
                    <div className={'flex gap-2'}>
                        <Input
                            type={'number'}
                            step={'0.01'}
                            min={'0'}
                            value={startingCredits}
                            onChange={e => setStartingCredits(e.target.value)}
                            placeholder={'0.00'}
                        />
                        <Button
                            size={Button.Sizes.Small}
                            disabled={savingStarting || isNaN(parseFloat(startingCredits)) || parseFloat(startingCredits) < 0}
                            onClick={saveStartingCredits}
                        >
                            Enregistrer
                        </Button>
                    </div>
                </div>

                <div className={'text-right mt-4 pt-3 border-t border-neutral-800'}>
                    <Link to={'/admin/billing/credits'}>
                        <Button size={Button.Sizes.Small}>
                            <FontAwesomeIcon icon={faCoins} className={'mr-1.5'} /> Gérer les crédits des utilisateurs
                        </Button>
                    </Link>
                </div>
            </AdminBox>
            <AdminBox title={'Legal Document Links'} icon={faGavel}>
                Provide a link to your business&apos; ToS or privacy policy that users must accept before purchase.
                <BillingLinksForm />
            </AdminBox>
            <AdminBox title={'Disable Billing Module'} icon={faPowerOff}>
                Clicking the button below will disable all modules of the billing system - such as subscriptions, server
                purchasing and more. Make sure that this will not impact your users before disabling.
                <div className={'text-right mt-3'}>
                    <ToggleFeatureButton />
                </div>
            </AdminBox>
        </div>
    );
};
