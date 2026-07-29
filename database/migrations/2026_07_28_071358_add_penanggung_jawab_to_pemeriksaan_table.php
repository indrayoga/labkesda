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
            $table->string('penanggung_jawab')->nullable()->after('keterangan');
            $table->string('tempat_lahir_penanggung_jawab')->nullable()->after('penanggung_jawab');
            $table->date('tanggal_lahir_penanggung_jawab')->nullable()->after('tempat_lahir_penanggung_jawab');
            $table->string('alamat_penanggung_jawab')->nullable()->after('tanggal_lahir_penanggung_jawab');
            $table->string('telepon_penanggung_jawab')->nullable()->after('alamat_penanggung_jawab');
            $table->enum('hubungan_penanggung_jawab', ['suami', 'istri', 'ayah', 'ibu', 'anak', 'keluarga'])->nullable()->after('telepon_penanggung_jawab');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemeriksaan', function (Blueprint $table) {
            $table->dropColumn('penanggung_jawab');
            $table->dropColumn('tempat_lahir_penanggung_jawab');
            $table->dropColumn('tanggal_lahir_penanggung_jawab');
            $table->dropColumn('alamat_penanggung_jawab');
            $table->dropColumn('telepon_penanggung_jawab');
            $table->dropColumn('hubungan_penanggung_jawab');
        });
    }
};
