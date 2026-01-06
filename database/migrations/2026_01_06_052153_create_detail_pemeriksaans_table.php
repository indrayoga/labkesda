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
        Schema::create('detail_pemeriksaan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pemeriksaan_id');
            $table->uuid('jenis_layanan_id');
            $table->unsignedInteger('harga')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_pemeriksaan');
    }
};
