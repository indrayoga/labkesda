<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\JenisLayanan;
use App\Models\PemeriksaanLingkungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PemeriksaanLingkunganController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function daftarregister(Request $request)
    {
        $tanggal = $request->tanggal ?? date('Y-m-d');

        return Inertia::render('PemeriksaanLingkungan/ListRegister', [
            'tanggal' => $tanggal,
            'items' => PemeriksaanLingkungan::with(['customer', 'detailPemeriksaanLingkungan.jenisLayanan'])
                ->whereDate('tanggal_pendaftaran', $tanggal)
                ->orderBy('created_at', 'asc')
                ->paginate(10),
        ]);
    }

    public function pendaftaran()
    {
        return Inertia::render('PemeriksaanLingkungan/Pendaftaran', [
            'customers' => Customer::all(),
            'jenisLayanan' => JenisLayanan::whereHas('kategoriLayanan', function ($query) {
                $query->where('jenis_lab', 'lingkungan');
            })->with('kategoriLayanan')->get(),
        ]);
    }

    public function editPendaftaran(PemeriksaanLingkungan $pemeriksaanLingkungan)
    {
        return Inertia::render('PemeriksaanLingkungan/EditPendaftaran', [
            'pemeriksaanLingkungan' => $pemeriksaanLingkungan->load(['customer', 'detailPemeriksaanLingkungan.jenisLayanan']),
            'customers' => Customer::all(),
            'jenisLayanan' => JenisLayanan::whereHas('kategoriLayanan', function ($query) {
                $query->where('jenis_lab', 'lingkungan');
            })->with('kategoriLayanan')->get(),
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
            'customer_id' => 'required|exists:customers,id',
            'tanggal_pendaftaran' => 'required|date',
            'tanggal_diambil' => 'required|date',
            'tanggal_diterima' => 'required|date',
            'jumlah_contoh_uji' => 'required|integer',
            'pengambil_contoh_uji' => 'required|string',
            'wadah_contoh_uji' => 'required',
            'jenis_bayar' => 'required',
            'detail_pemeriksaan_lingkungan' => 'required|array|min:1',
            'detail_pemeriksaan_lingkungan.*.jenis_layanan_id' => 'required|exists:jenis_layanan,id',
            'detail_pemeriksaan_lingkungan.*.no_lab_contoh_uji' => 'required',
            'detail_pemeriksaan_lingkungan.*.jam_pengambilan_contoh_uji' => 'nullable|string',
            'detail_pemeriksaan_lingkungan.*.parameter' => 'nullable|string',
            'detail_pemeriksaan_lingkungan.*.uraian' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();
            $pemeriksaanLingkungan = PemeriksaanLingkungan::create($request->all());
            foreach ($request->detail_pemeriksaan_lingkungan as $detail) {
                $layanan = JenisLayanan::find($detail['jenis_layanan_id']);
                $detail['harga'] = $layanan->harga;
                $pemeriksaanLingkungan->detailPemeriksaanLingkungan()->create($detail);
            }
            DB::commit();
            return redirect()->route('lab.lingkungan.list-register')->with('success', 'Pendaftaran pemeriksaan lingkungan berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing Pemeriksaan Lingkungan: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data pemeriksaan lingkungan. Silakan coba lagi.']);
        }
    }

    public function updatePendaftaran(Request $request, PemeriksaanLingkungan $pemeriksaanLingkungan)
    {
        //
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'tanggal_pendaftaran' => 'required|date',
            'tanggal_diambil' => 'required|date',
            'tanggal_diterima' => 'required|date',
            'jumlah_contoh_uji' => 'required|integer',
            'pengambil_contoh_uji' => 'required|string',
            'wadah_contoh_uji' => 'required',
            'jenis_bayar' => 'required',
            'detail_pemeriksaan_lingkungan' => 'required|array|min:1',
            'detail_pemeriksaan_lingkungan.*.jenis_layanan_id' => 'required|exists:jenis_layanan,id',
            'detail_pemeriksaan_lingkungan.*.no_lab_contoh_uji' => 'required',
            'detail_pemeriksaan_lingkungan.*.jam_pengambilan_contoh_uji' => 'nullable|string',
            'detail_pemeriksaan_lingkungan.*.parameter' => 'nullable|string',
            'detail_pemeriksaan_lingkungan.*.uraian' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();
            $pemeriksaanLingkungan->update($request->all());
            $pemeriksaanLingkungan->detailPemeriksaanLingkungan()->delete();
            foreach ($request->detail_pemeriksaan_lingkungan as $detail) {
                $layanan = JenisLayanan::find($detail['jenis_layanan_id']);
                $detail['harga'] = $layanan->harga;
                $pemeriksaanLingkungan->detailPemeriksaanLingkungan()->create($detail);
            }
            DB::commit();
            return redirect()->route('lab.lingkungan.list-register')->with('success', 'Pendaftaran pemeriksaan lingkungan berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing Pemeriksaan Lingkungan: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data pemeriksaan lingkungan. Silakan coba lagi.']);
        }
    }

    public function deletePendaftran(PemeriksaanLingkungan $pemeriksaanLingkungan)
    {
        try {
            DB::beginTransaction();
            $pemeriksaanLingkungan->detailPemeriksaanLingkungan()->delete();
            $pemeriksaanLingkungan->delete();
            DB::commit();
            return redirect()->route('lab.lingkungan.list-register')->with('success', 'Pendaftaran pemeriksaan lingkungan berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting Pemeriksaan Lingkungan: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menghapus data pemeriksaan lingkungan. Silakan coba lagi.']);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(PemeriksaanLingkungan $pemeriksaanLingkungan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PemeriksaanLingkungan $pemeriksaanLingkungan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PemeriksaanLingkungan $pemeriksaanLingkungan)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PemeriksaanLingkungan $pemeriksaanLingkungan)
    {
        //
    }
}
