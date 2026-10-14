@include('partials/admin.settings.notice')

@section('settings::nav')
    @yield('settings::notice')
    <div class="row">
        <div class="col-xs-12">
            <div class="nav-tabs-custom nav-tabs-floating">
                <ul class="nav nav-tabs">
                    <li @if($activeTab === 'basic')class="active"@endif>
                        <a href="{{ route('admin.settings') }}"><i class="fa fa-sliders text-purple"></i> General</a>
                    </li>
                    <li @if($activeTab === 'mail')class="active"@endif>
                        <a href="{{ route('admin.settings.mail') }}"><i class="fa fa-envelope text-info"></i> Mail</a>
                    </li>
                    <li @if($activeTab === 'advanced')class="active"@endif>
                        <a href="{{ route('admin.settings.advanced') }}"><i class="fa fa-shield text-warning"></i> Advanced</a>
                    </li>
                    <li @if($activeTab === 'nxslab')class="active"@endif>
                        <a href="{{ route('admin.settings.nxslab') }}"><i class="fa fa-cloud text-purple"></i> NXSLab &amp; Domaines</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
@endsection
