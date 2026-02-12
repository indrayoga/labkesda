<?php

namespace App\Services;

use App\Models\Pemeriksaan;
use Carbon\Carbon;
use FPDF;

class HasilPemeriksaanPdf extends FPDF
{
    public function __construct(
        protected Pemeriksaan $pemeriksaan
    ) {
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
        $this->SetFont('Arial', 'B', 13);
        $this->Cell(0, 7, 'HASIL PEMERIKSAAN LABORATORIUM', 0, 1, 'C');

        $this->SetFont('Arial', 'I', 11);
        $this->Cell(0, 6, 'Laboratory Examination Result', 0, 1, 'C');

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

        return $item->referenceRanges->map(function ($range) {
            $genderLabel = $range->jenis_kelamin ? $range->jenis_kelamin . ': ' : '';
            if ($range->value_type === 'kualitatif') {
                return $genderLabel . ($range->kualitatif_value ?? '-');
            }

            $minValue = $range->min_value !== null
                ? ($range->operator_min ?? '') . $range->min_value
                : '';
            $maxValue = $range->max_value !== null
                ? ($range->operator_max ?? '') . $range->max_value
                : '';
            $separator = $minValue && $maxValue ? ' - ' : '';

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
        $lineHeight = 6;
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

    protected function patientInfo()
    {
        $this->SetFont('Arial', '', 9);

        $this->Cell(30, 6, 'No. Registrasi', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(60, 6, $this->pemeriksaan->no_registrasi ?? '', 0, 0);

        $this->Cell(30, 6, 'No. Sampel', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(40, 6, $this->pemeriksaan->nomor_sampel ?? '', 0, 1);

        $this->Cell(30, 6, 'Nama', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(60, 6, $this->pemeriksaan->pasien->nama ?? '', 0, 0);

        $this->Cell(30, 6, 'Dokter', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(40, 6, $this->pemeriksaan->dokter->nama ?? '', 0, 1);

        $this->Cell(30, 6, 'Jenis Kelamin', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(60, 6, $this->pemeriksaan->pasien->jenis_kelamin ?? '', 0, 0);

        $this->Cell(30, 6, 'Tgl Sampling', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(
            40,
            6,
            trim($this->formatDate($this->pemeriksaan->tanggal_sampling) . ' ' . $this->formatTime($this->pemeriksaan->jam_sampling)),
            0,
            1
        );

        $this->Cell(30, 6, 'Alamat', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->MultiCell(60, 6, $this->pemeriksaan->pasien->alamat ?? '');

        $this->SetXY(105, $this->GetY() - 12);
        $this->Cell(30, 6, 'Hasil Selesai', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(
            40,
            6,
            trim($this->formatDate($this->pemeriksaan->tanggal_hasil_selesai) . ' ' . $this->formatTime($this->pemeriksaan->jam_hasil_selesai)),
            0,
            1
        );

        $this->Ln(4);
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

        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor(230, 230, 230);
        $this->Cell(60, 7, 'PARAMETER', 1, 0, 'C', true);
        $this->Cell(20, 7, 'HASIL', 1, 0, 'C', true);
        $this->Cell(20, 7, 'SATUAN', 1, 0, 'C', true);
        $this->Cell(40, 7, 'NILAI RUJUKAN', 1, 0, 'C', true);
        $this->Cell(35, 7, 'METODE', 1, 0, 'C', true);
        $this->Cell(15, 7, 'STATUS', 1, 1, 'C', true);

        $this->SetFont('Arial', '', 9);

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
                $this->Cell(190, 7, $this->sanitizeText(strtoupper($groupName)), 1, 1, 'L', true);
            }

            $nilaiRujukan = $hasil->nilai_rujukan ?: $this->formatReferenceRanges($item);
            $statusLabel = $hasil->status === 'tidak_normal' ? 'Tidak Normal' : 'Normal';

            $this->tableRow(
                [
                    $item->nama ?? '-',
                    $hasil->hasil ?? '',
                    $hasil->satuan ?? $item->satuan ?? '-',
                    $nilaiRujukan,
                    $hasil->metode ?? $item->metode ?? '-',
                    $statusLabel,
                ],
                [60, 20, 20, 40, 35, 15],
                ['L', 'C', 'C', 'L', 'L', 'C']
            );
        }

        $this->Ln(4);
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
        $this->Ln(3);
        $tanggalTtd = $this->pemeriksaan->tanggal_hasil_selesai ?? now();
        $this->SetFont('Arial', '', 9);
        $this->Cell(0, 6, 'Balikpapan, ' . $this->formatDateLongId($tanggalTtd), 0, 1, 'R');

        $this->Ln(2);
        $this->Cell(95, 6, 'Validated by', 0, 0, 'C');
        $this->Cell(95, 6, 'Authorized by', 0, 1, 'C');

        $this->Ln(16);
        $this->Cell(95, 6, '(............................)', 0, 0, 'C');
        $this->Cell(95, 6, '(............................)', 0, 1, 'C');
    }

    public function generate()
    {
        $this->AddPage();
        $this->patientInfo();
        $this->resultTable();
        $this->keteranganSection();
        $this->signatureSection();
    }
}
