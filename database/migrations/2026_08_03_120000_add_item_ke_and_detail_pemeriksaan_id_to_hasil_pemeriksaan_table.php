<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hasil_pemeriksaan', function (Blueprint $table) {
            $table->uuid('detail_pemeriksaan_id')->nullable()->after('pemeriksaan_id');
            $table->unsignedInteger('item_ke')->default(1)->after('item_pemeriksaan_id');
            $table->index(['pemeriksaan_id', 'item_pemeriksaan_id', 'item_ke'], 'hasil_pemeriksaan_item_ke_idx');
        });
    }

    public function down(): void
    {
        Schema::table('hasil_pemeriksaan', function (Blueprint $table) {
            $table->dropIndex('hasil_pemeriksaan_item_ke_idx');
            $table->dropColumn(['detail_pemeriksaan_id', 'item_ke']);
        });
    }
};
