<?php

namespace Database\Seeders;

use App\Models\JenisLayanan;
use Illuminate\Database\Seeder;

class JenisLayananLingkunganSeeder extends Seeder
{
    public function run(): void
    {
        $layanan = \file_get_contents(database_path('seeders/pemeriksaan_lingkungan.json'));
        $layananData = \json_decode($layanan, true);
        foreach ($layananData as $item) {
            JenisLayanan::create([
                'kategori_layanan_id' => $item['kategori_layanan_id'],
                'nama' => $item['nama'],
                'harga' => $item['harga'],
            ]);
        }
    }
}
