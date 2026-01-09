<?php

namespace App\Http\Controllers;

use App\Models\DetailPemeriksaan;
use App\Models\Pasien;
use App\Models\Pemeriksaan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BerandaController extends Controller
{
    //
    public function index()
    {
        return Inertia::render('Beranda', [
            'pasien_hari_ini' => Pemeriksaan::whereDate('tanggal_pendaftaran', today())->count(),
            'menunggu_pemeriksaan' => Pemeriksaan::where('status_periksa', 'Menunggu')->whereDate('tanggal_pendaftaran', today())->count(),
            'selesai_pemeriksaan' => Pemeriksaan::where('status_periksa', 'Selesai')->whereDate('tanggal_pendaftaran', today())->count(),
        ]);
    }

    public function pasienTerbaru()
    {
        $pemeriksaan = Pemeriksaan::with('pasien', 'detailPemeriksaan.jenisLayanan')
            ->orderBy('tanggal_pendaftaran', 'asc')
            ->take(5)
            ->get();

        return \response()->json([
            'message' => 'Berhasil mengambil data pasien terbaru',
            'data' => $pemeriksaan,
        ]);
    }

    public function pemeriksaanTerbanyakBulanIni()
    {
        $pemeriksaan = DetailPemeriksaan::with('jenisLayanan')
            ->join('jenis_layanan', 'detail_pemeriksaan.jenis_layanan_id', '=', 'jenis_layanan.id')
            ->whereHas('pemeriksaan', function ($query) {
                $query->whereMonth('tanggal_pendaftaran', now()->month)
                    ->whereYear('tanggal_pendaftaran', now()->year);
            })
            ->select('jenis_layanan.nama', 'detail_pemeriksaan.jenis_layanan_id')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('jenis_layanan.nama', 'detail_pemeriksaan.jenis_layanan_id')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        return \response()->json([
            'message' => 'Berhasil mengambil data pemeriksaan terbanyak bulan ini',
            'data' => $pemeriksaan,
        ]);
    }

    public function kunjunganPasien7hariTerakhir()
    {

        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = Pemeriksaan::whereDate('tanggal_pendaftaran', $date->toDateString())->count();
            $data[] = [
                'tanggal' => Carbon::parse($date)->isoFormat('dddd'),
                'jumlah_kunjungan' => $count,
            ];
        }

        return response()->json([
            'message' => 'Berhasil mengambil data kunjungan pasien 7 hari terakhir',
            'data' => $data,
        ]);
    }

    public function statistikBulanIni()
    {
        $totalPasienBaru = 0;
        $totalRegistrasi = 0;
        $totalPemeriksaan = 0;

        $totalPasienBaru = Pasien::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $totalRegistrasi = Pemeriksaan::whereMonth('tanggal_pendaftaran', now()->month)
            ->whereYear('tanggal_pendaftaran', now()->year)
            ->count();

        $totalPemeriksaan = DetailPemeriksaan::whereHas('pemeriksaan', function ($query) {
            $query->whereMonth('tanggal_pendaftaran', now()->month)
                ->whereYear('tanggal_pendaftaran', now()->year);
        })->count();

        return response()->json([
            'message' => 'Berhasil mengambil data statistik bulan ini',
            'data' => [
                'total_pasien_baru' => $totalPasienBaru,
                'total_registrasi' => $totalRegistrasi,
                'total_pemeriksaan' => $totalPemeriksaan,
            ],
        ]);
    }
}
