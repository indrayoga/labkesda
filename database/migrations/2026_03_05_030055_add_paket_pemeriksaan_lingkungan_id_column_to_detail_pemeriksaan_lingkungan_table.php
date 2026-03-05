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
        Schema::table('detail_pemeriksaan_lingkungan', function (Blueprint $table) {
            //
            $table->uuid('paket_pemeriksaan_lingkungan_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detail_pemeriksaan_lingkungan', function (Blueprint $table) {
            //
            $table->dropColumn('paket_pemeriksaan_lingkungan_id');
        });
    }
};
