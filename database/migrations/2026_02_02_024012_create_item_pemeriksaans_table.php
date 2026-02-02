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
        Schema::create('item_pemeriksaan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('kategori_pemeriksaan_id');
            $table->uuid('parent_id')->nullable();
            $table->string('nama');
            $table->string('satuan')->nullable();
            $table->string('metode')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_pemeriksaan');
    }
};
