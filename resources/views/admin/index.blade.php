@extends('layouts.admin')

@section('title')
    Tableau de Bord NXSLab
@endsection

@section('content-header')
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
        <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f4f4f5; display: flex; align-items: center; gap: 10px;">
                <i class="fa fa-shield" style="color: #a855f7;"></i> Centre d'Administration NXSLab
            </h1>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Gestion globale des serveurs, utilisateurs, crédits et nœuds d'infrastructure.</p>
        </div>
        <ol class="breadcrumb" style="position: static; float: none; background: transparent; padding: 0; margin: 0;">
            <li><a href="{{ route('admin.index') }}" style="color: #94a3b8;"><i class="fa fa-dashboard"></i> Admin</a></li>
            <li class="active" style="color: #c084fc;">Aperçu</li>
        </ol>
    </div>
@endsection

@section('content')
<!-- KPI Cards -->
<div class="row" style="margin-bottom: 20px;">
    <div class="col-xs-12 col-sm-6 col-md-3">
        <div style="background: #0f0d1b; border: 1px solid #231f38; border-radius: 12px; padding: 18px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); position: relative; overflow: hidden;">
            <div style="position: absolute; right: -10px; top: -10px; width: 70px; height: 70px; background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%);"></div>
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.35); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #c084fc;">
                    <i class="fa fa-server"></i>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 600;">Serveurs Actifs</div>
                    <div style="font-size: 26px; font-weight: 800; color: #f8fafc; line-height: 1.1;">{{ $serversCount }}</div>
                </div>
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: #a1a1aa; display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
                <span>{{ round($totalMemory / 1024, 1) }} GB RAM allouée</span>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-sm-6 col-md-3">
        <div style="background: #0f0d1b; border: 1px solid #231f38; border-radius: 12px; padding: 18px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); position: relative; overflow: hidden;">
            <div style="position: absolute; right: -10px; top: -10px; width: 70px; height: 70px; background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%);"></div>
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #38bdf8;">
                    <i class="fa fa-users"></i>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 600;">Utilisateurs</div>
                    <div style="font-size: 26px; font-weight: 800; color: #f8fafc; line-height: 1.1;">{{ $usersCount }}</div>
                </div>
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: #a1a1aa; display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;"></span>
                <span>Crédits gérables en direct</span>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-sm-6 col-md-3">
        <div style="background: #0f0d1b; border: 1px solid #231f38; border-radius: 12px; padding: 18px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); position: relative; overflow: hidden;">
            <div style="position: absolute; right: -10px; top: -10px; width: 70px; height: 70px; background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);"></div>
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #34d399;">
                    <i class="fa fa-sitemap"></i>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 600;">Nœuds Wings</div>
                    <div style="font-size: 26px; font-weight: 800; color: #f8fafc; line-height: 1.1;">{{ $nodesCount }}</div>
                </div>
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: #a1a1aa; display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
                <span>Daemon actif & synchronisé</span>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-sm-6 col-md-3">
        <div style="background: #0f0d1b; border: 1px solid #231f38; border-radius: 12px; padding: 18px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); position: relative; overflow: hidden;">
            <div style="position: absolute; right: -10px; top: -10px; width: 70px; height: 70px; background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);"></div>
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(236, 72, 153, 0.15); border: 1px solid rgba(236, 72, 153, 0.35); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #f472b6;">
                    <i class="fa fa-cubes"></i>
                </div>
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; font-weight: 600;">Plateforme</div>
                    <div style="font-size: 22px; font-weight: 800; color: #f8fafc; line-height: 1.2;">NXSLab v1.12</div>
                </div>
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: #a1a1aa; display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #a855f7;"></span>
                <span>Obsidian & Violet Design</span>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Infrastructure & System Health -->
    <div class="col-xs-12 col-md-7">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fa fa-heartbeat" style="color: #ec4899;"></i> État des Services & Modules NXSLab
                </h3>
            </div>
            <div class="box-body" style="padding: 16px 20px;">
                <div style="display: flex; flex-direction: column; gap: 14px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #1e1b2e;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fa fa-bolt" style="color: #fbbf24; font-size: 16px;"></i>
                            <div>
                                <strong style="color: #f1f5f9; font-size: 14px;">Boutique & Boosters Hardware</strong>
                                <div style="color: #94a3b8; font-size: 12px;">Paliers CPU, RAM, NVMe avec application à chaud sans reboot</div>
                            </div>
                        </div>
                        <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; padding: 4px 10px; font-size: 11px; font-weight: 600;">Opérationnel</span>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #1e1b2e;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fa fa-cubes" style="color: #34d399; font-size: 16px;"></i>
                            <div>
                                <strong style="color: #f1f5f9; font-size: 14px;">Moteur Minecraft & Modrinth API</strong>
                                <div style="color: #94a3b8; font-size: 12px;">PaperMC, Fabric, Purpur, NeoForge & recherche Modrinth 1-clic</div>
                            </div>
                        </div>
                        <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; padding: 4px 10px; font-size: 11px; font-weight: 600;">Actif</span>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #1e1b2e;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fa fa-diamond" style="color: #a855f7; font-size: 16px;"></i>
                            <div>
                                <strong style="color: #f1f5f9; font-size: 14px;">Gestion des Crédits Utilisateurs</strong>
                                <div style="color: #94a3b8; font-size: 12px;">Ajustement instantané du solde des clients depuis l'onglet Utilisateurs</div>
                            </div>
                        </div>
                        <span style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 9999px; padding: 4px 10px; font-size: 11px; font-weight: 600;">Connecté</span>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fa fa-database" style="color: #38bdf8; font-size: 16px;"></i>
                            <div>
                                <strong style="color: #f1f5f9; font-size: 14px;">Cache & Sessions Redis</strong>
                                <div style="color: #94a3b8; font-size: 12px;">Gestion mémoire haute performance et zéro verrouillage disque</div>
                            </div>
                        </div>
                        <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 9999px; padding: 4px 10px; font-size: 11px; font-weight: 600;">Haute Performance</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Admin Shortcuts -->
    <div class="col-xs-12 col-md-5">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fa fa-rocket" style="color: #a855f7;"></i> Raccourcis d'Administration
                </h3>
            </div>
            <div class="box-body" style="padding: 16px 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <a href="{{ route('admin.servers') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 10px; padding: 14px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-server" style="font-size: 20px; color: #a855f7; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 13px; font-weight: 600;">Serveurs</div>
                            <div style="color: #94a3b8; font-size: 11px;">Gestion & limites</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.users') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 10px; padding: 14px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-users" style="font-size: 20px; color: #38bdf8; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 13px; font-weight: 600;">Utilisateurs</div>
                            <div style="color: #94a3b8; font-size: 11px;">Comptes & crédits</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.nodes') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 10px; padding: 14px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-sitemap" style="font-size: 20px; color: #34d399; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 13px; font-weight: 600;">Nœuds Wings</div>
                            <div style="color: #94a3b8; font-size: 11px;">Allocations & hôtes</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.databases') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 10px; padding: 14px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-database" style="font-size: 20px; color: #fbbf24; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 13px; font-weight: 600;">Bases SQL</div>
                            <div style="color: #94a3b8; font-size: 11px;">Hôtes de base</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.nests') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 10px; padding: 14px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-th-large" style="font-size: 20px; color: #f472b6; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 13px; font-weight: 600;">Nids & Eggs</div>
                            <div style="color: #94a3b8; font-size: 11px;">Jeux supportés</div>
                        </div>
                    </a>

                    <a href="{{ route('admin.settings') }}" style="text-decoration: none;">
                        <div style="background: #141124; border: 1px solid #231f38; border-radius: 10px; padding: 14px; text-align: center; transition: all 0.2s ease;">
                            <i class="fa fa-cogs" style="font-size: 20px; color: #c084fc; margin-bottom: 6px;"></i>
                            <div style="color: #f1f5f9; font-size: 13px; font-weight: 600;">Paramètres</div>
                            <div style="color: #94a3b8; font-size: 11px;">Sécurité & 2FA</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
