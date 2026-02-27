<?php

namespace App\Http\Controllers;

use App\Models\ItemPemeriksaan;
use App\Models\JenisLayanan;
use App\Models\Pemeriksaan;
use App\Services\EsignBsreService;
use App\Services\EsignBsreV2Service;
use App\Services\FormulirPengambilanSamplePdf;
use App\Services\HasilPemeriksaanPdf;
use App\Services\InformedConsentNarkobaPdf;
use App\Services\InformedConsentPdf;
use App\Services\ItemPemeriksaanService;
use App\Services\PermintaanPengambilanSampleNapza;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PemeriksaanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //
        $tanggal = $request->tanggal ?? date('Y-m-d');
        return Inertia::render('Pemeriksaan/Index', [
            'tanggal' => $tanggal,
            'pemeriksaan' => Pemeriksaan::with(['pasien', 'dokter', 'detailPemeriksaan.jenisLayanan'])
                ->whereDate('tanggal_pendaftaran', $tanggal)
                ->orderBy('created_at', 'asc')
                ->paginate(10),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_spesimen' => 'required|string',
            'pasien_id' => 'required|exists:pasien,id',
            'dokter_id' => 'required|exists:dokter,id',
            'email' => 'nullable|email',
            'jenis_pasien' => 'required|string',
            'tanggal_pendaftaran' => 'required|date',
            'jam_pendaftaran' => 'required',
            'diagnosa' => 'required|string',
            'layanan' => 'required|array',
            'layanan.*.id' => 'exists:jenis_layanan,id',
        ]);

        try {
            DB::beginTransaction();
            $pemeriksaan = Pemeriksaan::create([
                'id_spesimen' => $request->id_spesimen,
                'pasien_id' => $request->pasien_id,
                'dokter_id' => $request->dokter_id,
                'email' => $request->email,
                'jenis_pasien' => $request->jenis_pasien,
                'tanggal_pendaftaran' => $request->tanggal_pendaftaran,
                'jam_pendaftaran' => $request->jam_pendaftaran,
                'diagnosa' => $request->diagnosa,
                'hasil_dikirim_ke_pasien' => $request->hasil_dikirim_ke_pasien ?? false,
                'hasil_dikirim_ke_dokter' => $request->hasil_dikirim_ke_dokter ?? false,
                'pasien_tidak_puasa' => $request->pasien_tidak_puasa ?? false,
                'pasien_puasa_jam' => $request->pasien_puasa_jam ?? 0,
                'persiapan_pasien' => $request->persiapan_pasien ?? '',
                'petugas_pendaftaran_id' => Auth::user()->id,
            ]);

            foreach ($request->layanan as $layanan) {
                $pemeriksaan->detailPemeriksaan()->create([
                    'jenis_layanan_id' => $layanan['id'],
                    'harga' => $layanan['harga'],
                ]);
            }

            DB::commit();

            return \redirect()->route('pendaftaran');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saat mendaftarkan pemeriksaan: ' . $e->getMessage());
            return back()->withErrors('Terjadi kesalahan saat menyimpan pendaftaran pemeriksaan.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Pemeriksaan $pemeriksaan)
    {
        // ambil item pemeriksaan terkait dan jenis layanannya
        $itemPemeriksaan = ItemPemeriksaan::whereHas('jenisLayanan', function ($query) use ($pemeriksaan) {
            $query->whereIn('jenis_layanan.id', $pemeriksaan->detailPemeriksaan->pluck('jenis_layanan_id'));
        })->with(['referenceRanges', 'parent'])->get();
        $pemeriksaanItems = [];
        foreach ($itemPemeriksaan as $item) {
            $pemeriksaanItems[] = ItemPemeriksaanService::getTreeById($item->id);
        }
        // dd(\json_encode($pemeriksaanItems));
        return Inertia::render('Pemeriksaan/Show', [
            'pemeriksaan' => $pemeriksaan->load(['pasien', 'dokter', 'detailPemeriksaan.jenisLayanan', 'hasilPemeriksaan']),
            'pemeriksaanItems' => $pemeriksaanItems,
        ]);
    }

    public function previewTtd(Pemeriksaan $pemeriksaan)
    {
        return Inertia::render('Pemeriksaan/PreviewTtd', [
            'pemeriksaan' => $pemeriksaan,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pemeriksaan $pemeriksaan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pemeriksaan $pemeriksaan)
    {
        //
    }

    public function updateHasilPemeriksaan(Request $request, Pemeriksaan $pemeriksaan)
    {
        $request->validate([
            'nomor_sampel' => 'required|string',
            'tanggal_sampling' => 'required|date',
            'jam_sampling' => 'required',
            'tanggal_sampel_diterima' => 'required|date',
            'jam_sampel_diterima' => 'required',
            'tanggal_hasil_selesai' => 'required|date',
            'jam_hasil_selesai' => 'required',
            'keterangan' => 'nullable|string',
            'hasil_pemeriksaan' => 'required|array',
            'hasil_pemeriksaan.*.item_pemeriksaan_id' => 'required|exists:item_pemeriksaan,id',
            'hasil_pemeriksaan.*.hasil' => 'required|string',
        ]);

        try {
            DB::beginTransaction();
            // Update data pemeriksaan
            $pemeriksaan->update([
                'nomor_sampel' => $request->nomor_sampel,
                'tanggal_sampling' => $request->tanggal_sampling,
                'jam_sampling' => $request->jam_sampling,
                'tanggal_sampel_diterima' => $request->tanggal_sampel_diterima,
                'jam_sampel_diterima' => $request->jam_sampel_diterima,
                'tanggal_hasil_selesai' => $request->tanggal_hasil_selesai,
                'jam_hasil_selesai' => $request->jam_hasil_selesai,
                'keterangan' => $request->keterangan,
            ]);
            // Hapus hasil pemeriksaan lama
            $pemeriksaan->hasilPemeriksaan()->delete();

            // Simpan hasil pemeriksaan baru
            foreach ($request->hasil_pemeriksaan as $hasil) {
                $itemPemeriksaan = ItemPemeriksaan::query()
                    ->where('id', $hasil['item_pemeriksaan_id'])
                    ->with(['referenceRanges', 'parent'])->first();

                $pemeriksaan->hasilPemeriksaan()->create([
                    'item_pemeriksaan_id' => $hasil['item_pemeriksaan_id'],
                    'hasil' => $hasil['hasil'],
                    'status' => $hasil['status'] ?? 'normal',
                    'satuan' => $itemPemeriksaan->satuan,
                    'nilai_rujukan' => $itemPemeriksaan->nilai_rujukan,
                    'metode' => $itemPemeriksaan->metode,
                ]);
            }

            DB::commit();

            return redirect()->route('pemeriksaan.show', $pemeriksaan->id)
                ->with('success', 'Hasil pemeriksaan berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saat memperbarui hasil pemeriksaan: ' . $e->getMessage());
            return back()->withErrors('Terjadi kesalahan saat memperbarui hasil pemeriksaan.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pemeriksaan $pemeriksaan)
    {
        //
        if (!empty($pemeriksaan->status_bayar) || !empty($pemeriksaan->pembayaran)) {
            return redirect()->back()->with('error', 'Pemeriksaan ini tidak dapat dihapus karena sudah memiliki status pembayaran.');
        }

        $pemeriksaan->detailPemeriksaan()->delete();
        $pemeriksaan->delete();

        return redirect()->route('pemeriksaan.index');
    }

    public function printInformedConsent(Pemeriksaan $pemeriksaan)
    {
        $pdf = new InformedConsentPdf($pemeriksaan);
        $pdf->AddPage();
        $pdf->sectionPenjelasan();
        $pdf->sectionPersetujuan();
        $pdf->signatureSection();

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf');
    }

    public function printFormulirPengambilanSample(Pemeriksaan $pemeriksaan)
    {
        $pdf = new FormulirPengambilanSamplePdf($pemeriksaan);
        $pdf->AddPage();
        $pdf->formSection();

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf');
    }

    public function printPermintaanPemeriksaanNapza(Pemeriksaan $pemeriksaan)
    {
        $pdf = new PermintaanPengambilanSampleNapza($pemeriksaan);
        $pdf->AddPage();
        $pdf->formSection();

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf');
    }

    public function printHasilPemeriksaan(Pemeriksaan $pemeriksaan)
    {
        $pdf = new HasilPemeriksaanPdf($pemeriksaan);
        $pdf->generate();

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf');
    }

    public function signHasilPemeriksaan(Request $request, Pemeriksaan $pemeriksaan)
    {
        $request->validate([
            'nik' => 'required|string|max:32',
            'passphrase' => 'required|string',
            'qr_page' => 'required|integer|min:1',
            'qr_x_ratio' => 'required|numeric|min:0|max:1',
            'qr_y_ratio' => 'required|numeric|min:0|max:1',
            'qr_page_width_pt' => 'nullable|numeric|min:1|max:5000',
            'qr_page_height_pt' => 'nullable|numeric|min:1|max:5000',
            'qr_image' => 'required|string',
        ]);

        $pdf = new HasilPemeriksaanPdf($pemeriksaan);
        $pdf->generate();

        $tmpDir = storage_path('app/tmp');
        if (!is_dir($tmpDir)) {
            mkdir($tmpDir, 0755, true);
        }

        $tempFilePath = storage_path('app/tmp/hasil-pemeriksaan-' . Str::uuid() . '.pdf');
        $pdf->Output($tempFilePath, 'F');

        try {
            if (!preg_match('/^data:image\/png;base64,/', $request->qr_image)) {
                return response()->json([
                    'message' => 'Format QR image tidak valid.',
                ], 422);
            }

            $imageBase64 = preg_replace('/^data:image\/png;base64,/', '', $request->qr_image);
            $imageBinary = base64_decode($imageBase64, true);

            if ($imageBinary === false) {
                return response()->json([
                    'message' => 'QR image tidak dapat diproses.',
                ], 422);
            }

            $pageWidthPt = (float) ($request->qr_page_width_pt ?? 595.28);
            $pageHeightPt = (float) ($request->qr_page_height_pt ?? 841.89);
            $xRatio = (float) $request->qr_x_ratio;
            $yRatio = (float) $request->qr_y_ratio;

            $xCenterPt = $xRatio * $pageWidthPt;
            $yCenterPt = $yRatio * $pageHeightPt;

            $stampWidthPt = 56.0 * 72 / 25.4;
            $stampHeightPt = 22.0 * 72 / 25.4;

            $originX = max(0, min($pageWidthPt - $stampWidthPt, $xCenterPt - ($stampWidthPt / 2)));
            $originY = max(0, min($pageHeightPt - $stampHeightPt, $yCenterPt - ($stampHeightPt / 2)));

            $signedPdfContent = app(EsignBsreV2Service::class)->signPdf(
                $tempFilePath,
                $request->nik,
                $request->passphrase,
                [[
                    'page' => (int) $request->qr_page,
                    'originX' => round($originX, 2),
                    'originY' => round($originY, 2),
                    'imageBase64' => $imageBase64,
                    'reason' => 'TTE',
                    'tampilan' => 'VISIBLE',
                    'width' => round($stampWidthPt, 2),
                    'height' => round($stampHeightPt, 2),
                ]]
            );
            return response($signedPdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="hasil-pemeriksaan-ttd.pdf"');
        } finally {
            // if (file_exists($tempFilePath)) {
            //     @unlink($tempFilePath);
            // }
        }
    }

    public function previewHasilPemeriksaanWithQr(Request $request, Pemeriksaan $pemeriksaan)
    {
        $validated = $request->validate([
            'nik' => 'required|string|max:32',
            'passphrase' => 'required|string',
            'qr_page' => 'required|integer|min:1',
            'qr_x_mm' => 'required|numeric|min:0|max:210',
            'qr_y_mm' => 'required|numeric|min:0|max:297',
            'qr_image' => 'required|string',
        ]);

        $qrImagePath = null;

        try {
            if (!preg_match('/^data:image\/png;base64,/', $validated['qr_image'])) {
                return response()->json([
                    'message' => 'Format QR image tidak valid.',
                ], 422);
            }

            $imageBase64 = preg_replace('/^data:image\/png;base64,/', '', $validated['qr_image']);
            $imageBinary = base64_decode($imageBase64, true);

            if ($imageBinary === false) {
                return response()->json([
                    'message' => 'QR image tidak dapat diproses.',
                ], 422);
            }

            $tmpDir = storage_path('app/tmp/qr-preview');
            if (!is_dir($tmpDir)) {
                mkdir($tmpDir, 0755, true);
            }

            $qrImagePath = $tmpDir . '/' . Str::uuid() . '.png';
            file_put_contents($qrImagePath, $imageBinary);

            $pdf = new HasilPemeriksaanPdf($pemeriksaan, [
                'qr_image_path' => $qrImagePath,
                'qr_page' => (int) $validated['qr_page'],
                'qr_position_mm' => [
                    'x' => (float) $validated['qr_x_mm'],
                    'y' => (float) $validated['qr_y_mm'],
                ],
            ]);
            $pdf->generate();

            return response($pdf->Output('S'))
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="preview-hasil-pemeriksaan.pdf"');
        } finally {
            if ($qrImagePath && file_exists($qrImagePath)) {
                @unlink($qrImagePath);
            }
        }
    }
}
