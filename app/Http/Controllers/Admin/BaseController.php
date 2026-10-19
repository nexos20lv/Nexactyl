<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Helpers\SoftwareVersionService;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Node;

class BaseController extends Controller
{
    /**
     * BaseController constructor.
     */
    public function __construct(private SoftwareVersionService $version)
    {
    }

    /**
     * Return the admin index view.
     */
    public function index(): View
    {
        $serversCount = Server::count();
        $suspendedCount = Server::where('status', 'suspended')->count();
        $activeServersCount = max(0, $serversCount - $suspendedCount);

        $usersCount = User::count();
        $nodesCount = Node::count();
        $totalMemory = Server::sum('memory');
        $totalDisk = Server::sum('disk');
        $totalCpu = Server::sum('cpu');

        $recentServers = Server::with(['user', 'node', 'allocation'])->latest()->take(6)->get();
        $recentUsers = User::latest()->take(6)->get();
        $nodes = Node::withCount('servers')->get();

        // Host system load & hardware metrics
        $hostLoad = function_exists('sys_getloadavg') ? sys_getloadavg() : [0.1, 0.1, 0.1];

        $memInfo = [];
        if (file_exists('/proc/meminfo')) {
            $lines = @file('/proc/meminfo') ?: [];
            foreach ($lines as $line) {
                if (preg_match('/^(\w+):\s+(\d+)/', $line, $matches)) {
                    $memInfo[$matches[1]] = (int) $matches[2];
                }
            }
        }
        $totalRam = isset($memInfo['MemTotal']) ? round($memInfo['MemTotal'] / 1024 / 1024, 1) : 0;
        $availRam = isset($memInfo['MemAvailable']) ? round($memInfo['MemAvailable'] / 1024 / 1024, 1) : 0;
        $usedRam = round(max(0, $totalRam - $availRam), 1);
        $ramPercent = $totalRam > 0 ? min(100, round(($usedRam / $totalRam) * 100)) : 0;

        $diskTotal = round(@disk_total_space('/') / 1024 / 1024 / 1024, 1);
        $diskFree = round(@disk_free_space('/') / 1024 / 1024 / 1024, 1);
        $diskUsed = round(max(0, $diskTotal - $diskFree), 1);
        $diskPercent = $diskTotal > 0 ? min(100, round(($diskUsed / $diskTotal) * 100)) : 0;

        return view('admin.index', [
            'version' => $this->version,
            'serversCount' => $serversCount,
            'activeServersCount' => $activeServersCount,
            'suspendedCount' => $suspendedCount,
            'usersCount' => $usersCount,
            'nodesCount' => $nodesCount,
            'totalMemory' => $totalMemory,
            'totalDisk' => $totalDisk,
            'totalCpu' => $totalCpu,
            'recentServers' => $recentServers,
            'recentUsers' => $recentUsers,
            'nodes' => $nodes,
            'hostLoad' => $hostLoad,
            'hostRam' => [
                'used' => $usedRam,
                'total' => $totalRam,
                'percent' => $ramPercent,
            ],
            'hostDisk' => [
                'used' => $diskUsed,
                'total' => $diskTotal,
                'percent' => $diskPercent,
            ],
        ]);
    }
}
