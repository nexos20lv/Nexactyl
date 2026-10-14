<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('server_subdomains')) {
            Schema::create('server_subdomains', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('server_id')->unique();
                $table->unsignedInteger('user_id');
                $table->string('subdomain', 64)->unique();
                $table->string('domain', 128)->default('nxslab.in');
                $table->unsignedInteger('port');
                $table->string('target', 191);
                $table->string('protocol', 16)->default('_tcp');
                $table->string('service', 32)->default('_minecraft');
                $table->string('cloudflare_id', 128)->nullable();
                $table->string('status', 32)->default('active');
                $table->timestamps();

                $table->foreign('server_id')->references('id')->on('servers')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('server_subdomains');
    }
};
