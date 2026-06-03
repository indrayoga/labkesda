<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pemeriksaan_layanan_order', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pemeriksaan_id');
            $table->enum('tipe', ['paket', 'layanan']);
            $table->uuid('paket_pemeriksaan_id')->nullable();
            $table->uuid('jenis_layanan_id')->nullable();
            $table->string('nama_snapshot');
            $table->unsignedInteger('harga')->default(0);
            $table->unsignedInteger('urutan')->nullable();
            $table->timestamps();

            $table->index('pemeriksaan_id');
            $table->index('paket_pemeriksaan_id');
            $table->index('jenis_layanan_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_layanan_order');
    }
};
