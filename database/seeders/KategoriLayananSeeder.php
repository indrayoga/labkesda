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
        $kategoriLayanan = array(
            array(
                "id" => "14ad1b36-75b0-435e-8dba-4464abab0da5",
                "nama" => "MIKROSKOPIS"
            ),
            array(
                "id" => "4e226662-10d2-4454-9286-bdb1bab510d1",
                "nama" => "URINALISA"
            ),
            array(
                "id" => "5c7e6f1c-289a-4b9f-a067-e84e1beff9aa",
                "nama" => "LAIN-LAIN"
            ),
            array(
                "id" => "6064ca44-89ad-4884-9f29-e5cd0a38a74a",
                "nama" => "KIMIA DARAH"
            ),
            array(
                "id" => "a98283be-e02f-488b-9082-a7ea59857bd1",
                "nama" => "HEMATOLOGI"
            ),
            array(
                "id" => "cc8ac91f-a6e3-42d1-b104-1e5d1f705b29",
                "nama" => "IMUNO-SEROLOGI"
            )
        );

        foreach ($kategoriLayanan as $kategori) {
            KategoriLayanan::create([
                'id' => $kategori['id'],
                'nama' => $kategori['nama'],
            ]);
        }
    }
}
