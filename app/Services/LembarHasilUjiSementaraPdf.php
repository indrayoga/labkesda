<?php

namespace App\Services;

class LembarHasilUjiSementaraPdf extends HasilPemeriksaanPdf
{
    protected float $resultTableX = 10.0;

    protected array $resultTableWidths = [45, 20, 15, 25, 30];

    protected float $controlCardWidth = 55.0;

    protected float $temporarySignatureHeight = 36.0;

    protected ?float $firstPageResultLimitY = null;

    protected ?float $firstPageControlCardBottom = null;

    protected ?int $temporaryStartPage = null;

    protected bool $firstPageLayoutFinalized = false;

    public function Header()
    {
        $this->Image(\public_path('images/logo.png'), 10, 8, 25);
        $this->Image(\public_path('images/logo-kemenkes.png'), 170, 8, 25);

        $this->SetFont('Arial', 'B', 12);
        $this->Cell(0, 6, 'PEMERINTAH KOTA BALIKPAPAN', 0, 1, 'C');
        $this->Cell(0, 6, 'DINAS KESEHATAN', 0, 1, 'C');
        $this->Cell(0, 6, 'UPTD LABORATORIUM KESEHATAN DAERAH', 0, 1, 'C');

        $this->SetFont('Arial', '', 9);
        $this->Cell(
            0,
            5,
            'Jl. Jend. Sudirman No.118 Balikpapan 76113 Telp. (0542) 732841 Lt.1, (0542) 7763444 Lt.2',
            0,
            1,
            'C'
        );
        $this->Cell(
            0,
            5,
            'Email: lab.dkk_bpn@yahoo.com  Web: www.labkesda.balikpapan.go.id',
            0,
            1,
            'C'
        );

        $this->Line(10, 40, 200, 40);

        $this->Ln(5);
        $this->SetFont('Arial', 'B', 11);
        $this->Cell(0, 5, 'LEMBAR HASIL UJI SEMENTARA', 0, 1, 'C');
        $this->Ln(5);

        $boxX = 177;
        $boxY = 41;
        $boxWidth = 23;
        $labelHeight = 6;
        $valueHeight = 10;

        $this->Rect($boxX, $boxY, $boxWidth, $labelHeight + $valueHeight);
        $this->Line($boxX, $boxY + $labelHeight, $boxX + $boxWidth, $boxY + $labelHeight);
        $this->SetFont('Arial', 'B', 9);
        $this->SetXY($boxX, $boxY + 1);
        $this->Cell($boxWidth, 4, 'NO. LAB', 0, 0, 'C');
        $this->SetFont('Arial', 'B', 11);
        $this->SetXY($boxX, $boxY + $labelHeight + 1.5);
        $this->Cell($boxWidth, 5, $this->sanitizeText($this->formatLabNumber()), 0, 0, 'C');
    }

    protected function formatLabNumber(): string
    {
        $registrationNumber = (string) ($this->pemeriksaan->id_spesimen ?? '');
        if (preg_match('/(\d{4})$/', $registrationNumber, $matches) === 1) {
            return $matches[1];
        }

        return $registrationNumber;
    }

    protected function drawTemporaryResultHeader(float $x, float $y): void
    {
        $this->SetFillColor(230, 230, 230);

        $resultWidth = array_sum($this->resultTableWidths);
        $this->Rect($x, $y, $resultWidth, 8, 'F');

        $currentX = $x;
        $headers = [
            ['PARAMETER', ''],
            ['HASIL', ''],
            ['SATUAN', ''],
            ['NILAI RUJUKAN', ''],
            ['METODE', ''],
        ];

        foreach ($headers as $index => [$label, $translation]) {
            $this->writeBilingualTableHeader(
                $currentX,
                $y,
                $this->resultTableWidths[$index],
                $label,
                $translation
            );
            $currentX += $this->resultTableWidths[$index];
        }
    }

