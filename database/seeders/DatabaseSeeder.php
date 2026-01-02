<?php

namespace Database\Seeders;

use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $kecamatan = array(
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "1",
                "nama" => "BALIKPAPAN TIMUR"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "2",
                "nama" => "BALIKPAPAN BARAT"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "3",
                "nama" => "BALIKPAPAN UTARA"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "4",
                "nama" => "BALIKPAPAN TENGAH"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "5",
                "nama" => "BALIKPAPAN SELATAN"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "6",
                "nama" => "BALIKPAPAN KOTA"
            )
        );
        foreach ($kecamatan as $kec) {
            Kecamatan::create($kec);
        }

        $kelurahan = array(
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "1",
                "no_kel" => "1001",
                "nama" => "MANGGAR"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "1",
                "no_kel" => "1002",
                "nama" => "LAMARU"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "1",
                "no_kel" => "1003",
                "nama" => "TERITIP"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "1",
                "no_kel" => "1004",
                "nama" => "MANGGAR BARU"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "2",
                "no_kel" => "1001",
                "nama" => "BARU ILIR"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "2",
                "no_kel" => "1002",
                "nama" => "BARU TENGAH"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "2",
                "no_kel" => "1003",
                "nama" => "BARU ULU"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "2",
                "no_kel" => "1004",
                "nama" => "KARIANGAU"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "2",
                "no_kel" => "1005",
                "nama" => "MARGO MULYO"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "2",
                "no_kel" => "1006",
                "nama" => "MARGA SARI"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "3",
                "no_kel" => "1001",
                "nama" => "BATU AMPAR"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "3",
                "no_kel" => "1002",
                "nama" => "GUNUNGSAMARINDA"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "3",
                "no_kel" => "1003",
                "nama" => "KARANG JOANG"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "3",
                "no_kel" => "1004",
                "nama" => "MUARARAPAK"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "3",
                "no_kel" => "1005",
                "nama" => "GUNUNGSAMARINDA BARU"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "3",
                "no_kel" => "1006",
                "nama" => "GRAHA INDAH"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "4",
                "no_kel" => "1001",
                "nama" => "GUNUNGSARI ULU"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "4",
                "no_kel" => "1002",
                "nama" => "GUNUNGSARI ILIR"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "4",
                "no_kel" => "1003",
                "nama" => "KARANG REJO"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "4",
                "no_kel" => "1004",
                "nama" => "KARANG JATI"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "4",
                "no_kel" => "1005",
                "nama" => "MEKAR SARI"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "4",
                "no_kel" => "1006",
                "nama" => "SUMBER REJO"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "5",
                "no_kel" => "1002",
                "nama" => "SEPINGGAN"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "5",
                "no_kel" => "1006",
                "nama" => "GUNUNGBAHAGIA"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "5",
                "no_kel" => "1008",
                "nama" => "SEPINGGAN BARU"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "5",
                "no_kel" => "1009",
                "nama" => "SEPINGGAN RAYA"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "5",
                "no_kel" => "1010",
                "nama" => "SUNGAINANGKA"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "5",
                "no_kel" => "1011",
                "nama" => "DAMAI BARU"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "5",
                "no_kel" => "1012",
                "nama" => "DAMAI BAHAGIA"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "6",
                "no_kel" => "1001",
                "nama" => "PRAPATAN"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "6",
                "no_kel" => "1002",
                "nama" => "TELAGA SARI"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "6",
                "no_kel" => "1003",
                "nama" => "KLANDASAN ULU"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "6",
                "no_kel" => "1004",
                "nama" => "KLANDASAN ILIR"
            ),
            array(
                "no_prop" => "64",
                "no_kab" => "71",
                "no_kec" => "6",
                "no_kel" => "1005",
                "nama" => "DAMAI"
            )
        );

        foreach ($kelurahan as $kel) {
            Kelurahan::create($kel);
        }
    }
}
