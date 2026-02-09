<?php

namespace App\Http\Controllers;

use App\Models\ItemPemeriksaan;
use App\Models\JenisLayanan;
use App\Models\JenisPasien;
use App\Models\KategoriLayanan;
use App\Rules\IsTarifLayananValidExists;
use App\Services\ItemPemeriksaanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JenisLayananController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Inertia::render('JenisLayanan/Index', [
            'jenisLayanan' => JenisLayanan::with('kategoriLayanan')
                ->when($request->nama, function ($query) use ($request) {
                    $query->where('nama', 'like', '%' . $request->nama . '%');
                })
                ->when($request->kategori_layanan_id, function ($query) use ($request) {
                    $query->where('kategori_layanan_id', $request->kategori_layanan_id);
                })
                ->orderBy('kategori_layanan_id')->paginate(10)->withQueryString(),
            'kategoriLayanan' => KategoriLayanan::all(),
            'itemPemeriksaanTree' => ItemPemeriksaanService::getTree()
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
            'nama' => 'required|string|max:255',
            'kategori_layanan_id' => 'required|exists:kategori_layanan,id',
            'harga' => 'required|numeric',
        ]);

        JenisLayanan::create([
            'nama' => $request->nama,
            'kategori_layanan_id' => $request->kategori_layanan_id,
            'harga' => $request->harga,
        ]);

        return redirect()->route('jenis-layanan.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(JenisLayanan $jenisLayanan)
    {
        //
        return Inertia::render('JenisLayanan/Show', [
            'jenisLayanan' => $jenisLayanan->load('kategoriLayanan'),
            'itemPemeriksaan' => ItemPemeriksaan::all()
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JenisLayanan $jenisLayanan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JenisLayanan $jenisLayanan)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kategori_layanan_id' => 'required|exists:kategori_layanan,id',
            'harga' => 'required|numeric',
        ]);

        $jenisLayanan->update([
            'nama' => $request->nama,
            'kategori_layanan_id' => $request->kategori_layanan_id,
            'harga' => $request->harga,
        ]);

        return redirect()->route('jenis-layanan.index');
    }

    public function tarif(Request $request, JenisLayanan $jenisLayanan)
    {

        return Inertia::render('JenisLayanan/Tarif', [
            'jenisLayanan' => $jenisLayanan,
            'existingTarif' => $jenisLayanan->tarif()->with('jenisPasien')->orderBy('jenis_pasien')->get(),
            'jenisPasien' => JenisPasien::all()
        ]);
    }

    public function storeTarif(Request $request, JenisLayanan $jenisLayanan)
    {

        $request->validate([
            'jenis_pasien' => ['required', 'exists:jenis_pasien,kode', new IsTarifLayananValidExists([
                'jenis_layanan_id' => $jenisLayanan->id,
                'valid_dari' => $request->valid_dari,
                'valid_sampai' => $request->valid_sampai,
            ])],
            'harga' => 'required|numeric',
            'valid_dari' => 'required|date',
            'valid_sampai' => 'nullable|date|after_or_equal:valid_dari',
            'keterangan' => 'nullable|string|max:250',
        ]);

        $jenisLayanan->tarif()->create([
            'jenis_pasien' => $request->jenis_pasien,
            'harga' => $request->harga,
            'valid_dari' => $request->valid_dari,
            'valid_sampai' => $request->valid_sampai,
            'keterangan' => $request->keterangan,
        ]);

        return redirect()->route('jenis-layanan.tarif', $jenisLayanan->id);
    }

    public function updateTarif(Request $request, JenisLayanan $jenisLayanan, $tarif)
    {
        $request->validate([
            'jenis_pasien' => ['required', 'exists:jenis_pasien,kode'],
            'harga' => 'required|numeric',
            'valid_dari' => 'required|date',
            'valid_sampai' => 'nullable|date|after_or_equal:valid_dari',
        ]);

        $jenisLayanan->tarif()
            ->where('id', $tarif)
            ->update([
                'jenis_pasien' => $request->jenis_pasien,
                'harga' => $request->harga,
                'valid_dari' => $request->valid_dari,
                'valid_sampai' => $request->valid_sampai,
                'keterangan' => $request->keterangan,
            ]);

        return redirect()->route('jenis-layanan.tarif', $jenisLayanan->id);
    }

    public function syncItemPemeriksaan(Request $request, JenisLayanan $jenisLayanan)
    {
        $request->validate([
            'item_pemeriksaan_id' => 'required'
        ]);

        $jenisLayanan->itemPemeriksaan()->sync([$request->item_pemeriksaan_id]);

        return redirect()->route('jenis-layanan.index');
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JenisLayanan $jenisLayanan)
    {
        $jenisLayanan->delete();
        return redirect()->route('jenis-layanan.index');
    }
}
