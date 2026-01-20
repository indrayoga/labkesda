<?php

namespace Database\Seeders;

use App\Models\JenisPembayaran;
use App\Models\KategoriLayanan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JenisPembayaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $jenisPembayaran = array(
            array(
                "nama" => "Tunai"
            ),
            array(
                "nama" => "QRIS"
            ),
            array(
                "nama" => "Transfer"
            ),
            array(
                "nama" => "Klaim BPJS"
            ),
            array(
                "nama" => "MOU/Kerja Sama"
            )
        );

        foreach ($jenisPembayaran as $jenis) {
            JenisPembayaran::create([
                'nama' => $jenis['nama'],
            ]);
        }
    }
}
