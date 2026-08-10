<?php

namespace App\Http\Controllers;

use App\Models\JenisLayanan;
use App\Services\report\LaporanPendaftaranPasienExcel;
use App\Services\report\LaporanPendaftaranPasienPdf;
use App\Services\report\LaporanPemeriksaanPasienExcel;
use App\Services\report\LaporanPemeriksaanPasienPdf;
use App\Services\report\RekapPemeriksaanPasien;
use App\Services\report\RekapPendaftaranByJenisBayar;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class laporanController extends Controller
{
    public function pendaftaranPasien(Request $request, RekapPendaftaranByJenisBayar $rekapPendaftaranByJenisBayar)
    {
        $data = $this->validatedPendaftaranFilters($request);

        return inertia('Laporan/PendaftaranPasien', [
            'data' => $data,
            'laporan' => $rekapPendaftaranByJenisBayar($data['tahun']),
        ]);
    }

    public function exportPendaftaranPasienExcel(
        Request $request,
        RekapPendaftaranByJenisBayar $rekapPendaftaranByJenisBayar,
        LaporanPendaftaranPasienExcel $laporanPendaftaranPasienExcel,
    ) {
        $data = $this->validatedPendaftaranFilters($request);
        $spreadsheet = $laporanPendaftaranPasienExcel->make(
            $rekapPendaftaranByJenisBayar($data['tahun'])->toArray(),
            $data['tahun'],
        );

        return $this->downloadSpreadsheet(
            $spreadsheet,
            sprintf('laporan-pendaftaran-pasien-%s.xlsx', $data['tahun']),
        );
    }

    public function exportPendaftaranPasienPdf(
        Request $request,
        RekapPendaftaranByJenisBayar $rekapPendaftaranByJenisBayar,
        LaporanPendaftaranPasienPdf $laporanPendaftaranPasienPdf,
    ) {
        $data = $this->validatedPendaftaranFilters($request);
        $pdf = $laporanPendaftaranPasienPdf->make(
            $rekapPendaftaranByJenisBayar($data['tahun'])->toArray(),
            $data['tahun'],
        );

        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header(
                'Content-Disposition',
                sprintf('attachment; filename="laporan-pendaftaran-pasien-%s.pdf"', $data['tahun']),
            );
    }

    public function pemeriksaanPasien(Request $request, RekapPemeriksaanPasien $rekapPemeriksaanPasien)
    {
        $jenisLayanan = $this->jenisLayananOptions();
        $data = $this->validatedPemeriksaanFilters($request, $jenisLayanan);

        $rekap = $rekapPemeriksaanPasien(
            $data['tanggal_awal'] ?? null,
            $data['tanggal_akhir'] ?? null,
            $data['jenis_layanan_ids'] ?? [],
        );

        return inertia('Laporan/PemeriksaanPasien', [
            'data' => $data,
            'jenisLayanan' => $jenisLayanan,
            'tanggalLaporan' => $rekap['tanggal'],
            'laporan' => $rekap['laporan'],
        ]);
    }

    public function exportPemeriksaanPasienExcel(
        Request $request,
        RekapPemeriksaanPasien $rekapPemeriksaanPasien,
        LaporanPemeriksaanPasienExcel $laporanPemeriksaanPasienExcel,
    ) {
        $jenisLayanan = $this->jenisLayananOptions();
        $data = $this->validatedPemeriksaanFilters($request, $jenisLayanan);
        $rekap = $rekapPemeriksaanPasien(
            $data['tanggal_awal'] ?? null,
            $data['tanggal_akhir'] ?? null,
            $data['jenis_layanan_ids'] ?? [],
        );

        $spreadsheet = $laporanPemeriksaanPasienExcel->make(
            $rekap['tanggal'],
            $rekap['laporan'],
            $data,
        );

        return $this->downloadSpreadsheet(
            $spreadsheet,
            sprintf(
                'laporan-pemeriksaan-pasien-%s-sampai-%s.xlsx',
                $data['tanggal_awal'] ?? 'semua',
                $data['tanggal_akhir'] ?? 'semua',
            ),
        );
    }

    public function exportPemeriksaanPasienPdf(
        Request $request,
        RekapPemeriksaanPasien $rekapPemeriksaanPasien,
        LaporanPemeriksaanPasienPdf $laporanPemeriksaanPasienPdf,
    ) {
        $jenisLayanan = $this->jenisLayananOptions();
        $data = $this->validatedPemeriksaanFilters($request, $jenisLayanan);
        $rekap = $rekapPemeriksaanPasien(
            $data['tanggal_awal'] ?? null,
            $data['tanggal_akhir'] ?? null,
            $data['jenis_layanan_ids'] ?? [],
        );

        $pdf = $laporanPemeriksaanPasienPdf->make(
            $rekap['tanggal'],
            $rekap['laporan'],
            $data,
        );

        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header(
                'Content-Disposition',
                sprintf(
                    'attachment; filename="laporan-pemeriksaan-pasien-%s-sampai-%s.pdf"',
                    $data['tanggal_awal'] ?? 'semua',
                    $data['tanggal_akhir'] ?? 'semua',
                ),
            );
    }

    private function jenisLayananOptions(): Collection
    {
        return JenisLayanan::query()
            ->select('id', 'nama')
            ->whereHas('kategoriLayanan', function ($query) {
                $query->where('jenis_lab', 'klinis');
            })
            // ->orderBy('urut')
            ->orderBy('nama')
            ->get();
    }

    private function validatedPendaftaranFilters(Request $request): array
    {
        $data = $request->validate([
            'tahun' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ]);

        $data['tahun'] = (int) ($data['tahun'] ?? now()->year);

        return $data;
    }

    private function validatedPemeriksaanFilters(Request $request, Collection $jenisLayanan): array
    {
        $data = $request->validate([
            'tanggal_awal' => ['nullable', 'date'],
            'tanggal_akhir' => ['nullable', 'date'],
            'jenis_layanan_ids' => ['nullable', 'array'],
            'jenis_layanan_ids.*' => ['string', 'exists:jenis_layanan,id'],
        ]);

        if (
            !empty($data['tanggal_awal'])
            && !empty($data['tanggal_akhir'])
            && empty($data['jenis_layanan_ids'])
        ) {
            $data['jenis_layanan_ids'] = $jenisLayanan->pluck('id')->all();
        }

        return $data;
    }

    private function downloadSpreadsheet(Spreadsheet $spreadsheet, string $fileName)
    {
        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
