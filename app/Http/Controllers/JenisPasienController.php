<?php

namespace App\Http\Controllers;

use App\Models\JenisPasien;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JenisPasienController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Inertia::render('JenisPasien/Index', [
            'jenis_pasiens' => JenisPasien::orderByRaw('urut IS NULL, urut ASC')->paginate(10),
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
            'kode' => 'nullable|string|max:10|unique:jenis_pasien,kode',
            'nama' => 'required|string|max:255',
            'urut' => 'nullable|integer',
            'kategori' => 'required|in:umum,asuransi,perusahaan',
        ]);
        // jika kode kosong maka generate kode otomatis berdasarkan kategori dengan format <initial kategori>-001
        $kode = $request->kode;
        if (!$request->kode) {
            $lastKode = JenisPasien::where('kategori', $request->kategori)->orderBy('kode', 'desc')->first();
            $lastNumber = $lastKode ? (int) substr($lastKode->kode, -3) : 0;
            $kode = strtoupper(substr($request->kategori, 0, 1)) . '-' . str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        }

        JenisPasien::create([
            'kode' => $kode,
            'nama' => $request->nama,
            'urut' => $request->urut,
            'kategori' => $request->kategori,
        ]);

        return \redirect()->route('jenis-pasien.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(JenisPasien $jenisPasien)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JenisPasien $jenisPasien)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JenisPasien $jenisPasien)
    {
        //
        $request->validate([
            'kode' => 'required|string|max:10|unique:jenis_pasien,kode,' . $jenisPasien->id,
            'nama' => 'required|string|max:255',
            'urut' => 'nullable|integer',
            'kategori' => 'required|in:umum,asuransi,perusahaan',
        ]);

        $jenisPasien->update([
            'kode' => $request->kode,
            'nama' => $request->nama,
            'urut' => $request->urut,
            'kategori' => $request->kategori,
        ]);

        return \redirect()->route('jenis-pasien.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JenisPasien $jenisPasien)
    {
        // check if jenis pasien is used in pasien table
        if ($jenisPasien->pemeriksaan()->count() > 0) {
            return \redirect()->route('jenis-pasien.index')->with('error', 'Jenis pasien tidak dapat dihapus karena masih digunakan oleh pasien');
        }

        $jenisPasien->delete();

        return \redirect()->route('jenis-pasien.index');
    }
}
