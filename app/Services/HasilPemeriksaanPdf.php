<?php

namespace App\Services;

use App\Models\Pemeriksaan;
use Carbon\Carbon;
use FPDF;

class HasilPemeriksaanPdf extends FPDF
{
    protected ?string $qrImagePath;

    protected ?array $qrPositionMm;

    protected ?int $qrPage;

    public function __construct(
        protected Pemeriksaan $pemeriksaan,
        array $options = []
    ) {
        $this->qrImagePath = $options['qr_image_path'] ?? null;
        $this->qrPositionMm = $options['qr_position_mm'] ?? null;
        $this->qrPage = isset($options['qr_page']) ? (int) $options['qr_page'] : null;

        return parent::__construct();
    }

    function Header()
    {
        // Logo kiri
        $this->Image(\public_path('images/logo.png'), 10, 8, 25);

        // Logo kanan (akreditasi)
        $this->Image(\public_path('images/logo-kemenkes.png'), 170, 8, 25);

        // Header instansi
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

        // Garis
        $this->Line(10, 40, 200, 40);

        // Judul dokumen
        $this->Ln(5);
        $this->SetFont('Arial', 'B', 11);
        $this->Cell(0, 5, 'HASIL PEMERIKSAAN LABORATORIUM', 0, 1, 'C');

        $this->SetFont('Arial', 'I', 9);
        $this->Cell(0, 4, 'Laboratory Examination Result Report', 0, 1, 'C');
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(0, 4, 'No.Register Lab ' . $this->pemeriksaan->no_registrasi, 0, 1, 'C');

        $this->Ln(5);
    }

    protected function formatDate($date)
    {
        if (empty($date)) {
            return '';
        }

        return Carbon::parse($date)->format('d/m/Y');
    }

    protected function formatTime($time)
    {
        if (empty($time)) {
            return '';
        }

        return Carbon::parse($time)->format('H:i');
    }

    protected function formatReferenceRanges($item)
    {
        if (!$item || $item->referenceRanges->isEmpty()) {
            return '-';
        }

        $ranges = $item->referenceRanges;
        $singleRange = $ranges->count() === 1;

        return $ranges->map(function ($range) use ($singleRange) {
            $genderLabel = $range->jenis_kelamin ? $range->jenis_kelamin . ': ' : '';
            if ($singleRange && strtoupper((string) $range->jenis_kelamin) === 'ALL') {
                $genderLabel = '';
            }

            if ($range->value_type === 'kualitatif') {
                return $genderLabel . ($range->kualitatif_value ?? '-');
            }
            $hasMin = $range->min_value !== null;
            $hasMax = $range->max_value !== null;
            $operatorMin = $range->operator_min ?? '';
            $operatorMax = $range->operator_max ?? '';
            $stripOperators = $hasMin
                && $hasMax
                && in_array($operatorMin, ['>=', '>'], true)
                && in_array($operatorMax, ['<=', '<'], true);

            $minValue = $hasMin
                ? ($stripOperators ? '' : $operatorMin) . $range->min_value
                : '';
            $maxValue = $hasMax
                ? ($stripOperators ? '' : $operatorMax) . $range->max_value
                : '';
            // fix bug $minValue and $maxValue being empty strings when the value is 0, which is a valid reference range value.
            $separator = $minValue !== '' && $maxValue !== '' ? ' - ' : '';

            return trim($genderLabel . $minValue . $separator . $maxValue);
        })->implode(' | ');
    }

    protected function sanitizeText($text)
    {
        $value = (string) $text;
        $value = strtr($value, [
            '³' => '3',
            '²' => '2',
            'µ' => 'u',
            '≤' => '<=',
            '≥' => '>=',
            '–' => '-',
            '—' => '-',
            '×' => 'x',
        ]);

        return preg_replace('/[^\x20-\x7E]/', '', $value);
    }

    protected function formatDateLongId($date)
    {
        if (empty($date)) {
            return '';
        }

        $parsed = Carbon::parse($date);
        $months = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        $monthName = $months[(int) $parsed->format('n')] ?? $parsed->format('F');

        return $parsed->format('d') . ' ' . $monthName . ' ' . $parsed->format('Y');
    }

