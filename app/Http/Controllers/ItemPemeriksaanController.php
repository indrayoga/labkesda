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

    public function storeReferenceRange(Request $request, ItemPemeriksaan $itemPemeriksaan)
    {
        $request->validate([
            'ranges' => 'required|array',
            'ranges.*.label' => 'required',
            'ranges.*.gender' => 'required',
            'ranges.*.value_type' => 'required',
            'ranges.*.min' => 'numeric|nullable',
            'ranges.*.max' => 'numeric|nullable',

        ]);

        foreach ($request->ranges as $rangeData) {
            if ($rangeData['value_type'] === 'kualitatif') {
                $rangeData['min'] = null;
                $rangeData['max'] = null;
                $rangeData['operator_min'] = null;
                $rangeData['operator_max'] = null;
            } else {
                $rangeData['kualitatif_value'] = null;
                if (!($rangeData['min_enabled'] ?? true)) {
                    $rangeData['min'] = null;
                }
                if (!($rangeData['max_enabled'] ?? true)) {
                    $rangeData['max'] = null;
                }
            }
            // check jika label dan jenis kelamin sudah ada untuk item pemeriksaan ini, update saja
            $existingRange = $itemPemeriksaan->referenceRanges()
                ->where('label', $rangeData['label'])
                ->where('jenis_kelamin', $rangeData['gender'])
                ->first();
            if ($existingRange) {
                $existingRange->update([
                    'value_type' => $rangeData['value_type'],
                    'min_value' => $rangeData['min'] ?? null,
                    'max_value' => $rangeData['max'] ?? null,
                    'operator_min' => $rangeData['operator_min'],
                    'operator_max' => $rangeData['operator_max'],
                    'kualitatif_value' => $rangeData['kualitatif_value'],
                ]);
                continue;;
            }

            $itemPemeriksaan->referenceRanges()->create([
                'label' => $rangeData['label'],
                'jenis_kelamin' => $rangeData['gender'],
                'min_value' => $rangeData['min'] ?? null,
                'max_value' => $rangeData['max'] ?? null,
                'operator_min' => $rangeData['operator_min'],
                'operator_max' => $rangeData['operator_max'],
                'kualitatif_value' => $rangeData['kualitatif_value'],
                'value_type' => $rangeData['value_type'],
            ]);
        }

        return redirect()->route('item-pemeriksaan.index');
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
