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
        Schema::create('pemeriksaan_lingkungan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no_registrasi')->unique();
            $table->date('tanggal_pendaftaran');
            $table->uuid('customer_id');
            $table->date('tanggal_diambil');
            $table->date('tanggal_diterima');
            $table->integer('jumlah_contoh_uji');
            $table->string('pengambil_contoh_uji');
            $table->enum('wadah_contoh_uji', ['Steril', 'Non-Steril']);
            $table->text('keterangan')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->enum('jenis_bayar', ['cash', 'tagihan'])->default('cash');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_lingkungan');
    }
};
