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
        Schema::create('pemeriksaan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no_registrasi')->unique();
            $table->string('id_spesimen')->nullable();
            $table->uuid('pasien_id')->nullable();
            $table->uuid('dokter_id')->nullable();
            $table->date('tanggal_pendaftaran');
            $table->time('jam_pendaftaran');
            $table->date('tanggal_periksa')->nullable();
            $table->time('jam_periksa')->nullable();
            $table->time('jam_sampling')->nullable();
            $table->string('diagnosa');
            $table->boolean('hasil_dikirim_ke_pasien')->default(false);
            $table->boolean('hasil_dikirim_ke_dokter')->default(false);
            $table->boolean('pasien_tidak_puasa')->default(false);
            $table->integer('pasien_puasa_jam')->default(0);
            $table->string('persiapan_pasien')->nullable();
            $table->unsignedInteger('petugas_pendaftaran_id');
            $table->unsignedInteger('petugas_sampling_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan');
    }
};
