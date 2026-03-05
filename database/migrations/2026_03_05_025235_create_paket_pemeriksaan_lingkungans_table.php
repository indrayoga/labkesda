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
        Schema::create('paket_pemeriksaan_lingkungan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pemeriksaan_lingkungan_id');
            $table->uuid('paket_pemeriksaan_id');
            $table->string('no_lab_contoh_uji');
            $table->time('jam_pengambilan_contoh_uji');
            $table->text('parameter')->nullable();
            $table->text('uraian')->nullable();
            $table->integer('harga')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paket_pemeriksaan_lingkungan');
    }
};
