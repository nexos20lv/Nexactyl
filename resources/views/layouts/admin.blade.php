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
                                    <img src="https://www.gravatar.com/avatar/{{ md5(strtolower(Auth::user()->email)) }}?s=160" class="user-image" alt="User Image">
                                    <span class="hidden-xs">{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
                                </a>
                            </li>
                            <li>
                                <li><a href="{{ route('index') }}" data-toggle="tooltip" data-placement="bottom" title="Exit Admin Control"><i class="fa fa-server"></i></a></li>
                            </li>
                            <li>
                                <li><a href="{{ route('auth.logout') }}" id="logoutButton" data-toggle="tooltip" data-placement="bottom" title="Logout"><i class="fa fa-sign-out"></i></a></li>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
            <aside class="main-sidebar">
                <section class="sidebar">
                    <ul class="sidebar-menu">
                        <li class="header">BASIC ADMINISTRATION</li>
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
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
                            <a href="{{ route('admin.api.index')}}">
                                <i class="fa fa-gamepad"></i> <span>Application API</span>
                            </a>
                        </li>
                        <li class="header">MANAGEMENT</li>
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
                        <li class="header">SERVICE MANAGEMENT</li>
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