    protected function drawControlCard(float $x, float $y): float
    {
        $bottomLimit = $this->PageBreakTrigger - 2;
        $height = max(120, $bottomLimit - $y);

        $this->Rect($x, $y, $this->controlCardWidth, $height);
        $this->SetFont('Arial', 'B', 8);
        $this->SetXY($x, $y + 1.5);
        $this->Cell($this->controlCardWidth, 3.5, 'KARTU KENDALI', 0, 2, 'C');
        $this->SetFont('Arial', 'I', 7);
        $this->Cell($this->controlCardWidth, 2.5, 'Control Card', 0, 0, 'C');

        $sections = [
            'PENDAFTARAN',
            'KASIR',
            'PENGAMBILAN SAMPLE',
            'RUANG PEMERIKSAAN',
            'PENGETIKAN HASIL',
            'VERIFIKASI HASIL',
            'VALIDASI KA. LAB',
            'PASIEN / CUSTOMER',
        ];

        $sectionTop = $y + 8;
        $sectionHeight = ($height - 8) / count($sections);
        $timeWidth = 22;
        $parafWidth = $this->controlCardWidth - $timeWidth;

        foreach ($sections as $section) {
            $bodyHeight = $sectionHeight - 12;

            $this->SetXY($x, $sectionTop);
            $this->SetFont('Arial', 'B', 7);
            $this->Cell($this->controlCardWidth, 6, $section, 1, 0, 'C');

            $this->SetXY($x, $sectionTop + 6);
            $this->SetFont('Arial', '', 7);
            $this->Cell($timeWidth, 6, 'JAM', 1, 0, 'C');
            $this->Cell($parafWidth, 6, 'PARAF', 1, 0, 'C');

            $this->SetXY($x, $sectionTop + 12);
            $this->Cell($timeWidth, $bodyHeight, '', 1, 0, 'C');
            $this->Cell($parafWidth, $bodyHeight, '', 1, 0, 'C');

            $sectionTop += $sectionHeight;
        }

        return $y + $height;
    }

    protected function addTemporaryResultPageHeader(): void
    {
        $headerY = $this->GetY();
        $this->drawTemporaryResultHeader($this->resultTableX, $headerY);
        $this->SetXY($this->resultTableX, $headerY + 8);
    }

    protected function drawTemporaryResultRow(array $cells, array $aligns): void
    {
        $lineHeight = 5;
        $maxLines = 1;
        foreach ($cells as $index => $text) {
            $cleanText = $this->sanitizeText($text);
            $maxLines = max($maxLines, $this->nbLines($this->resultTableWidths[$index], $cleanText));
        }

        $rowHeight = $lineHeight * $maxLines;
        $this->ensureTemporaryTableFits($rowHeight);

        foreach ($cells as $index => $text) {
            $cleanText = $this->sanitizeText($text);
            $width = $this->resultTableWidths[$index];
            $align = $aligns[$index] ?? 'L';
            $x = $this->GetX();
            $y = $this->GetY();

            $this->Rect($x, $y, $width, $rowHeight);
            $this->MultiCell($width, $lineHeight, $cleanText, 0, $align);
            $this->SetXY($x + $width, $y);
        }

        $this->Ln($rowHeight);
    }

    protected function fillBlankResultRowsUntil(float $bottomY): void
    {
        $lineHeight = 5;

        while ($this->GetY() < $bottomY - 0.1) {
            $rowHeight = min($lineHeight, $bottomY - $this->GetY());
            $x = $this->resultTableX;
            $y = $this->GetY();

            foreach ($this->resultTableWidths as $width) {
                $this->Rect($x, $y, $width, $rowHeight);
                $x += $width;
            }

            $this->SetXY($this->resultTableX, $y + $rowHeight);
        }

        $this->SetXY($this->resultTableX, max($this->GetY(), $bottomY));
    }

    protected function drawTemporarySignatureArea(float $y): void
    {
        $tableWidth = array_sum($this->resultTableWidths);

        $this->Rect($this->resultTableX, $y, $tableWidth, $this->temporarySignatureHeight);
        $this->SetFont('Arial', 'B', 8);
        $this->SetXY($this->resultTableX, $y + 8);
        $this->Cell($tableWidth, 5, 'PEMERIKSA', 0, 1, 'C');
        $this->SetXY($this->resultTableX, $y + 22);
        $this->Cell($tableWidth, 5, 'ANALIS', 0, 1, 'C');
    }

    protected function getCurrentResultLimitY(): float
    {
        if (
            $this->temporaryStartPage !== null
            && $this->PageNo() === $this->temporaryStartPage
            && $this->firstPageResultLimitY !== null
        ) {
            return $this->firstPageResultLimitY;
        }

        return $this->PageBreakTrigger;
    }

    protected function finalizeFirstPageLayout(): void
    {
        if ($this->firstPageLayoutFinalized || $this->firstPageControlCardBottom === null) {
            return;
        }

        $signatureTop = $this->firstPageControlCardBottom - $this->temporarySignatureHeight;
        $this->fillBlankResultRowsUntil($signatureTop);
        $this->drawTemporarySignatureArea($signatureTop);
        $this->firstPageLayoutFinalized = true;
    }

    protected function ensureTemporaryTableFits(float $height): void
    {
        if ($this->GetY() + $height <= $this->getCurrentResultLimitY()) {
            return;
        }

        if ($this->temporaryStartPage !== null && $this->PageNo() === $this->temporaryStartPage) {
            $this->finalizeFirstPageLayout();
        }

        $this->AddPage($this->CurOrientation);
        $this->addTemporaryResultPageHeader();
    }

