<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Services\Servers\BuildModificationService;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class BoosterStoreController extends ClientApiController
{
    public function __construct(
        private BuildModificationService $buildModificationService,
        private SettingsRepositoryInterface $settings,
    ) {
        parent::__construct();
    }

    private function getCatalog(): array
    {
        $costRam1 = (int) $this->settings->get('settings::nxslab:store:cost_ram_1gb', 50);
        $costCpu25 = (int) $this->settings->get('settings::nxslab:store:cost_cpu_25', 35);
        $costDisk10 = (int) $this->settings->get('settings::nxslab:store:cost_disk_10gb', 25);
        $costBackups2 = (int) $this->settings->get('settings::nxslab:store:cost_backups_2', 20);

        return [
            'ram' => [
                1 => ['amount' => 1024, 'cost' => $costRam1, 'label' => '+1 Go RAM DDR4/DDR5'],
                2 => ['amount' => 2048, 'cost' => (int) round($costRam1 * 1.9), 'label' => '+2 Go RAM DDR4/DDR5'],
                3 => ['amount' => 4096, 'cost' => (int) round($costRam1 * 3.6), 'label' => '+4 Go RAM DDR4/DDR5'],
                4 => ['amount' => 8192, 'cost' => (int) round($costRam1 * 6.8), 'label' => '+8 Go RAM DDR4/DDR5'],
            ],
            'cpu' => [
                1 => ['amount' => 25, 'cost' => $costCpu25, 'label' => '+25% Coeur CPU'],
                2 => ['amount' => 50, 'cost' => (int) round($costCpu25 * 1.85), 'label' => '+50% Coeur CPU'],
                3 => ['amount' => 100, 'cost' => (int) round($costCpu25 * 3.4), 'label' => '+100% Coeur Dédié'],
                4 => ['amount' => 200, 'cost' => (int) round($costCpu25 * 6.3), 'label' => '+200% Dual-Core Boost'],
            ],
            'disk' => [
                1 => ['amount' => 10240, 'cost' => $costDisk10, 'label' => '+10 Go NVMe PCIe 4.0'],
                2 => ['amount' => 25600, 'cost' => (int) round($costDisk10 * 2.2), 'label' => '+25 Go NVMe PCIe 4.0'],
                3 => ['amount' => 51200, 'cost' => (int) round($costDisk10 * 4.0), 'label' => '+50 Go NVMe PCIe 4.0'],
                4 => ['amount' => 102400, 'cost' => (int) round($costDisk10 * 7.2), 'label' => '+100 Go NVMe Enterprise'],
            ],
            'backups' => [
                1 => ['amount' => 2, 'cost' => $costBackups2, 'label' => '+2 Slots Sauvegardes'],
                2 => ['amount' => 5, 'cost' => (int) round($costBackups2 * 2.25), 'label' => '+5 Slots Sauvegardes'],
                3 => ['amount' => 10, 'cost' => (int) round($costBackups2 * 4.0), 'label' => '+10 Slots Sauvegardes Cloud'],
            ],
        ];
    }

    public function balance(Request $request, Server $server): JsonResponse
    {
        $enabled = (bool) $this->settings->get('settings::nxslab:store:enabled', true);
        $user = $request->user();
        return response()->json([
            'enabled' => $enabled,
            'credits' => (int) ($user->credits ?? 0),
            'catalog' => $this->getCatalog(),
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
        $enabled = (bool) $this->settings->get('settings::nxslab:store:enabled', true);
        if (!$enabled) {
            return response()->json(['error' => 'La boutique de boosters est actuellement désactivée par les administrateurs.'], 403);
        }

        $request->validate([
            'type' => 'required|string|in:ram,cpu,disk,backups',
            'tier' => 'required|integer',
        ]);

        $user = $request->user();
        $catalog = $this->getCatalog();

        // 1. Only server owner or root admin can purchase hardware boosters for this server
        if ($user->id !== $server->owner_id && !$user->root_admin) {
            return response()->json([
                'error' => 'Seul le propriétaire de ce serveur peut appliquer des boosters hardware.',
            ], 403);
        }

        $type = $request->input('type');
        $tier = (int) $request->input('tier');

        if (!isset($catalog[$type][$tier])) {
            return response()->json(['error' => 'Palier de booster invalide.'], 422);
        }

        $item = $catalog[$type][$tier];
        $cost = $item['cost'];
        $amount = $item['amount'];

        // 2. Atomic credit verification & deduction to prevent race conditions / double-spending
        try {
            DB::transaction(function () use ($user, $server, $type, $amount, $cost) {
                $affected = DB::table('users')
                    ->where('id', $user->id)
                    ->where('credits', '>=', $cost)
                    ->decrement('credits', $cost);

                if ($affected === 0) {
                    throw new \DomainException('INSUFFICIENT_CREDITS');
                }

                DB::table('server_boosters')->insert([
                    'server_id' => $server->id,
                    'type' => $type,
                    'amount' => $amount,
                    'cost' => $cost,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
        } catch (\DomainException) {
            $currentCredits = (int) (DB::table('users')->where('id', $user->id)->value('credits') ?? 0);
            return response()->json([
                'error' => "Solde insuffisant ({$currentCredits} cr). Requis : {$cost} cr.",
            ], 422);
        }

        $newMemory = $server->memory + ($type === 'ram' ? $amount : 0);
        $newCpu = $server->cpu + ($type === 'cpu' ? $amount : 0);
        $newDisk = $server->disk + ($type === 'disk' ? $amount : 0);
        $newBackups = $server->backup_limit + ($type === 'backups' ? $amount : 0);

        // 3. Preserve database_limit and allocation_limit so they are not wiped to 0
        $this->buildModificationService->handle($server, [
            'memory' => $newMemory,
            'cpu' => $newCpu,
            'disk' => $newDisk,
            'backup_limit' => $newBackups,
            'database_limit' => $server->database_limit,
            'allocation_limit' => $server->allocation_limit,
        ]);

        // 4. Log event in Pterodactyl activity log
        Activity::event('server:booster.apply')
            ->subject($server)
            ->property([
                'type' => $type,
                'amount' => $amount,
                'cost' => $cost,
            ])
            ->log();

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
