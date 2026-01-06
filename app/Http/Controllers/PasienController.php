<?php

namespace App\Http\Controllers;

use App\Models\Dokter;
use App\Models\JenisLayanan;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\Pasien;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PasienController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $nama = $request->nama;
        $tanggal_lahir = $request->tanggal_lahir;

        return Inertia::render('Pasien/Index', [
            'kecamatans' => Kecamatan::all(),
            'kelurahans' => Kelurahan::all(),
            'pasien' => Pasien::with(['kecamatan', 'kelurahan'])
                ->when($nama, function ($query, $nama) {
                    $query->where('nama', 'like', '%' . $nama . '%');
                })
                ->when($tanggal_lahir, function ($query, $tanggal_lahir) {
                    $query->where('tanggal_lahir', $tanggal_lahir);
                })
                ->orderBy('no_rm')->paginate(10),
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
        $request->validate([
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|string',
            'tempat_lahir' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'no_telepon' => 'required|string',
            'kecamatan_id' => 'required|exists:kecamatan,id',
            'kelurahan_id' => 'required|exists:kelurahan,id',
            'alamat' => 'required|string',
            'pekerjaan' => 'required|string',
        ]);

        Pasien::create($request->all());

        return redirect()->route('pasien.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Pasien $pasien)
    {
        //
    }

    public function pendaftaranLaboratorium(Pasien $pasien)
    {
        //

        $jenisLayanan = JenisLayanan::with('kategoriLayanan')->get();
        // grouping jenis layanan by kategori layanan
        $kategoriLayanan = [];
        foreach ($jenisLayanan as $layanan) {
            $kategoriLayanan[$layanan->kategoriLayanan->nama][] = $layanan;
        }

        return Inertia::render('Pasien/PendaftaranLaboratorium', [
            'pasien' => $pasien,
            'dokter' => Dokter::all(),
            'kategoriLayanans' => $kategoriLayanan,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pasien $pasien)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pasien $pasien)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|string',
            'tempat_lahir' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'no_telepon' => 'required|string',
            'kecamatan_id' => 'required|exists:kecamatan,id',
            'kelurahan_id' => 'required|exists:kelurahan,id',
            'alamat' => 'required|string',
            'pekerjaan' => 'required|string',
        ]);

        $pasien->update($request->all());

        return redirect()->route('pasien.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pasien $pasien)
    {
        $pasien->delete();

        return redirect()->route('pasien.index');
    }
}
