<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'credits')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedInteger('credits')->default(2500);
            });
        }

        if (!Schema::hasTable('server_boosters')) {
            Schema::create('server_boosters', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('server_id');
                $table->string('type'); // ram, cpu, disk
                $table->integer('amount');
                $table->unsignedInteger('cost');
                $table->timestamps();

                $table->foreign('server_id')->references('id')->on('servers')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('server_boosters');
        if (Schema::hasColumn('users', 'credits')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('credits');
            });
        }
    }
};
