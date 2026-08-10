<?php

namespace App\Services\report;

use Illuminate\Support\Facades\DB;

class RekapPendaftaranByJenisBayar
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Invoke the class instance.
     */
    public function __invoke($tahun = null)
    {
        $tahun = $tahun ?? date('Y');

        return DB::table('jenis_pasien as j')
            ->select('p.jenis_pasien')
            ->selectRaw("
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 1 THEN 1 ELSE 0 END) AS jan,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 2 THEN 1 ELSE 0 END) AS feb,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 3 THEN 1 ELSE 0 END) AS mar,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 4 THEN 1 ELSE 0 END) AS apr,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 5 THEN 1 ELSE 0 END) AS mei,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 6 THEN 1 ELSE 0 END) AS jun,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 7 THEN 1 ELSE 0 END) AS jul,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 8 THEN 1 ELSE 0 END) AS agu,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 9 THEN 1 ELSE 0 END) AS sep,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 10 THEN 1 ELSE 0 END) AS okt,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 11 THEN 1 ELSE 0 END) AS nov,
                SUM(CASE WHEN MONTH(p.tanggal_pendaftaran) = 12 THEN 1 ELSE 0 END) AS des,
                COUNT(p.jenis_pasien) AS total
            ")
            ->leftJoin('pemeriksaan as p', function ($join) use ($tahun) {
                $join->on('j.kode', '=', 'p.jenis_pasien')
                    ->whereYear('p.tanggal_pendaftaran', $tahun);
            })
            ->groupBy('p.jenis_pasien')
            ->orderBy('p.jenis_pasien')
            ->get();
    }
}
