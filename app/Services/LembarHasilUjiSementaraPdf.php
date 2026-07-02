<?php

namespace App\Services;

use Indrayoga\Bday\Bday;

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

        $this->Ln(5);
        $this->SetFont('Arial', 'B', 11);
        $this->Cell(0, 5, 'LEMBAR HASIL UJI SEMENTARA', 0, 1, 'C');

        // $this->SetFont('Arial', 'I', 9);
        // $this->Cell(0, 4, 'Temporary Laboratory Examination Result', 0, 1, 'C');
        // $this->SetFont('Arial', 'B', 9);
        // $this->Cell(0, 4, 'No.Register Lab ' . $this->pemeriksaan->no_registrasi, 0, 1, 'C');

        $this->Ln(5);
    }

    protected function formatLabNumber(): string
    {
        $registrationNumber = (string) ($this->pemeriksaan->nomor_sampel ?? '');
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
        $tableWidth = array_sum($this->resultTableWidths);

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

    protected function resultTable()
    {
        $results = $this->pemeriksaan->hasilPemeriksaan()
            ->with(['itemPemeriksaan.parent', 'itemPemeriksaan.referenceRanges'])
            ->get()
            ->sortBy(function ($hasil) {
                $parent = $hasil->itemPemeriksaan?->parent;
                $parentOrder = $parent?->urut ?? 0;
                $itemOrder = $hasil->itemPemeriksaan?->urut ?? 0;
                $parentName = $parent?->nama ?? '';

                return sprintf('%04d-%s-%04d', $parentOrder, $parentName, $itemOrder);
            });

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

        $currentGroup = null;
        $startPage = $this->PageNo();

        foreach ($results as $hasil) {
            $item = $hasil->itemPemeriksaan;
            if (!$item) {
                continue;
            }

            $groupName = $item->parent?->nama;
            if ($groupName && $groupName !== $currentGroup) {
                $currentGroup = $groupName;

                $this->ensureTemporaryTableFits(6);

                $this->SetFillColor(245, 245, 245);
                $this->Cell(
                    array_sum($this->resultTableWidths),
                    6,
                    $this->sanitizeText(strtoupper($groupName)),
                    1,
                    1,
                    'L',
                    true
                );
            }

            $nilaiRujukan = $hasil->nilai_rujukan ?: $this->formatReferenceRanges($item);
            $hasilValue = $hasil->hasil ?? '';
            if ($hasil->status === 'tidak_normal') {
                $hasilValue = $hasilValue !== '' ? $hasilValue . ' *' : '*';
            }

            $this->drawTemporaryResultRow(
                [
                    $item->nama ?? '-',
                    $hasilValue,
                    $hasil->satuan ?? $item->satuan ?? '-',
                    $nilaiRujukan,
                    $hasil->metode ?? $item->metode ?? '-',
                ],
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
        $umur = Bday::age($this->pemeriksaan->pasien->tanggal_lahir);
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
                $umur->years() . ' thn ' . $umur->months() . ' bln ',
            ],
            [
                'Alamat',
                $this->pemeriksaan->pasien->alamat ?? '',
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
                '',
                '',
            ],
        ];

        $leftX = 10;
        $rightX = 105;
        $labelWidth = 38;
        $colonWidth = 3;
        $valueWidth = 54;
        $y = $this->GetY();

        foreach ($leftItems as $index => $leftItem) {
            $rowHeight = $index === 5 ? 14 : 7;

            [$labelLeft,  $valueLeft] = $leftItem;
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

            if ($index === 5) {
                $this->SetXY($rightX + $labelWidth + $colonWidth, $y + 1);
                $this->MultiCell(
                    $valueWidth,
                    4,
                    $this->sanitizeText($valueRight)
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
