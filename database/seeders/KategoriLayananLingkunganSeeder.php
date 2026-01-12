<?php

namespace Database\Seeders;

use App\Models\KategoriLayanan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KategoriLayananLingkunganSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $kategoriLayanan = array(
            array(
                "id" => "1d1c334a-08ce-4cf9-9e1c-d1cd4881b817",
                "nama" => "KIMIA AIR"
            ),
            array(
                "id" => "69a1a20d-6141-4e6a-a1ff-38b52013f55f",
                "nama" => "KIMIA PANGAN"
            ),
            array(
                "id" => "6026aba5-1272-4a28-9f63-d4935d5dc149",
                "nama" => "MIKROBIOLOGI AIR,PANGAN DAN UDARA"
            ),
        );

        foreach ($kategoriLayanan as $kategori) {
            KategoriLayanan::create([
                'id' => $kategori['id'],
                'nama' => $kategori['nama'],
            ]);
        }
    }
}
