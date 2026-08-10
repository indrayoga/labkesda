<?php

namespace App\Services\report;

use FPDF;

class LaporanPemeriksaanPasienPdf
{
    public function make(array $tanggalLaporan, array $laporan, array $filters): string
    {
        $pdf = new FPDF('L', 'mm', 'A4');
        $pdf->SetMargins(10, 10, 10);
        $pdf->AddPage();

        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 8, $this->sanitize('Laporan Pemeriksaan Pasien'), 0, 1, 'C');

        $pdf->SetFont('Arial', '', 9);
        $pdf->Cell(0, 6, $this->sanitize($this->filterText($filters)), 0, 1, 'C');
        $pdf->Ln(3);

        $this->renderTable($pdf, $tanggalLaporan, $laporan);

        return $pdf->Output('S');
    }

    private function renderTable(FPDF $pdf, array $tanggalLaporan, array $laporan): void
    {
        $noWidth = 12;
        $indikatorWidth = 90;
        $totalWidth = 18;
        $dateCount = max(count($tanggalLaporan), 1);
        $dateWidth = max(10, min(18, (277 - $noWidth - $indikatorWidth - $totalWidth) / $dateCount));
        $fontSize = count($tanggalLaporan) > 15 ? 7 : 8;

        $pdf->SetFont('Arial', 'B', $fontSize);
        $pdf->SetFillColor(220, 235, 255);
        $pdf->Cell($noWidth, 8, 'No', 1, 0, 'C', true);
        $pdf->Cell($indikatorWidth, 8, $this->sanitize('Indikator Pemeriksaan'), 1, 0, 'C', true);

        foreach ($tanggalLaporan as $tanggal) {
            $pdf->Cell($dateWidth, 8, $this->sanitize((string) ($tanggal['label'] ?? '')), 1, 0, 'C', true);
        }

        $pdf->Cell($totalWidth, 8, 'Jumlah', 1, 1, 'C', true);

        $pdf->SetFont('Arial', '', $fontSize);

        if ($laporan === []) {
            $pdf->Cell($noWidth + $indikatorWidth + ($dateWidth * count($tanggalLaporan)) + $totalWidth, 8, $this->sanitize('Belum ada data untuk filter yang dipilih.'), 1, 1, 'C');
            return;
        }

        foreach ($laporan as $row) {
            $pdf->Cell($noWidth, 7, (string) $row['no'], 1, 0, 'C');
            $pdf->Cell($indikatorWidth, 7, $this->sanitize($this->truncate($row['indikator_pemeriksaan'], 52)), 1, 0, 'L');

            foreach ($tanggalLaporan as $tanggal) {
                $pdf->Cell($dateWidth, 7, (string) ($row['jumlah_per_tanggal'][$tanggal['key']] ?? 0), 1, 0, 'C');
            }

            $pdf->Cell($totalWidth, 7, (string) $row['total'], 1, 1, 'C');
        }

        $pdf->SetFont('Arial', 'B', $fontSize);
        $pdf->SetFillColor(220, 235, 255);
        $pdf->Cell($noWidth + $indikatorWidth, 8, 'Total', 1, 0, 'R', true);

        foreach ($tanggalLaporan as $tanggal) {
            $totalPerTanggal = collect($laporan)->sum(fn(array $item) => $item['jumlah_per_tanggal'][$tanggal['key']] ?? 0);
            $pdf->Cell($dateWidth, 8, (string) $totalPerTanggal, 1, 0, 'C', true);
        }

        $pdf->Cell($totalWidth, 8, (string) collect($laporan)->sum('total'), 1, 1, 'C', true);
    }

    private function filterText(array $filters): string
    {
        $tanggalAwal = $filters['tanggal_awal'] ?? '-';
        $tanggalAkhir = $filters['tanggal_akhir'] ?? '-';
        $jumlahItem = count($filters['jenis_layanan_ids'] ?? []);

        return sprintf('Periode: %s s/d %s | Jenis layanan dipilih: %d', $tanggalAwal, $tanggalAkhir, $jumlahItem);
    }

    private function truncate(string $text, int $limit): string
    {
        if (mb_strlen($text) <= $limit) {
            return $text;
        }

        return mb_substr($text, 0, $limit - 3) . '...';
    }

    private function sanitize(string $text): string
    {
        return iconv('UTF-8', 'windows-1252//TRANSLIT', $text) ?: $text;
    }
}
