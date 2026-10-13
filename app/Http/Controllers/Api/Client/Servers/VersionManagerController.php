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

    /**
     * Return all available server engines categorized.
     */
    public function loaders(): JsonResponse
    {
        return response()->json([
            'loaders' => [
                // Plugins & Optimized
                [
                    'id' => 'paper',
                    'name' => 'Paper',
                    'category' => 'Plugins & Performance',
                    'tag' => 'Recommandé',
                    'badge_color' => 'violet',
                    'description' => 'Moteur haute performance n°1 compatible plugins Spigot/Bukkit.',
                    'default' => true,
                ],
                [
                    'id' => 'purpur',
                    'name' => 'Purpur',
                    'category' => 'Plugins & Performance',
                    'tag' => 'Ultra Opti',
                    'badge_color' => 'fuchsia',
                    'description' => 'Fork de Paper hautement optimisé avec configurations de gameplay avancées.',
                ],
                [
                    'id' => 'spigot',
                    'name' => 'Spigot',
                    'category' => 'Plugins & Performance',
                    'tag' => 'Classique',
                    'badge_color' => 'amber',
                    'description' => 'Moteur historique pour plugins Bukkit et Spigot.',
                ],

                // Modloaders
                [
                    'id' => 'neoforge',
                    'name' => 'NeoForge',
                    'category' => 'Modded (Mods)',
                    'tag' => 'Moderne 1.20.2+',
                    'badge_color' => 'cyan',
                    'description' => 'Le successeur officiel et moderne de Forge pour les versions récentes.',
                ],
                [
                    'id' => 'fabric',
                    'name' => 'Fabric',
                    'category' => 'Modded (Mods)',
                    'tag' => 'Ultra Léger',
                    'badge_color' => 'emerald',
                    'description' => 'Modloader nouvelle génération ultra rapide et modulaire (Sodium, Lithium).',
                ],
                [
                    'id' => 'forge',
                    'name' => 'Minecraft Forge',
                    'category' => 'Modded (Mods)',
                    'tag' => 'Modpacks Standard',
                    'badge_color' => 'blue',
                    'description' => 'Le modloader le plus populaire pour les gros modpacks (1.7.10 -> 1.20.x).',
                ],
                [
                    'id' => 'legacyfabric',
                    'name' => 'Legacy Fabric',
                    'category' => 'Modded (Mods)',
                    'tag' => 'Rétro 1.8 - 1.12',
                    'badge_color' => 'indigo',
                    'description' => 'Moteur Fabric optimisé pour les versions historiques (1.8.9, 1.12.2).',
                ],

                // Hybrids (Mods + Plugins together)
                [
                    'id' => 'mohist',
                    'name' => 'Mohist',
                    'category' => 'Hybride (Mods + Plugins)',
                    'tag' => 'Forge + Paper',
                    'badge_color' => 'rose',
                    'description' => 'Moteur hybride permettant de lancer des mods Forge ET des plugins Paper ensemble.',
                ],

                // Proxies & Network
                [
                    'id' => 'velocity',
                    'name' => 'Velocity',
                    'category' => 'Réseau & Proxy',
                    'tag' => 'Proxy Haute Vitesse',
                    'badge_color' => 'purple',
                    'description' => 'Le proxy nouvelle génération de PaperMC pour interconnecter vos serveurs.',
                ],

                // Official Vanilla
                [
                    'id' => 'vanilla',
                    'name' => 'Vanilla',
                    'category' => 'Officiel',
                    'tag' => 'Pur Mojang',
                    'badge_color' => 'gray',
                    'description' => 'Serveur officiel pur Mojang sans modificateur.',
                ],
            ],
        ]);
    }

    /**
     * List all versions available for a specific engine.
     */
    public function versions(Request $request, Server $server): JsonResponse
    {
        $this->assertMinecraftServer($server);
        $loader = $request->query('loader', 'paper');

        $versions = Cache::remember("mc_versions_{$loader}", 1800, function () use ($loader) {
            try {
                // 1. Purpur
                if ($loader === 'purpur') {
                    $res = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get('https://api.purpurmc.org/v2/purpur');
                    if ($res->successful()) {
                        return array_reverse($res->json('versions') ?? []);
                    }
                }

                // 2. PaperMC
                if ($loader === 'paper') {
                    $res = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get('https://fill.papermc.io/v3/projects/paper');
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
                        if (!empty($all)) {
                            return array_values(array_unique($all));
                        }
                    }
                }

                // 3. Fabric
                if ($loader === 'fabric') {
                    $res = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get('https://meta.fabricmc.net/v2/versions/game');
                    if ($res->successful()) {
                        $items = $res->json() ?? [];
                        $versions = [];
                        foreach ($items as $item) {
                            if (!empty($item['stable']) && !empty($item['version'])) {
                                $versions[] = $item['version'];
                            }
                        }
                        if (!empty($versions)) {
                            return $versions;
                        }
                    }
                }

                // 4. NeoForge (1.20.2+)
                if ($loader === 'neoforge') {
                    return ['1.21.1', '1.21.0', '1.20.6', '1.20.4', '1.20.2'];
                }

                // 5. Minecraft Forge Normal
                if ($loader === 'forge') {
                    return [
                        '1.20.4', '1.20.2', '1.20.1', '1.19.4', '1.19.2',
                        '1.18.2', '1.16.5', '1.12.2', '1.7.10',
                    ];
                }

                // 6. Mohist (Hybrid Forge + Paper)
                if ($loader === 'mohist') {
                    $res = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get('https://mohistmc.com/api/v2/projects/mohist');
                    if ($res->successful()) {
                        $list = $res->json('versions') ?? [];
                        if (!empty($list)) {
                            return array_reverse($list);
                        }
                    }
                    return ['1.20.2', '1.20.1', '1.19.4', '1.19.2', '1.18.2', '1.16.5', '1.12.2', '1.7.10'];
                }

                // 7. Spigot
                if ($loader === 'spigot') {
                    return [
                        '1.21.1', '1.21', '1.20.4', '1.20.2', '1.20.1',
                        '1.19.4', '1.19.2', '1.18.2', '1.17.1', '1.16.5',
                        '1.15.2', '1.14.4', '1.13.2', '1.12.2', '1.8.8',
                    ];
                }

                // 8. Legacy Fabric
                if ($loader === 'legacyfabric') {
                    return ['1.12.2', '1.8.9', '1.7.10'];
                }

                // 9. Velocity Proxy
                if ($loader === 'velocity') {
                    $res = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get('https://fill.papermc.io/v3/projects/velocity');
                    if ($res->successful()) {
                        $groups = $res->json('versions') ?? [];
                        $all = [];
                        foreach ($groups as $groupVersions) {
                            if (is_array($groupVersions)) {
                                foreach ($groupVersions as $v) {
                                    $all[] = $v;
                                }
                            }
                        }
                        if (!empty($all)) {
                            return array_values(array_unique($all));
                        }
                    }
                    return ['3.3.0', '3.2.0', '3.1.2'];
                }

                // 10. Default Mojang Vanilla
                $res = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json');
                if ($res->successful()) {
                    $items = $res->json('versions') ?? [];
                    $versions = [];
                    foreach ($items as $item) {
                        if (($item['type'] ?? '') === 'release') {
                            $versions[] = $item['id'];
                        }
                    }
                    if (!empty($versions)) {
                        return $versions;
                    }
                }
            } catch (\Throwable $e) {
                // Return safe fallbacks below
            }

            return ['1.21.1', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.8'];
        });

        return response()->json(['versions' => $versions]);
    }

    /**
     * Download and install server jar to /server.jar via Wings.
     */
    public function install(Request $request, Server $server): JsonResponse
    {
        $this->assertMinecraftServer($server);
        $request->validate([
            'loader' => 'required|string',
            'version' => 'required|string',
        ]);

        $loader = $request->input('loader');
        $version = $request->input('version');
        $downloadUrl = null;

        // 1. Purpur
        if ($loader === 'purpur') {
            $downloadUrl = "https://api.purpurmc.org/v2/purpur/{$version}/latest/download";
        }

        // 2. Paper
        elseif ($loader === 'paper') {
            try {
                $versionInfo = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])
                    ->get("https://fill.papermc.io/v3/projects/paper/versions/{$version}")->json();
                $builds = $versionInfo['builds'] ?? [];
                if (!empty($builds)) {
                    $latestBuild = $builds[0];
                    $buildInfo = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])
                        ->get("https://fill.papermc.io/v3/projects/paper/versions/{$version}/builds/{$latestBuild}")->json();
                    $downloadUrl = $buildInfo['downloads']['server:default']['url'] ?? null;
                }
            } catch (\Throwable $e) {}
            if (!$downloadUrl) {
                $downloadUrl = "https://api.purpurmc.org/v2/purpur/{$version}/latest/download";
            }
        }

        // 3. Fabric
        elseif ($loader === 'fabric') {
            try {
                $loaderMeta = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get('https://meta.fabricmc.net/v2/versions/loader')->json();
                $installerMeta = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get('https://meta.fabricmc.net/v2/versions/installer')->json();
                $loaderVersion = $loaderMeta[0]['version'] ?? '0.16.5';
                $installerVersion = $installerMeta[0]['version'] ?? '1.0.1';
                $downloadUrl = "https://meta.fabricmc.net/v2/versions/loader/{$version}/{$loaderVersion}/{$installerVersion}/server/jar";
            } catch (\Throwable $e) {}
        }

        // 4. NeoForge
        elseif ($loader === 'neoforge') {
            $neoMap = [
                '1.21.1' => '21.1.72',
                '1.21.0' => '21.0.167',
                '1.20.6' => '20.6.119',
                '1.20.4' => '20.4.237',
                '1.20.2' => '20.2.88',
            ];
            $neoBuild = $neoMap[$version] ?? '21.1.72';
            $downloadUrl = "https://maven.neoforged.net/releases/net/neoforged/neoforge/{$neoBuild}/neoforge-{$neoBuild}-installer.jar";
        }

        // 5. Minecraft Forge Normal
        elseif ($loader === 'forge') {
            $forgeMap = [
                '1.20.4' => '1.20.4-49.0.38',
                '1.20.2' => '1.20.2-48.1.0',
                '1.20.1' => '1.20.1-47.3.0',
                '1.19.4' => '1.19.4-45.2.0',
                '1.19.2' => '1.19.2-43.3.0',
                '1.18.2' => '1.18.2-40.2.0',
                '1.16.5' => '1.16.5-36.2.39',
                '1.12.2' => '1.12.2-14.23.5.2860',
                '1.7.10' => '1.7.10-10.13.4.1614-1.7.10',
            ];
            $forgeFull = $forgeMap[$version] ?? "{$version}-latest";
            $downloadUrl = "https://maven.minecraftforge.net/net/minecraftforge/forge/{$forgeFull}/forge-{$forgeFull}-installer.jar";
        }

        // 6. Mohist (Forge + Paper Hybrid)
        elseif ($loader === 'mohist') {
            $downloadUrl = "https://mohistmc.com/api/v2/projects/mohist/{$version}/builds/latest/download";
        }

        // 7. Spigot
        elseif ($loader === 'spigot') {
            $downloadUrl = "https://download.getbukkit.org/spigot/spigot-{$version}.jar";
        }

        // 8. Legacy Fabric
        elseif ($loader === 'legacyfabric') {
            $downloadUrl = "https://meta.legacyfabric.net/v2/versions/loader/{$version}/0.15.11/1.0.0/server/jar";
        }

        // 9. Velocity Proxy
        elseif ($loader === 'velocity') {
            try {
                $versionInfo = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])
                    ->get("https://fill.papermc.io/v3/projects/velocity/versions/{$version}")->json();
                $builds = $versionInfo['builds'] ?? [];
                if (!empty($builds)) {
                    $latestBuild = $builds[0];
                    $buildInfo = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])
                        ->get("https://fill.papermc.io/v3/projects/velocity/versions/{$version}/builds/{$latestBuild}")->json();
                    $downloadUrl = $buildInfo['downloads']['server:default']['url'] ?? null;
                }
            } catch (\Throwable $e) {}
        }

        // 10. Vanilla Mojang
        else {
            try {
                $manifest = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json')->json();
                foreach ($manifest['versions'] ?? [] as $item) {
                    if ($item['id'] === $version) {
                        $verDetail = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])->get($item['url'])->json();
                        $downloadUrl = $verDetail['downloads']['server']['url'] ?? null;
                        break;
                    }
                }
            } catch (\Throwable $e) {}
        }

        if (!$downloadUrl) {
            return response()->json(['error' => "Impossible de résoudre le lien de téléchargement officiel pour {$loader} {$version}"], 422);
        }

        // Trigger Wings daemon pull
        $this->fileRepository->setServer($server)->pull($downloadUrl, '/', ['filename' => 'server.jar']);

        return response()->json([
            'success' => true,
            'message' => "Installation de {$loader} {$version} démarrée. Le fichier server.jar est en cours de téléchargement sur votre serveur.",
            'loader' => $loader,
            'version' => $version,
            'download_url' => $downloadUrl,
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
