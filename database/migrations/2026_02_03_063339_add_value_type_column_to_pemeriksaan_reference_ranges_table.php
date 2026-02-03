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
        Schema::table('pemeriksaan_reference_ranges', function (Blueprint $table) {
            //
            $table->enum('value_type', ['numeric', 'kualitatif'])->default('numeric')->after('jenis_kelamin');
            $table->string('kualitatif_value')->nullable()->after('max_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemeriksaan_reference_ranges', function (Blueprint $table) {
            //
            $table->dropColumn('value_type');
            $table->dropColumn('kualitatif_value');
        });
    }
};
