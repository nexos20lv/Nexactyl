<?php

namespace Pterodactyl\Http\ViewComposers;

use Illuminate\View\View;
use Pterodactyl\Services\Helpers\AssetHashService;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class AssetComposer
{
    /**
     * AssetComposer constructor.
     */
    public function __construct(
        private AssetHashService $assetHashService,
        private SettingsRepositoryInterface $settings
    ) {
    }

    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $brandName = (string) $this->settings->get('settings::nxslab:brand:name', config('app.name', 'NXSLab'));
        $brandTagline = (string) $this->settings->get('settings::nxslab:brand:tagline', 'Plateforme Cloud Gaming Haute Performance');
        $brandLogo = (string) $this->settings->get('settings::nxslab:brand:logo_url', '');
        $defaultAccent = (string) $this->settings->get('settings::nxslab:brand:default_accent', 'violet');
        $currencyName = (string) $this->settings->get('settings::nxslab:brand:currency_name', 'Crédits');
        $currencySymbol = (string) $this->settings->get('settings::nxslab:brand:currency_symbol', 'cr');
        $footerText = (string) $this->settings->get('settings::nxslab:brand:footer_text', "{$brandName} • Plateforme Cloud Gaming Haute Performance");

        $view->with('asset', $this->assetHashService);
        $view->with('siteConfiguration', [
            'name' => $brandName,
            'locale' => config('app.locale') ?? 'fr',
            'tagline' => $brandTagline,
            'logo' => $brandLogo,
            'accentColor' => $defaultAccent,
            'currencyName' => $currencyName,
            'currencySymbol' => $currencySymbol,
            'footerText' => $footerText,
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
        ]);
    }
}
