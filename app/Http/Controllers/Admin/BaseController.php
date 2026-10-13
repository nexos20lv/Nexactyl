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
        $usersCount = User::count();
        $nodesCount = Node::count();
        $totalMemory = Server::sum('memory');
        $totalDisk = Server::sum('disk');

        return view('admin.index', [
            'version' => $this->version,
            'serversCount' => $serversCount,
            'usersCount' => $usersCount,
            'nodesCount' => $nodesCount,
            'totalMemory' => $totalMemory,
            'totalDisk' => $totalDisk,
        ]);
    }
}
