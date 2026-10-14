<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>{{ 'NXSLab' }} - @yield('title')</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta name="_token" content="{{ csrf_token() }}">

        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
        <link rel="manifest" href="/favicons/manifest.json">
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
        <link rel="shortcut icon" href="/favicons/favicon.ico">
        <meta name="msapplication-config" content="/favicons/browserconfig.xml">
        <meta name="theme-color" content="#0e4688">

        @include('layouts.scripts')

        @section('scripts')
            {!! Theme::css('vendor/select2/select2.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/bootstrap/bootstrap.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/admin.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/colors/skin-blue.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">

            <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
            <![endif]-->
        @show
    
        <style>
            /* Obsidian & Neon Violet Admin Theme Overrides */
            :root {
                --bg-dark: #07060a;
                --bg-card: #0d0b16;
                --bg-card-header: #120f20;
                --bg-input: #141124;
                --border-color: #201c34;
                --text-primary: #f4f4f5;
                --text-muted: #94a3b8;
                --accent-violet: #8b5cf6;
                --accent-violet-hover: #7c3aed;
                --accent-glow: rgba(139, 92, 246, 0.25);
            }
            body, .content-wrapper, .right-side, .main-footer {
                background-color: var(--bg-dark) !important;
                color: var(--text-primary) !important;
            }
            .main-header .navbar {
                background-color: #090812 !important;
                border-bottom: 1px solid var(--border-color) !important;
            }
            .main-header .logo {
                background-color: #07060a !important;
                border-bottom: 1px solid var(--border-color) !important;
                border-right: 1px solid var(--border-color) !important;
                color: #c084fc !important;
                font-weight: 700 !important;
                letter-spacing: 0.05em !important;
            }
            .main-header .logo:hover {
                background-color: #0c0a18 !important;
            }
            .main-sidebar, .left-side {
                background-color: #090812 !important;
                border-right: 1px solid var(--border-color) !important;
            }
            .sidebar-menu > li.header {
                background: transparent !important;
                color: #64748b !important;
                font-size: 11px !important;
                letter-spacing: 0.08em !important;
                text-transform: uppercase !important;
            }
            .sidebar-menu > li > a {
                color: #94a3b8 !important;
                border-left: 3px solid transparent !important;
                transition: all 0.2s ease !important;
            }
            .sidebar-menu > li:hover > a, .sidebar-menu > li.active > a {
                color: #f4f4f5 !important;
                background: #141124 !important;
                border-left-color: var(--accent-violet) !important;
                box-shadow: inset 4px 0 12px var(--accent-glow) !important;
            }
            .box {
                background: var(--bg-card) !important;
                border: 1px solid var(--border-color) !important;
                border-top: 3px solid var(--accent-violet) !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
                color: var(--text-primary) !important;
            }
            .box.box-primary { border-top-color: #8b5cf6 !important; }
            .box.box-info { border-top-color: #38bdf8 !important; }
            .box.box-success { border-top-color: #10b981 !important; }
            .box.box-warning { border-top-color: #f59e0b !important; }
            .box.box-danger { border-top-color: #ef4444 !important; }
            .box-header {
                background: var(--bg-card-header) !important;
                border-bottom: 1px solid var(--border-color) !important;
                color: var(--text-primary) !important;
                border-top-left-radius: 8px !important;
                border-top-right-radius: 8px !important;
            }
            .box-header .box-title {
                color: #f4f4f5 !important;
                font-weight: 600 !important;
            }
            .box-footer {
                background: var(--bg-card-header) !important;
                border-top: 1px solid var(--border-color) !important;
                border-bottom-left-radius: 8px !important;
                border-bottom-right-radius: 8px !important;
            }
            .form-control, .input-group-addon {
                background-color: var(--bg-input) !important;
                border: 1px solid var(--border-color) !important;
                color: #f4f4f5 !important;
                border-radius: 6px !important;
            }
            .form-control:focus {
                border-color: var(--accent-violet) !important;
                box-shadow: 0 0 0 3px var(--accent-glow) !important;
            }
            .table {
                color: #cbd5e1 !important;
            }
            .table > thead > tr > th {
                background-color: #120f20 !important;
                border-bottom: 2px solid var(--border-color) !important;
                color: #a855f7 !important;
                text-transform: uppercase !important;
                font-size: 11px !important;
                letter-spacing: 0.05em !important;
            }
            .table > tbody > tr > td {
                border-top: 1px solid var(--border-color) !important;
            }
            .table-hover > tbody > tr:hover {
                background-color: #161328 !important;
            }
            .btn-primary {
                background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%) !important;
                border: none !important;
                box-shadow: 0 2px 10px rgba(124, 58, 237, 0.3) !important;
                font-weight: 600 !important;
                border-radius: 6px !important;
                transition: all 0.2s ease !important;
            }
            .btn-primary:hover {
                background: linear-gradient(135deg, #6d28d9 0%, #7e22ce 100%) !important;
                box-shadow: 0 4px 15px rgba(124, 58, 237, 0.5) !important;
            }
            .btn-default {
                background: #141124 !important;
                border: 1px solid var(--border-color) !important;
                color: #e2e8f0 !important;
                border-radius: 6px !important;
            }
            .btn-default:hover {
                background: #1c1832 !important;
                border-color: var(--accent-violet) !important;
                color: #fff !important;
            }
            .content-header > h1 {
                color: #f4f4f5 !important;
                font-weight: 700 !important;
            }
            .content-header > h1 > small {
                color: #94a3b8 !important;
            }
            .breadcrumb {
                background: transparent !important;
            }
            .breadcrumb > li, .breadcrumb > li > a {
                color: #94a3b8 !important;
            }
            .breadcrumb > li.active {
                color: #c084fc !important;
                font-weight: 600 !important;
            }
            .breadcrumb > li:first-child > a:before {
                content: "\f015 ";
                font-family: FontAwesome;
                color: #a855f7;
                margin-right: 4px;
            }
            
            /* ==========================================================================
               Obsidian Violet Apple Fluid Tabs & Navbars
               ========================================================================== */
            .nav-tabs-custom {
                background: transparent !important;
                box-shadow: none !important;
                border-radius: 16px !important;
                margin-bottom: 22px !important;
            }
            .nav-tabs-custom.nav-tabs-floating {
                margin-bottom: 22px !important;
            }
            .nav-tabs-custom > .nav-tabs {
                background: rgba(13, 11, 22, 0.85) !important;
                backdrop-filter: blur(20px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                border: 1px solid rgba(139, 92, 246, 0.22) !important;
                border-radius: 16px !important;
                padding: 6px !important;
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                gap: 6px !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
            }
            .nav-tabs-custom > .nav-tabs > li {
                margin: 0 !important;
                border: none !important;
                border-top: none !important;
                float: none !important;
            }
            .nav-tabs-custom > .nav-tabs > li > a {
                color: #94a3b8 !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                padding: 9px 18px !important;
                border-radius: 11px !important;
                border: 1px solid transparent !important;
                margin: 0 !important;
                background: transparent !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 8px !important;
                letter-spacing: 0.01em !important;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            .nav-tabs-custom > .nav-tabs > li > a:hover {
                color: #ffffff !important;
                background: rgba(139, 92, 246, 0.12) !important;
                border-color: rgba(139, 92, 246, 0.25) !important;
                transform: translateY(-1px) !important;
            }
            .nav-tabs-custom > .nav-tabs > li > a:active {
                transform: scale(0.98) !important;
            }
            .nav-tabs-custom > .nav-tabs > li.active {
                border-top: none !important;
            }
            .nav-tabs-custom > .nav-tabs > li.active > a {
                color: #ffffff !important;
                background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
                border-color: rgba(168, 85, 247, 0.5) !important;
                box-shadow: 0 4px 16px rgba(124, 58, 237, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
                font-weight: 600 !important;
                border-top: none !important;
            }
            .nav-tabs-custom > .nav-tabs > li.active > a:hover {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
                box-shadow: 0 6px 20px rgba(139, 92, 246, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
            }
            /* Danger Tab (ex: Delete) */
            .nav-tabs-custom > .nav-tabs > li.tab-danger > a {
                color: #f87171 !important;
            }
            .nav-tabs-custom > .nav-tabs > li.tab-danger > a:hover {
                background: rgba(239, 68, 68, 0.15) !important;
                border-color: rgba(239, 68, 68, 0.35) !important;
                color: #fca5a5 !important;
            }
            .nav-tabs-custom > .nav-tabs > li.tab-danger.active > a {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                border-color: rgba(248, 113, 113, 0.5) !important;
                color: #ffffff !important;
                box-shadow: 0 4px 16px rgba(239, 68, 68, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
            }
            /* Success Tab (ex: View Client) */
            .nav-tabs-custom > .nav-tabs > li.tab-success {
                margin-left: auto !important;
            }
            .nav-tabs-custom > .nav-tabs > li.tab-success > a {
                color: #34d399 !important;
                background: rgba(16, 185, 129, 0.1) !important;
                border-color: rgba(16, 185, 129, 0.25) !important;
            }
            .nav-tabs-custom > .nav-tabs > li.tab-success > a:hover {
                background: rgba(16, 185, 129, 0.22) !important;
                color: #ffffff !important;
                box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
            }
            /* Tab Icons */
            .nav-tabs-custom > .nav-tabs > li > a i.fa {
                font-size: 14px !important;
                opacity: 0.9 !important;
                margin-right: 2px !important;
                transition: opacity 0.15s ease, transform 0.15s ease !important;
            }
            .nav-tabs-custom > .nav-tabs > li > a:hover i.fa,
            .nav-tabs-custom > .nav-tabs > li.active > a i.fa {
                opacity: 1 !important;
                transform: scale(1.1) !important;
            }
            /* Content pane */
            .nav-tabs-custom > .tab-content {
                background: var(--bg-card) !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 16px !important;
                padding: 24px !important;
                color: var(--text-primary) !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45) !important;
            }

            /* Navbar items */
            .navbar-custom-menu .navbar-nav > li > a {
                border-radius: 10px !important;
                margin: 8px 4px !important;
                padding: 8px 14px !important;
                background: rgba(255, 255, 255, 0.04) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                color: #cbd5e1 !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                transition: all 0.2s ease !important;
            }
            .navbar-custom-menu .navbar-nav > li > a:hover {
                background: rgba(139, 92, 246, 0.15) !important;
                border-color: rgba(139, 92, 246, 0.35) !important;
                color: #ffffff !important;
            }
            .navbar-custom-menu .navbar-nav > li.user-menu > a {
                background: rgba(139, 92, 246, 0.1) !important;
                border-color: rgba(139, 92, 246, 0.25) !important;
            }
            .navbar-custom-menu .navbar-nav > li.user-menu > a img.user-image {
                border-radius: 8px !important;
                border: 1px solid rgba(168, 85, 247, 0.4) !important;
                float: none !important;
                margin: 0 !important;
                width: 24px !important;
                height: 24px !important;
                object-fit: cover !important;
            }

            ::-webkit-scrollbar { width: 7px; height: 7px; }
            ::-webkit-scrollbar-track { background: #07060a; }
            ::-webkit-scrollbar-thumb { background: #25213b; border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: #7c3aed; }
        </style>

    </head>
    <body class="hold-transition skin-blue fixed sidebar-mini">
        <div class="wrapper">
            <header class="main-header">
                <a href="{{ route('index') }}" class="logo">
                    <span>{{ 'NXSLab' }}</span>
                </a>
                <nav class="navbar navbar-static-top">
                    <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <div class="navbar-custom-menu">
                        <ul class="nav navbar-nav">
                            <li class="user-menu">
                                <a href="{{ route('account') }}">
                                    <img src="{{ Auth::user()->avatar_url ?: 'https://www.gravatar.com/avatar/' . md5(strtolower(Auth::user()->email)) . '?s=160' }}" class="user-image" alt="User Image">
                                    <span class="hidden-xs">{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('index') }}" data-toggle="tooltip" data-placement="bottom" title="Retour au Panel Client">
                                    <i class="fa fa-desktop" style="color: #c084fc;"></i> <span class="hidden-xs" style="font-weight: 500;">Panel Client</span>
                                </a>
                            </li>
                            <li>
                                <a href="{{ route('auth.logout') }}" id="logoutButton" data-toggle="tooltip" data-placement="bottom" title="Déconnexion">
                                    <i class="fa fa-sign-out text-danger"></i> <span class="hidden-xs" style="font-weight: 500;">Déconnexion</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
            <aside class="main-sidebar">
                <section class="sidebar">
                    <ul class="sidebar-menu">
                        <li class="header"><i class="fa fa-compass" style="color: #a855f7; margin-right: 6px;"></i> ADMINISTRATION</li>
                        <li class="{{ Route::currentRouteName() !== 'admin.index' ?: 'active' }}">
                            <a href="{{ route('admin.index') }}">
                                <i class="fa fa-home"></i> <span>Overview</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}">
                            <a href="{{ route('admin.settings')}}">
                                <i class="fa fa-wrench"></i> <span>Settings</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings.nxslab') ?: 'active' }}">
                            <a href="{{ route('admin.settings.nxslab') }}">
                                <i class="fa fa-cloud text-purple"></i> <span>NXSLab &amp; Domaines</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
                            <a href="{{ route('admin.api.index')}}">
                                <i class="fa fa-gamepad"></i> <span>Application API</span>
                            </a>
                        </li>
                        <li class="header"><i class="fa fa-cubes" style="color: #a855f7; margin-right: 6px;"></i> INFRASTRUCTURE</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.databases') ?: 'active' }}">
                            <a href="{{ route('admin.databases') }}">
                                <i class="fa fa-database"></i> <span>Databases</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.locations') ?: 'active' }}">
                            <a href="{{ route('admin.locations') }}">
                                <i class="fa fa-globe"></i> <span>Locations</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nodes') ?: 'active' }}">
                            <a href="{{ route('admin.nodes') }}">
                                <i class="fa fa-sitemap"></i> <span>Nodes</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.servers') ?: 'active' }}">
                            <a href="{{ route('admin.servers') }}">
                                <i class="fa fa-server"></i> <span>Servers</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.users') ?: 'active' }}">
                            <a href="{{ route('admin.users') }}">
                                <i class="fa fa-users"></i> <span>Users</span>
                            </a>
                        </li>
                        <li class="header"><i class="fa fa-puzzle-piece" style="color: #a855f7; margin-right: 6px;"></i> SERVICES &amp; MODÈLES</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.mounts') ?: 'active' }}">
                            <a href="{{ route('admin.mounts') }}">
                                <i class="fa fa-magic"></i> <span>Mounts</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nests') ?: 'active' }}">
                            <a href="{{ route('admin.nests') }}">
                                <i class="fa fa-th-large"></i> <span>Nests</span>
                            </a>
                        </li>
                    </ul>
                </section>
            </aside>
            <div class="content-wrapper">
                <section class="content-header">
                    @yield('content-header')
                </section>
                <section class="content">
                    <div class="row">
                        <div class="col-xs-12">
                            @if (count($errors) > 0)
                                <div class="alert alert-danger">
                                    There was an error validating the data provided.<br><br>
                                    <ul>
                                        @foreach ($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif
                            @foreach (Alert::getMessages() as $type => $messages)
                                @foreach ($messages as $message)
                                    <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                                        {{ $message }}
                                    </div>
                                @endforeach
                            @endforeach
                        </div>
                    </div>
                    @yield('content')
                </section>
            </div>
            <footer class="main-footer">
                <div class="pull-right small text-gray" style="margin-right:10px;margin-top:-7px;">
                    <strong><i class="fa fa-fw {{ $appIsGit ? 'fa-git-square' : 'fa-code-fork' }}"></i></strong> {{ $appVersion }}<br />
                    <strong><i class="fa fa-fw fa-clock-o"></i></strong> {{ round(microtime(true) - LARAVEL_START, 3) }}s
                </div>
                Copyright &copy; {{ date('Y') }} <strong>NXSLab Cloud Platform</strong>. Tous droits r&eacute;serv&eacute;s.
            </footer>
        </div>
        @section('footer-scripts')
            <script src="/js/keyboard.polyfill.js" type="application/javascript"></script>
            <script>keyboardeventKeyPolyfill.polyfill();</script>

            {!! Theme::js('vendor/jquery/jquery.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/sweetalert/sweetalert.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap/bootstrap.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/slimscroll/jquery.slimscroll.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/adminlte/app.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap-notify/bootstrap-notify.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/select2/select2.full.min.js?t={cache-version}') !!}
            {!! Theme::js('js/admin/functions.js?t={cache-version}') !!}
            <script src="/js/autocomplete.js" type="application/javascript"></script>

            @if(Auth::user()->root_admin)
                <script>
                    $('#logoutButton').on('click', function (event) {
                        event.preventDefault();

                        var that = this;
                        swal({
                            title: 'Do you want to log out?',
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d9534f',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Log out'
                        }, function () {
                             $.ajax({
                                type: 'POST',
                                url: '{{ route('auth.logout') }}',
                                data: {
                                    _token: '{{ csrf_token() }}'
                                },complete: function () {
                                    window.location.href = '{{route('auth.login')}}';
                                }
                        });
                    });
                });
                </script>
            @endif

            <script>
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                })
            </script>
        @show
    </body>
</html>
