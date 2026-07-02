<?php

namespace Tests\Feature;

use App\Models\Dokter;
use App\Models\JenisLayanan;
use App\Models\JenisPasien;
use App\Models\KategoriLayanan;
use App\Models\PaketPemeriksaan;
use App\Models\Pasien;
use App\Models\Pemeriksaan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PemeriksaanRegistrasiTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_pemeriksaan_menyimpan_order_dan_breakdown_teknis(): void
    {
        $user = User::factory()->create();
        $jenisPasien = JenisPasien::create([
            'kode' => 'UMUM',
            'nama' => 'Umum',
            'kategori' => 'umum',
        ]);
        $kategori = KategoriLayanan::create([
            'nama' => 'Kimia Klinik',
            'jenis_lab' => 'klinis',
        ]);
        $layananDarah = JenisLayanan::create([
            'kategori_layanan_id' => $kategori->id,
            'nama' => 'Glukosa Darah',
            'harga' => 10000,
        ]);
        $layananKolesterol = JenisLayanan::create([
            'kategori_layanan_id' => $kategori->id,
            'nama' => 'Kolesterol',
            'harga' => 20000,
        ]);
        $paket = PaketPemeriksaan::create([
            'nama' => 'Paket Skrining',
            'jenis_lab' => 'klinis',
        ]);
        $paket->jenisLayanan()->sync([$layananDarah->id, $layananKolesterol->id]);

        $pasien = Pasien::create([
            'nama' => 'Budi',
            'jenis_kelamin' => 'Laki-laki',
            'tempat_lahir' => 'Balikpapan',
            'tanggal_lahir' => '1990-01-01',
            'no_telepon' => '08123456789',
            'kecamatan_id' => 1,
            'kelurahan_id' => 1,
            'alamat' => 'Jl. Mawar',
            'pekerjaan' => 'Pegawai',
        ]);
        $dokter = Dokter::create([
            'nama' => 'dr. Sinta',
            'alamat' => 'Balikpapan',
            'no_telepon' => '08129876543',
            'email' => 'dokter@example.com',
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('pemeriksaan.store'), [
                'id_spesimen' => 'SP-001',
                'pasien_id' => $pasien->id,
                'dokter_id' => $dokter->id,
                'jenis_pasien' => $jenisPasien->kode,
                'tanggal_pendaftaran' => '2026-05-06',
                'jam_pendaftaran' => '08:00',
                'diagnosa' => 'Check up rutin',
                'items' => [
                    [
                        'tipe' => 'paket',
                        'id' => $paket->id,
                    ],
                    [
                        'tipe' => 'layanan',
                        'id' => $layananDarah->id,
                    ],
                ],
            ]);

        $response->assertRedirect(route('pendaftaran'));

        $pemeriksaan = Pemeriksaan::query()->firstOrFail();

        $this->assertCount(2, $pemeriksaan->layananOrder);
        $this->assertSame(2, $pemeriksaan->detailPemeriksaan()->count());
        $this->assertSame(30000, $pemeriksaan->layananOrder()->where('tipe', 'paket')->value('harga'));
        $this->assertSame(40000, $pemeriksaan->total);
        $this->assertDatabaseHas('pemeriksaan_layanan_order', [
            'pemeriksaan_id' => $pemeriksaan->id,
            'tipe' => 'paket',
            'nama_snapshot' => 'Paket Skrining',
        ]);
        $this->assertDatabaseHas('detail_pemeriksaan', [
            'pemeriksaan_id' => $pemeriksaan->id,
            'jenis_layanan_id' => $layananKolesterol->id,
            'harga' => 20000,
        ]);
    }

    public function test_store_pemeriksaan_menolak_paket_kosong(): void
    {
        $user = User::factory()->create();
        $jenisPasien = JenisPasien::create([
            'kode' => 'UMUM',
            'nama' => 'Umum',
            'kategori' => 'umum',
        ]);
        $paket = PaketPemeriksaan::create([
            'nama' => 'Paket Kosong',
            'jenis_lab' => 'klinis',
        ]);
        $pasien = Pasien::create([
            'nama' => 'Ani',
            'jenis_kelamin' => 'Perempuan',
            'tempat_lahir' => 'Balikpapan',
            'tanggal_lahir' => '1992-02-02',
            'no_telepon' => '08120000000',
            'kecamatan_id' => 1,
            'kelurahan_id' => 1,
            'alamat' => 'Jl. Melati',
            'pekerjaan' => 'Wiraswasta',
        ]);
        $dokter = Dokter::create([
            'nama' => 'dr. Maya',
            'alamat' => 'Balikpapan',
            'no_telepon' => '08123334444',
            'email' => 'maya@example.com',
        ]);

        $response = $this
            ->actingAs($user)
            ->from(route('pendaftaran-laboratorium', $pasien->id))
            ->post(route('pemeriksaan.store'), [
                'id_spesimen' => 'SP-002',
                'pasien_id' => $pasien->id,
                'dokter_id' => $dokter->id,
                'jenis_pasien' => $jenisPasien->kode,
                'tanggal_pendaftaran' => '2026-05-06',
                'jam_pendaftaran' => '09:00',
                'diagnosa' => 'Check up',
                'items' => [
                    [
                        'tipe' => 'paket',
                        'id' => $paket->id,
                    ],
                ],
            ]);

        $response->assertRedirect(route('pendaftaran-laboratorium', $pasien->id));
        $response->assertSessionHasErrors('items');
        $this->assertDatabaseCount('pemeriksaan', 0);
    }
}
