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
        Schema::table('pemeriksaan', function (Blueprint $table) {
            //
            $table->string('email')->nullable()->after('pasien_id');
            $table->string('jenis_bayar')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemeriksaan', function (Blueprint $table) {
            //
            $table->dropColumn('email');
            $table->dropColumn('jenis_bayar');
        });
    }
};
