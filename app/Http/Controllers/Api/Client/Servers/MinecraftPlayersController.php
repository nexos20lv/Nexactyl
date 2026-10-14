<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Repositories\Wings\DaemonCommandRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;

class MinecraftPlayersController extends ClientApiController
{
    public function __construct(
        private DaemonFileRepository $fileRepository,
        private DaemonCommandRepository $commandRepository
    ) {
        parent::__construct();
    }

    /**
     * Get online players, OPs, whitelist, and banned players.
     */
    public function index(Request $request, Server $server): JsonResponse
    {
        // 1. Read JSON files
        $ops = $this->readJsonFile($server, 'ops.json');
        $whitelist = $this->readJsonFile($server, 'whitelist.json');
        $banned = $this->readJsonFile($server, 'banned-players.json');

        // 2. Query online players via Minecraft Ping
        $pingResult = $this->queryServerStatus($server);

        return response()->json([
            'online' => $pingResult['players'],
            'online_count' => $pingResult['online_count'],
            'max_players' => $pingResult['max_players'],
            'server_online' => $pingResult['server_online'],
            'version' => $pingResult['version'],
            'motd' => $pingResult['motd'],
            'ops' => $ops,
            'whitelist' => $whitelist,
            'banned' => $banned,
        ]);
    }

    /**
     * Execute a player administration action via console.
     */
    public function action(Request $request, Server $server): JsonResponse
    {
        $request->validate([
            'action' => 'required|in:op,deop,kick,ban,pardon,whitelist_add,whitelist_remove,teleport,gamemode,whisper,kill',
            'player' => 'required|string|max:64',
            'reason' => 'nullable|string|max:255',
            'target' => 'nullable|string|max:64',
            'gamemode' => 'nullable|in:survival,creative,adventure,spectator',
            'message' => 'nullable|string|max:255',
        ]);

        $act = $request->input('action');
        $player = preg_replace('/[^a-zA-Z0-9_]/', '', $request->input('player'));
        $reason = trim($request->input('reason', ''));
        $target = preg_replace('/[^a-zA-Z0-9_]/', '', $request->input('target', ''));
        $gamemode = $request->input('gamemode', 'survival');
        $msg = trim($request->input('message', ''));

        $cmd = match ($act) {
            'op' => "op {$player}",
            'deop' => "deop {$player}",
            'kick' => !empty($reason) ? "kick {$player} {$reason}" : "kick {$player}",
            'ban' => !empty($reason) ? "ban {$player} {$reason}" : "ban {$player}",
            'pardon' => "pardon {$player}",
            'whitelist_add' => "whitelist add {$player}",
            'whitelist_remove' => "whitelist remove {$player}",
            'teleport' => !empty($target) ? "tp {$player} {$target}" : "tp {$player}",
            'gamemode' => "gamemode {$gamemode} {$player}",
            'whisper' => "tell {$player} {$msg}",
            'kill' => "kill {$player}",
        };

        try {
            $this->commandRepository->setServer($server)->send($cmd);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Impossible d\'envoyer la commande : le serveur doit être en cours d\'exécution.'], 400);
        }

        Activity::event('server:minecraft.player-action')
            ->subject($server)
            ->property(['action' => $act, 'player' => $player, 'command' => $cmd])
            ->log("Action joueur Minecraft : {$cmd}");

        return response()->json([
            'success' => true,
            'command' => $cmd,
            'message' => "Commande '{$cmd}' exécutée avec succès.",
        ]);
    }

    private function readJsonFile(Server $server, string $filename): array
    {
        try {
            $content = $this->fileRepository->setServer($server)->getContent($filename);
            $data = json_decode($content, true);
            return is_array($data) ? $data : [];
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Fast Minecraft TCP Server List Ping (SLP).
     */
    private function queryServerStatus(Server $server): array
    {
        $default = [
            'server_online' => false,
            'online_count' => 0,
            'max_players' => 0,
            'players' => [],
            'version' => null,
            'motd' => null,
        ];

        $allocation = $server->allocation;
        if (!$allocation) {
            return $default;
        }

        $host = $allocation->ip === '0.0.0.0' || str_starts_with($allocation->ip, '10.') || str_starts_with($allocation->ip, '192.168.') ? '127.0.0.1' : $allocation->ip;
        $port = (int) $allocation->port;

        $fp = @fsockopen($host, $port, $errno, $errstr, 1.2);
        if (!$fp) {
            return $default;
        }

        stream_set_timeout($fp, 1, 200000);

        try {
            // Handshake packet (protocol 47 = 1.8+, next_state = 1)
            $hostLen = strlen($host);
            $handshakeData = "\x00\x2f" . pack('c', $hostLen) . $host . pack('n', $port) . "\x01";
            $handshake = pack('c', strlen($handshakeData)) . $handshakeData;
            fwrite($fp, $handshake);

            // Status request packet
            fwrite($fp, "\x01\x00");

            // Read response length & packet id
            $len = $this->readVarInt($fp);
            if ($len < 1) {
                fclose($fp);
                return $default;
            }

            $packetId = $this->readVarInt($fp);
            $jsonLen = $this->readVarInt($fp);
            $json = '';
            while (strlen($json) < $jsonLen && !feof($fp)) {
                $chunk = fread($fp, min(4096, $jsonLen - strlen($json)));
                if ($chunk === false || strlen($chunk) === 0) break;
                $json .= $chunk;
            }

            fclose($fp);

            $data = json_decode($json, true);
            if (!is_array($data)) {
                return $default;
            }

            $players = [];
            if (isset($data['players']['sample']) && is_array($data['players']['sample'])) {
                foreach ($data['players']['sample'] as $p) {
                    $players[] = [
                        'name' => $p['name'] ?? 'Joueur',
                        'id' => $p['id'] ?? null,
                    ];
                }
            }

            $motdText = '';
            if (isset($data['description'])) {
                if (is_string($data['description'])) {
                    $motdText = $data['description'];
                } elseif (isset($data['description']['text'])) {
                    $motdText = $data['description']['text'];
                }
            }

            return [
                'server_online' => true,
                'online_count' => (int) ($data['players']['online'] ?? 0),
                'max_players' => (int) ($data['players']['max'] ?? 0),
                'players' => $players,
                'version' => $data['version']['name'] ?? null,
                'motd' => $motdText,
            ];
        } catch (\Throwable $e) {
            @fclose($fp);
            return $default;
        }
    }

    private function readVarInt($fp): int
    {
        $i = 0;
        $j = 0;
        while (true) {
            $byte = fgetc($fp);
            if ($byte === false) {
                return 0;
            }
            $k = ord($byte);
            $i |= ($k & 0x7f) << ($j++ * 7);
            if ($j > 5) {
                return 0;
            }
            if (($k & 0x80) !== 128) {
                break;
            }
        }
        return $i;
    }
}
