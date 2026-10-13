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
    public function __construct(private DaemonFileRepository $fileRepository)
    {
        parent::__construct();
    }

    public function search(Request $request, Server $server): JsonResponse
    {
        $query = $request->query('query', '');
        $loader = $request->query('loader', 'paper');
        $version = $request->query('version', '1.21.1');
        $limit = min((int) $request->query('limit', 20), 50);

        $facets = [];
        if (in_array($loader, ['paper', 'purpur', 'spigot'])) {
            $facets[] = ['project_type:plugin'];
        } else {
            $facets[] = ['project_type:mod'];
            $facets[] = ["categories:{$loader}"];
        }
        if (!empty($version)) {
            $facets[] = ["versions:{$version}"];
        }

        $res = Http::withHeaders(['User-Agent' => 'Pterodactyl-Custom-Panel/1.0'])
            ->get('https://api.modrinth.com/v2/search', [
                'query' => $query,
                'facets' => json_encode($facets),
                'limit' => $limit,
            ]);

        return response()->json($res->json() ?? ['hits' => []]);
    }

    public function install(Request $request, Server $server): JsonResponse
    {
        $request->validate([
            'project_id' => 'required|string',
            'loader' => 'required|string',
            'version' => 'nullable|string',
        ]);

        $projectId = $request->input('project_id');
        $loader = $request->input('loader');
        $version = $request->input('version');

        $params = ['loaders' => json_encode([$loader])];
        if (!empty($version)) {
            $params['game_versions'] = json_encode([$version]);
        }

        $res = Http::withHeaders(['User-Agent' => 'Pterodactyl-Custom-Panel/1.0'])
            ->get("https://api.modrinth.com/v2/project/{$projectId}/version", $params);

        $versionsList = $res->json() ?? [];
        if (empty($versionsList)) {
            // retry without version constraint
            $res = Http::withHeaders(['User-Agent' => 'Pterodactyl-Custom-Panel/1.0'])
                ->get("https://api.modrinth.com/v2/project/{$projectId}/version");
            $versionsList = $res->json() ?? [];
        }

        if (empty($versionsList[0]['files'][0]['url'])) {
            return response()->json(['error' => 'Aucun fichier compatible trouvé sur Modrinth'], 422);
        }

        $file = $versionsList[0]['files'][0];
        $fileUrl = $file['url'];
        $fileName = $file['filename'];

        $directory = in_array($loader, ['paper', 'purpur', 'spigot']) ? '/plugins' : '/mods';

        $this->fileRepository->setServer($server)->pull($fileUrl, $directory, ['filename' => $fileName]);

        return response()->json([
            'success' => true,
            'message' => "Installation de {$fileName} lancée dans {$directory}",
            'filename' => $fileName,
            'directory' => $directory,
        ]);
    }
}
