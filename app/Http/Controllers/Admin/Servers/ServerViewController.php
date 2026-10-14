<?php

namespace Pterodactyl\Http\Controllers\Admin\Servers;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerSubdomain;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Servers\EnvironmentService;
use Pterodactyl\Repositories\Eloquent\NestRepository;
use Pterodactyl\Repositories\Eloquent\NodeRepository;
use Pterodactyl\Repositories\Eloquent\MountRepository;
use Pterodactyl\Traits\Controllers\JavascriptInjection;
use Pterodactyl\Repositories\Eloquent\LocationRepository;
use Pterodactyl\Repositories\Eloquent\DatabaseHostRepository;

class ServerViewController extends Controller
{
    use JavascriptInjection;

    /**
     * ServerViewController constructor.
     */
    public function __construct(
        private DatabaseHostRepository $databaseHostRepository,
        private LocationRepository $locationRepository,
        private MountRepository $mountRepository,
        private NestRepository $nestRepository,
        private NodeRepository $nodeRepository,
        private EnvironmentService $environmentService,
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings,
    ) {
    }

    /**
     * Returns the index view for a server.
     */
    public function index(Request $request, Server $server): View
    {
        return view('admin.servers.view.index', compact('server'));
    }

    /**
     * Returns the server details page.
     */
    public function details(Request $request, Server $server): View
    {
        return view('admin.servers.view.details', compact('server'));
    }

    /**
     * Returns a view of server build settings.
     */
    public function build(Request $request, Server $server): View
    {
        $allocations = $server->node->allocations->toBase();

        return view('admin.servers.view.build', [
            'server' => $server,
            'assigned' => $allocations->where('server_id', $server->id)->sortBy('port')->sortBy('ip'),
            'unassigned' => $allocations->where('server_id', null)->sortBy('port')->sortBy('ip'),
        ]);
    }

    /**
     * Returns the server startup management page.
     *
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function startup(Request $request, Server $server): View
    {
        $nests = $this->nestRepository->getWithEggs();
        $variables = $this->environmentService->handle($server);

        $this->plainInject([
            'server' => $server,
            'server_variables' => $variables,
            'nests' => $nests->map(function (Nest $item) {
                return array_merge($item->toArray(), [
                    'eggs' => $item->eggs->keyBy('id')->toArray(),
                ]);
            })->keyBy('id'),
        ]);

        return view('admin.servers.view.startup', compact('server', 'nests'));
    }

    /**
     * Returns all the databases that exist for the server.
     */
    public function database(Request $request, Server $server): View
    {
        return view('admin.servers.view.database', [
            'hosts' => $this->databaseHostRepository->all(),
            'server' => $server,
        ]);
    }

    /**
     * Returns all the mounts that exist for the server.
     */
    public function mounts(Request $request, Server $server): View
    {
        $server->load('mounts');

        return view('admin.servers.view.mounts', [
            'mounts' => $this->mountRepository->getMountListForServer($server),
            'server' => $server,
        ]);
    }

    /**
     * Returns the base server management page, or an exception if the server
     * is in a state that cannot be recovered from.
     *
     * @throws DisplayException
     */
    public function manage(Request $request, Server $server): View
    {
        if ($server->status === Server::STATUS_INSTALL_FAILED) {
            throw new DisplayException('This server is in a failed install state and cannot be recovered. Please delete and re-create the server.');
        }

        // Check if the panel doesn't have at least 2 nodes configured.
        $nodes = $this->nodeRepository->all();
        $canTransfer = false;
        if (count($nodes) >= 2) {
            $canTransfer = true;
        }

        \JavaScript::put([
            'nodeData' => $this->nodeRepository->getNodesForServerCreation(),
        ]);

        return view('admin.servers.view.manage', [
            'server' => $server,
            'locations' => $this->locationRepository->all(),
            'canTransfer' => $canTransfer,
        ]);
    }

    /**
     * Returns the server deletion page.
     */
    public function delete(Request $request, Server $server): View
    {
        return view('admin.servers.view.delete', compact('server'));
    }

