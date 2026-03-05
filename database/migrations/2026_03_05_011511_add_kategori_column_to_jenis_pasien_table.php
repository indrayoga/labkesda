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
        Schema::table('jenis_pasien', function (Blueprint $table) {
            //
            $table->enum('kategori', ['umum', 'asuransi', 'perusahaan'])->default('umum')->after('nama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jenis_pasien', function (Blueprint $table) {
            $table->dropColumn('kategori');
        });
    }
};
