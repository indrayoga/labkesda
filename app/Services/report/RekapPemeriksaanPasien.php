<?php

namespace App\Services\report;

use App\Models\JenisLayanan;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

class RekapPemeriksaanPasien
{
    public function __invoke(?string $tanggalAwal = null, ?string $tanggalAkhir = null, array $jenisLayananIds = []): array
    {
        if (!$tanggalAwal || !$tanggalAkhir) {
            return [
                'tanggal' => [],
                'laporan' => [],
            ];
        }

        $mulai = Carbon::parse($tanggalAwal)->startOfDay();
        $selesai = Carbon::parse($tanggalAkhir)->startOfDay();

        if ($mulai->gt($selesai)) {
            [$mulai, $selesai] = [$selesai, $mulai];
        }

        $tanggal = collect(CarbonPeriod::create($mulai, $selesai))
            ->map(fn(Carbon $date) => [
                'key' => $date->format('Y-m-d'),
                'label' => $date->format('j'),
                'full_label' => $date->translatedFormat('d M Y'),
            ])
            ->values();

        $items = JenisLayanan::query()
            ->select('id', 'nama')
            ->whereHas('kategoriLayanan', function ($query) {
                $query->where('jenis_lab', 'klinis');
            })
            ->when($jenisLayananIds !== [], fn($query) => $query->whereIn('id', $jenisLayananIds))
            // ->orderBy('urut')
            ->orderBy('nama')
            ->get();

        if ($items->isEmpty()) {
            return [
                'tanggal' => $tanggal->all(),
                'laporan' => [],
            ];
        }

        $counts = DB::table('detail_pemeriksaan as dp')
            ->join('pemeriksaan as p', 'p.id', '=', 'dp.pemeriksaan_id')
            ->select('dp.jenis_layanan_id')
            ->selectRaw('DATE(p.tanggal_pendaftaran) as tanggal')
            ->selectRaw('COALESCE(SUM(dp.qty), 0) as jumlah')
            ->whereBetween('p.tanggal_pendaftaran', [$mulai->toDateString(), $selesai->toDateString()])
            ->whereIn('dp.jenis_layanan_id', $items->pluck('id')->all())
            ->groupBy('dp.jenis_layanan_id', DB::raw('DATE(p.tanggal_pendaftaran)'))
            ->get()
            ->groupBy('jenis_layanan_id');

        $laporan = $items->map(function ($item, $index) use ($counts, $tanggal) {
            $itemCounts = collect($counts->get($item->id, []))
                ->mapWithKeys(fn($row) => [$row->tanggal => (int) $row->jumlah]);

            $jumlahPerTanggal = $tanggal->mapWithKeys(
                fn(array $date) => [$date['key'] => $itemCounts->get($date['key'], 0)]
            );

            return [
                'no' => $index + 1,
                'jenis_layanan_id' => $item->id,
                'indikator_pemeriksaan' => $item->nama,
                'jumlah_per_tanggal' => $jumlahPerTanggal,
                'total' => $jumlahPerTanggal->sum(),
            ];
        })->values();

        return [
            'tanggal' => $tanggal->all(),
            'laporan' => $laporan->all(),
        ];
    }
}