    protected function nbLines($w, $txt)
    {
        $cw = $this->CurrentFont['cw'];
        if ($w == 0) {
            $w = $this->w - $this->rMargin - $this->x;
        }
        $wmax = ($w - 2 * $this->cMargin) * 1000 / $this->FontSize;
        $s = str_replace("\r", '', (string) $txt);
        $nb = strlen($s);
        if ($nb > 0 && $s[$nb - 1] === "\n") {
            $nb--;
        }
        $sep = -1;
        $i = 0;
        $j = 0;
        $l = 0;
        $nl = 1;
        while ($i < $nb) {
            $c = $s[$i];
            if ($c === "\n") {
                $i++;
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
                continue;
            }
            if ($c === ' ') {
                $sep = $i;
            }
            $l += $cw[$c] ?? 0;
            if ($l > $wmax) {
                if ($sep === -1) {
                    if ($i === $j) {
                        $i++;
                    }
                } else {
                    $i = $sep + 1;
                }
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
            } else {
                $i++;
            }
        }
        return $nl;
    }

    protected function checkPageBreak($h)
    {
        if ($this->GetY() + $h > $this->PageBreakTrigger) {
            $this->AddPage($this->CurOrientation);
        }
    }

    protected function tableRow(array $cells, array $widths, array $aligns)
    {
        $lineHeight = 5;
        $maxLines = 1;
        foreach ($cells as $index => $text) {
            $cleanText = $this->sanitizeText($text);
            $maxLines = max($maxLines, $this->nbLines($widths[$index], $cleanText));
        }
        $rowHeight = $lineHeight * $maxLines;
        $this->checkPageBreak($rowHeight);

        foreach ($cells as $index => $text) {
            $cleanText = $this->sanitizeText($text);
            $w = $widths[$index];
            $a = $aligns[$index] ?? 'L';
            $x = $this->GetX();
            $y = $this->GetY();
            $this->Rect($x, $y, $w, $rowHeight);
            $this->MultiCell($w, $lineHeight, $cleanText, 0, $a);
            $this->SetXY($x + $w, $y);
        }
        $this->Ln($rowHeight);
    }

    protected function writeBilingualLabel($x, $y, $label, $translation = '')
    {
        $this->SetFont('Arial', '', 9);
        $this->Text($x, $y + 3, $label);
        $this->SetFont('Arial', 'I', 8);
        if ($translation !== '') {
            $this->Text($x, $y + 5.5, $translation);
        }
    }

    protected function writeBilingualTableHeader($x, $y, $width, $label, $translation = '')
    {
        $this->Rect($x, $y, $width, 8);
        $this->SetFont('Arial', 'B', 8);
        $this->SetXY($x, $y + 1.5);
        $this->Cell($width, 3.5, $label, 0, 2, 'C');
        $this->SetFont('Arial', 'I', 7);
        if ($translation !== '') {
            $this->Cell($width, 2.5, $translation, 0, 0, 'C');
        }
    }

