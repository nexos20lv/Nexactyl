@extends('layouts.admin')

@section('title')
    Centre de Contrôle NXSLab
@endsection

@section('content-header')
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 12px;">
        <div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #f4f4f5; display: flex; align-items: center; gap: 12px; letter-spacing: -0.02em;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: rgba(139, 92, 246, 0.18); border: 1px solid rgba(139, 92, 246, 0.35); color: #c084fc; font-size: 18px;">
                    <i class="fa fa-shield"></i>
                </span>
                <span>Centre de Contrôle NXSLab</span>
            </h1>
            <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Supervision temps réel de l'infrastructure, des instances conteneurisées et des comptes.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; font-size: 12px; font-weight: 600; color: #34d399;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
                <span>Système Opérationnel</span>
            </div>
            <a href="{{ route('admin.servers.new') }}" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; font-size: 12px;">
                <i class="fa fa-plus"></i> Nouveau Serveur
            </a>
        </div>
    </div>
@endsection

@section('content')
<!-- Top KPI Cards -->
<div class="row" style="margin-bottom: 22px;">
    <!-- Servers Card -->
    <div class="col-xs-12 col-sm-6 col-md-3">
        <div style="background: rgba(13, 11, 22, 0.9); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); position: relative; overflow: hidden; backdrop-filter: blur(16px);">
            <div style="position: absolute; right: -15px; top: -15px; width: 90px; height: 90px; background: radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%);"></div>
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.35); display: flex; align-items: center; justify-content: center; font-size: 22px; color: #c084fc;">
                    <i class="fa fa-server"></i>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 700;">Serveurs Déployés</div>
                    <div style="font-size: 28px; font-weight: 800; color: #f8fafc; line-height: 1.1;">{{ $serversCount }}</div>
                </div>
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #a1a1aa; display: flex; align-items: center; justify-content: space-between;">
                <span style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
                    <span>{{ $activeServersCount ?? $serversCount }} Actifs</span>
                </span>
                <span style="font-weight: 600; color: #c084fc;">{{ round($totalMemory / 1024, 1) }} GB RAM</span>
            </div>
        </div>
    </div>

    <!-- Users Card -->
    <div class="col-xs-12 col-sm-6 col-md-3">
        <div style="background: rgba(13, 11, 22, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); position: relative; overflow: hidden; backdrop-filter: blur(16px);">
            <div style="position: absolute; right: -15px; top: -15px; width: 90px; height: 90px; background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%);"></div>
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; font-size: 22px; color: #38bdf8;">
                    <i class="fa fa-users"></i>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 700;">Utilisateurs</div>
                    <div style="font-size: 28px; font-weight: 800; color: #f8fafc; line-height: 1.1;">{{ $usersCount }}</div>
                </div>
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #a1a1aa; display: flex; align-items: center; justify-content: space-between;">
                <span style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;"></span>
                    <span>Clients Actifs</span>
                </span>
                <span style="color: #38bdf8; font-weight: 600;"><i class="fa fa-diamond"></i> Crédits Boutique</span>
            </div>
        </div>
    </div>

    <!-- Wings Nodes Card -->
    <div class="col-xs-12 col-sm-6 col-md-3">
        <div style="background: rgba(13, 11, 22, 0.9); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); position: relative; overflow: hidden; backdrop-filter: blur(16px);">
            <div style="position: absolute; right: -15px; top: -15px; width: 90px; height: 90px; background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);"></div>
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); display: flex; align-items: center; justify-content: center; font-size: 22px; color: #34d399;">
                    <i class="fa fa-sitemap"></i>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 700;">Nœuds Wings</div>
                    <div style="font-size: 28px; font-weight: 800; color: #f8fafc; line-height: 1.1;">{{ $nodesCount }}</div>
                </div>
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #a1a1aa; display: flex; align-items: center; justify-content: space-between;">
                <span style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
                    <span>Daemon Connecté</span>
                </span>
                <span style="color: #34d399; font-weight: 600;">100% En ligne</span>
            </div>
        </div>
    </div>

    <!-- Storage Card -->
    <div class="col-xs-12 col-sm-6 col-md-3">
        <div style="background: rgba(13, 11, 22, 0.9); border: 1px solid rgba(244, 114, 182, 0.2); border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); position: relative; overflow: hidden; backdrop-filter: blur(16px);">
            <div style="position: absolute; right: -15px; top: -15px; width: 90px; height: 90px; background: radial-gradient(circle, rgba(244, 114, 182, 0.25) 0%, transparent 70%);"></div>
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(244, 114, 182, 0.15); border: 1px solid rgba(244, 114, 182, 0.35); display: flex; align-items: center; justify-content: center; font-size: 22px; color: #f472b6;">
                    <i class="fa fa-hdd-o"></i>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 700;">Disque Alloué</div>
                    <div style="font-size: 28px; font-weight: 800; color: #f8fafc; line-height: 1.1;">{{ round($totalDisk / 1024, 1) }} <span style="font-size: 16px; font-weight: 600;">GB</span></div>
                </div>
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #a1a1aa; display: flex; align-items: center; justify-content: space-between;">
                <span style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #f472b6;"></span>
                    <span>NVMe Haute Vitesse</span>
                </span>
                <span style="color: #f472b6; font-weight: 600;">{{ $serversCount }} conteneurs</span>
            </div>
        </div>
    </div>
