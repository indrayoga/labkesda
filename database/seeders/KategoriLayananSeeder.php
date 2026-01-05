<?php

namespace Database\Seeders;

use App\Models\KategoriLayanan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KategoriLayananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $kategoriLayanan = [
            ['nama' => 'HEMATOLOGI'],
            ['nama' => 'URINALISA'],
            ['nama' => 'MIKROSKOPIS'],
            ['nama' => 'KIMIA DARAH'],
            ['nama' => 'IMUNO-SEROLOGI'],
            ['nama' => 'LAIN-LAIN'],
        ];

        foreach ($kategoriLayanan as $kategori) {
            KategoriLayanan::create($kategori);
        }
    }
}
