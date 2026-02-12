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
        Schema::create('hasil_pemeriksaan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pemeriksaan_id');
            $table->uuid('item_pemeriksaan_id');
            $table->string('hasil')->nullable();
            $table->string('status')->nullable();
            $table->string('satuan')->nullable();
            $table->string('nilai_rujukan')->nullable();
            $table->string('metode')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hasil_pemeriksaan');
    }
};
