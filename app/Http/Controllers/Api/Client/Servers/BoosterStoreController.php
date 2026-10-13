<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Services\Servers\BuildModificationService;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class BoosterStoreController extends ClientApiController
{
    public function __construct(private BuildModificationService $buildModificationService)
    {
        parent::__construct();
    }

    public function balance(Request $request, Server $server): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'credits' => $user->credits ?? 2500,
            'server_limits' => [
                'memory' => $server->memory,
                'cpu' => $server->cpu,
                'disk' => $server->disk,
            ],
            'boosters' => DB::table('server_boosters')->where('server_id', $server->id)->get(),
        ]);
    }

    public function apply(Request $request, Server $server): JsonResponse
    {
        $request->validate([
            'type' => 'required|string|in:ram,cpu,disk',
        ]);

        $user = $request->user();
        $type = $request->input('type');

        $catalog = [
            'ram' => ['amount' => 1024, 'cost' => 250, 'field' => 'memory'],
            'cpu' => ['amount' => 50, 'cost' => 300, 'field' => 'cpu'],
            'disk' => ['amount' => 20480, 'cost' => 150, 'field' => 'disk'],
        ];

        $item = $catalog[$type];

        if (($user->credits ?? 0) < $item['cost']) {
            return response()->json(['error' => 'Solde de crédits insuffisant pour ce booster'], 422);
        }

        // Deduct credits and log booster
        DB::transaction(function () use ($user, $server, $type, $item) {
            DB::table('users')->where('id', $user->id)->decrement('credits', $item['cost']);
            DB::table('server_boosters')->insert([
                'server_id' => $server->id,
                'type' => $type,
                'amount' => $item['amount'],
                'cost' => $item['cost'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        // Apply new server limits and sync instantly to Wings container
        $newMemory = $server->memory + ($type === 'ram' ? $item['amount'] : 0);
        $newCpu = $server->cpu + ($type === 'cpu' ? $item['amount'] : 0);
        $newDisk = $server->disk + ($type === 'disk' ? $item['amount'] : 0);

        $this->buildModificationService->handle($server, [
            'memory' => $newMemory,
            'cpu' => $newCpu,
            'disk' => $newDisk,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Booster {$type} activé avec succès ! Limites mises à jour sans interruption.",
            'new_limits' => [
                'memory' => $newMemory,
                'cpu' => $newCpu,
                'disk' => $newDisk,
            ],
            'remaining_credits' => $user->fresh()->credits,
        ]);
    }
}
