<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerSubdomain;
use Pterodactyl\Facades\Activity;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class SubdomainController extends ClientApiController
{
    public function __construct(private SettingsRepositoryInterface $settings)
    {
        parent::__construct();
    }

    /**
     * Get available domains list from settings.
     */
    private function getAvailableDomains(): array
    {
        $raw = (string) $this->settings->get('settings::nxslab:subdomain:available_domains', "nxslab.in\nplay.nxslab.in");
        $lines = preg_split('/[\r\n,]+/', $raw);
        $domains = [];

        foreach ($lines as $line) {
            $line = strtolower(trim($line));
            if (!empty($line) && !in_array($line, $domains, true)) {
                $domains[] = $line;
            }
        }

        return !empty($domains) ? $domains : ['nxslab.in'];
    }

    /**
     * Get reserved subdomains list from settings.
     */
    private function getReservedSubdomains(): array
    {
        $raw = (string) $this->settings->get(
            'settings::nxslab:subdomain:reserved',
            'admin, api, ptero, node, vpn, dashboard, broker, mail, ns1, ns2, smtp, pop, imap, ftp, cpanel, webmail, localhost, panel, dev, cloud, billing'
        );
        $parts = preg_split('/[\r\n,]+/', $raw);
        $reserved = [];

        foreach ($parts as $p) {
            $p = strtolower(trim($p));
            if (!empty($p)) {
                $reserved[] = $p;
            }
        }

        return $reserved;
    }

    /**
     * Get current subdomain configuration.
     */
    public function index(Request $request, Server $server): JsonResponse
    {
        $enabled = (bool) $this->settings->get('settings::nxslab:subdomain:enabled', true);
        $availableDomains = $this->getAvailableDomains();
        $sub = ServerSubdomain::where('server_id', $server->id)->first();
        $allocation = $server->allocation;

        $cfToken = $this->settings->get('settings::nxslab:cloudflare:api_token', env('CLOUDFLARE_API_TOKEN', ''));
        $cfZone = $this->settings->get('settings::nxslab:cloudflare:zone_id', env('CLOUDFLARE_ZONE_ID', ''));

        return response()->json([
            'enabled' => $enabled,
            'subdomain' => $sub,
            'available_domains' => $availableDomains,
            'allocation' => $allocation ? [
                'ip' => $allocation->ip_alias ?: $allocation->ip,
                'port' => $allocation->port,
            ] : null,
            'cloudflare_configured' => !empty($cfToken) && !empty($cfZone),
        ]);
    }

    /**
     * Create or update a custom subdomain.
     */
    public function store(Request $request, Server $server): JsonResponse
    {
        $enabled = (bool) $this->settings->get('settings::nxslab:subdomain:enabled', true);
        if (!$enabled) {
            return response()->json(['error' => 'Le service de sous-domaines est actuellement désactivé par les administrateurs.'], 403);
        }

        $availableDomains = $this->getAvailableDomains();
        $baseDomain = $this->settings->get('settings::nxslab:subdomain:base_domain', 'nxslab.in');

        $request->validate([
            'subdomain' => 'required|alpha_dash|min:3|max:32',
            'domain' => 'nullable|string',
        ]);

        $subdomain = strtolower($request->input('subdomain'));
        $domain = strtolower($request->input('domain', $baseDomain));

        if (!in_array($domain, $availableDomains, true)) {
            return response()->json(['error' => "Le domaine '{$domain}' n'est pas autorisé."], 422);
        }

        $reserved = $this->getReservedSubdomains();
        if (in_array($subdomain, $reserved, true)) {
            return response()->json(['error' => "Le préfixe '{$subdomain}' est réservé par le système NXSLab."], 422);
        }

        $exists = ServerSubdomain::where('subdomain', $subdomain)
            ->where('domain', $domain)
            ->where('server_id', '!=', $server->id)
            ->exists();

        if ($exists) {
            return response()->json(['error' => "Le sous-domaine '{$subdomain}.{$domain}' est déjà utilisé par un autre serveur."], 422);
        }

        $allocation = $server->allocation;
        if (!$allocation) {
            return response()->json(['error' => 'Le serveur ne possède aucune allocation réseau active.'], 400);
        }

        $port = (int) $allocation->port;
        $target = (string) $this->settings->get('settings::nxslab:subdomain:target_host', 'node.nxslab.in');
        $cfId = null;

        // Cloudflare sync
        $autoSync = (bool) $this->settings->get('settings::nxslab:cloudflare:auto_sync', true);
        $cfToken = $this->settings->get('settings::nxslab:cloudflare:api_token', env('CLOUDFLARE_API_TOKEN', ''));
        $cfZone = $this->settings->get('settings::nxslab:cloudflare:zone_id', env('CLOUDFLARE_ZONE_ID', ''));

        if ($autoSync && !empty($cfToken) && !empty($cfZone)) {
            try {
                $cfId = $this->syncCloudflareSrv($cfToken, $cfZone, $subdomain, $domain, $port, $target);
            } catch (\Throwable $e) {
                // Log and continue, saving local mapping
            }
        }

        $sub = ServerSubdomain::updateOrCreate(
            ['server_id' => $server->id],
            [
                'user_id' => $request->user()->id,
                'subdomain' => $subdomain,
                'domain' => $domain,
                'port' => $port,
                'target' => $target,
                'protocol' => '_tcp',
                'service' => '_minecraft',
                'cloudflare_id' => $cfId,
                'status' => 'active',
            ]
        );

        Activity::event('server:subdomain.updated')
            ->subject($server)
            ->property(['full_domain' => "{$subdomain}.{$domain}", 'port' => $port])
            ->log("Création du sous-domaine personnalisé : {$subdomain}.{$domain}");

        return response()->json([
            'success' => true,
            'subdomain' => $sub,
            'full_domain' => "{$subdomain}.{$domain}",
            'message' => "Le sous-domaine '{$subdomain}.{$domain}' est prêt !",
        ]);
    }

    /**
     * Delete the custom subdomain.
     */
    public function delete(Request $request, Server $server): JsonResponse
    {
        $sub = ServerSubdomain::where('server_id', $server->id)->first();
        if ($sub) {
            $cfToken = $this->settings->get('settings::nxslab:cloudflare:api_token', env('CLOUDFLARE_API_TOKEN', ''));
            $cfZone = $this->settings->get('settings::nxslab:cloudflare:zone_id', env('CLOUDFLARE_ZONE_ID', ''));

            if (!empty($cfToken) && !empty($cfZone) && !empty($sub->cloudflare_id)) {
                try {
                    Http::withToken($cfToken)
                        ->timeout(5)
                        ->delete("https://api.cloudflare.com/client/v4/zones/{$cfZone}/dns_records/{$sub->cloudflare_id}");
                } catch (\Throwable $e) {
                    // Ignore CF delete errors
                }
            }

            $sub->delete();

            Activity::event('server:subdomain.deleted')
                ->subject($server)
                ->log('Suppression du sous-domaine personnalisé');
        }

        return response()->json(['success' => true]);
    }

    private function syncCloudflareSrv(string $token, string $zone, string $sub, string $domain, int $port, string $target): ?string
    {
        $name = "_minecraft._tcp.{$sub}.{$domain}";
        $srvData = [
            'type' => 'SRV',
            'name' => $name,
            'data' => [
                'service' => '_minecraft',
                'proto' => '_tcp',
                'name' => "{$sub}.{$domain}",
                'priority' => 0,
                'weight' => 5,
                'port' => $port,
                'target' => $target,
            ],
            'ttl' => 120,
        ];

        $res = Http::withToken($token)
            ->timeout(6)
            ->post("https://api.cloudflare.com/client/v4/zones/{$zone}/dns_records", $srvData);

        if ($res->successful()) {
            return $res->json('result.id');
        }

        return null;
    }
}
