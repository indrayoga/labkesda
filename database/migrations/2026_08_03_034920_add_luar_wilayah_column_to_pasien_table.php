<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pasien', function (Blueprint $table) {
            //
            $table->boolean('luar_wilayah')->default(false)->after('kelurahan_id');
            $table->string('kecamatan_luar_wilayah')->nullable()->after('luar_wilayah');
            $table->string('kelurahan_luar_wilayah')->nullable()->after('kecamatan_luar_wilayah');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pasien', function (Blueprint $table) {
            $table->dropColumn('luar_wilayah');
            $table->dropColumn('kecamatan_luar_wilayah');
            $table->dropColumn('kelurahan_luar_wilayah');
        });
    }
};
