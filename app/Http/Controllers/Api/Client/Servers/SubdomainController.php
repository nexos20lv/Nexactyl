<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerSubdomain;
use Pterodactyl\Facades\Activity;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class SubdomainController extends ClientApiController
{
    private const RESERVED = [
        'admin', 'api', 'ptero', 'node', 'vpn', 'dashboard', 'broker',
        'mail', 'ns1', 'ns2', 'smtp', 'pop', 'imap', 'ftp', 'cpanel',
        'webmail', 'localhost', 'panel', 'dev', 'cloud', 'billing',
    ];

    /**
     * Get current subdomain configuration.
     */
    public function index(Request $request, Server $server): JsonResponse
    {
        $sub = ServerSubdomain::where('server_id', $server->id)->first();
        $allocation = $server->allocation;

        return response()->json([
            'subdomain' => $sub,
            'available_domains' => ['nxslab.in', 'play.nxslab.in'],
            'allocation' => $allocation ? [
                'ip' => $allocation->ip_alias ?: $allocation->ip,
                'port' => $allocation->port,
            ] : null,
            'cloudflare_configured' => !empty(env('CLOUDFLARE_API_TOKEN')),
        ]);
    }

    /**
     * Create or update a custom subdomain.
     */
    public function store(Request $request, Server $server): JsonResponse
    {
        $request->validate([
            'subdomain' => 'required|alpha_dash|min:3|max:32',
            'domain' => 'nullable|string|in:nxslab.in,play.nxslab.in',
        ]);

        $subdomain = strtolower($request->input('subdomain'));
        $domain = $request->input('domain', 'nxslab.in');

        if (in_array($subdomain, self::RESERVED, true)) {
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
        $target = 'node.nxslab.in';
        $cfId = null;

        // Cloudflare SRV sync if API token is configured
        $cfToken = env('CLOUDFLARE_API_TOKEN');
        $cfZone = env('CLOUDFLARE_ZONE_ID');

        if (!empty($cfToken) && !empty($cfZone)) {
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
            $cfToken = env('CLOUDFLARE_API_TOKEN');
            $cfZone = env('CLOUDFLARE_ZONE_ID');

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
