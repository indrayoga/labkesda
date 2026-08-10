<?php

namespace App\Services\report;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class LaporanPendaftaranPasienExcel
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

    public function make(array $laporan, int $tahun): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Pendaftaran Pasien');

        $sheet->setCellValue('A1', 'Laporan Pendaftaran Pasien');
        $sheet->setCellValue('A2', 'Tahun: ' . $tahun);

        $headerRow = 4;
        $headers = ['No', 'Pembayaran'];

        foreach ($this->months as $month) {
            $headers[] = $month['label'];
        }

        $headers[] = 'Jumlah';

        foreach ($headers as $index => $header) {
            $sheet->setCellValue($this->cell($index + 1, $headerRow), $header);
        }

        $rowIndex = $headerRow + 1;

        foreach ($laporan as $index => $row) {
            $sheet->setCellValue($this->cell(1, $rowIndex), $index + 1);
            $sheet->setCellValue($this->cell(2, $rowIndex), $row['jenis_pasien']);

            $columnIndex = 3;
            foreach ($this->months as $month) {
                $sheet->setCellValue($this->cell($columnIndex, $rowIndex), (int) ($row[$month['key']] ?? 0));
                $columnIndex++;
            }

            $sheet->setCellValue($this->cell($columnIndex, $rowIndex), (int) ($row['total'] ?? 0));
            $rowIndex++;
        }

        $sheet->setCellValue($this->cell(1, $rowIndex), 'Total');
        $sheet->mergeCells($this->cell(1, $rowIndex) . ':' . $this->cell(2, $rowIndex));

        $columnIndex = 3;
        foreach ($this->months as $month) {
            $sheet->setCellValue(
                $this->cell($columnIndex, $rowIndex),
                collect($laporan)->sum(fn(array $item) => (int) ($item[$month['key']] ?? 0)),
            );
            $columnIndex++;
        }

        $sheet->setCellValue(
            $this->cell($columnIndex, $rowIndex),
            collect($laporan)->sum(fn(array $item) => (int) ($item['total'] ?? 0)),
        );

        $lastColumn = Coordinate::stringFromColumnIndex(count($headers));

        $sheet->getStyle("A1:{$lastColumn}1")->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle("A2:{$lastColumn}2")->getFont()->setItalic(true);
        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$headerRow}")->applyFromArray($this->headerStyle());
        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$rowIndex}")->applyFromArray($this->tableBorderStyle());
        $sheet->getStyle("A{$rowIndex}:{$lastColumn}{$rowIndex}")->applyFromArray($this->headerStyle());

        foreach (range(1, count($headers)) as $column) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($column))->setAutoSize(true);
        }

        return $spreadsheet;
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