    protected function formatReferenceRangesFromArray(array $ranges): string
    {
        if ($ranges === []) {
            return '-';
        }

        $singleRange = count($ranges) === 1;
        $formattedRanges = [];

        foreach ($ranges as $range) {
            $genderLabel = $range['jenis_kelamin'] ?? null;
            $genderLabel = $genderLabel ? $genderLabel . ': ' : '';
            if ($singleRange && strtoupper((string) ($range['jenis_kelamin'] ?? '')) === 'ALL') {
                $genderLabel = '';
            }

            if (($range['value_type'] ?? null) === 'kualitatif') {
                $formattedRanges[] = $genderLabel . ($range['kualitatif_value'] ?? '-');
                continue;
            }

            $hasMin = array_key_exists('min_value', $range) && $range['min_value'] !== null;
            $hasMax = array_key_exists('max_value', $range) && $range['max_value'] !== null;
            $operatorMin = $range['operator_min'] ?? '';
            $operatorMax = $range['operator_max'] ?? '';
            $stripOperators = $hasMin
                && $hasMax
                && in_array($operatorMin, ['>=', '>'], true)
                && in_array($operatorMax, ['<=', '<'], true);

            $minValue = $hasMin ? ($stripOperators ? '' : $operatorMin) . $range['min_value'] : '';
            $maxValue = $hasMax ? ($stripOperators ? '' : $operatorMax) . $range['max_value'] : '';
            $separator = $minValue && $maxValue ? ' - ' : '';

            $formattedRanges[] = trim($genderLabel . $minValue . $separator . $maxValue);
        }

        return implode(' | ', $formattedRanges);
    }

    protected function appendTemporaryTreeRows(
        array $items,
        array &$rows,
        array $savedResults,
        array &$renderedIds,
        int $depth = 0
    ): void {
        foreach ($items as $item) {
            $isGroup = !empty($item['children']) && is_array($item['children']);
            $showRow = !$isGroup
                || !empty($item['satuan'])
                || !empty($item['metode'])
                || !empty($item['reference_ranges']);

            $groupKey = 'group:' . ($item['id'] ?? '');
            if ($isGroup && !isset($renderedIds[$groupKey])) {
                $rows[] = [
                    'type' => 'group',
                    'label' => strtoupper((string) ($item['name'] ?? '')),
                ];
                $renderedIds[$groupKey] = true;
            }

            $itemId = $item['id'] ?? '';
            $detailPemeriksaanId = $item['detail_pemeriksaan_id'] ?? '';
            $itemKe = (int) ($item['item_ke'] ?? 1);
            $itemKey = 'item:' . $itemId . ':' . $detailPemeriksaanId . ':' . $itemKe;
            if ($showRow && !isset($renderedIds[$itemKey])) {
                $savedResult = $savedResults[$itemKey] ?? null;
                $hasilValue = $savedResult?->hasil ?? '';
                if (($savedResult?->status ?? null) === 'tidak_normal') {
                    $hasilValue = $hasilValue !== '' ? $hasilValue . ' *' : '*';
                }

                $indent = $depth > 0 ? str_repeat('  ', $depth) . '- ' : '';
                $detailQty = max(1, (int) ($item['detail_qty'] ?? 1));
                $parameterLabel = $indent . ($item['name'] ?? '-');
                if ($detailQty > 1) {
                    $parameterLabel .= ' (' . $itemKe . '/' . $detailQty . ')';
                }

                $rows[] = [
                    'type' => 'result',
                    'cells' => [
                        $parameterLabel,
                        $hasilValue,
                        $savedResult?->satuan ?? ($item['satuan'] ?? '-'),
                        $savedResult?->nilai_rujukan ?: $this->formatReferenceRangesFromArray($item['reference_ranges'] ?? []),
                        $savedResult?->metode ?? ($item['metode'] ?? '-'),
                    ],
                ];
                $renderedIds[$itemKey] = true;
            }

            if ($isGroup) {
                $this->appendTemporaryTreeRows(
                    $item['children'],
                    $rows,
                    $savedResults,
                    $renderedIds,
                    $depth + 1
                );
            }
        }
    }

