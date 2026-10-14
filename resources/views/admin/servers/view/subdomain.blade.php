@extends('layouts.admin')

@section('title')
    Server — {{ $server->name }}: Subdomain
@endsection

@section('content-header')
    <h1>{{ $server->name }}<small>Gérer le sous-domaine personnalisé et le routage DNS.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.servers') }}">Servers</a></li>
        <li><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></li>
        <li class="active">Subdomain</li>
    </ol>
@endsection

@section('content')
@include('admin.servers.partials.navigation')
<div class="row">
    <div class="col-sm-7">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-globe text-aqua"></i> Configuration du Sous-domaine</h3>
            </div>
            <form action="{{ route('admin.servers.view.subdomain.update', $server->id) }}" method="POST">
                {!! csrf_field() !!}
                <div class="box-body">
                    <div class="form-group">
                        <label class="control-label">Nom du sous-domaine</label>
                        <div class="input-group">
                            <input type="text" class="form-control" name="subdomain" value="{{ old('subdomain', $sub->subdomain ?? '') }}" placeholder="mon-serveur" required pattern="^[a-zA-Z0-9_-]+$" />
                            <span class="input-group-addon" style="padding: 0; border: none;">
                                <select name="domain" class="form-control" style="border-left: 0; min-width: 140px;">
                                    @foreach($availableDomains as $d)
                                        <option value="{{ $d }}" @if(old('domain', $sub->domain ?? '') === $d) selected @endif>.{{ $d }}</option>
                                    @endforeach
                                </select>
                            </span>
                        </div>
                        <p class="text-muted"><small>Ce nom de domaine permettra aux joueurs de se connecter sans devoir entrer de port numérique.</small></p>
                    </div>

                    <div class="row">
                        <div class="col-xs-6 form-group">
                            <label class="control-label">Port de jeu associé</label>
                            <input type="text" class="form-control" value="{{ $server->allocation->port }}" readonly />
                            <p class="text-muted"><small>Port d'allocation principal du serveur.</small></p>
                        </div>
                        <div class="col-xs-6 form-group">
                            <label class="control-label">Cible de redirection (Target Host)</label>
                            <input type="text" class="form-control" value="{{ $targetHost }}" readonly />
                            <p class="text-muted"><small>Hôte vers lequel pointe l'enregistrement SRV.</small></p>
                        </div>
                    </div>
                </div>
                <div class="box-footer">
                    <button type="submit" class="btn btn-primary pull-right">
                        <i class="fa fa-save"></i> Enregistrer le sous-domaine
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div class="col-sm-5">
        <div class="box box-info">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-info-circle text-info"></i> Statut &amp; Informations DNS</h3>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tr>
                        <td>Statut Actuel</td>
                        <td>
                            @if($sub)
                                <span class="label label-success"><i class="fa fa-check"></i> Actif</span>
                            @else
                                <span class="label label-default">Aucun sous-domaine</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td>Adresse de Connexion</td>
                        <td>
                            @if($sub)
                                <code style="font-size: 13px; font-weight: bold; color: #7c3aed;">{{ $sub->subdomain }}.{{ $sub->domain }}</code>
                            @else
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td>Cloudflare DNS</td>
                        <td>
                            @if($sub && $sub->cloudflare_id)
                                <span class="label label-primary" title="ID: {{ $sub->cloudflare_id }}"><i class="fa fa-cloud"></i> Synchronisé SRV</span>
                            @elseif($sub)
                                <span class="label label-warning">Local</span>
                            @else
                                <span class="text-muted">-</span>
                            @endif
                        </td>
                    </tr>
                    @if($sub)
                        <tr>
                            <td>Dernière modification</td>
                            <td><small class="text-muted">{{ $sub->updated_at->format('d/m/Y H:i') }}</small></td>
                        </tr>
                    @endif
                </table>
            </div>
            @if($sub)
                <div class="box-footer">
                    <form action="{{ route('admin.servers.view.subdomain.delete', $server->id) }}" method="POST" onsubmit="return confirm('Confirmer la révocation et la suppression du sous-domaine pour ce serveur ?');">
                        {!! csrf_field() !!}
                        {!! method_field('DELETE') !!}
                        <button type="submit" class="btn btn-danger btn-block">
                            <i class="fa fa-trash"></i> Révoquer et supprimer le sous-domaine
                        </button>
                    </form>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
