<?php

namespace App\Http\Controllers;

use App\Models\ItemPemeriksaan;
use App\Models\JenisLayanan;
use App\Models\PaketPemeriksaan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaketPemeriksaanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('PaketPemeriksaan/Index', [
            'paketPemeriksaan' => PaketPemeriksaan::paginate(10),
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
            'deskripsi' => 'nullable|string',
            'jenis_lab' => 'required|in:klinis,lingkungan',
        ]);

        PaketPemeriksaan::create([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'jenis_lab' => $request->jenis_lab,
        ]);

        return redirect()->route('paket-pemeriksaan.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(PaketPemeriksaan $paketPemeriksaan)
    {
        $paketPemeriksaan->load(['jenisLayanan' => function ($query) {
            $query->with('kategoriLayanan');
        }]);

        $allItems = JenisLayanan::with('kategoriLayanan')
            ->orderBy('nama')
            ->get();

        return Inertia::render('PaketPemeriksaan/ItemPemeriksaan', [
            'paketPemeriksaan' => $paketPemeriksaan,
            'allItems' => $allItems,
        ]);
    }

    public function items(PaketPemeriksaan $paketPemeriksaan)
    {
        return \response()->json($paketPemeriksaan->jenisLayanan);
    }

    /**
     * Sync item pemeriksaan for a paket.
     */
    public function syncItems(Request $request, PaketPemeriksaan $paketPemeriksaan)
    {
        $request->validate([
            'items' => 'array',
            'items.*.id' => 'required|exists:jenis_layanan,id',
        ]);

        $paketPemeriksaan->jenisLayanan()->sync(collect($request->items)->pluck('id')->toArray());

        return redirect()->route('paket-pemeriksaan.show', $paketPemeriksaan->id)
            ->with('success', 'Item pemeriksaan berhasil diperbarui.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaketPemeriksaan $paketPemeriksaan) {}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaketPemeriksaan $paketPemeriksaan)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'jenis_lab' => 'required|in:klinis,lingkungan',
        ]);

        $paketPemeriksaan->update([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'jenis_lab' => $request->jenis_lab,
        ]);

        return redirect()->route('paket-pemeriksaan.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaketPemeriksaan $paketPemeriksaan)
    {
        //
        $paketPemeriksaan->jenisLayanan()->detach();
        $paketPemeriksaan->delete();

        return redirect()->route('paket-pemeriksaan.index');
    }
}
