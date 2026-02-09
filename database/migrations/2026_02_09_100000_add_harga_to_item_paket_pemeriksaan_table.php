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
        Schema::table('item_paket_pemeriksaan', function (Blueprint $table) {
            $table->double('harga')->default(0)->after('item_pemeriksaan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_paket_pemeriksaan', function (Blueprint $table) {
            $table->dropColumn('harga');
        });
    }
};
