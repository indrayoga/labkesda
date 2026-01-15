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
        Schema::table('customers', function (Blueprint $table) {
            //
            $table->unsignedInteger('kecamatan_id')->nullable()->after('alamat');
            $table->unsignedInteger('kelurahan_id')->nullable()->after('kecamatan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            //
            $table->dropColumn('kecamatan_id');
            $table->dropColumn('kelurahan_id');
        });
    }
};
