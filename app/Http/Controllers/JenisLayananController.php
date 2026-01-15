<?php

namespace App\Http\Controllers;

use App\Models\JenisLayanan;
use App\Models\KategoriLayanan;
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
                ->latest()->paginate(10),
            'kategoriLayanan' => KategoriLayanan::all(),
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JenisLayanan $jenisLayanan)
    {
        $jenisLayanan->delete();
        return redirect()->route('jenis-layanan.index');
    }
}
