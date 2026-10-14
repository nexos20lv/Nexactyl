<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\ServerSubdomain;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class NxsLabSettingsController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings,
    ) {
    }

    /**
     * Render the NXSLab administration view.
     */
    public function index(): View
    {
        $settings = [
            // Identité Visuelle & Marque Blanche
            'brand_name' => (string) $this->settings->get('settings::nxslab:brand:name', config('app.name', 'NXSLab')),
            'brand_tagline' => (string) $this->settings->get('settings::nxslab:brand:tagline', 'Plateforme Cloud Gaming Haute Performance'),
            'brand_logo_url' => (string) $this->settings->get('settings::nxslab:brand:logo_url', ''),
            'brand_default_accent' => (string) $this->settings->get('settings::nxslab:brand:default_accent', 'violet'),
            'brand_currency_name' => (string) $this->settings->get('settings::nxslab:brand:currency_name', 'Crédits'),
            'brand_currency_symbol' => (string) $this->settings->get('settings::nxslab:brand:currency_symbol', 'cr'),
            'brand_footer_text' => (string) $this->settings->get('settings::nxslab:brand:footer_text', 'NXSLab • Plateforme Cloud Gaming Haute Performance'),

            // Sous-domaines & Cloudflare
            'subdomain_enabled' => (bool) $this->settings->get('settings::nxslab:subdomain:enabled', true),
            'base_domain' => (string) $this->settings->get('settings::nxslab:subdomain:base_domain', 'nxslab.in'),
            'available_domains' => (string) $this->settings->get('settings::nxslab:subdomain:available_domains', "nxslab.in\nplay.nxslab.in"),
            'target_host' => (string) $this->settings->get('settings::nxslab:subdomain:target_host', 'node.nxslab.in'),
            'reserved_subdomains' => (string) $this->settings->get(
                'settings::nxslab:subdomain:reserved',
                'admin, api, ptero, node, vpn, dashboard, broker, mail, ns1, ns2, smtp, pop, imap, ftp, cpanel, webmail, localhost, panel, dev, cloud, billing'
            ),
            'cf_api_token' => (string) $this->settings->get('settings::nxslab:cloudflare:api_token', env('CLOUDFLARE_API_TOKEN', '')),
            'cf_zone_id' => (string) $this->settings->get('settings::nxslab:cloudflare:zone_id', env('CLOUDFLARE_ZONE_ID', '')),
            'cf_auto_sync' => (bool) $this->settings->get('settings::nxslab:cloudflare:auto_sync', true),

            // Gaming & CurseForge
            'curseforge_key' => (string) $this->settings->get(
                'settings::nxslab:gaming:curseforge_key',
                env('CURSEFORGE_API_KEY', '$2a$10$bL4bIL5pUWqfcO7KQtnMReakwtfHbNKh6v1uTpKlzhwoueEJQnPnm')
            ),

            // Boutique & Crédits
            'store_enabled' => (bool) $this->settings->get('settings::nxslab:store:enabled', true),
            'starting_credits' => (int) $this->settings->get('settings::nxslab:store:starting_credits', 2500),
            'cost_ram_1gb' => (int) $this->settings->get('settings::nxslab:store:cost_ram_1gb', 50),
            'cost_cpu_25' => (int) $this->settings->get('settings::nxslab:store:cost_cpu_25', 35),
            'cost_disk_10gb' => (int) $this->settings->get('settings::nxslab:store:cost_disk_10gb', 25),
            'cost_backups_2' => (int) $this->settings->get('settings::nxslab:store:cost_backups_2', 20),
        ];

        $subdomains = ServerSubdomain::with(['server', 'user'])->orderByDesc('id')->paginate(30);

        return view('admin.settings.nxslab', [
            'settings' => $settings,
            'subdomains' => $subdomains,
        ]);
    }

    /**
     * Update NXSLab, Branding & Subdomain settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            // Identité Visuelle
            'brand_name' => 'required|string|max:100',
            'brand_tagline' => 'nullable|string|max:191',
            'brand_logo_url' => 'nullable|url|max:255',
            'brand_default_accent' => 'required|string|in:violet,azure,emerald,crimson,amber,fuchsia',
            'brand_currency_name' => 'required|string|max:50',
            'brand_currency_symbol' => 'required|string|max:10',
            'brand_footer_text' => 'nullable|string|max:191',

            // Sous-domaines
            'subdomain_enabled' => 'nullable|string',
            'base_domain' => 'required|string|max:100',
            'available_domains' => 'required|string',
            'target_host' => 'required|string|max:191',
            'reserved_subdomains' => 'nullable|string',
            'cf_api_token' => 'nullable|string|max:255',
            'cf_zone_id' => 'nullable|string|max:100',
            'cf_auto_sync' => 'nullable|string',

            // Gaming & Boutique
            'curseforge_key' => 'nullable|string|max:255',
            'store_enabled' => 'nullable|string',
            'starting_credits' => 'required|integer|min:0',
            'cost_ram_1gb' => 'required|integer|min:0',
            'cost_cpu_25' => 'required|integer|min:0',
            'cost_disk_10gb' => 'required|integer|min:0',
            'cost_backups_2' => 'required|integer|min:0',
        ]);

        // Sauvegarde de l'Identité Visuelle
        $this->settings->set('settings::nxslab:brand:name', trim($data['brand_name']));
        $this->settings->set('settings::nxslab:brand:tagline', trim($data['brand_tagline'] ?? ''));
        $this->settings->set('settings::nxslab:brand:logo_url', trim($data['brand_logo_url'] ?? ''));
        $this->settings->set('settings::nxslab:brand:default_accent', trim($data['brand_default_accent']));
        $this->settings->set('settings::nxslab:brand:currency_name', trim($data['brand_currency_name']));
        $this->settings->set('settings::nxslab:brand:currency_symbol', trim($data['brand_currency_symbol']));
        $this->settings->set('settings::nxslab:brand:footer_text', trim($data['brand_footer_text'] ?? ''));

        // Sauvegarde Sous-domaines
        $this->settings->set('settings::nxslab:subdomain:enabled', !empty($request->input('subdomain_enabled')) ? '1' : '0');
        $this->settings->set('settings::nxslab:subdomain:base_domain', trim($data['base_domain']));
        $this->settings->set('settings::nxslab:subdomain:available_domains', trim($data['available_domains']));
        $this->settings->set('settings::nxslab:subdomain:target_host', trim($data['target_host']));
        $this->settings->set('settings::nxslab:subdomain:reserved', trim($data['reserved_subdomains'] ?? ''));

        // Cloudflare
        $this->settings->set('settings::nxslab:cloudflare:api_token', trim($data['cf_api_token'] ?? ''));
        $this->settings->set('settings::nxslab:cloudflare:zone_id', trim($data['cf_zone_id'] ?? ''));
        $this->settings->set('settings::nxslab:cloudflare:auto_sync', !empty($request->input('cf_auto_sync')) ? '1' : '0');

        // Gaming
        $this->settings->set('settings::nxslab:gaming:curseforge_key', trim($data['curseforge_key'] ?? ''));

        // Boutique
        $this->settings->set('settings::nxslab:store:enabled', !empty($request->input('store_enabled')) ? '1' : '0');
        $this->settings->set('settings::nxslab:store:starting_credits', (string) $data['starting_credits']);
        $this->settings->set('settings::nxslab:store:cost_ram_1gb', (string) $data['cost_ram_1gb']);
        $this->settings->set('settings::nxslab:store:cost_cpu_25', (string) $data['cost_cpu_25']);
        $this->settings->set('settings::nxslab:store:cost_disk_10gb', (string) $data['cost_disk_10gb']);
        $this->settings->set('settings::nxslab:store:cost_backups_2', (string) $data['cost_backups_2']);

        $this->alert->success('Tous les paramètres de personnalisation, sous-domaines et boutique ont été mis à jour avec succès !')->flash();

        return redirect()->route('admin.settings.nxslab');
    }

    /**
     * Test Cloudflare credentials via API.
     */
    public function testCloudflare(Request $request): JsonResponse
    {
        $token = trim($request->input('token') ?: $this->settings->get('settings::nxslab:cloudflare:api_token', env('CLOUDFLARE_API_TOKEN', '')));
        $zoneId = trim($request->input('zone_id') ?: $this->settings->get('settings::nxslab:cloudflare:zone_id', env('CLOUDFLARE_ZONE_ID', '')));

        if (empty($token) || empty($zoneId)) {
            return response()->json([
                'success' => false,
                'error' => 'Veuillez renseigner un Token API Cloudflare et un Zone ID valides.',
            ], 422);
        }

        try {
            $res = Http::withToken($token)
                ->timeout(7)
                ->get("https://api.cloudflare.com/client/v4/zones/{$zoneId}");

            $data = $res->json();

            if ($res->successful() && !empty($data['success'])) {
                $zoneName = $data['result']['name'] ?? 'Inconnu';
                $status = $data['result']['status'] ?? 'active';
                $plan = $data['result']['plan']['name'] ?? 'Standard';

                return response()->json([
                    'success' => true,
                    'message' => "Connexion Cloudflare réussie ! Domaine détecté : {$zoneName} (Statut : {$status}, Offre : {$plan})",
                    'zone' => $zoneName,
                    'status' => $status,
                ]);
            }

            $errMsg = $data['errors'][0]['message'] ?? 'Erreur de validation des identifiants Cloudflare.';
            return response()->json([
                'success' => false,
                'error' => "Échec de connexion Cloudflare : {$errMsg}",
            ], 400);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => 'Impossible de contacter les serveurs Cloudflare : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an active user subdomain from database and Cloudflare DNS.
     */
    public function deleteSubdomain(int $id): RedirectResponse
    {
        $sub = ServerSubdomain::findOrFail($id);

        $token = $this->settings->get('settings::nxslab:cloudflare:api_token', env('CLOUDFLARE_API_TOKEN', ''));
        $zoneId = $this->settings->get('settings::nxslab:cloudflare:zone_id', env('CLOUDFLARE_ZONE_ID', ''));

        if (!empty($token) && !empty($zoneId) && !empty($sub->cloudflare_id)) {
            try {
                Http::withToken($token)
                    ->timeout(5)
                    ->delete("https://api.cloudflare.com/client/v4/zones/{$zoneId}/dns_records/{$sub->cloudflare_id}");
            } catch (\Throwable $e) {
                // Ignore CF delete error
            }
        }

        $full = "{$sub->subdomain}.{$sub->domain}";
        $sub->delete();

        $this->alert->success("Le sous-domaine '{$full}' a été révoqué et supprimé du DNS avec succès.")->flash();

        return redirect()->route('admin.settings.nxslab');
    }
}
