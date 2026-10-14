@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'nxslab'])

@section('title')
    NXSLab & Sous-domaines
@endsection

@section('content-header')
    <h1>Configuration Globale NXSLab<small>Gérez les sous-domaines, l'API Cloudflare, le Store et les intégrations Gaming.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">NXSLab & Sous-domaines</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <form action="{{ route('admin.settings.nxslab') }}" method="POST">
        {!! csrf_field() !!}
        {!! method_field('PATCH') !!}

        <div class="row">
            {{-- BOX 1: SOUS-DOMAINES & CLOUDFLARE --}}
            <div class="col-md-6">
                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-cloud text-aqua"></i> Sous-domaines & Cloudflare DNS</h3>
                    </div>
                    <div class="box-body">
                        <div class="form-group">
                            <label class="control-label">Système de Sous-domaines Gratuits</label>
                            <div>
                                <label class="radio-inline">
                                    <input type="radio" name="subdomain_enabled" value="1" {{ $settings['subdomain_enabled'] ? 'checked' : '' }}> Activé
                                </label>
                                <label class="radio-inline">
                                    <input type="radio" name="subdomain_enabled" value="0" {{ !$settings['subdomain_enabled'] ? 'checked' : '' }}> Désactivé
                                </label>
                                <p class="text-muted"><small>Permet aux clients d'assigner un nom de domaine personnalisé gratuit à leur serveur Minecraft.</small></p>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="control-label">Domaine Principal par Défaut</label>
                            <input type="text" class="form-control" name="base_domain" value="{{ old('base_domain', $settings['base_domain']) }}" placeholder="nxslab.in" required />
                            <p class="text-muted"><small>Domaine de base proposé en priorité aux utilisateurs (ex: <code>nxslab.in</code>).</small></p>
                        </div>

                        <div class="form-group">
                            <label class="control-label">Domaines Disponibles pour les Clients (1 par ligne)</label>
                            <textarea class="form-control" name="available_domains" rows="3" placeholder="nxslab.in&#10;play.nxslab.in" required>{{ old('available_domains', $settings['available_domains']) }}</textarea>
                            <p class="text-muted"><small>Les utilisateurs pourront choisir parmi ces extensions dans le menu déroulant.</small></p>
                        </div>

                        <div class="form-group">
                            <label class="control-label">Cible Hôte de Redirection (Target SRV)</label>
                            <input type="text" class="form-control" name="target_host" value="{{ old('target_host', $settings['target_host']) }}" placeholder="node.nxslab.in" required />
                            <p class="text-muted"><small>Nom d'hôte ou enregistrement DNS pointant vers l'IP de votre nœud/serveur physique (ex: <code>node.nxslab.in</code>).</small></p>
                        </div>

                        <hr style="border-color: #eee;" />

                        <div class="form-group">
                            <label class="control-label">Cloudflare API Token</label>
                            <div class="input-group">
                                <input type="password" id="cf_api_token" class="form-control" name="cf_api_token" value="{{ old('cf_api_token', $settings['cf_api_token']) }}" placeholder="Token API Cloudflare (avec droits Zone.DNS:Edit)" autocomplete="new-password" />
                                <span class="input-group-btn">
                                    <button class="btn btn-default" type="button" onclick="toggleTokenVisibility()"><i id="cf_eye_icon" class="fa fa-eye"></i></button>
                                </span>
                            </div>
                            <p class="text-muted"><small>Créé sur le dashboard Cloudflare dans <em>My Profile &gt; API Tokens</em> avec permissions <strong>Zone.DNS (Edit)</strong> et <strong>Zone.Zone (Read)</strong>.</small></p>
                        </div>

                        <div class="form-group">
                            <label class="control-label">Cloudflare Zone ID</label>
                            <input type="text" id="cf_zone_id" class="form-control" name="cf_zone_id" value="{{ old('cf_zone_id', $settings['cf_zone_id']) }}" placeholder="ID de Zone (32 caractères héxadécimaux)" />
                            <p class="text-muted"><small>Trouvable sur la page d'accueil de votre domaine sur Cloudflare (en bas de la colonne de droite).</small></p>
                        </div>

                        <div class="form-group">
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" name="cf_auto_sync" value="1" {{ $settings['cf_auto_sync'] ? 'checked' : '' }}>
                                    <strong>Création &amp; suppression automatique des enregistrements DNS SRV sur Cloudflare</strong>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <button type="button" class="btn btn-info btn-sm" id="btn-test-cf" onclick="testCloudflareConnection()">
                                <i class="fa fa-plug"></i> Tester la connexion Cloudflare
                            </button>
                            <span id="cf-test-result" style="margin-left: 10px; font-weight: bold;"></span>
                        </div>

                        <div class="form-group">
                            <label class="control-label">Préfixes Réservés / Interdits</label>
                            <textarea class="form-control" name="reserved_subdomains" rows="2">{{ old('reserved_subdomains', $settings['reserved_subdomains']) }}</textarea>
                            <p class="text-muted"><small>Séparés par des virgules. Les utilisateurs ne pourront pas enregistrer ces noms.</small></p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- BOX 2 & 3: GAMING & BOUTIQUE --}}
            <div class="col-md-6">
                {{-- GAMING INTEGRATIONS --}}
                <div class="box box-warning">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-gamepad text-orange"></i> Intégrations Gaming &amp; CurseForge</h3>
                    </div>
                    <div class="box-body">
                        <div class="form-group">
                            <label class="control-label">Clé API CurseForge Eternal</label>
                            <input type="text" class="form-control" name="curseforge_key" value="{{ old('curseforge_key', $settings['curseforge_key']) }}" placeholder="Clé API CurseForge..." />
                            <p class="text-muted"><small>Permet la recherche et le téléchargement direct de mods et plugins CurseForge dans le gestionnaire de versions.</small></p>
                        </div>
                    </div>
                </div>

                {{-- BOUTIQUE HARDWARE & CREDITS --}}
                <div class="box box-success">
                    <div class="box-header with-border">
                        <h3 class="box-title"><i class="fa fa-bolt text-yellow"></i> Boutique Hardware &amp; Économie de Crédits</h3>
                    </div>
                    <div class="box-body">
                        <div class="form-group">
                            <label class="control-label">Boutique Hardware</label>
                            <div>
                                <label class="radio-inline">
                                    <input type="radio" name="store_enabled" value="1" {{ $settings['store_enabled'] ? 'checked' : '' }}> Activée
                                </label>
                                <label class="radio-inline">
                                    <input type="radio" name="store_enabled" value="0" {{ !$settings['store_enabled'] ? 'checked' : '' }}> Désactivée
                                </label>
                                <p class="text-muted"><small>Autorise les clients à améliorer les ressources de leurs serveurs contre leurs crédits.</small></p>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="control-label">Crédits de Bienvenue (Offerts aux nouveaux comptes)</label>
                            <input type="number" class="form-control" name="starting_credits" value="{{ old('starting_credits', $settings['starting_credits']) }}" min="0" required />
                            <p class="text-muted"><small>Nombre de crédits crédités automatiquement à chaque nouvel utilisateur.</small></p>
                        </div>

                        <div class="row">
                            <div class="col-xs-6 form-group">
                                <label class="control-label">Coût RAM (+1 Go)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" name="cost_ram_1gb" value="{{ old('cost_ram_1gb', $settings['cost_ram_1gb']) }}" min="0" required />
                                    <span class="input-group-addon">cr</span>
                                </div>
                            </div>
                            <div class="col-xs-6 form-group">
                                <label class="control-label">Coût CPU (+25%)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" name="cost_cpu_25" value="{{ old('cost_cpu_25', $settings['cost_cpu_25']) }}" min="0" required />
                                    <span class="input-group-addon">cr</span>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-xs-6 form-group">
                                <label class="control-label">Coût Disque (+10 Go NVMe)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" name="cost_disk_10gb" value="{{ old('cost_disk_10gb', $settings['cost_disk_10gb']) }}" min="0" required />
                                    <span class="input-group-addon">cr</span>
                                </div>
                            </div>
                            <div class="col-xs-6 form-group">
                                <label class="control-label">Coût Sauvegardes (+2 Slots)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" name="cost_backups_2" value="{{ old('cost_backups_2', $settings['cost_backups_2']) }}" min="0" required />
                                    <span class="input-group-addon">cr</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- SAUVEGARDER --}}
                <div class="box box-solid">
                    <div class="box-body">
                        <button type="submit" class="btn btn-primary btn-block btn-lg">
                            <i class="fa fa-save"></i> Enregistrer tous les paramètres
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>

    {{-- BOX 4: LISTE DES SOUS-DOMAINES ATTRIBUÉS --}}
    <div class="row">
        <div class="col-xs-12">
            <div class="box box-info">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-list"></i> Sous-domaines Actifs Assignés ({{ $subdomains->total() }})</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Sous-domaine</th>
                                <th>Serveur</th>
                                <th>Propriétaire</th>
                                <th>Port Cible</th>
                                <th>Hôte Cible</th>
                                <th>Cloudflare</th>
                                <th>Date de Création</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($subdomains as $sub)
                                <tr>
                                    <td>
                                        <code style="font-size: 13px;">{{ $sub->subdomain }}.{{ $sub->domain }}</code>
                                    </td>
                                    <td>
                                        @if ($sub->server)
                                            <a href="{{ route('admin.servers.view', $sub->server->id) }}" target="_blank">
                                                {{ $sub->server->name }}
                                            </a>
                                        @else
                                            <span class="text-muted">Serveur supprimé</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if ($sub->user)
                                            <a href="{{ route('admin.users.view', $sub->user->id) }}" target="_blank">
                                                {{ $sub->user->username }}
                                            </a>
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="label label-primary">{{ $sub->port }}</span>
                                    </td>
                                    <td>
                                        <small class="text-muted">{{ $sub->target }}</small>
                                    </td>
                                    <td>
                                        @if ($sub->cloudflare_id)
                                            <span class="label label-success" title="ID: {{ $sub->cloudflare_id }}"><i class="fa fa-check"></i> Synchronisé</span>
                                        @else
                                            <span class="label label-default">Local</span>
                                        @endif
                                    </td>
                                    <td>
                                        <small>{{ $sub->created_at->format('d/m/Y H:i') }}</small>
                                    </td>
                                    <td class="text-right">
                                        <form action="{{ route('admin.settings.nxslab.delete-sub', $sub->id) }}" method="POST" style="display:inline-block;" onsubmit="return confirm('Confirmer la révocation et suppression de ce sous-domaine ?');">
                                            {!! csrf_field() !!}
                                            {!! method_field('DELETE') !!}
                                            <button type="submit" class="btn btn-xs btn-danger" title="Révoquer ce sous-domaine">
                                                <i class="fa fa-trash"></i> Supprimer
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="8" class="text-center text-muted" style="padding: 24px;">
                                        Aucun sous-domaine n'a encore été créé par les utilisateurs.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @if ($subdomains->hasPages())
                    <div class="box-footer">
                        {!! $subdomains->render() !!}
                    </div>
                @endif
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        function toggleTokenVisibility() {
            var input = document.getElementById('cf_api_token');
            var icon = document.getElementById('cf_eye_icon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fa fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fa fa-eye';
            }
        }

        function testCloudflareConnection() {
            var token = $('#cf_api_token').val();
            var zone = $('#cf_zone_id').val();
            var btn = $('#btn-test-cf');
            var res = $('#cf-test-result');

            btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Test en cours...');
            res.html('');

            $.ajax({
                type: 'POST',
                url: '{{ route('admin.settings.nxslab.test-cf') }}',
                data: {
                    _token: '{{ csrf_token() }}',
                    token: token,
                    zone_id: zone
                },
                success: function(data) {
                    btn.prop('disabled', false).html('<i class="fa fa-plug"></i> Tester la connexion Cloudflare');
                    res.html('<span class="text-green"><i class="fa fa-check-circle"></i> ' + data.message + '</span>');
                },
                error: function(xhr) {
                    btn.prop('disabled', false).html('<i class="fa fa-plug"></i> Tester la connexion Cloudflare');
                    var err = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Erreur inconnue lors du test.';
                    res.html('<span class="text-red"><i class="fa fa-times-circle"></i> ' + err + '</span>');
                }
            });
        }
    </script>
@endsection