    protected function patientInfo()
    {
        $leftItems = [
            [
                'No. Sampel',
                'Sampling Number',
                $this->pemeriksaan->nomor_sampel ?? '',
            ],
            [
                'Waktu Sampling',
                'Sampling Time',
                trim($this->formatDate($this->pemeriksaan->tanggal_sampling) . ' ' . $this->formatTime($this->pemeriksaan->jam_sampling)),
            ],
            [
                'Sampel Diterima',
                'Sample Received',
                trim(
                    $this->formatDate($this->pemeriksaan->tanggal_sampel_diterima)
                        . ' '
                        . $this->formatTime($this->pemeriksaan->jam_sampel_diterima)
                ),
            ],
            [
                'Waktu Hasil Selesai',
                'Result Time',
                trim(
                    $this->formatDate($this->pemeriksaan->tanggal_hasil_selesai)
                        . ' '
                        . $this->formatTime($this->pemeriksaan->jam_hasil_selesai)
                ),
            ],
            [
                'Rujukan Dari',
                'Referred By',
                $this->pemeriksaan->dokter->nama ?? '',
            ],
            [
                'No. Telp Dokter',
                'Doctor Phone Number',
                $this->pemeriksaan->dokter->no_telepon ?? '',
            ],
        ];

        $rightItems = [
            [
                'Nama',
                'Name',
                $this->pemeriksaan->pasien->nama ?? '',
            ],
            [
                'Tanggal Lahir',
                'Date of Birth',
                $this->formatDate($this->pemeriksaan->pasien->tanggal_lahir ?? null),
            ],
            [
                'NIK',
                'ID Number',
                $this->pemeriksaan->pasien->nik ?? '',
            ],
            [
                'Jenis Kelamin',
                'Sex',
                $this->pemeriksaan->pasien->jenis_kelamin ?? '',
            ],
            [
                'No. Telepon',
                'Phone Number',
                $this->pemeriksaan->pasien->no_telepon ?? '',
            ],
            [
                'Alamat',
                'Address',
                $this->pemeriksaan->pasien->alamat ?? '',
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

            [$labelLeft, $translationLeft, $valueLeft] = $leftItem;
            [$labelRight, $translationRight, $valueRight] = $rightItems[$index];

            $this->writeBilingualLabel($leftX, $y, $labelLeft, $translationLeft);
            $this->SetFont('Arial', '', 9);
            $this->Text($leftX + $labelWidth, $y + 3.5, ':');
            $this->Text(
                $leftX + $labelWidth + $colonWidth,
                $y + 3.5,
                $this->sanitizeText($valueLeft)
            );

            $this->writeBilingualLabel($rightX, $y, $labelRight, $translationRight);
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

    protected function resultTable()
    {
        $results = $this->pemeriksaan->hasilPemeriksaan()
            ->with(['detailPemeriksaan', 'itemPemeriksaan.parent', 'itemPemeriksaan.referenceRanges'])
            ->get()
            ->sortBy(function ($hasil) {
                $parent = $hasil->itemPemeriksaan?->parent;
                $parentOrder = $parent?->urut ?? 0;
                $itemOrder = $hasil->itemPemeriksaan?->urut ?? 0;
                $parentName = $parent?->nama ?? '';
                $detailId = $hasil->detail_pemeriksaan_id ?? '';
                $itemKe = (int) ($hasil->item_ke ?? 1);

                return sprintf('%04d-%s-%04d-%s-%04d', $parentOrder, $parentName, $itemOrder, $detailId, $itemKe);
            });

        $this->SetFillColor(230, 230, 230);
        $headerY = $this->GetY();
        $headerX = $this->GetX();
        $this->Rect($headerX, $headerY, 190, 8, 'F');

        $x = $headerX;
        $this->writeBilingualTableHeader($x, $headerY, 60, 'PARAMETER', 'Test');
        $x += 60;
        $this->writeBilingualTableHeader($x, $headerY, 25, 'HASIL', 'Result');
        $x += 25;
        $this->writeBilingualTableHeader($x, $headerY, 20, 'SATUAN', 'Unit');
        $x += 20;
        $this->writeBilingualTableHeader($x, $headerY, 40, 'NILAI RUJUKAN', 'Reference');
        $x += 40;
        $this->writeBilingualTableHeader($x, $headerY, 45, 'METODE', 'Method');
        $this->SetY($headerY + 8);

        $this->SetFont('Arial', '', 8);

        $currentGroup = null;
        foreach ($results as $hasil) {
            $item = $hasil->itemPemeriksaan;
            if (!$item) {
                continue;
            }

            $groupName = $item->parent?->nama;
            if ($groupName && $groupName !== $currentGroup) {
                $currentGroup = $groupName;
                $this->SetFillColor(245, 245, 245);
                $this->Cell(190, 6, $this->sanitizeText(strtoupper($groupName)), 1, 1, 'L', true);
            }

            $nilaiRujukan = $hasil->nilai_rujukan ?: $this->formatReferenceRanges($item);
            $hasilValue = $hasil->hasil ?? '';
            if ($hasil->status === 'tidak_normal') {
                $hasilValue = $hasilValue !== '' ? $hasilValue . ' *' : '*';
            }
            $detailQty = max(1, (int) ($hasil->detailPemeriksaan?->qty ?? 1));
            $parameterLabel = $item->nama ?? '-';
            if ($detailQty > 1) {
                $parameterLabel .= ' (' . ((int) ($hasil->item_ke ?? 1)) . '/' . $detailQty . ')';
            }

            $this->tableRow(
                [
                    $parameterLabel,
                    $hasilValue,
                    $hasil->satuan ?? $item->satuan ?? '-',
                    $nilaiRujukan,
                    $hasil->metode ?? $item->metode ?? '-',
                ],
                [60, 25, 20, 40, 45],
                ['L', 'C', 'C', 'C', 'L']
            );
        }

        $this->Ln(4);
    }

    protected function notesSection()
    {
        $this->SetFont('Arial', '', 8);
        $this->Cell(0, 5, 'Catatan:', 0, 1);
        $this->Cell(0, 4, '- spesimen layak diperiksa', 0, 1);
        $this->Cell(0, 4, '- tanda * untuk hasil abnormal', 0, 1);
        $this->Cell(0, 4, '- angka dalam kurung menunjukkan pengulangan hasil sesuai qty pemeriksaan', 0, 1);
        $this->Ln(2);
    }

    protected function keteranganSection()
    {
        $this->SetFont('Arial', 'B', 10);
        $this->Cell(0, 6, 'Keterangan', 0, 1);
        $this->SetFont('Arial', '', 9);
        $this->MultiCell(0, 6, $this->pemeriksaan->keterangan ?? '-');
        $this->Ln(2);
    }

    protected function signatureSection()
    {
        $this->Ln(2);
        $petugas = $this->pemeriksaan->petugasPemeriksaan()->with('user')->get();
        $pemeriksa = $petugas->first()?->user->name ?? '(............................)';

        $leftX = 10;
        $rightX = 120;

        $startY = $this->GetY();

        // Pemeriksa
        $this->SetX($leftX);
        $this->SetFont('Arial', '', 9);
        $this->Cell(30, 5, 'Pemeriksa', 0, 0, 'L');
        $this->Cell(5, 5, ':', 0, 0, 'C');
        $this->Cell(0, 5, $this->sanitizeText($pemeriksa), 0, 1, 'L');
        $this->SetX($leftX);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 5, 'Analytical by', 0, 1, 'L');

        $this->Ln(1); // Reduced spacing

        // Divalidasi oleh
        $this->SetX($leftX);
        $this->SetFont('Arial', '', 9);
        $this->Cell(30, 5, 'Divalidasi oleh', 0, 0, 'L');
        $this->Cell(5, 5, ':', 0, 0, 'C');
        $petugasValidasi = $this->pemeriksaan->petugasValidasi()->with('user')->get();
        $validator = $petugasValidasi->first()?->user->name ?? '(........................)';
        $this->Cell(0, 5, $this->sanitizeText($validator), 0, 1, 'L');
        $this->SetX($leftX);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 5, 'Validated by', 0, 1, 'L');

        // Notes Section moved here
        $this->Ln(2);
        $this->SetX($leftX);
        $this->SetFont('Arial', '', 8);
        $this->Cell(0, 5, 'Catatan:', 0, 1);
        // ambil keterangan dari pemeriksaan, dan split berdasarkan enter 
        $keteranganLines = explode("\n", $this->pemeriksaan->keterangan ?? '');
        foreach ($keteranganLines as $line) {
            $this->SetX($leftX);
            $this->Cell(0, 4, '- ' . $line, 0, 1);
        }
        $this->SetX($leftX);
        $this->Cell(0, 4, '- spesimen layak diperiksa', 0, 1);
        $this->SetX($leftX);
        $this->Cell(0, 4, '- tanda * untuk hasil abnormal', 0, 1);
        $this->SetX($leftX);
        $this->Cell(0, 4, '- angka dalam kurung menunjukkan pengulangan hasil sesuai qty pemeriksaan', 0, 1);

        // Right side for signature date and authorization
        $this->SetY($startY); // Reset Y to align with top of pemeriksa
        $tanggalTtd = $this->pemeriksaan->tanggal_hasil_selesai ?? now();
        $this->SetFont('Arial', '', 9);
        $this->SetX($rightX);
        $this->Cell(0, 5, 'Balikpapan, ' . $this->formatDateLongId($tanggalTtd), 0, 1, 'L');

        $this->SetX($rightX);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(0, 6, 'Authorized by', 0, 1, 'L');
        $this->Ln(20); // Space for signature
        $this->SetX($rightX);
        $this->SetFont('Arial', '', 9);
        // $this->Cell(0, 6, '(............................)', 0, 1, 'L');

        $this->Ln(2);
    }

    protected function drawQrAtSelectedPosition(): void
    {
        if (empty($this->qrImagePath) || !is_file($this->qrImagePath)) {
            return;
        }

        if (!is_array($this->qrPositionMm)) {
            return;
        }

        $targetPage = $this->qrPage ?? $this->PageNo();
        $totalPages = $this->PageNo();
        $targetPage = max(1, min($totalPages, $targetPage));

        $xMm = (float) ($this->qrPositionMm['x'] ?? 0);
        $yMm = (float) ($this->qrPositionMm['y'] ?? 0);
        $qrSize = 18;

        $pageWidth = (float) $this->GetPageWidth();
        $pageHeight = (float) $this->GetPageHeight();

        $x = max(0, min($pageWidth - $qrSize, $xMm - ($qrSize / 2)));
        $y = max(0, min($pageHeight - $qrSize, $yMm - ($qrSize / 2)));

        $originalPage = $this->page;
        $this->page = $targetPage;
        $this->Image($this->qrImagePath, $x, $y, $qrSize, $qrSize, 'PNG');
        $this->page = $originalPage;
    }

    public function generate()
    {
        $this->AddPage();
        $this->patientInfo();
        $this->resultTable();
        $this->signatureSection();
        $this->drawQrAtSelectedPosition();
    }
}
