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
        Schema::create('pemeriksaan_reference_ranges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('item_pemeriksaan_id');
            $table->string('label');
            $table->enum('jenis_kelamin', ['L', 'P', 'ALL'])->default('ALL'); // L/P/ALL
            $table->double('min_value')->nullable();
            $table->double('max_value')->nullable();
            $table->enum('operator_min', ['>', '<', '>=', '<=', '='])->nullable();
            $table->enum('operator_max', ['<', '>', '<=', '>=', '='])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_reference_ranges');
    }
};
