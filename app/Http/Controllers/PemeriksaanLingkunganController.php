<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\JenisLayanan;
use App\Models\PaketPemeriksaan;
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
            'items' => PemeriksaanLingkungan::with(['customer', 'paketPemeriksaanLingkungan.paketPemeriksaan'])
                ->whereDate('tanggal_pendaftaran', $tanggal)
                ->orderBy('created_at', 'asc')
                ->paginate(10),
        ]);
    }

    public function pendaftaran()
    {
        return Inertia::render('PemeriksaanLingkungan/Pendaftaran', [
            'customers' => Customer::all(),
            'paketPemeriksaan' => PaketPemeriksaan::whereHas('jenisLayanan', function ($query) {
                $query->whereHas('kategoriLayanan', function ($query) {
                    $query->where('jenis_lab', 'lingkungan');
                });
            })->with('jenisLayanan.kategoriLayanan')->get(),
            'jenisLayanan' => JenisLayanan::whereHas('kategoriLayanan', function ($query) {
                $query->where('jenis_lab', 'lingkungan');
            })->with('kategoriLayanan')->get(),
        ]);
    }

    public function editPendaftaran(PemeriksaanLingkungan $pemeriksaanLingkungan)
    {
        return Inertia::render('PemeriksaanLingkungan/EditPendaftaran', [
            'pemeriksaanLingkungan' => $pemeriksaanLingkungan->load(['customer', 'paketPemeriksaanLingkungan.paketPemeriksaan', 'detailPemeriksaanLingkungan.jenisLayanan']),
            'customers' => Customer::all(),
            'paketPemeriksaan' => PaketPemeriksaan::whereHas('jenisLayanan', function ($query) {
                $query->whereHas('kategoriLayanan', function ($query) {
                    $query->where('jenis_lab', 'lingkungan');
                });
            })->with('jenisLayanan.kategoriLayanan')->get(),
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
            'paket_pemeriksaan_lingkungan' => 'required|array|min:1',
            'paket_pemeriksaan_lingkungan.*.paket_pemeriksaan_id' => 'required|exists:paket_pemeriksaan,id',
            'paket_pemeriksaan_lingkungan.*.no_lab_contoh_uji' => 'required',
            'paket_pemeriksaan_lingkungan.*.jam_pengambilan_contoh_uji' => 'nullable|string',
            'paket_pemeriksaan_lingkungan.*.parameter' => 'nullable|string',
            'paket_pemeriksaan_lingkungan.*.uraian' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();
            $pemeriksaanLingkungan = PemeriksaanLingkungan::create($request->all());
            foreach ($request->paket_pemeriksaan_lingkungan as $detail) {
                $paket = PaketPemeriksaan::find($detail['paket_pemeriksaan_id']);
                $detail['harga'] = $paket->harga;
                $paketPemeriksaan = $pemeriksaanLingkungan->paketPemeriksaanLingkungan()->create([
                    'paket_pemeriksaan_id' => $detail['paket_pemeriksaan_id'],
                    'no_lab_contoh_uji' => $detail['no_lab_contoh_uji'],
                    'jam_pengambilan_contoh_uji' => $detail['jam_pengambilan_contoh_uji'],
                    'parameter' => $detail['parameter'],
                    'uraian' => $detail['uraian'] ?? '-',
                    'harga' => $detail['harga'],
                ]);
                // input item parameter nya
                foreach ($paket->jenisLayanan as $layanan) {
                    $pemeriksaanLingkungan->detailPemeriksaanLingkungan()->create([
                        'paket_pemeriksaan_lingkungan_id' => $paketPemeriksaan->id,
                        'jenis_layanan_id' => $layanan->id,
                        'jenis_contoh_uji' => $paket->nama,
                        'no_lab_contoh_uji' => $detail['no_lab_contoh_uji'],
                        'jam_pengambilan_contoh_uji' => $detail['jam_pengambilan_contoh_uji'],
                        'parameter' => '',
                        'uraian' => $detail['uraian'] ?? '-',
                        'harga' => $layanan->harga,
                    ]);
                }
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
            'paket_pemeriksaan_lingkungan' => 'required|array|min:1',
            'paket_pemeriksaan_lingkungan.*.paket_pemeriksaan_id' => 'required|exists:paket_pemeriksaan,id',
            'paket_pemeriksaan_lingkungan.*.no_lab_contoh_uji' => 'required',
            'paket_pemeriksaan_lingkungan.*.jam_pengambilan_contoh_uji' => 'nullable|string',
            'paket_pemeriksaan_lingkungan.*.parameter' => 'nullable|string',
            'paket_pemeriksaan_lingkungan.*.uraian' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();
            $pemeriksaanLingkungan->update($request->all());
            $pemeriksaanLingkungan->paketPemeriksaanLingkungan()->delete();
            foreach ($request->paket_pemeriksaan_lingkungan as $detail) {
                $paket = PaketPemeriksaan::find($detail['paket_pemeriksaan_id']);
                $detail['harga'] = $paket->harga;
                $paketPemeriksaan = $pemeriksaanLingkungan->paketPemeriksaanLingkungan()->create([
                    'paket_pemeriksaan_id' => $detail['paket_pemeriksaan_id'],
                    'no_lab_contoh_uji' => $detail['no_lab_contoh_uji'],
                    'jam_pengambilan_contoh_uji' => $detail['jam_pengambilan_contoh_uji'],
                    'parameter' => $detail['parameter'],
                    'uraian' => $detail['uraian'] ?? '-',
                    'harga' => $detail['harga'],
                ]);
                // input item parameter nya
                $pemeriksaanLingkungan->detailPemeriksaanLingkungan()->delete();
                foreach ($paket->jenisLayanan as $layanan) {
                    $pemeriksaanLingkungan->detailPemeriksaanLingkungan()->create([
                        'jenis_layanan_id' => $layanan->id,
                        'paket_pemeriksaan_lingkungan_id' => $paketPemeriksaan->id,
                        'jenis_contoh_uji' => $paket->nama,
                        'no_lab_contoh_uji' => $detail['no_lab_contoh_uji'],
                        'jam_pengambilan_contoh_uji' => $detail['jam_pengambilan_contoh_uji'],
                        'parameter' => '',
                        'uraian' => $detail['uraian'] ?? '-',
                        'harga' => $layanan->harga,
                    ]);
                }
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
