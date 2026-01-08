<?php

namespace App\Http\Controllers;

use App\Models\JenisLayanan;
use App\Models\Pemeriksaan;
use App\Services\InformedConsentPdf;
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
            'jenis_bayar' => 'required|string',
            'tanggal_pendaftaran' => 'required|date',
            'jam_pendaftaran' => 'required',
            'diagnosa' => 'required|string',
            'layanan_ids' => 'required|array',
            'layanan_ids.*' => 'exists:jenis_layanan,id',
        ]);

        try {
            DB::beginTransaction();
            $pemeriksaan = Pemeriksaan::create([
                'id_spesimen' => $request->id_spesimen,
                'pasien_id' => $request->pasien_id,
                'dokter_id' => $request->dokter_id,
                'email' => $request->email,
                'jenis_bayar' => $request->jenis_bayar,
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

            $layanans = JenisLayanan::whereIn('id', $request->layanan_ids)->get();
            foreach ($layanans as $layanan) {
                $pemeriksaan->detailPemeriksaan()->create([
                    'jenis_layanan_id' => $layanan->id,
                    'harga' => $layanan->harga,
                ]);
            }

            DB::commit();

            return \redirect()->route('pasien.index');
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
        //
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
}
