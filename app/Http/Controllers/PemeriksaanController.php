<?php

namespace App\Http\Controllers;

use App\Models\ItemPemeriksaan;
use App\Models\Pemeriksaan;
use App\Models\User;
use App\Services\EsignBsreService;
use App\Services\EsignBsreV2Service;
use App\Services\FormulirPengambilanSamplePdf;
use App\Services\HasilPemeriksaanPdf;
use App\Services\InformedConsentNarkobaPdf;
use App\Services\InformedConsentPdf;
use App\Services\ItemPemeriksaanService;
use App\Services\LembarHasilUjiSementaraPdf;
use App\Services\PemeriksaanRegistrasiService;
use App\Services\PermintaanPengambilanSampleNapza;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
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
        $tanggal_akhir = $request->tanggal_akhir ?? date('Y-m-d');
        return Inertia::render('Pemeriksaan/Index', [
            'tanggal' => $tanggal,
            'tanggal_akhir' => $tanggal_akhir,
            'pemeriksaan' => Pemeriksaan::with(['pasien', 'dokter', 'detailPemeriksaan.jenisLayanan'])
                ->whereBetween('tanggal_pendaftaran', [$tanggal, $tanggal_akhir])
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
    public function store(Request $request, PemeriksaanRegistrasiService $registrasiService)
    {
        $validated = $registrasiService->validateRegistrationRequest($request);

        try {
            DB::beginTransaction();
            $pemeriksaan = Pemeriksaan::create([
                'id_spesimen' => $validated['id_spesimen'],
                'pasien_id' => $validated['pasien_id'],
                'dokter_id' => $validated['dokter_id'],
                'email' => $validated['email'] ?? null,
                'jenis_pasien' => $validated['jenis_pasien'],
                'tanggal_pendaftaran' => $validated['tanggal_pendaftaran'],
                'jam_pendaftaran' => $validated['jam_pendaftaran'],
                'tanggal_periksa' => $validated['tanggal_periksa'],
                'diagnosa' => $validated['diagnosa'],
                'hasil_dikirim_ke_pasien' => $validated['hasil_dikirim_ke_pasien'] ?? false,
                'hasil_dikirim_ke_dokter' => $validated['hasil_dikirim_ke_dokter'] ?? false,
                'pasien_tidak_puasa' => $validated['pasien_tidak_puasa'] ?? false,
                'pasien_puasa_jam' => $validated['pasien_puasa_jam'] ?? 0,
                'persiapan_pasien' => $validated['persiapan_pasien'] ?? '',
                'petugas_pendaftaran_id' => Auth::user()->id,
            ]);

            $registrasiService->syncItems($pemeriksaan, $validated['items'], $validated['jenis_pasien']);

            DB::commit();

            return \redirect()->route('pendaftaran');
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
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
        $pemeriksaanItems = ItemPemeriksaanService::getTreeByPemeriksaan($pemeriksaan);
        // dd(\json_encode($pemeriksaanItems));
        return Inertia::render('Pemeriksaan/Show', [
            'pemeriksaan' => $pemeriksaan->load(['pasien', 'dokter', 'detailPemeriksaan.jenisLayanan', 'hasilPemeriksaan', 'petugasPemeriksaan.user']),
            'pemeriksaanItems' => $pemeriksaanItems,
            'analisLab' => User::where('role', 'analis_lab')->get(),
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
    public function update(Request $request, Pemeriksaan $pemeriksaan, PemeriksaanRegistrasiService $registrasiService)
    {
        $validated = $registrasiService->validateRegistrationRequest($request);

        try {
            DB::beginTransaction();

            $pemeriksaan->update([
                'id_spesimen' => $validated['id_spesimen'],
                'pasien_id' => $validated['pasien_id'],
                'dokter_id' => $validated['dokter_id'],
                'email' => $validated['email'] ?? null,
                'jenis_pasien' => $validated['jenis_pasien'],
                'tanggal_pendaftaran' => $validated['tanggal_pendaftaran'],
                'jam_pendaftaran' => $validated['jam_pendaftaran'],
                'tanggal_periksa' => $validated['tanggal_periksa'],
                'diagnosa' => $validated['diagnosa'],
                'hasil_dikirim_ke_pasien' => $validated['hasil_dikirim_ke_pasien'] ?? false,
                'hasil_dikirim_ke_dokter' => $validated['hasil_dikirim_ke_dokter'] ?? false,
                'pasien_tidak_puasa' => $validated['pasien_tidak_puasa'] ?? false,
                'pasien_puasa_jam' => $validated['pasien_puasa_jam'] ?? 0,
                'persiapan_pasien' => $validated['persiapan_pasien'] ?? '',
            ]);

            $registrasiService->syncItems($pemeriksaan, $validated['items'], $validated['jenis_pasien']);

            DB::commit();

            return redirect()->route('pemeriksaan.index');
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saat memperbarui pendaftaran pemeriksaan: ' . $e->getMessage());
            return back()->withErrors('Terjadi kesalahan saat memperbarui pendaftaran pemeriksaan.');
        }
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
            'petugas' => 'nullable|array',
            'petugas.*' => 'required|exists:users,id',
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

            if ($request->has('petugas')) {
                $pemeriksaan->petugasPemeriksaan()->delete();
                foreach ($request->petugas as $petugasId) {
                    $user = \App\Models\User::find($petugasId);
                    if ($user && $user->role === 'analis_lab') {
                        $pemeriksaan->petugasPemeriksaan()->create([
                            'user_id' => $petugasId,
                        ]);
                    }
                }
            }

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

        $pemeriksaan->layananOrder()->delete();
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
        // Check apakah sudah ada file ttd, jika ada tampilkan yang sudah ttd, jika belum buat pdf baru
        if ($pemeriksaan->file_tte) {
            $filePath = storage_path('app/' . $pemeriksaan->file_tte);
            if (file_exists($filePath)) {
                return response()->file($filePath, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="hasil-pemeriksaan-ttd.pdf"',
                ]);
            } else {
                Log::warning('File TTE tidak ditemukan untuk pemeriksaan ID ' . $pemeriksaan->id);
            }
        }

        $pdf = new HasilPemeriksaanPdf($pemeriksaan);
        $pdf->generate();

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf');
    }

    public function printLembarHasilUjiSementara(Pemeriksaan $pemeriksaan)
    {
        $pdf = new LembarHasilUjiSementaraPdf($pemeriksaan);
        $pdf->generate();

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf');
    }

    public function signHasilPemeriksaan(Request $request, Pemeriksaan $pemeriksaan)
    {
        $validated = $request->validate([
            'nik' => 'required|string|max:32',
            'passphrase' => 'required|string',
            'placements' => 'nullable|array|min:1',
            'placements.*.page' => 'required_with:placements|integer|min:1',
            'placements.*.x_ratio' => 'required_with:placements|numeric|min:0|max:1',
            'placements.*.y_ratio' => 'required_with:placements|numeric|min:0|max:1',
            'placements.*.page_width_pt' => 'nullable|numeric|min:1|max:5000',
            'placements.*.page_height_pt' => 'nullable|numeric|min:1|max:5000',
            'qr_page' => 'required_without:placements|integer|min:1',
            'qr_x_ratio' => 'required_without:placements|numeric|min:0|max:1',
            'qr_y_ratio' => 'required_without:placements|numeric|min:0|max:1',
            'qr_page_width_pt' => 'nullable|numeric|min:1|max:5000',
            'qr_page_height_pt' => 'nullable|numeric|min:1|max:5000',
            'qr_image' => 'required|string',
        ]);

        // check file tte sudah ada di table, jika ada pakai file tte yang sudah ada, jika belum buat pdf baru untuk ditandatangani
        if ($pemeriksaan->file_tte) {
            $filePath = storage_path('app/' . $pemeriksaan->file_tte);
            if (file_exists($filePath)) {
                $tempFilePath = $filePath;
                $existingFileName = basename((string) $pemeriksaan->file_tte);
                $filename = pathinfo($existingFileName, PATHINFO_FILENAME);
            } else {
                Log::warning('File TTE tidak ditemukan untuk pemeriksaan ID ' . $pemeriksaan->id);
                return response()->json([
                    'message' => 'File TTE tidak ditemukan. Pastikan hasil pemeriksaan sudah ditandatangani sebelumnya.',
                ], 422);
            }
        } else {
            $pdf = new HasilPemeriksaanPdf($pemeriksaan);
            $pdf->generate();

            $tmpDir = storage_path('app/tmp');
            if (!is_dir($tmpDir)) {
                mkdir($tmpDir, 0755, true);
            }

            $tempFilePath = storage_path('app/tmp/hasil-pemeriksaan-' . $pemeriksaan->id . '.pdf');
            $filename = 'hasil-pemeriksaan-' . $pemeriksaan->id;
            $pdf->Output($tempFilePath, 'F');
        }


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

            $stampWidthPt = 56.0 * 72 / 25.4;
            $stampHeightPt = 22.0 * 72 / 25.4;

            $placementInputs = $validated['placements'] ?? [[
                'page' => (int) $validated['qr_page'],
                'x_ratio' => (float) $validated['qr_x_ratio'],
                'y_ratio' => (float) $validated['qr_y_ratio'],
                'page_width_pt' => (float) ($validated['qr_page_width_pt'] ?? 595.28),
                'page_height_pt' => (float) ($validated['qr_page_height_pt'] ?? 841.89),
            ]];

            $signatureOptions = [];
            foreach ($placementInputs as $placement) {
                $pageWidthPt = (float) ($placement['page_width_pt'] ?? 595.28);
                $pageHeightPt = (float) ($placement['page_height_pt'] ?? 841.89);
                $xRatio = (float) $placement['x_ratio'];
                $yRatio = (float) $placement['y_ratio'];

                $xCenterPt = $xRatio * $pageWidthPt;
                $yCenterPt = $yRatio * $pageHeightPt;

                $originX = max(0, min($pageWidthPt - $stampWidthPt, $xCenterPt - ($stampWidthPt / 2)));
                $originY = max(0, min($pageHeightPt - $stampHeightPt, $yCenterPt - ($stampHeightPt / 2)));

                $signatureOptions[] = [
                    'page' => (int) $placement['page'],
                    'originX' => round($originX, 2),
                    'originY' => round($originY, 2),
                    'imageBase64' => $imageBase64,
                    'reason' => 'TTE',
                    'tampilan' => 'VISIBLE',
                    'width' => round($stampWidthPt, 2),
                    'height' => round($stampHeightPt, 2),
                ];
            }

            try {
                $signedPdfContent = app(EsignBsreV2Service::class)->signPdf(
                    $tempFilePath,
                    $validated['nik'],
                    $validated['passphrase'],
                    $signatureOptions
                );
            } catch (\Exception $e) {
                Log::error('Error saat menandatangani PDF: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Terjadi kesalahan saat menandatangani PDF. Silakan periksa kredensial Anda dan coba lagi.',
                ], 500);
            }
            // save signed pdf
            $file_tte = $filename . '-signed.pdf';
            $signedPdfPath = storage_path('app/private/' . $file_tte);
            file_put_contents($signedPdfPath, $signedPdfContent);
            //update path signed pdf ke database
            $pemeriksaan->update([
                'file_tte' => 'private/' . $file_tte,
            ]);

            return response($signedPdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="' . $file_tte . '"');
        } finally {
            if (file_exists($tempFilePath)) {
                @unlink($tempFilePath);
            }
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
