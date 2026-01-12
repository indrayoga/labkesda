<?php

namespace App\Http\Controllers;

use App\Models\Dokter;
use App\Models\JenisLayanan;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\Pasien;
use App\Models\Pemeriksaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

    public function pendaftaran(Request $request)
    {
        //
        $tanggal = $request->tanggal ?? date('Y-m-d');
        return Inertia::render('Pasien/Pendaftaran', [
            'tanggal' => $tanggal,
            'pemeriksaan' => Pemeriksaan::with(['pasien', 'dokter', 'detailPemeriksaan.jenisLayanan'])
                ->whereDate('tanggal_pendaftaran', $tanggal)
                ->orderBy('created_at', 'asc')
                ->paginate(10),
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
            'nik' => 'required|string|max:16|unique:pasien,nik',
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

    public function editPendaftaranLaboratorium(Pasien $pasien, Pemeriksaan $pemeriksaan)
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
            'pemeriksaan' => $pemeriksaan->load('detailPemeriksaan'),
            'kategoriLayanans' => $kategoriLayanan,
        ]);
    }

    public function updatePendaftaranLaboratorium(Request $request, Pasien $pasien, Pemeriksaan $pemeriksaan)
    {
        $request->validate([
            'id_spesimen' => 'required|string',
            'pasien_id' => 'required|exists:pasien,id',
            'dokter_id' => 'required|exists:dokter,id',
            'email' => 'nullable|email',
            'jenis_bayar' => 'required|string',
            'tanggal_pendaftaran' => 'required|date',
            'jam_pendaftaran' => 'required',
            'diagnosa' => 'required|string',
            'layanan_ids' => 'required|array',
            'layanan_ids.*' => 'exists:jenis_layanan,id',
        ]);

        try {
            DB::beginTransaction();
            $pemeriksaan->update([
                'id_spesimen' => $request->id_spesimen,
                'pasien_id' => $request->pasien_id,
                'dokter_id' => $request->dokter_id,
                'email' => $request->email,
                'jenis_bayar' => $request->jenis_bayar,
                'tanggal_pendaftaran' => $request->tanggal_pendaftaran,
                'jam_pendaftaran' => $request->jam_pendaftaran,
                'diagnosa' => $request->diagnosa,
                'hasil_dikirim_ke_pasien' => $request->hasil_dikirim_ke_pasien ?? false,
                'hasil_dikirim_ke_dokter' => $request->hasil_dikirim_ke_dokter ?? false,
                'pasien_tidak_puasa' => $request->pasien_tidak_puasa ?? false,
                'pasien_puasa_jam' => $request->pasien_puasa_jam ?? 0,
                'persiapan_pasien' => $request->persiapan_pasien ?? '',
            ]);

            $pemeriksaan->detailPemeriksaan()->delete();

            $layanans = JenisLayanan::whereIn('id', $request->layanan_ids)->get();
            foreach ($layanans as $layanan) {
                $pemeriksaan->detailPemeriksaan()->create([
                    'jenis_layanan_id' => $layanan->id,
                    'harga' => $layanan->harga,
                ]);
            }

            DB::commit();

            return \redirect()->route('pemeriksaan.index');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saat perbaharui mendaftarkan pemeriksaan: ' . $e->getMessage());
            return back()->withErrors('Terjadi kesalahan saat menyimpan.');
        }
        //
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
