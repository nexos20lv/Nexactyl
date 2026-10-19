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
                --bg-card-hover: #151126;
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
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
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
                font-weight: 800 !important;
                letter-spacing: 0.06em !important;
            }
            .main-header .logo:hover {
                background-color: #0c0a18 !important;
                color: #d8b4fe !important;
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
                font-weight: 700 !important;
                padding: 14px 20px 6px !important;
            }
            .sidebar-menu > li > a {
                color: #94a3b8 !important;
                border-left: 3px solid transparent !important;
                padding: 11px 18px !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            .sidebar-menu > li > a > i {
                width: 18px !important;
                text-align: center !important;
                font-size: 15px !important;
                color: #a855f7 !important;
                transition: transform 0.2s ease !important;
            }
            .sidebar-menu > li:hover > a {
                color: #ffffff !important;
                background: #141124 !important;
                border-left-color: rgba(139, 92, 246, 0.5) !important;
            }
            .sidebar-menu > li:hover > a > i {
                transform: scale(1.15) !important;
            }
            .sidebar-menu > li.active > a {
                color: #ffffff !important;
                background: #151128 !important;
                border-left-color: var(--accent-violet) !important;
                box-shadow: inset 4px 0 16px var(--accent-glow) !important;
                font-weight: 600 !important;
            }
            .sidebar-menu > li.active > a > i {
                color: #c084fc !important;
            }
            .box {
                background: var(--bg-card) !important;
                border: 1px solid var(--border-color) !important;
                border-top: 3px solid var(--accent-violet) !important;
                border-radius: 14px !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45) !important;
                color: var(--text-primary) !important;
                margin-bottom: 22px !important;
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
                border-top-left-radius: 14px !important;
                border-top-right-radius: 14px !important;
                padding: 14px 18px !important;
            }
            .box-header .box-title {
                color: #f4f4f5 !important;
                font-weight: 600 !important;
                font-size: 15px !important;
            }
            .box-footer {
                background: var(--bg-card-header) !important;
                border-top: 1px solid var(--border-color) !important;
                border-bottom-left-radius: 14px !important;
                border-bottom-right-radius: 14px !important;
                padding: 12px 18px !important;
            }
            .form-control, .input-group-addon {
                background-color: var(--bg-input) !important;
                border: 1px solid var(--border-color) !important;
                color: #f4f4f5 !important;
                border-radius: 8px !important;
                transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
            }
            .form-control:focus {
                border-color: var(--accent-violet) !important;
                box-shadow: 0 0 0 3px var(--accent-glow) !important;
                outline: none !important;
            }
            .input-group-addon {
                background-color: #18142c !important;
                color: #cbd5e1 !important;
            }
            .table {
                color: #cbd5e1 !important;
            }
            .table > thead > tr > th {
                background-color: #120f20 !important;
                border-bottom: 2px solid var(--border-color) !important;
                color: #c084fc !important;
                text-transform: uppercase !important;
                font-size: 11px !important;
                letter-spacing: 0.06em !important;
                font-weight: 700 !important;
                padding: 12px 14px !important;
            }
            .table > tbody > tr > td {
                border-top: 1px solid var(--border-color) !important;
                padding: 12px 14px !important;
                vertical-align: middle !important;
            }
            .table-hover > tbody > tr:hover {
                background-color: #161328 !important;
            }
            
            /* Buttons with Apple Springs */
            .btn {
                border-radius: 10px !important;
                font-weight: 600 !important;
                transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, box-shadow 0.15s ease !important;
            }
            .btn:active {
                transform: scale(0.97) !important;
            }
            .btn-primary {
                background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%) !important;
                border: none !important;
                box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35) !important;
                color: #ffffff !important;
            }
            .btn-primary:hover {
                background: linear-gradient(135deg, #6d28d9 0%, #7e22ce 100%) !important;
                box-shadow: 0 6px 18px rgba(124, 58, 237, 0.5) !important;
                color: #ffffff !important;
            }
            .btn-success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                border: none !important;
                box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
                color: #ffffff !important;
            }
            .btn-success:hover {
                background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
                box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5) !important;
                color: #ffffff !important;
            }
            .btn-danger {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                border: none !important;
                box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35) !important;
                color: #ffffff !important;
            }
            .btn-danger:hover {
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
                box-shadow: 0 6px 18px rgba(239, 68, 68, 0.5) !important;
                color: #ffffff !important;
            }
            .btn-warning {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
                border: none !important;
                color: #ffffff !important;
            }
            .btn-default {
                background: #141124 !important;
                border: 1px solid var(--border-color) !important;
                color: #e2e8f0 !important;
            }
            .btn-default:hover {
                background: #1c1832 !important;
                border-color: var(--accent-violet) !important;
                color: #ffffff !important;
            }
            
            /* Select2 Dark Theme */
            .select2-container--default .select2-selection--single {
                background-color: var(--bg-input) !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 8px !important;
                height: 38px !important;
                padding: 4px 8px !important;
                color: #f4f4f5 !important;
            }
            .select2-container--default .select2-selection--single:focus,
            .select2-container--default.select2-container--open .select2-selection--single {
                border-color: var(--accent-violet) !important;
                box-shadow: 0 0 0 3px var(--accent-glow) !important;
            }
            .select2-container--default .select2-selection--single .select2-selection__rendered {
                color: #f4f4f5 !important;
                line-height: 28px !important;
            }
            .select2-container--default .select2-selection--single .select2-selection__arrow {
                height: 36px !important;
                right: 8px !important;
            }
            .select2-container--default .select2-selection--single .select2-selection__arrow b {
                border-color: #94a3b8 transparent transparent transparent !important;
            }
            .select2-dropdown {
                background-color: #0e0c18 !important;
                border: 1px solid rgba(139, 92, 246, 0.35) !important;
                border-radius: 12px !important;
                box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(124, 58, 237, 0.15) !important;
                color: #f4f4f5 !important;
                overflow: hidden !important;
            }
            .select2-container--default .select2-search--dropdown .select2-search__field {
                background-color: #141124 !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 6px !important;
                color: #ffffff !important;
                padding: 6px 10px !important;
            }
            .select2-results__option {
                color: #cbd5e1 !important;
                padding: 8px 12px !important;
                font-size: 13px !important;
            }
            .select2-container--default .select2-results__option--highlighted[aria-selected],
            .select2-container--default .select2-results__option[aria-selected="true"] {
                background-color: var(--accent-violet-hover) !important;
                color: #ffffff !important;
            }
            .select2-container--default .select2-selection--multiple {
                background-color: var(--bg-input) !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 8px !important;
                color: #f4f4f5 !important;
                padding: 4px !important;
            }
            .select2-container--default .select2-selection--multiple .select2-selection__choice {
                background-color: rgba(139, 92, 246, 0.2) !important;
                border: 1px solid rgba(139, 92, 246, 0.4) !important;
                border-radius: 6px !important;
                color: #c084fc !important;
                padding: 2px 8px !important;
            }

            /* SweetAlert Dark Theme */
            .sweet-alert {
                background-color: #0e0c18 !important;
                border: 1px solid rgba(139, 92, 246, 0.3) !important;
                border-radius: 20px !important;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.2) !important;
                padding: 26px !important;
            }
            .sweet-alert h2 {
                color: #f4f4f5 !important;
                font-weight: 700 !important;
                font-size: 20px !important;
            }
            .sweet-alert p {
                color: #94a3b8 !important;
                font-size: 14px !important;
            }
            .sweet-alert .sa-icon.sa-warning {
                border-color: #f59e0b !important;
            }
            .sweet-alert .sa-icon.sa-warning .sa-body,
            .sweet-alert .sa-icon.sa-warning .sa-dot {
                background-color: #f59e0b !important;
            }
            .sweet-alert .sa-icon.sa-success {
                border-color: #10b981 !important;
            }
            .sweet-alert .sa-icon.sa-success::before,
            .sweet-alert .sa-icon.sa-success::after {
                background: transparent !important;
            }
            .sweet-alert button {
                border-radius: 12px !important;
                font-weight: 600 !important;
                padding: 10px 22px !important;
                font-size: 13px !important;
                box-shadow: none !important;
            }
            .sweet-alert button:active {
                transform: scale(0.97) !important;
            }
            .sweet-alert button.confirm {
                background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
                box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4) !important;
            }
            .sweet-alert button.cancel {
                background: #1e1b2e !important;
                color: #94a3b8 !important;
                border: 1px solid #2d2845 !important;
            }
            .sweet-alert button.cancel:hover {
                background: #25213b !important;
                color: #ffffff !important;
            }

            /* Modals Dark Theme */
            .modal-content {
                background-color: #0e0c18 !important;
                border: 1px solid rgba(139, 92, 246, 0.25) !important;
                border-radius: 18px !important;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(124, 58, 237, 0.15) !important;
                color: #f4f4f5 !important;
                overflow: hidden !important;
            }
            .modal-header {
                background-color: #120f20 !important;
                border-bottom: 1px solid var(--border-color) !important;
                padding: 16px 20px !important;
            }
            .modal-header .modal-title {
                color: #f4f4f5 !important;
                font-weight: 700 !important;
                font-size: 16px !important;
            }
            .modal-header .close {
                color: #94a3b8 !important;
                text-shadow: none !important;
                opacity: 0.7 !important;
            }
            .modal-header .close:hover {
                color: #ffffff !important;
                opacity: 1 !important;
            }
            .modal-footer {
                background-color: #120f20 !important;
                border-top: 1px solid var(--border-color) !important;
                padding: 14px 20px !important;
            }

            /* Pagination Dark Theme */
            .pagination {
                margin: 15px 0 !important;
            }
            .pagination > li > a, .pagination > li > span {
                background-color: #141124 !important;
                border: 1px solid var(--border-color) !important;
                color: #94a3b8 !important;
                border-radius: 8px !important;
                margin: 0 3px !important;
                padding: 6px 12px !important;
                font-size: 13px !important;
                transition: all 0.15s ease !important;
            }
            .pagination > li > a:hover {
                background-color: rgba(139, 92, 246, 0.2) !important;
                border-color: rgba(139, 92, 246, 0.4) !important;
                color: #ffffff !important;
            }
            .pagination > .active > a, .pagination > .active > span {
                background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
                border-color: rgba(168, 85, 247, 0.5) !important;
                color: #ffffff !important;
                box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4) !important;
                font-weight: 600 !important;
            }
            .pagination > .disabled > a, .pagination > .disabled > span {
                background-color: #0b0914 !important;
                border-color: #181528 !important;
                color: #475569 !important;
            }

            /* Badges & Labels */
            .label {
                border-radius: 9999px !important;
                padding: 4px 10px !important;
                font-size: 11px !important;
                font-weight: 600 !important;
                letter-spacing: 0.02em !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
            }
            .label-success {
                background-color: rgba(16, 185, 129, 0.15) !important;
                border: 1px solid rgba(16, 185, 129, 0.35) !important;
                color: #34d399 !important;
            }
            .label-danger {
                background-color: rgba(239, 68, 68, 0.15) !important;
                border: 1px solid rgba(239, 68, 68, 0.35) !important;
                color: #f87171 !important;
            }
            .label-warning {
                background-color: rgba(245, 158, 11, 0.15) !important;
                border: 1px solid rgba(245, 158, 11, 0.35) !important;
                color: #fbbf24 !important;
            }
            .label-primary, .label-info {
                background-color: rgba(139, 92, 246, 0.15) !important;
                border: 1px solid rgba(139, 92, 246, 0.35) !important;
                color: #c084fc !important;
            }
            .label-default {
                background-color: rgba(148, 163, 184, 0.15) !important;
                border: 1px solid rgba(148, 163, 184, 0.3) !important;
                color: #cbd5e1 !important;
            }

            /* Alerts */
            .alert {
                border-radius: 14px !important;
                border-width: 1px !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
                padding: 14px 18px !important;
            }
            .alert-danger {
                background-color: rgba(239, 68, 68, 0.12) !important;
                border-color: rgba(239, 68, 68, 0.35) !important;
                color: #fca5a5 !important;
            }
            .alert-success {
                background-color: rgba(16, 185, 129, 0.12) !important;
                border-color: rgba(16, 185, 129, 0.35) !important;
                color: #6ee7b7 !important;
            }
            .alert-warning {
                background-color: rgba(245, 158, 11, 0.12) !important;
                border-color: rgba(245, 158, 11, 0.35) !important;
                color: #fde68a !important;
            }
            .alert-info {
                background-color: rgba(56, 189, 248, 0.12) !important;
                border-color: rgba(56, 189, 248, 0.35) !important;
                color: #7dd3fc !important;
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
                                <i class="fa fa-home"></i> <span>Vue d'ensemble</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}">
                            <a href="{{ route('admin.settings')}}">
                                <i class="fa fa-sliders"></i> <span>Paramètres généraux</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings.nxslab') ?: 'active' }}">
                            <a href="{{ route('admin.settings.nxslab') }}">
                                <i class="fa fa-cloud text-purple"></i> <span>NXSLab &amp; Domaines</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
                            <a href="{{ route('admin.api.index')}}">
                                <i class="fa fa-key"></i> <span>Clés d'API</span>
                            </a>
                        </li>
                        <li class="header"><i class="fa fa-cubes" style="color: #a855f7; margin-right: 6px;"></i> INFRASTRUCTURE</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.databases') ?: 'active' }}">
                            <a href="{{ route('admin.databases') }}">
                                <i class="fa fa-database"></i> <span>Bases de données</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.locations') ?: 'active' }}">
                            <a href="{{ route('admin.locations') }}">
                                <i class="fa fa-globe"></i> <span>Emplacements</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nodes') ?: 'active' }}">
                            <a href="{{ route('admin.nodes') }}">
                                <i class="fa fa-sitemap"></i> <span>Nœuds Wings</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.servers') ?: 'active' }}">
                            <a href="{{ route('admin.servers') }}">
                                <i class="fa fa-server"></i> <span>Serveurs</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.users') ?: 'active' }}">
                            <a href="{{ route('admin.users') }}">
                                <i class="fa fa-users"></i> <span>Utilisateurs &amp; Crédits</span>
                            </a>
                        </li>
                        <li class="header"><i class="fa fa-puzzle-piece" style="color: #a855f7; margin-right: 6px;"></i> SERVICES &amp; MODÈLES</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.mounts') ?: 'active' }}">
                            <a href="{{ route('admin.mounts') }}">
                                <i class="fa fa-hdd-o"></i> <span>Points de montage</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nests') ?: 'active' }}">
                            <a href="{{ route('admin.nests') }}">
                                <i class="fa fa-th-large"></i> <span>Nids &amp; Modèles</span>
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
                            @if (isset($errors) && count($errors) > 0)
                                <div class="alert alert-danger">
                                    Une erreur est survenue lors de la validation des données.<br><br>
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
                    <strong><i class="fa fa-fw fa-clock-o"></i></strong> {{ round(microtime(true) - (defined('LARAVEL_START') ? LARAVEL_START : microtime(true)), 3) }}s
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
                            title: 'Voulez-vous vous déconnecter ?',
                            text: 'Vous devrez vous reconnecter pour accéder au panneau d\'administration.',
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#ef4444',
                            cancelButtonColor: '#25213b',
                            confirmButtonText: 'Se déconnecter',
                            cancelButtonText: 'Annuler'
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
