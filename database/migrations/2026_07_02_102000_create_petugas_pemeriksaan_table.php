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
        Schema::create('petugas_pemeriksaan', function (Blueprint $table) {
            $table->id();
            $table->uuid('pemeriksaan_id');
            $table->bigInteger('user_id');
            $table->timestamps();

            $table->unique(['pemeriksaan_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('petugas_pemeriksaan');
    }
};
