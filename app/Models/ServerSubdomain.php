<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServerSubdomain extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'server_subdomains';

    /**
     * Fields that can be mass assigned.
     */
    protected $fillable = [
        'server_id',
        'user_id',
        'subdomain',
        'domain',
        'port',
        'target',
        'protocol',
        'service',
        'cloudflare_id',
        'status',
    ];

    /**
     * Default casts.
     */
    protected $casts = [
        'server_id' => 'integer',
        'user_id' => 'integer',
        'port' => 'integer',
    ];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
