<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class ModManagerController extends ClientApiController
{
    private const CURSEFORGE_KEY = '$2a$10$bL4bIL5pUWqfcO7KQtnMReakwtfHbNKh6v1uTpKlzhwoueEJQnPnm';

    public function __construct(private DaemonFileRepository $fileRepository)
    {
        parent::__construct();
    }

    /**
     * Search mods/plugins on Modrinth or CurseForge.
     */
    public function search(Request $request, Server $server): JsonResponse
    {
        $this->assertMinecraftServer($server);
        $source = $request->query('source', 'modrinth');
        $query = $request->query('query', '');
        $loader = $request->query('loader', 'paper');
        $version = $request->query('version', '1.21.1');
        $limit = min((int) $request->query('limit', 24), 50);

        // 1. CURSEFORGE SEARCH
        if ($source === 'curseforge') {
            try {
                $isPlugin = in_array($loader, ['paper', 'purpur', 'spigot']);
                $classId = $isPlugin ? 5 : 6; // 5 = Bukkit Plugins, 6 = Mods

                // ModLoaderType: 1 = Forge, 4 = Fabric, 6 = NeoForge
                $modLoaderType = null;
                if (!$isPlugin) {
                    if ($loader === 'fabric' || $loader === 'legacyfabric') {
                        $modLoaderType = 4;
                    } elseif ($loader === 'neoforge') {
                        $modLoaderType = 6;
                    } elseif ($loader === 'forge' || $loader === 'mohist') {
                        $modLoaderType = 1;
                    }
                }

                $params = [
                    'gameId' => 432,
                    'classId' => $classId,
                    'searchFilter' => $query,
                    'pageSize' => $limit,
                    'sortField' => 2, // Popularity
                    'sortOrder' => 'desc',
                ];
                if ($modLoaderType) {
                    $params['modLoaderType'] = $modLoaderType;
                }
                if (!empty($version)) {
                    $params['gameVersion'] = $version;
                }

                $res = Http::withHeaders([
                    'Accept' => 'application/json',
                    'x-api-key' => self::CURSEFORGE_KEY,
                    'User-Agent' => 'NXSLab-Cloud/1.0',
                ])->get('https://api.curseforge.com/v1/mods/search', $params);

                if ($res->successful()) {
                    $data = $res->json('data') ?? [];
                    $hits = [];
                    foreach ($data as $m) {
                        $hits[] = [
                            'project_id' => (string) $m['id'],
                            'slug' => $m['slug'] ?? '',
                            'title' => $m['name'] ?? '',
                            'description' => $m['summary'] ?? '',
                            'icon_url' => $m['logo']['thumbnailUrl'] ?? $m['logo']['url'] ?? null,
                            'downloads' => (int) ($m['downloadCount'] ?? 0),
                            'author' => $m['authors'][0]['name'] ?? 'Auteur vérifié',
                            'source' => 'curseforge',
                        ];
                    }
                    return response()->json(['hits' => $hits]);
                }
            } catch (\Throwable $e) {}

            return response()->json(['hits' => []]);
        }

        // 2. MODRINTH SEARCH (Default)
        $facets = [];
        if (in_array($loader, ['paper', 'purpur', 'spigot'])) {
            $facets[] = ['project_type:plugin'];
        } else {
            $facets[] = ['project_type:mod'];
            $categories = [];
            if ($loader === 'fabric' || $loader === 'legacyfabric') {
                $categories[] = 'categories:fabric';
            } elseif ($loader === 'neoforge') {
                $categories[] = 'categories:neoforge';
            } elseif ($loader === 'forge' || $loader === 'mohist') {
                $categories[] = 'categories:forge';
            }
            if (!empty($categories)) {
                $facets[] = $categories;
            }
        }
        if (!empty($version)) {
            $facets[] = ["versions:{$version}"];
        }

        $res = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])
            ->get('https://api.modrinth.com/v2/search', [
                'query' => $query,
                'facets' => json_encode($facets),
                'limit' => $limit,
            ]);

        $rawHits = $res->json('hits') ?? [];
        $hits = [];
        foreach ($rawHits as $m) {
            $hits[] = [
                'project_id' => $m['project_id'],
                'slug' => $m['slug'],
                'title' => $m['title'],
                'description' => $m['description'],
                'icon_url' => $m['icon_url'],
                'downloads' => (int) ($m['downloads'] ?? 0),
                'author' => $m['author'] ?? 'Modrinth Creator',
                'source' => 'modrinth',
            ];
        }

        return response()->json(['hits' => $hits]);
    }

    /**
     * Install mod or plugin from either Modrinth or CurseForge.
     */
    public function install(Request $request, Server $server): JsonResponse
    {
        $this->assertMinecraftServer($server);
        $request->validate([
            'project_id' => 'required|string',
            'loader' => 'required|string',
            'version' => 'nullable|string',
            'source' => 'nullable|string|in:modrinth,curseforge',
        ]);

        $projectId = $request->input('project_id');
        $loader = $request->input('loader');
        $version = $request->input('version');
        $source = $request->input('source', 'modrinth');

        $directory = in_array($loader, ['paper', 'purpur', 'spigot']) ? '/plugins' : '/mods';
        $fileUrl = null;
        $fileName = null;

        // 1. CURSEFORGE INSTALL
        if ($source === 'curseforge') {
            try {
                $res = Http::withHeaders([
                    'Accept' => 'application/json',
                    'x-api-key' => self::CURSEFORGE_KEY,
                    'User-Agent' => 'NXSLab-Cloud/1.0',
                ])->get("https://api.curseforge.com/v1/mods/{$projectId}/files?pageSize=20");

                $files = $res->json('data') ?? [];
                if (!empty($files)) {
                    // Pick the most compatible file
                    $bestFile = $files[0];
                    if (!empty($version)) {
                        foreach ($files as $f) {
                            $gameVersions = $f['gameVersions'] ?? [];
                            if (in_array($version, $gameVersions)) {
                                $bestFile = $f;
                                break;
                            }
                        }
                    }

                    $fileName = $bestFile['fileName'] ?? "curseforge-{$projectId}.jar";
                    $fileUrl = $bestFile['downloadUrl'] ?? null;

                    // Fallback to Edge CDN formula if author restricted direct api downloadUrl
                    if (!$fileUrl && !empty($bestFile['id'])) {
                        $fId = (string) $bestFile['id'];
                        $p1 = substr($fId, 0, 4);
                        $p2 = substr($fId, 4);
                        $fileUrl = "https://edge.forgecdn.net/files/{$p1}/{$p2}/" . rawurlencode($fileName);
                    }
                }
            } catch (\Throwable $e) {}
        }

        // 2. MODRINTH INSTALL
        else {
            try {
                $params = ['loaders' => json_encode([$loader])];
                if (!empty($version)) {
                    $params['game_versions'] = json_encode([$version]);
                }

                $res = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])
                    ->get("https://api.modrinth.com/v2/project/{$projectId}/version", $params);

                $versionsList = $res->json() ?? [];
                if (empty($versionsList)) {
                    $res = Http::withHeaders(['User-Agent' => 'NXSLab-Cloud/1.0'])
                        ->get("https://api.modrinth.com/v2/project/{$projectId}/version");
                    $versionsList = $res->json() ?? [];
                }

                if (!empty($versionsList[0]['files'][0]['url'])) {
                    $file = $versionsList[0]['files'][0];
                    $fileUrl = $file['url'];
                    $fileName = $file['filename'];
                }
            } catch (\Throwable $e) {}
        }

        if (!$fileUrl || !$fileName) {
            return response()->json(['error' => 'Aucun fichier jar compatible trouvé pour cette ressource.'], 422);
        }

        $this->fileRepository->setServer($server)->pull($fileUrl, $directory, ['filename' => $fileName]);

        return response()->json([
            'success' => true,
            'message' => "Installation de {$fileName} lancée via Wings dans le dossier {$directory}",
            'filename' => $fileName,
            'directory' => $directory,
            'source' => $source,
        ]);
    }

    protected function assertMinecraftServer(Server $server): void
    {
        $isMinecraft = ($server->nest_id === 1)
            || (stripos($server->egg->name ?? '', 'minecraft') !== false)
            || (isset($server->egg->nest) && stripos($server->egg->nest->name ?? '', 'minecraft') !== false)
            || in_array('eula', $server->egg->inherit_features ?? []);

        if (!$isMinecraft) {
            abort(400, 'Ce gestionnaire de mods et plugins est réservé exclusivement aux serveurs Minecraft.');
        }
    }
}
