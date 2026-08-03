<?php

namespace App\Http\Controllers;

use App\Models\Dokter;
use App\Models\JenisLayanan;
use App\Models\JenisPasien;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\PaketPemeriksaan;
use App\Models\Pasien;
use App\Models\Pemeriksaan;
use App\Services\PemeriksaanRegistrasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
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
        $tanggal_akhir = $request->tanggal_akhir ?? date('Y-m-d');
        return Inertia::render('Pasien/Pendaftaran', [
            'tanggal' => $tanggal,
            'tanggal_akhir' => $tanggal_akhir,
            'pemeriksaan' => Pemeriksaan::with(['pasien', 'dokter', 'detailPemeriksaan.jenisLayanan'])
                ->whereBetween('tanggal_pendaftaran', [$tanggal, $tanggal_akhir])
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
            'luar_wilayah' => 'required|boolean',
            'kecamatan_id' => 'required_if:luar_wilayah,false',
            'kelurahan_id' => 'required_if:luar_wilayah,false',
            'kecamatan_luar_wilayah' => 'required_if:luar_wilayah,true',
            'kelurahan_luar_wilayah' => 'required_if:luar_wilayah,true',
            'alamat' => 'required|string',
            'pekerjaan' => 'required|string',
        ]);
        if ($request->luar_wilayah) {
            $request->merge([
                'kecamatan_id' => null,
                'kelurahan_id' => null,
            ]);
        } else {
            $request->merge([
                'kecamatan_luar_wilayah' => null,
                'kelurahan_luar_wilayah' => null,
            ]);
        }

        $pasien = Pasien::create($request->all());

        if ($request->has('register') && $request->register) {
            return redirect()->route('pendaftaran-laboratorium', ['pasien' => $pasien->id]);
        }
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
        //ambil semua jenis layanan dengan kategori layanan klinis dengan tarif umum yang aktif
        $jenisLayanan = JenisLayanan::with('kategoriLayanan')
            ->whereHas('kategoriLayanan', function ($query) {
                $query->where('jenis_lab', 'klinis');
            })
            ->get();
        // grouping jenis layanan by kategori layanan
        $kategoriLayanan = [];
        foreach ($jenisLayanan as $layanan) {
            $kategoriLayanan[$layanan->kategoriLayanan->nama][] = $layanan;
        }

        // ambil id spesien terakhir dari tabel konfigurasi
        $idSpesimenTerakhir = DB::table('konfigurasi')->where('nama', 'id_spesimen')->value('nilai');

        return Inertia::render('Pasien/PendaftaranLaboratorium', [
            'pasien' => $pasien,
            'dokter' => Dokter::orderBy('nama')->get(),
            'jenisPasien' => JenisPasien::orderByRaw('urut IS NULL, urut ASC')->get(),
            'kategoriLayanans' => $kategoriLayanan,
            'idSpesimenTerakhir' => $idSpesimenTerakhir + 1, // increment id spesimen terakhir by 1
            'paketLayanan' => PaketPemeriksaan::with('jenisLayanan')->where('jenis_lab', 'klinis')->get(),
        ]);
    }

    public function editPendaftaranLaboratorium(Pasien $pasien, Pemeriksaan $pemeriksaan)
    {
        $jenisLayanan = JenisLayanan::with('kategoriLayanan')
            ->whereHas('kategoriLayanan', function ($query) {
                $query->where('jenis_lab', 'klinis');
            })
            ->get();
        // grouping jenis layanan by kategori layanan
        $kategoriLayanan = [];
        foreach ($jenisLayanan as $layanan) {
            $kategoriLayanan[$layanan->kategoriLayanan->nama][] = $layanan;
        }

        return Inertia::render('Pasien/PendaftaranLaboratorium', [
            'pasien' => $pasien,
            'dokter' => Dokter::all(),
            'jenisPasien' => JenisPasien::orderByRaw('urut IS NULL, urut ASC')->get(),
            'pemeriksaan' => $pemeriksaan->load(['detailPemeriksaan.jenisLayanan', 'layananOrder']),
            'kategoriLayanans' => $kategoriLayanan,
            'paketLayanan' => PaketPemeriksaan::with('jenisLayanan')->where('jenis_lab', 'klinis')->get(),
        ]);
    }

    public function updatePendaftaranLaboratorium(Request $request, Pasien $pasien, Pemeriksaan $pemeriksaan, PemeriksaanRegistrasiService $registrasiService)
    {
        $validated = $registrasiService->validateRegistrationRequest($request);

        try {
            DB::beginTransaction();
            $pemeriksaan->update([
                'id_spesimen' => $validated['id_spesimen'],
                'pasien_id' => $validated['pasien_id'],
                'dokter_id' => $validated['dokter_id'],
                'email' => $validated['email'] ?? null,
                'jenis_pasien' => $validated['jenis_pasien'],
                'tanggal_pendaftaran' => $validated['tanggal_pendaftaran'],
                'jam_pendaftaran' => $validated['jam_pendaftaran'],
                'tanggal_periksa' => $validated['tanggal_periksa'],
                'diagnosa' => $validated['diagnosa'],
                'hasil_dikirim_ke_pasien' => $validated['hasil_dikirim_ke_pasien'] ?? false,
                'hasil_dikirim_ke_dokter' => $validated['hasil_dikirim_ke_dokter'] ?? false,
                'pasien_tidak_puasa' => $validated['pasien_tidak_puasa'] ?? false,
                'pasien_puasa_jam' => $validated['pasien_puasa_jam'] ?? 0,
                'persiapan_pasien' => $validated['persiapan_pasien'] ?? '',
                'penanggung_jawab' => $validated['penanggung_jawab'] ?? null,
                'tempat_lahir_penanggung_jawab' => $validated['tempat_lahir_penanggung_jawab'] ?? null,
                'tanggal_lahir_penanggung_jawab' => $validated['tanggal_lahir_penanggung_jawab'] ?? null,
                'alamat_penanggung_jawab' => $validated['alamat_penanggung_jawab'] ?? null,
                'telepon_penanggung_jawab' => $validated['telepon_penanggung_jawab'] ?? null,
                'hubungan_penanggung_jawab' => $validated['hubungan_penanggung_jawab'] ?? null,
                'jenis_kelamin_penanggung_jawab' => $validated['jenis_kelamin_penanggung_jawab'] ?? null,
            ]);

            $registrasiService->syncItems($pemeriksaan, $validated['items'], $validated['jenis_pasien']);

            DB::commit();

            return \redirect()->route('pemeriksaan.index');
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
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
            'luar_wilayah' => 'required|boolean',
            'kecamatan_id' => 'required_if:luar_wilayah,false',
            'kelurahan_id' => 'required_if:luar_wilayah,false',
            'kecamatan_luar_wilayah' => 'required_if:luar_wilayah,true',
            'kelurahan_luar_wilayah' => 'required_if:luar_wilayah,true',
            'alamat' => 'required|string',
            'pekerjaan' => 'required|string',
        ]);

        if ($request->luar_wilayah) {
            $request->merge([
                'kecamatan_id' => null,
                'kelurahan_id' => null,
            ]);
        } else {
            $request->merge([
                'kecamatan_luar_wilayah' => null,
                'kelurahan_luar_wilayah' => null,
            ]);
        }
        $pasien->update($request->all());

        if ($request->has('register') && $request->register) {
            return redirect()->route('pendaftaran-laboratorium', ['pasien' => $pasien->id]);
        }

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
