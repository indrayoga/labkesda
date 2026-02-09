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
        Schema::create('item_paket_pemeriksaan', function (Blueprint $table) {
            $table->uuid('paket_pemeriksaan_id');
            $table->uuid('jenis_layanan_id');
            $table->primary(['paket_pemeriksaan_id', 'jenis_layanan_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_paket_pemeriksaan');
    }
};