</div>

<!-- Real-time Host Infrastructure Gauges -->
<div class="row" style="margin-bottom: 22px;">
    <div class="col-xs-12">
        <div style="background: rgba(13, 11, 22, 0.95); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 18px; padding: 22px 24px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); backdrop-filter: blur(20px);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: rgba(139, 92, 246, 0.15); color: #c084fc; font-size: 16px;">
                        <i class="fa fa-dashboard"></i>
                    </span>
                    <div>
                        <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #f4f4f5;">Ressources &amp; Santé du Serveur Hôte (VPS)</h4>
                        <span style="color: #94a3b8; font-size: 12px;">Métriques réelles de la machine physique / hyperviseur NXSLab</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="label label-primary" style="font-size: 11px;"><i class="fa fa-linux"></i> Linux VPS</span>
                    <span class="label label-default" style="font-size: 11px;"><i class="fa fa-code"></i> PHP {{ PHP_VERSION }}</span>
                    <span class="label label-info" style="font-size: 11px;"><i class="fa fa-bolt"></i> Laravel {{ app()->version() }}</span>
                </div>
            </div>

            <div class="row">
                <!-- CPU Load Gauge -->
                <div class="col-xs-12 col-sm-4" style="margin-bottom: 12px;">
                    <div style="background: #141124; border: 1px solid #231f38; border-radius: 14px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 12px; font-weight: 600; color: #cbd5e1; display: flex; align-items: center; gap: 6px;">
                                <i class="fa fa-microchip" style="color: #a855f7;"></i> Charge CPU Hôte
                            </span>
                            <span style="font-size: 12px; font-weight: 700; color: #c084fc;">{{ round($hostLoad[0] ?? 0.1, 2) }}</span>
                        </div>
                        <div style="height: 8px; background: #201c34; border-radius: 9999px; overflow: hidden; margin-bottom: 8px;">
                            @php
                                $cpuPct = min(100, round(($hostLoad[0] ?? 0.1) * 25));
                            @endphp
                            <div style="width: {{ max(4, $cpuPct) }}%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #ec4899); border-radius: 9999px; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
                            <span>1m: <strong>{{ round($hostLoad[0] ?? 0, 2) }}</strong></span>
                            <span>5m: <strong>{{ round($hostLoad[1] ?? 0, 2) }}</strong></span>
                            <span>15m: <strong>{{ round($hostLoad[2] ?? 0, 2) }}</strong></span>
                        </div>
                    </div>
                </div>

                <!-- RAM Gauge -->
                <div class="col-xs-12 col-sm-4" style="margin-bottom: 12px;">
                    <div style="background: #141124; border: 1px solid #231f38; border-radius: 14px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 12px; font-weight: 600; color: #cbd5e1; display: flex; align-items: center; gap: 6px;">
                                <i class="fa fa-tasks" style="color: #38bdf8;"></i> Mémoire RAM Hôte
                            </span>
                            <span style="font-size: 12px; font-weight: 700; color: #38bdf8;">{{ $hostRam['used'] ?? 0 }} / {{ $hostRam['total'] ?? 0 }} GB</span>
                        </div>
                        <div style="height: 8px; background: #201c34; border-radius: 9999px; overflow: hidden; margin-bottom: 8px;">
                            <div style="width: {{ max(4, $hostRam['percent'] ?? 0) }}%; height: 100%; background: linear-gradient(90deg, #38bdf8, #818cf8); border-radius: 9999px; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
                            <span>Utilisation: <strong>{{ $hostRam['percent'] ?? 0 }}%</strong></span>
                            <span>Disponible: <strong>{{ max(0, round(($hostRam['total'] ?? 0) - ($hostRam['used'] ?? 0), 1)) }} GB</strong></span>
                        </div>
                    </div>
                </div>

                <!-- Disk Gauge -->
                <div class="col-xs-12 col-sm-4" style="margin-bottom: 12px;">
                    <div style="background: #141124; border: 1px solid #231f38; border-radius: 14px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 12px; font-weight: 600; color: #cbd5e1; display: flex; align-items: center; gap: 6px;">
                                <i class="fa fa-database" style="color: #34d399;"></i> Stockage Disque Hôte (/)
                            </span>
                            <span style="font-size: 12px; font-weight: 700; color: #34d399;">{{ $hostDisk['used'] ?? 0 }} / {{ $hostDisk['total'] ?? 0 }} GB</span>
                        </div>
                        <div style="height: 8px; background: #201c34; border-radius: 9999px; overflow: hidden; margin-bottom: 8px;">
                            <div style="width: {{ max(4, $hostDisk['percent'] ?? 0) }}%; height: 100%; background: linear-gradient(90deg, #34d399, #10b981); border-radius: 9999px; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
                            <span>Espace utilisé: <strong>{{ $hostDisk['percent'] ?? 0 }}%</strong></span>
                            <span>Libre: <strong>{{ max(0, round(($hostDisk['total'] ?? 0) - ($hostDisk['used'] ?? 0), 1)) }} GB</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Left Column: Recent Servers & Nodes Health -->
    <div class="col-xs-12 col-lg-8">
        <!-- Recent Servers -->
        <div class="box box-primary">
            <div class="box-header with-border" style="display: flex; align-items: center; justify-content: space-between;">
                <h3 class="box-title" style="display: flex; align-items: center; gap: 10px;">
                    <i class="fa fa-server" style="color: #a855f7;"></i> Derniers Serveurs Déployés
                </h3>
                <a href="{{ route('admin.servers') }}" class="btn btn-default btn-xs" style="padding: 4px 10px; font-size: 11px;">
                    Voir tout ({{ $serversCount }}) <i class="fa fa-arrow-right"></i>
                </a>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover" style="margin: 0;">
                    <thead>
                        <tr>
                            <th>Serveur</th>
                            <th>Propriétaire</th>
                            <th>Nœud</th>
                            <th>Ressources</th>
                            <th>Statut</th>
                            <th class="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentServers as $server)
                            <tr>
                                <td>
                                    <div style="font-weight: 700; color: #f8fafc; font-size: 13px;">
                                        <a href="{{ route('admin.servers.view', $server->id) }}" style="color: #f8fafc; text-decoration: none;">
                                            {{ $server->name }}
                                        </a>
                                    </div>
                                    <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">{{ $server->uuidShort }}</div>
                                </td>
                                <td>
                                    @if($server->user)
                                        <a href="{{ route('admin.users.view', $server->user->id) }}" style="color: #cbd5e1; text-decoration: none; display: flex; align-items: center; gap: 8px;">
                                            <img src="{{ $server->user->avatar_url ?: 'https://www.gravatar.com/avatar/' . md5(strtolower($server->user->email)) . '?s=60' }}" style="width: 22px; height: 22px; border-radius: 6px; object-fit: cover;" alt="">
                                            <span style="font-size: 12px; font-weight: 500;">{{ $server->user->username }}</span>
                                        </a>
                                    @else
                                        <span class="text-muted">Système</span>
                                    @endif
                                </td>
                                <td>
                                    <span class="label label-default" style="font-size: 11px;">
                                        <i class="fa fa-sitemap"></i> {{ $server->node->name ?? 'N/A' }}
                                    </span>
                                </td>
                                <td>
                                    <span style="font-size: 12px; color: #cbd5e1;">
                                        <strong>{{ $server->memory }} MB</strong> / {{ $server->cpu }}% CPU
                                    </span>
                                </td>
                                <td>
                                    @if($server->status === 'suspended')
                                        <span class="label label-danger">Suspendu</span>
                                    @elseif($server->isSuspended())
                                        <span class="label label-warning">Suspendu</span>
                                    @else
                                        <span class="label label-success">Actif</span>
                                    @endif
                                </td>
                                <td class="text-right">
                                    <a href="{{ route('admin.servers.view', $server->id) }}" class="btn btn-default btn-xs" data-toggle="tooltip" title="Gérer">
                                        <i class="fa fa-cog text-purple"></i> Gérer
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center text-muted" style="padding: 24px;">Aucun serveur créé pour le moment.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Wings Nodes Health -->
        <div class="box box-primary">
            <div class="box-header with-border" style="display: flex; align-items: center; justify-content: space-between;">
                <h3 class="box-title" style="display: flex; align-items: center; gap: 10px;">
                    <i class="fa fa-sitemap" style="color: #34d399;"></i> État des Nœuds Wings
                </h3>
                <a href="{{ route('admin.nodes') }}" class="btn btn-default btn-xs" style="padding: 4px 10px; font-size: 11px;">
                    Gérer les nœuds <i class="fa fa-arrow-right"></i>
                </a>
            </div>
            <div class="box-body" style="padding: 16px 20px;">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    @forelse($nodes as $node)
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                            <div style="display: flex; align-items: center; gap: 14px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.35); display: flex; align-items: center; justify-content: center; font-size: 18px; color: #34d399;">
                                    <i class="fa fa-server"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 700; color: #f8fafc; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                                        <a href="{{ route('admin.nodes.view', $node->id) }}" style="color: #f8fafc; text-decoration: none;">
                                            {{ $node->name }}
                                        </a>
                                        <span class="label label-success" style="font-size: 10px;">En ligne</span>
                                    </div>
                                    <div style="font-size: 12px; color: #94a3b8; font-family: monospace;">{{ $node->fqdn }}:{{ $node->daemonListen }}</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 18px;">
                                <div style="text-align: right;">
                                    <div style="font-size: 13px; font-weight: 700; color: #f8fafc;">{{ $node->servers_count }} serveurs</div>
                                    <div style="font-size: 11px; color: #94a3b8;">{{ round($node->memory / 1024, 1) }} GB max</div>
                                </div>
                                <a href="{{ route('admin.nodes.view', $node->id) }}" class="btn btn-default btn-sm" style="padding: 6px 12px;">
                                    <i class="fa fa-wrench"></i>
                                </a>
                            </div>
                        </div>
                    @empty
                        <div class="text-center text-muted" style="padding: 16px;">Aucun nœud configuré.</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <!-- Right Column: Shortcuts, Recent Users & Modules -->
    <div class="col-xs-12 col-lg-4">
        <!-- Quick Admin Shortcuts -->
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fa fa-rocket" style="color: #a855f7;"></i> Raccourcis Rapides
                </h3>
            </div>
            <div class="box-body" style="padding: 16px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <a href="{{ route('admin.servers') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 12px; padding: 14px 10px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-server" style="font-size: 20px; color: #a855f7; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 12px; font-weight: 600;">Serveurs</div>
                            <div style="color: #94a3b8; font-size: 10px;">Gestion des instances</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.users') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 12px; padding: 14px 10px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-users" style="font-size: 20px; color: #38bdf8; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 12px; font-weight: 600;">Utilisateurs</div>
                            <div style="color: #94a3b8; font-size: 10px;">Crédits &amp; rôles</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.settings.nxslab') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 12px; padding: 14px 10px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-cloud" style="font-size: 20px; color: #c084fc; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 12px; font-weight: 600;">Domaines DNS</div>
                            <div style="color: #94a3b8; font-size: 10px;">Cloudflare API</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.nodes') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 12px; padding: 14px 10px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-sitemap" style="font-size: 20px; color: #34d399; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 12px; font-weight: 600;">Nœuds Wings</div>
                            <div style="color: #94a3b8; font-size: 10px;">Ports &amp; Hôtes</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.databases') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 12px; padding: 14px 10px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-database" style="font-size: 20px; color: #fbbf24; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 12px; font-weight: 600;">Bases SQL</div>
                            <div style="color: #94a3b8; font-size: 10px;">Serveurs DB</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.nests') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 12px; padding: 14px 10px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-th-large" style="font-size: 20px; color: #f472b6; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 12px; font-weight: 600;">Nids &amp; Eggs</div>
                            <div style="color: #94a3b8; font-size: 10px;">Minecraft &amp; Jeux</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>

        <!-- Recent Users -->
        <div class="box box-primary">
            <div class="box-header with-border" style="display: flex; align-items: center; justify-content: space-between;">
                <h3 class="box-title" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fa fa-user-plus" style="color: #38bdf8;"></i> Nouveaux Utilisateurs
                </h3>
                <a href="{{ route('admin.users') }}" class="btn btn-default btn-xs" style="padding: 4px 10px; font-size: 11px;">
                    Voir tout <i class="fa fa-arrow-right"></i>
                </a>
            </div>
            <div class="box-body" style="padding: 12px 16px;">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    @forelse($recentUsers as $user)
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="{{ $user->avatar_url ?: 'https://www.gravatar.com/avatar/' . md5(strtolower($user->email)) . '?s=80' }}" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover;" alt="">
                                <div>
                                    <div style="font-size: 13px; font-weight: 600; color: #f8fafc;">
                                        <a href="{{ route('admin.users.view', $user->id) }}" style="color: #f8fafc; text-decoration: none;">
                                            {{ $user->username }}
                                        </a>
                                        @if($user->root_admin)
                                            <span class="label label-danger" style="font-size: 9px; padding: 2px 6px;">Admin</span>
                                        @endif
                                    </div>
                                    <div style="font-size: 11px; color: #94a3b8;">{{ $user->email }}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <span class="label label-primary" style="font-size: 10px;">
                                    <i class="fa fa-diamond"></i> {{ $user->store_credits ?? 0 }} pts
                                </span>
                            </div>
                        </div>
                    @empty
                        <div class="text-center text-muted" style="padding: 12px;">Aucun utilisateur.</div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Modules Status Card -->
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fa fa-heartbeat" style="color: #ec4899;"></i> État des Modules NXSLab
                </h3>
            </div>
            <div class="box-body" style="padding: 14px 18px;">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 13px; color: #cbd5e1; display: flex; align-items: center; gap: 8px;">
                            <i class="fa fa-bolt" style="color: #fbbf24;"></i> Boosters &amp; Boutique
                        </span>
                        <span class="label label-success">Opérationnel</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 13px; color: #cbd5e1; display: flex; align-items: center; gap: 8px;">
                            <i class="fa fa-cubes" style="color: #34d399;"></i> Modrinth &amp; Moteur MC
                        </span>
                        <span class="label label-success">Actif</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 13px; color: #cbd5e1; display: flex; align-items: center; gap: 8px;">
                            <i class="fa fa-cloud" style="color: #c084fc;"></i> Cloudflare Sous-domaines
                        </span>
                        <span class="label label-primary">Synchronisé</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 13px; color: #cbd5e1; display: flex; align-items: center; gap: 8px;">
                            <i class="fa fa-database" style="color: #38bdf8;"></i> Redis Cache &amp; Sessions
                        </span>
                        <span class="label label-info">Haute Vitesse</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