    protected function getTemporaryResultRows(): array
    {
        $savedResults = $this->pemeriksaan->hasilPemeriksaan()
            ->with(['detailPemeriksaan', 'itemPemeriksaan.parent', 'itemPemeriksaan.referenceRanges'])
            ->get()
            ->mapWithKeys(function ($hasil) {
                $key = 'item:'
                    . ($hasil->item_pemeriksaan_id ?? '')
                    . ':'
                    . ($hasil->detail_pemeriksaan_id ?? '')
                    . ':'
                    . (int) ($hasil->item_ke ?? 1);

                return [$key => $hasil];
            })
            ->all();

        $rows = [];
        $renderedIds = [];
        $pemeriksaanItems = ItemPemeriksaanService::getTreeByPemeriksaan($this->pemeriksaan);

        foreach ($pemeriksaanItems as $items) {
            $this->appendTemporaryTreeRows($items, $rows, $savedResults, $renderedIds);
        }

        return $rows;
    }

    protected function resultTable()
    {
        $rows = $this->getTemporaryResultRows();

        $tableStartY = $this->GetY();
        $this->drawTemporaryResultHeader($this->resultTableX, $tableStartY);
        $controlCardBottom = $this->drawControlCard(
            $this->resultTableX + array_sum($this->resultTableWidths),
            $tableStartY
        );

        $this->temporaryStartPage = $this->PageNo();
        $this->firstPageControlCardBottom = $controlCardBottom;
        $this->firstPageResultLimitY = $controlCardBottom - $this->temporarySignatureHeight;
        $this->firstPageLayoutFinalized = false;

        $this->SetFont('Arial', '', 8);
        $this->SetXY($this->resultTableX, $tableStartY + 8);

        $startPage = $this->PageNo();

        foreach ($rows as $row) {
            if (($row['type'] ?? null) === 'group') {
                $this->ensureTemporaryTableFits(6);
                $this->SetFillColor(245, 245, 245);
                $this->Cell(
                    array_sum($this->resultTableWidths),
                    6,
                    $this->sanitizeText($row['label'] ?? ''),
                    1,
                    1,
                    'L',
                    true
                );

                continue;
            }

            $this->drawTemporaryResultRow(
                $row['cells'] ?? ['-', '', '-', '-', '-'],
                ['L', 'C', 'C', 'C', 'L']
            );
        }

        if ($this->PageNo() === $startPage) {
            $this->finalizeFirstPageLayout();
            $this->SetY($controlCardBottom + 4);
            return;
        }

        $this->Ln(4);
    }

    public function patientInfo()
    {
        $leftItems = [
            [
                'No. Register',
                $this->pemeriksaan->no_registrasi ?? '',
            ],
            [
                'Nama',
                $this->pemeriksaan->pasien->nama ?? '',
            ],
            [
                'Umur',
                $this->pemeriksaan->pasien->umur ?? '',
            ],
            [
                'Jenis Kelamin',
                $this->pemeriksaan->pasien->jenis_kelamin ?? '',
            ],
        ];

        $rightItems = [
            [
                'Tgl. Pemeriksaan',
                $this->formatDate($this->pemeriksaan->tanggal_periksa ?? null),
            ],
            [
                'Dokter',
                $this->pemeriksaan->dokter->nama ?? '',
            ],
            [
                'Pembayaran',
                $this->pemeriksaan->pembayaran?->jenisPembayaran?->nama ?? '',
            ],
            [
                'Alamat',
                $this->pemeriksaan->pasien->alamat ?? '',
            ],
        ];

        $leftX = 10;
        $rightX = 95;
        $labelWidth = 30;
        $colonWidth = 3;
        $valueWidth = 54;
        $y = $this->GetY();

        foreach ($leftItems as $index => $leftItem) {
            $rowHeight = 7;

            [$labelLeft, $valueLeft] = $leftItem;
            [$labelRight, $valueRight] = $rightItems[$index];

            $this->writeBilingualLabel($leftX, $y, $labelLeft);
            $this->SetFont('Arial', '', 9);
            $this->Text($leftX + $labelWidth, $y + 3.5, ':');
            $this->Text(
                $leftX + $labelWidth + $colonWidth,
                $y + 3.5,
                $this->sanitizeText($valueLeft)
            );

            $this->writeBilingualLabel($rightX, $y, $labelRight);
            $this->SetFont('Arial', '', 9);
            $this->Text($rightX + $labelWidth, $y + 3.5, ':');

            if ($index == 3) {
                $this->SetXY($rightX + $labelWidth + $colonWidth, $y);
                $this->MultiCell(
                    $valueWidth + 15,
                    5,
                    $this->sanitizeText($valueRight),
                    0,
                    'L'
                );
            } else {
                $this->Text(
                    $rightX + $labelWidth + $colonWidth,
                    $y + 3.5,
                    $this->sanitizeText($valueRight)
                );
            }
            $y += $rowHeight;
            $this->SetXY($leftX, $y);
        }

        $this->SetY($y + 2);
    }

    public function generate()
    {
        $this->AddPage();
        $this->patientInfo();
        $this->resultTable();
    }
}
