<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class VersionManagerController extends ClientApiController
{
    public function __construct(private DaemonFileRepository $fileRepository)
    {
        parent::__construct();
    }

    public function loaders(): JsonResponse
    {
        return response()->json([
            'loaders' => [
                ['id' => 'paper', 'name' => 'Paper', 'description' => 'Plugins Bukkit/Spigot, ultra optimisé, recommandé', 'default' => true],
                ['id' => 'purpur', 'name' => 'Purpur', 'description' => 'Fork de Paper hautement personnalisable avec mécaniques étendues'],
                ['id' => 'fabric', 'name' => 'Fabric', 'description' => 'Modloader ultra-léger et moderne (Lithium, Sodium, etc.)'],
                ['id' => 'vanilla', 'name' => 'Vanilla', 'description' => 'Serveur officiel pur Mojang'],
            ],
        ]);
    }

    public function versions(Request $request, Server $server): JsonResponse
    {
        $this->assertMinecraftServer($server);
        $loader = $request->query('loader', 'paper');

        $versions = Cache::remember("mc_versions_{$loader}", 3600, function () use ($loader) {
            try {
                if ($loader === 'purpur') {
                    $res = Http::withHeaders(['User-Agent' => 'Pterodactyl'])->get('https://api.purpurmc.org/v2/purpur');
                    if ($res->successful()) {
                        return array_reverse($res->json('versions') ?? []);
                    }
                } elseif ($loader === 'fabric') {
                    $res = Http::withHeaders(['User-Agent' => 'Pterodactyl'])->get('https://meta.fabricmc.net/v2/versions/game');
                    if ($res->successful()) {
                        $items = $res->json() ?? [];
                        $versions = [];
                        foreach ($items as $item) {
                            if (!empty($item['stable']) && !empty($item['version'])) {
                                $versions[] = $item['version'];
                            }
                        }
                        return $versions;
                    }
                } elseif ($loader === 'paper') {
                    $res = Http::withHeaders(['User-Agent' => 'Pterodactyl (https://pterodactyl.io)'])->get('https://fill.papermc.io/v3/projects/paper');
                    if ($res->successful()) {
                        $groups = $res->json('versions') ?? [];
                        $all = [];
                        foreach ($groups as $groupVersions) {
                            if (is_array($groupVersions)) {
                                foreach ($groupVersions as $v) {
                                    if (!str_contains($v, '-rc') && !str_contains($v, '-pre')) {
                                        $all[] = $v;
                                    }
                                }
                            }
                        }
                        return array_values(array_unique($all));
                    }
                }

                // Default Mojang Vanilla
                $res = Http::withHeaders(['User-Agent' => 'Pterodactyl'])->get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json');
                if ($res->successful()) {
                    $items = $res->json('versions') ?? [];
                    $versions = [];
                    foreach ($items as $item) {
                        if (($item['type'] ?? '') === 'release') {
                            $versions[] = $item['id'];
                        }
                    }
                    return $versions;
                }
            } catch (\Throwable $e) {
                // fallback list
            }
            return ['1.21.1', '1.20.4', '1.20.2', '1.19.4', '1.18.2', '1.16.5', '1.12.2'];
        });

        return response()->json(['versions' => $versions]);
    }

    public function install(Request $request, Server $server): JsonResponse
    {
        $this->assertMinecraftServer($server);
        $request->validate([
            'loader' => 'required|string|in:paper,purpur,fabric,vanilla',
            'version' => 'required|string',
        ]);

        $loader = $request->input('loader');
        $version = $request->input('version');
        $downloadUrl = null;

        if ($loader === 'purpur') {
            $downloadUrl = "https://api.purpurmc.org/v2/purpur/{$version}/latest/download";
        } elseif ($loader === 'fabric') {
            $loaderMeta = Http::withHeaders(['User-Agent' => 'Pterodactyl'])->get('https://meta.fabricmc.net/v2/versions/loader')->json();
            $installerMeta = Http::withHeaders(['User-Agent' => 'Pterodactyl'])->get('https://meta.fabricmc.net/v2/versions/installer')->json();
            $loaderVersion = $loaderMeta[0]['version'] ?? '0.16.5';
            $installerVersion = $installerMeta[0]['version'] ?? '1.0.1';
            $downloadUrl = "https://meta.fabricmc.net/v2/versions/loader/{$version}/{$loaderVersion}/{$installerVersion}/server/jar";
        } elseif ($loader === 'paper') {
            $versionInfo = Http::withHeaders(['User-Agent' => 'Pterodactyl (https://pterodactyl.io)'])
                ->get("https://fill.papermc.io/v3/projects/paper/versions/{$version}")->json();
            $builds = $versionInfo['builds'] ?? [];
            if (!empty($builds)) {
                $latestBuild = $builds[0];
                $buildInfo = Http::withHeaders(['User-Agent' => 'Pterodactyl (https://pterodactyl.io)'])
                    ->get("https://fill.papermc.io/v3/projects/paper/versions/{$version}/builds/{$latestBuild}")->json();
                $downloadUrl = $buildInfo['downloads']['server:default']['url'] ?? null;
            }
            if (!$downloadUrl) {
                $downloadUrl = "https://api.purpurmc.org/v2/purpur/{$version}/latest/download";
            }
        } else {
            // Vanilla
            $manifest = Http::withHeaders(['User-Agent' => 'Pterodactyl'])->get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json')->json();
            foreach ($manifest['versions'] ?? [] as $item) {
                if ($item['id'] === $version) {
                    $verDetail = Http::withHeaders(['User-Agent' => 'Pterodactyl'])->get($item['url'])->json();
                    $downloadUrl = $verDetail['downloads']['server']['url'] ?? null;
                    break;
                }
            }
        }

        if (!$downloadUrl) {
            return response()->json(['error' => 'Impossible de résoudre le lien de téléchargement du serveur'], 422);
        }

        // Trigger Wings Pull
        $this->fileRepository->setServer($server)->pull($downloadUrl, '/', ['filename' => 'server.jar']);

        return response()->json([
            'success' => true,
            'message' => "Installation de {$loader} {$version} démarrée. Le fichier server.jar est téléchargé par Wings.",
            'loader' => $loader,
            'version' => $version,
        ]);
    }

    protected function assertMinecraftServer(Server $server): void
    {
        $isMinecraft = ($server->nest_id === 1)
            || (stripos($server->egg->name ?? '', 'minecraft') !== false)
            || (isset($server->egg->nest) && stripos($server->egg->nest->name ?? '', 'minecraft') !== false)
            || in_array('eula', $server->egg->inherit_features ?? []);

        if (!$isMinecraft) {
            abort(400, 'Ce gestionnaire de versions est réservé exclusivement aux serveurs Minecraft.');
        }
    }

}
