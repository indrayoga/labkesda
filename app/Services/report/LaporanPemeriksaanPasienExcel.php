<?php

namespace App\Services\report;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class LaporanPemeriksaanPasienExcel
{
    public function make(array $tanggalLaporan, array $laporan, array $filters): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Pemeriksaan Pasien');

        $sheet->setCellValue('A1', 'Laporan Pemeriksaan Pasien');
        $sheet->setCellValue('A2', $this->filterText($filters));

        $headerRow = 4;
        $headers = ['No', 'Indikator Pemeriksaan'];

        foreach ($tanggalLaporan as $tanggal) {
            $headers[] = $tanggal['full_label'] ?? $tanggal['label'] ?? $tanggal['key'];
        }

        $headers[] = 'Jumlah';

        foreach ($headers as $index => $header) {
            $sheet->setCellValue($this->cell($index + 1, $headerRow), $header);
        }

        $rowIndex = $headerRow + 1;

        if ($laporan === []) {
            $sheet->setCellValue('A5', 'Belum ada data untuk filter yang dipilih.');
        } else {
            foreach ($laporan as $row) {
                $sheet->setCellValue($this->cell(1, $rowIndex), $row['no']);
                $sheet->setCellValue($this->cell(2, $rowIndex), $row['indikator_pemeriksaan']);

                $columnIndex = 3;
                foreach ($tanggalLaporan as $tanggal) {
                    $sheet->setCellValue(
                        $this->cell($columnIndex, $rowIndex),
                        $row['jumlah_per_tanggal'][$tanggal['key']] ?? 0,
                    );
                    $columnIndex++;
                }

                $sheet->setCellValue($this->cell($columnIndex, $rowIndex), $row['total']);
                $rowIndex++;
            }

            $sheet->setCellValue($this->cell(1, $rowIndex), 'Total');
            $sheet->mergeCells($this->cell(1, $rowIndex) . ':' . $this->cell(2, $rowIndex));

            $columnIndex = 3;
            foreach ($tanggalLaporan as $tanggal) {
                $sheet->setCellValue(
                    $this->cell($columnIndex, $rowIndex),
                    collect($laporan)->sum(fn(array $item) => $item['jumlah_per_tanggal'][$tanggal['key']] ?? 0),
                );
                $columnIndex++;
            }

            $sheet->setCellValue($this->cell($columnIndex, $rowIndex), collect($laporan)->sum('total'));
        }

        $lastColumn = Coordinate::stringFromColumnIndex(count($headers));
        $lastDataRow = $laporan === [] ? 5 : $rowIndex;

        $sheet->getStyle("A1:{$lastColumn}1")->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle("A2:{$lastColumn}2")->getFont()->setItalic(true);
        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$headerRow}")->applyFromArray($this->headerStyle());
        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$lastDataRow}")->applyFromArray($this->tableBorderStyle());

        if ($laporan !== []) {
            $sheet->getStyle("A{$rowIndex}:{$lastColumn}{$rowIndex}")->applyFromArray($this->headerStyle());
        }

        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$lastDataRow}")
            ->getAlignment()
            ->setVertical(Alignment::VERTICAL_CENTER);

        foreach (range(1, count($headers)) as $columnIndex) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($columnIndex))->setAutoSize(true);
        }

        return $spreadsheet;
    }

    private function filterText(array $filters): string
    {
        $tanggalAwal = $filters['tanggal_awal'] ?? '-';
        $tanggalAkhir = $filters['tanggal_akhir'] ?? '-';
        $jumlahItem = count($filters['jenis_layanan_ids'] ?? []);

        return sprintf(
            'Periode: %s s/d %s | Jenis layanan dipilih: %d',
            $tanggalAwal,
            $tanggalAkhir,
            $jumlahItem,
        );
    }

    private function cell(int $columnIndex, int $rowIndex): string
    {
        return Coordinate::stringFromColumnIndex($columnIndex) . $rowIndex;
    }

    private function headerStyle(): array
    {
        return [
            'font' => [
                'bold' => true,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'DCEBFF'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];
    }

    private function tableBorderStyle(): array
    {
        return [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'B7C4D6'],
                ],
            ],
        ];
    }
}
