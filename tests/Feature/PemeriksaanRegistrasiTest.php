<?php

namespace Tests\Feature;

use App\Models\ItemPemeriksaan;
use App\Models\KategoriPemeriksaan;
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
                'tanggal_periksa' => '2026-05-06',
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
            'qty' => 1,
        ]);
    }

    public function test_store_pemeriksaan_menyimpan_qty_layanan_ke_order_dan_detail(): void
    {
        $user = User::factory()->create();
        $jenisPasien = JenisPasien::create([
            'kode' => 'UMUM',
            'nama' => 'Umum',
            'kategori' => 'umum',
        ]);
        $kategori = KategoriLayanan::create([
            'nama' => 'Hematologi',
            'jenis_lab' => 'klinis',
        ]);
        $layanan = JenisLayanan::create([
            'kategori_layanan_id' => $kategori->id,
            'nama' => 'Hemoglobin',
            'harga' => 15000,
        ]);

        $pasien = Pasien::create([
            'nama' => 'Rina',
            'jenis_kelamin' => 'Perempuan',
            'tempat_lahir' => 'Balikpapan',
            'tanggal_lahir' => '1993-03-03',
            'no_telepon' => '08121234567',
            'kecamatan_id' => 1,
            'kelurahan_id' => 1,
            'alamat' => 'Jl. Anggrek',
            'pekerjaan' => 'Perawat',
        ]);
        $dokter = Dokter::create([
            'nama' => 'dr. Lala',
            'alamat' => 'Balikpapan',
            'no_telepon' => '08127778888',
            'email' => 'lala@example.com',
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('pemeriksaan.store'), [
                'id_spesimen' => 'SP-003',
                'pasien_id' => $pasien->id,
                'dokter_id' => $dokter->id,
                'jenis_pasien' => $jenisPasien->kode,
                'tanggal_pendaftaran' => '2026-05-06',
                'jam_pendaftaran' => '10:00',
                'tanggal_periksa' => '2026-05-06',
                'diagnosa' => 'Kontrol Hb',
                'items' => [
                    [
                        'tipe' => 'layanan',
                        'id' => $layanan->id,
                        'qty' => 3,
                    ],
                ],
            ]);

        $response->assertRedirect(route('pendaftaran'));

        $pemeriksaan = Pemeriksaan::query()->firstOrFail();

        $this->assertSame(45000, $pemeriksaan->total);
        $this->assertDatabaseHas('pemeriksaan_layanan_order', [
            'pemeriksaan_id' => $pemeriksaan->id,
            'tipe' => 'layanan',
            'jenis_layanan_id' => $layanan->id,
            'harga' => 45000,
        ]);
        $this->assertDatabaseHas('detail_pemeriksaan', [
            'pemeriksaan_id' => $pemeriksaan->id,
            'jenis_layanan_id' => $layanan->id,
            'harga' => 45000,
            'qty' => 3,
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
                'tanggal_periksa' => '2026-05-06',
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

    public function test_update_hasil_pemeriksaan_menyimpan_item_berulang_sesuai_qty(): void
    {
        $user = User::factory()->create(['role' => 'analis_lab']);
        $pasien = Pasien::create([
            'nama' => 'Dewi',
            'jenis_kelamin' => 'Perempuan',
            'tempat_lahir' => 'Balikpapan',
            'tanggal_lahir' => '1991-04-12',
            'no_telepon' => '08123456000',
            'kecamatan_id' => 1,
            'kelurahan_id' => 1,
            'alamat' => 'Jl. Kenanga',
            'pekerjaan' => 'Guru',
        ]);
        $dokter = Dokter::create([
            'nama' => 'dr. Nisa',
            'alamat' => 'Balikpapan',
            'no_telepon' => '08121111000',
            'email' => 'nisa@example.com',
        ]);
        $kategoriLayanan = KategoriLayanan::create([
            'nama' => 'Kimia Klinik',
            'jenis_lab' => 'klinis',
        ]);
        $jenisLayanan = JenisLayanan::create([
            'kategori_layanan_id' => $kategoriLayanan->id,
            'nama' => 'Glukosa',
            'harga' => 10000,
        ]);
        $kategoriPemeriksaan = KategoriPemeriksaan::create([
            'nama' => 'Kimia Klinik',
        ]);
        $itemPemeriksaan = ItemPemeriksaan::create([
            'kategori_pemeriksaan_id' => $kategoriPemeriksaan->id,
            'nama' => 'Glukosa Puasa',
            'satuan' => 'mg/dL',
            'metode' => 'Fotometri',
        ]);
        $itemPemeriksaan->jenisLayanan()->attach($jenisLayanan->id);

        $pemeriksaan = Pemeriksaan::create([
            'id_spesimen' => 'SP-004',
            'pasien_id' => $pasien->id,
            'dokter_id' => $dokter->id,
            'tanggal_pendaftaran' => '2026-08-03',
            'jam_pendaftaran' => '08:00',
            'tanggal_periksa' => '2026-08-03',
            'diagnosa' => 'Kontrol',
            'petugas_pendaftaran_id' => $user->id,
        ]);
        $detail = $pemeriksaan->detailPemeriksaan()->create([
            'jenis_layanan_id' => $jenisLayanan->id,
            'qty' => 2,
            'harga' => 20000,
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('pemeriksaan.update-hasil-pemeriksaan', $pemeriksaan->id), [
                'nomor_sampel' => 'SPL-001',
                'tanggal_sampling' => '2026-08-03',
                'jam_sampling' => '08:30',
                'tanggal_sampel_diterima' => '2026-08-03',
                'jam_sampel_diterima' => '08:45',
                'tanggal_hasil_selesai' => '2026-08-03',
                'jam_hasil_selesai' => '09:30',
                'keterangan' => 'Dua kali pengukuran',
                'hasil_pemeriksaan' => [
                    [
                        'item_pemeriksaan_id' => $itemPemeriksaan->id,
                        'detail_pemeriksaan_id' => $detail->id,
                        'item_ke' => 1,
                        'hasil' => '95',
                        'status' => 'normal',
                    ],
                    [
                        'item_pemeriksaan_id' => $itemPemeriksaan->id,
                        'detail_pemeriksaan_id' => $detail->id,
                        'item_ke' => 2,
                        'hasil' => '98',
                        'status' => 'normal',
                    ],
                ],
            ]);

        $response->assertRedirect(route('pemeriksaan.show', $pemeriksaan->id));
        $this->assertDatabaseCount('hasil_pemeriksaan', 2);
        $this->assertDatabaseHas('hasil_pemeriksaan', [
            'pemeriksaan_id' => $pemeriksaan->id,
            'item_pemeriksaan_id' => $itemPemeriksaan->id,
            'detail_pemeriksaan_id' => $detail->id,
            'item_ke' => 1,
            'hasil' => '95',
        ]);
        $this->assertDatabaseHas('hasil_pemeriksaan', [
            'pemeriksaan_id' => $pemeriksaan->id,
            'item_pemeriksaan_id' => $itemPemeriksaan->id,
            'detail_pemeriksaan_id' => $detail->id,
            'item_ke' => 2,
            'hasil' => '98',
        ]);
    }
}
