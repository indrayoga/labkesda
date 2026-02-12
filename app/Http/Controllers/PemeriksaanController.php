<?php

namespace App\Http\Controllers;

use App\Models\ItemPemeriksaan;
use App\Models\JenisLayanan;
use App\Models\Pemeriksaan;
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
}
