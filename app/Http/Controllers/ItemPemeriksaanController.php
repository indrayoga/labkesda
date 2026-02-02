<?php

namespace App\Http\Controllers;

use App\Models\ItemPemeriksaan;
use App\Models\KategoriPemeriksaan;
use App\Services\ItemPemeriksaanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemPemeriksaanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kategori = KategoriPemeriksaan::all();
        $itemsTree = ItemPemeriksaanService::getTree();

        return Inertia::render('ItemPemeriksaan/Index', [
            'kategoriPemeriksaan' => $kategori,
            'itemPemeriksaan' => ItemPemeriksaan::with('kategoriPemeriksaan')->get(),
            'items' => $itemsTree,
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
            'kategori_pemeriksaan_id' => 'nullable|exists:kategori_pemeriksaan,id',
            'urut' => 'nullable|integer',
            'nama' => 'required|string|max:255',
            'satuan' => 'nullable|string|max:100',
            'metode' => 'nullable|string|max:100',
            'parent_id' => 'nullable|exists:item_pemeriksaan,id',
        ]);

        ItemPemeriksaan::create([
            'kategori_pemeriksaan_id' => $request->kategori_pemeriksaan_id,
            'nama' => $request->nama,
            'satuan' => $request->satuan,
            'metode' => $request->metode,
            'urut' => $request->urut,
            'parent_id' => $request->parent_id,
        ]);

        return \redirect()->route('item-pemeriksaan.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(ItemPemeriksaan $itemPemeriksaan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ItemPemeriksaan $itemPemeriksaan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ItemPemeriksaan $itemPemeriksaan)
    {
        $request->validate([
            'kategori_pemeriksaan_id' => 'nullable|exists:kategori_pemeriksaan,id',
            'urut' => 'nullable|integer',
            'nama' => 'required|string|max:255',
            'satuan' => 'nullable|string|max:100',
            'metode' => 'nullable|string|max:100',
            'parent_id' => 'nullable|exists:item_pemeriksaan,id',
        ]);

        $itemPemeriksaan->update([
            'kategori_pemeriksaan_id' => $request->kategori_pemeriksaan_id,
            'nama' => $request->nama,
            'satuan' => $request->satuan,
            'metode' => $request->metode,
            'urut' => $request->urut,
            'parent_id' => $request->parent_id,
        ]);

        return \redirect()->route('item-pemeriksaan.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ItemPemeriksaan $itemPemeriksaan)
    {
        //
        $itemPemeriksaan->children()->delete();
        $itemPemeriksaan->delete();

        return redirect()->route('item-pemeriksaan.index');
    }
}
