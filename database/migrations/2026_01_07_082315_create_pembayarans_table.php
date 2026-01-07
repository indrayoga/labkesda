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
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pemeriksaan_id');
            $table->string('no_bayar')->unique();
            $table->date('tanggal_bayar');
            $table->unsignedBigInteger('jumlah_bayar');
            $table->string('metode_bayar')->default('tunai');
            $table->unsignedInteger('user_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
