<?php

namespace App\Services;

use App\Models\JenisLayanan;
use App\Models\PaketPemeriksaan;
use App\Models\Pemeriksaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PemeriksaanRegistrasiService
{
    public function validateRegistrationRequest(Request $request): array
    {
        $items = $this->extractItems($request);
        $payload = array_merge($request->all(), ['items' => $items]);

        $validated = Validator::make($payload, [
            'id_spesimen' => 'required|string',
            'pasien_id' => 'required|exists:pasien,id',
            'dokter_id' => 'required|exists:dokter,id',
            'email' => 'nullable|email',
            'jenis_pasien' => 'required|string|exists:jenis_pasien,kode',
            'tanggal_pendaftaran' => 'required|date',
            'jam_pendaftaran' => 'required',
            'diagnosa' => 'required|string',
            'hasil_dikirim_ke_pasien' => 'nullable|boolean',
            'hasil_dikirim_ke_dokter' => 'nullable|boolean',
            'pasien_tidak_puasa' => 'nullable|boolean',
            'pasien_puasa_jam' => 'nullable|integer|min:0',
            'persiapan_pasien' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.tipe' => 'required|in:paket,layanan',
            'items.*.id' => 'required|string',
            'items.*.harga' => 'nullable|numeric|min:0',
        ])->validate();

        $validated['items'] = array_values($validated['items']);

        return $validated;
    }

    public function syncItems(Pemeriksaan $pemeriksaan, array $items, string $jenisPasien): void
    {
        $pemeriksaan->layananOrder()->delete();
        $pemeriksaan->detailPemeriksaan()->delete();

        $detailRows = [];

        foreach (array_values($items) as $index => $item) {
            if (($item['tipe'] ?? null) === 'paket') {
                $paket = PaketPemeriksaan::query()
                    ->with(['jenisLayanan.kategoriLayanan'])
                    ->where('jenis_lab', 'klinis')
                    ->find($item['id']);

                if (!$paket) {
                    throw ValidationException::withMessages([
                        'items' => ['Paket pemeriksaan yang dipilih tidak valid.'],
                    ]);
                }

                if ($paket->jenisLayanan->isEmpty()) {
                    throw ValidationException::withMessages([
                        'items' => ["Paket {$paket->nama} tidak memiliki item layanan."],
                    ]);
                }

                $hargaPaket = 0;
                foreach ($paket->jenisLayanan as $layanan) {
                    $hargaLayanan = $this->resolveLayananPrice($layanan, $jenisPasien);
                    $hargaPaket += $hargaLayanan;

                    if (!array_key_exists($layanan->id, $detailRows)) {
                        $detailRows[$layanan->id] = [
                            'jenis_layanan_id' => $layanan->id,
                            'harga' => $hargaLayanan,
                        ];
                    }
                }

                $pemeriksaan->layananOrder()->create([
                    'tipe' => 'paket',
                    'paket_pemeriksaan_id' => $paket->id,
                    'nama_snapshot' => $paket->nama,
                    'harga' => $hargaPaket,
                    'urutan' => $index + 1,
                ]);

                continue;
            }

            $layanan = JenisLayanan::query()
                ->with('kategoriLayanan')
                ->whereHas('kategoriLayanan', function ($query) {
                    $query->where('jenis_lab', 'klinis');
                })
                ->find($item['id']);

            if (!$layanan) {
                throw ValidationException::withMessages([
                    'items' => ['Layanan pemeriksaan yang dipilih tidak valid.'],
                ]);
            }

            $hargaLayanan = $this->resolveLayananPrice($layanan, $jenisPasien);

            $pemeriksaan->layananOrder()->create([
                'tipe' => 'layanan',
                'jenis_layanan_id' => $layanan->id,
                'nama_snapshot' => $layanan->nama,
                'harga' => $hargaLayanan,
                'urutan' => $index + 1,
            ]);

            if (!array_key_exists($layanan->id, $detailRows)) {
                $detailRows[$layanan->id] = [
                    'jenis_layanan_id' => $layanan->id,
                    'harga' => $hargaLayanan,
                ];
            }
        }

        foreach ($detailRows as $detailRow) {
            $pemeriksaan->detailPemeriksaan()->create($detailRow);
        }
    }

    public function extractItems(Request $request): array
    {
        $items = $request->input('items');
        if (is_array($items)) {
            return $items;
        }

        $legacyLayanan = $request->input('layanan', []);
        if (!is_array($legacyLayanan)) {
            return [];
        }

        return collect($legacyLayanan)
            ->map(function ($layanan) {
                return [
                    'tipe' => 'layanan',
                    'id' => $layanan['id'] ?? null,
                    'harga' => $layanan['harga'] ?? null,
                ];
            })
            ->values()
            ->all();
    }

    private function resolveLayananPrice(JenisLayanan $layanan, string $jenisPasien): int
    {
        $harga = $layanan->tarif()
            ->where('jenis_pasien', $jenisPasien)
            ->active()
            ->value('harga');

        if ($harga !== null) {
            return (int) $harga;
        }

        $hargaUmum = $layanan->tarif()
            ->where('jenis_pasien', 'UMUM')
            ->active()
            ->value('harga');

        if ($hargaUmum !== null) {
            return (int) $hargaUmum;
        }

        return (int) ($layanan->harga ?? 0);
    }
}
