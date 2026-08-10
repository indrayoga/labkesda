<?php

namespace App\Services\report;

use FPDF;

class LaporanPendaftaranPasienPdf
{
    private array $months = [
        ['label' => 'Jan', 'key' => 'jan'],
        ['label' => 'Feb', 'key' => 'feb'],
        ['label' => 'Mar', 'key' => 'mar'],
        ['label' => 'Apr', 'key' => 'apr'],
        ['label' => 'Mei', 'key' => 'mei'],
        ['label' => 'Jun', 'key' => 'jun'],
        ['label' => 'Jul', 'key' => 'jul'],
        ['label' => 'Ags', 'key' => 'agu'],
        ['label' => 'Sep', 'key' => 'sep'],
        ['label' => 'Okt', 'key' => 'okt'],
        ['label' => 'Nov', 'key' => 'nov'],
        ['label' => 'Des', 'key' => 'des'],
    ];

    public function make(array $laporan, int $tahun): string
    {
        $pdf = new FPDF('L', 'mm', 'A4');
        $pdf->SetMargins(10, 10, 10);
        $pdf->AddPage();

        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 8, $this->sanitize('Laporan Pendaftaran Pasien'), 0, 1, 'C');

        $pdf->SetFont('Arial', '', 9);
        $pdf->Cell(0, 6, 'Tahun: ' . $tahun, 0, 1, 'C');
        $pdf->Ln(3);

        $this->renderTable($pdf, $laporan);

        return $pdf->Output('S');
    }

    private function renderTable(FPDF $pdf, array $laporan): void
    {
        $noWidth = 12;
        $pembayaranWidth = 70;
        $monthWidth = 14;
        $totalWidth = 18;

        $pdf->SetFont('Arial', 'B', 8);
        $pdf->SetFillColor(220, 235, 255);
        $pdf->Cell($noWidth, 8, 'No', 1, 0, 'C', true);
        $pdf->Cell($pembayaranWidth, 8, $this->sanitize('Pembayaran'), 1, 0, 'C', true);

        foreach ($this->months as $month) {
            $pdf->Cell($monthWidth, 8, $month['label'], 1, 0, 'C', true);
        }

        $pdf->Cell($totalWidth, 8, 'Jumlah', 1, 1, 'C', true);

        $pdf->SetFont('Arial', '', 8);

        foreach ($laporan as $index => $row) {
            $pdf->Cell($noWidth, 7, (string) ($index + 1), 1, 0, 'C');
            $pdf->Cell($pembayaranWidth, 7, $this->sanitize($this->truncate($row['jenis_pasien'], 36)), 1, 0, 'L');

            foreach ($this->months as $month) {
                $pdf->Cell($monthWidth, 7, (string) ((int) ($row[$month['key']] ?? 0)), 1, 0, 'C');
            }

            $pdf->Cell($totalWidth, 7, (string) ((int) ($row['total'] ?? 0)), 1, 1, 'C');
        }

        $pdf->SetFont('Arial', 'B', 8);
        $pdf->SetFillColor(220, 235, 255);
        $pdf->Cell($noWidth + $pembayaranWidth, 8, 'Total', 1, 0, 'R', true);

        foreach ($this->months as $month) {
            $totalMonth = collect($laporan)->sum(fn(array $item) => (int) ($item[$month['key']] ?? 0));
            $pdf->Cell($monthWidth, 8, (string) $totalMonth, 1, 0, 'C', true);
        }

        $pdf->Cell($totalWidth, 8, (string) collect($laporan)->sum(fn(array $item) => (int) ($item['total'] ?? 0)), 1, 1, 'C', true);
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