    /**
     * Returns the server custom subdomain view.
     */
    public function subdomain(Request $request, Server $server): View
    {
        $sub = $server->subdomain;
        $raw = (string) $this->settings->get('settings::nxslab:subdomain:available_domains', "nxslab.in\nplay.nxslab.in");
        $lines = preg_split('/[\r\n,]+/', $raw);
        $availableDomains = [];

        foreach ($lines as $line) {
            $line = strtolower(trim($line));
            if (!empty($line) && !in_array($line, $availableDomains, true)) {
                $availableDomains[] = $line;
            }
        }

        if (empty($availableDomains)) {
            $availableDomains = ['nxslab.in'];
        }

        $targetHost = (string) $this->settings->get('settings::nxslab:subdomain:target_host', 'node.nxslab.in');

        return view('admin.servers.view.subdomain', compact('server', 'sub', 'availableDomains', 'targetHost'));
    }

    /**
     * Updates or assigns a custom subdomain to the server.
     */
    public function updateSubdomain(Request $request, Server $server): RedirectResponse
    {
        $request->validate([
            'subdomain' => 'required|alpha_dash|min:3|max:32',
            'domain' => 'required|string',
        ]);

        $subdomain = strtolower($request->input('subdomain'));
        $domain = strtolower($request->input('domain'));

        $exists = ServerSubdomain::where('subdomain', $subdomain)
            ->where('domain', $domain)
            ->where('server_id', '!=', $server->id)
            ->exists();

        if ($exists) {
            $this->alert->danger("Le sous-domaine '{$subdomain}.{$domain}' est déjà utilisé par un autre serveur.")->flash();
            return redirect()->route('admin.servers.view.subdomain', $server->id);
        }

        $allocation = $server->allocation;
        if (!$allocation) {
            $this->alert->danger("Ce serveur ne possède aucune allocation réseau.")->flash();
            return redirect()->route('admin.servers.view.subdomain', $server->id);
        }

        $port = (int) $allocation->port;
        $target = (string) $this->settings->get('settings::nxslab:subdomain:target_host', 'node.nxslab.in');
        $cfId = null;

        $autoSync = (bool) $this->settings->get('settings::nxslab:cloudflare:auto_sync', true);
        $cfToken = $this->settings->get('settings::nxslab:cloudflare:api_token', env('CLOUDFLARE_API_TOKEN', ''));
        $cfZone = $this->settings->get('settings::nxslab:cloudflare:zone_id', env('CLOUDFLARE_ZONE_ID', ''));

        if ($autoSync && !empty($cfToken) && !empty($cfZone)) {
            try {
                $srvData = [
                    'type' => 'SRV',
                    'name' => "_minecraft._tcp.{$subdomain}.{$domain}",
                    'data' => [
                        'service' => '_minecraft',
                        'proto' => '_tcp',
                        'name' => "{$subdomain}.{$domain}",
                        'priority' => 0,
                        'weight' => 5,
                        'port' => $port,
                        'target' => $target,
                    ],
                    'ttl' => 120,
                ];

                $res = Http::withToken($cfToken)->timeout(6)->post("https://api.cloudflare.com/client/v4/zones/{$cfZone}/dns_records", $srvData);
                if ($res->successful()) {
                    $cfId = $res->json('result.id');
                }
            } catch (\Throwable) {
                // Ignore CF error
            }
        }

        ServerSubdomain::updateOrCreate(
            ['server_id' => $server->id],
            [
                'user_id' => $server->owner_id,
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

        $this->alert->success("Le sous-domaine '{$subdomain}.{$domain}' a été configuré avec succès.")->flash();

        return redirect()->route('admin.servers.view.subdomain', $server->id);
    }

    /**
     * Deletes the custom subdomain for the server.
     */
    public function deleteSubdomain(Request $request, Server $server): RedirectResponse
    {
        $sub = $server->subdomain;
        if ($sub) {
            $cfToken = $this->settings->get('settings::nxslab:cloudflare:api_token', env('CLOUDFLARE_API_TOKEN', ''));
            $cfZone = $this->settings->get('settings::nxslab:cloudflare:zone_id', env('CLOUDFLARE_ZONE_ID', ''));

            if (!empty($cfToken) && !empty($cfZone) && !empty($sub->cloudflare_id)) {
                try {
                    Http::withToken($cfToken)->timeout(5)->delete("https://api.cloudflare.com/client/v4/zones/{$cfZone}/dns_records/{$sub->cloudflare_id}");
                } catch (\Throwable) {
                    // Ignore
                }
            }

            $sub->delete();
            $this->alert->success("Le sous-domaine a été supprimé.")->flash();
        }

        return redirect()->route('admin.servers.view.subdomain', $server->id);
    }
}

