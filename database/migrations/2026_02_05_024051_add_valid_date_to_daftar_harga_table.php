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
        Schema::table('daftar_harga', function (Blueprint $table) {
            //
            $table->date('valid_dari')->nullable()->after('harga');
            $table->date('valid_sampai')->nullable()->after('valid_dari');
            $table->string('keterangan')->nullable()->after('valid_sampai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daftar_harga', function (Blueprint $table) {
            //
            $table->dropColumn('valid_dari');
            $table->dropColumn('valid_sampai');
            $table->dropColumn('keterangan');
        });
    }
};
