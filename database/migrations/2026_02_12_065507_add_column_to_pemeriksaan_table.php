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
            $table->string('nomor_sampel')->nullable()->after('jam_pendaftaran');
            $table->date('tanggal_sampling')->nullable()->after('jam_periksa');
            $table->date('tanggal_sampel_diterima')->nullable()->after('jam_sampling');
            $table->time('jam_sampel_diterima')->nullable()->after('tanggal_sampel_diterima');
            $table->date('tanggal_hasil_selesai')->nullable()->after('jam_sampel_diterima');
            $table->time('jam_hasil_selesai')->nullable()->after('tanggal_hasil_selesai');
            $table->text('keterangan')->nullable()->after('status_periksa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemeriksaan', function (Blueprint $table) {
            //
            $table->dropColumn([
                'nomor_sampel',
                'tanggal_sampling',
                'tanggal_sampel_diterima',
                'jam_sampel_diterima',
                'tanggal_hasil_selesai',
                'jam_hasil_selesai',
                'keterangan',
            ]);
        });
    }
};
