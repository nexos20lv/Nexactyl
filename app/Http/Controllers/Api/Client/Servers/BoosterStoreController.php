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
    private array $catalog = [
        'ram' => [
            1 => ['amount' => 1024, 'cost' => 50, 'label' => '+1 Go RAM DDR4/DDR5'],
            2 => ['amount' => 2048, 'cost' => 95, 'label' => '+2 Go RAM DDR4/DDR5'],
            3 => ['amount' => 4096, 'cost' => 180, 'label' => '+4 Go RAM DDR4/DDR5'],
            4 => ['amount' => 8192, 'cost' => 340, 'label' => '+8 Go RAM DDR4/DDR5'],
        ],
        'cpu' => [
            1 => ['amount' => 25, 'cost' => 35, 'label' => '+25% Coeur CPU'],
            2 => ['amount' => 50, 'cost' => 65, 'label' => '+50% Coeur CPU'],
            3 => ['amount' => 100, 'cost' => 120, 'label' => '+100% Coeur Dédié'],
            4 => ['amount' => 200, 'cost' => 220, 'label' => '+200% Dual-Core Boost'],
        ],
        'disk' => [
            1 => ['amount' => 10240, 'cost' => 25, 'label' => '+10 Go NVMe PCIe 4.0'],
            2 => ['amount' => 25600, 'cost' => 55, 'label' => '+25 Go NVMe PCIe 4.0'],
            3 => ['amount' => 51200, 'cost' => 100, 'label' => '+50 Go NVMe PCIe 4.0'],
            4 => ['amount' => 102400, 'cost' => 180, 'label' => '+100 Go NVMe Enterprise'],
        ],
        'backups' => [
            1 => ['amount' => 2, 'cost' => 20, 'label' => '+2 Slots Sauvegardes'],
            2 => ['amount' => 5, 'cost' => 45, 'label' => '+5 Slots Sauvegardes'],
            3 => ['amount' => 10, 'cost' => 80, 'label' => '+10 Slots Sauvegardes Cloud'],
        ],
    ];

    public function __construct(private BuildModificationService $buildModificationService)
    {
        parent::__construct();
    }

    public function balance(Request $request, Server $server): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'credits' => (int) ($user->credits ?? 0),
            'catalog' => $this->catalog,
            'server_limits' => [
                'memory' => $server->memory,
                'cpu' => $server->cpu,
                'disk' => $server->disk,
                'backups' => $server->backup_limit,
            ],
            'boosters' => DB::table('server_boosters')
                ->where('server_id', $server->id)
                ->orderByDesc('id')
                ->limit(15)
                ->get(),
        ]);
    }

    public function apply(Request $request, Server $server): JsonResponse
    {
        $request->validate([
            'type' => 'required|string|in:ram,cpu,disk,backups',
            'tier' => 'required|integer',
        ]);

        $user = $request->user();
        $type = $request->input('type');
        $tier = (int) $request->input('tier');

        if (!isset($this->catalog[$type][$tier])) {
            return response()->json(['error' => 'Palier de booster invalide.'], 422);
        }

        $item = $this->catalog[$type][$tier];
        $cost = $item['cost'];
        $amount = $item['amount'];

        if (($user->credits ?? 0) < $cost) {
            return response()->json(['error' => "Solde insuffisant ({$user->credits} cr). Requis : {$cost} cr."], 422);
        }

        DB::transaction(function () use ($user, $server, $type, $amount, $cost) {
            DB::table('users')->where('id', $user->id)->decrement('credits', $cost);
            DB::table('server_boosters')->insert([
                'server_id' => $server->id,
                'type' => $type,
                'amount' => $amount,
                'cost' => $cost,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $newMemory = $server->memory + ($type === 'ram' ? $amount : 0);
        $newCpu = $server->cpu + ($type === 'cpu' ? $amount : 0);
        $newDisk = $server->disk + ($type === 'disk' ? $amount : 0);
        $newBackups = $server->backup_limit + ($type === 'backups' ? $amount : 0);

        $this->buildModificationService->handle($server, [
            'memory' => $newMemory,
            'cpu' => $newCpu,
            'disk' => $newDisk,
            'backup_limit' => $newBackups,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booster activé avec succès ! Vos ressources ont été augmentées instantanément sans redémarrage.',
            'new_limits' => [
                'memory' => $newMemory,
                'cpu' => $newCpu,
                'disk' => $newDisk,
                'backups' => $newBackups,
            ],
            'remaining_credits' => (int) ($user->fresh()->credits ?? 0),
        ]);
    }
}
