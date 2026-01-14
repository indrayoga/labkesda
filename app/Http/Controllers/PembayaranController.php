<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Pemeriksaan;
use App\Models\PemeriksaanLingkungan;
use App\Services\KwitansiPdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PembayaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //
        $tanggal = $request->tanggal ?? date('Y-m-d');
        return Inertia::render('Pembayaran/Index', [
            'tanggal' => $tanggal,
            'pemeriksaan' => Pemeriksaan::with(['pasien', 'dokter', 'detailPemeriksaan.jenisLayanan'])
                ->whereDate('tanggal_pendaftaran', $tanggal)
                ->whereNull('status_bayar')
                ->orderBy('created_at', 'asc')
                ->paginate(10),
        ]);
    }

    public function lingkungan(Request $request)
    {
        //
        $tanggal = $request->tanggal ?? date('Y-m-d');
        return Inertia::render('Pembayaran/Lingkungan', [
            'tanggal' => $tanggal,
            'pemeriksaan' => PemeriksaanLingkungan::with(['customer', 'detailPemeriksaanLingkungan.jenisLayanan'])
                ->whereDate('tanggal_pendaftaran', $tanggal)
                ->whereNull('status_bayar')
                ->orderBy('created_at', 'asc')
                ->paginate(10),
        ]);
    }

    public function kwitansi(Request $request)
    {
        //
        $tanggal = $request->tanggal ?? date('Y-m-d');
        return Inertia::render('Pembayaran/SudahBayar', [
            'tanggal' => $tanggal,
            'pembayaran' => Pembayaran::with(['pasien', 'customer', 'dokter', 'pemeriksaan.detailPemeriksaan.jenisLayanan', 'pemeriksaanLingkungan.detailPemeriksaanLingkungan.jenisLayanan'])
                ->whereDate('tanggal_bayar', $tanggal)
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
        //
        $request->validate([
            'pemeriksaan_id' => 'sometimes|exists:pemeriksaan,id',
            'pemeriksaan_lingkungan_id' => 'sometimes|exists:pemeriksaan_lingkungan,id',
            // 'jumlah_bayar' => 'required|numeric|min:0',
            // 'metode_bayar' => 'required|string',
        ]);

        try {
            DB::beginTransaction();
            if ($request->pemeriksan_id) {
                $pemeriksaan = Pemeriksaan::findOrFail($request->pemeriksaan_id);

                Pembayaran::create([
                    'pemeriksaan_id' => $pemeriksaan->id,
                    'jumlah_bayar' => $pemeriksaan->total,
                    'metode_bayar' => 'CASH',
                    'user_id' => Auth::user()->id,
                    'tanggal_bayar' => date('Y-m-d'),
                ]);

                $pemeriksaan->status_bayar = 'LUNAS';
                $pemeriksaan->save();
                DB::commit();
                return redirect()->route('pembayaran.index');
            } else {
                $pemeriksaan = PemeriksaanLingkungan::findOrFail($request->pemeriksaan_lingkungan_id);

                Pembayaran::create([
                    'pemeriksaan_id' => $pemeriksaan->id,
                    'jumlah_bayar' => $pemeriksaan->total,
                    'metode_bayar' => 'CASH',
                    'user_id' => Auth::user()->id,
                    'tanggal_bayar' => date('Y-m-d'),
                ]);

                $pemeriksaan->status_bayar = 'LUNAS';
                $pemeriksaan->save();
                DB::commit();
                return redirect()->route('pembayaran.lingkungan');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing payment: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Pembayaran $pembayaran)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pembayaran $pembayaran)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pembayaran $pembayaran)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pembayaran $pembayaran)
    {
        //
    }

    public function printKwitansi(Pembayaran $pembayaran)
    {
        $pdf = new KwitansiPdf($pembayaran);
        $pdf->AddPage();
        $pdf->patientInfo();
        $pdf->table();
        $pdf->footerSection();

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf');
    }
}
