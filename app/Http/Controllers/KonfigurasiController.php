<?php

namespace App\Http\Controllers;

use App\Models\Konfigurasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KonfigurasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $konfigurasi = Konfigurasi::all();
        return Inertia::render('Konfigurasi/Index', [
            'konfigurasi' => $konfigurasi,
        ]);
    }

    public function updateAll(Request $request)
    {
        $request->validate([
            'konfigurasi' => 'required|array',
            'konfigurasi.*.id' => 'required|exists:konfigurasi,id',
            'konfigurasi.*.nilai' => 'nullable|string',
        ]);

        foreach ($request->konfigurasi as $item) {
            $konfigurasi = Konfigurasi::find($item['id']);
            if ($konfigurasi) {
                $konfigurasi->nilai = $item['nilai'];
                $konfigurasi->save();
            }
        }

        return redirect()->route('konfigurasi.index')->with('success', 'Konfigurasi berhasil diperbarui.');
    }
}
