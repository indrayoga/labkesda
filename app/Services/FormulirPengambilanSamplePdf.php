<?php

namespace App\Services;

use App\Models\Pemeriksaan;
use Carbon\Carbon;
use FPDF;

class FormulirPengambilanSamplePdf extends FPDF
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
        $this->Cell(0, 7, 'FORMULIR PENGAMBILAN SAMPEL', 0, 1, 'C');

        $this->SetFont('Arial', 'I', 11);
        $this->Cell(0, 6, 'Sample Collection Form', 0, 1, 'C');

        $this->Ln(5);
    }

    function checkbox($x, $y, $checked = false)
    {
        $this->Rect($x, $y, 5, 5);
        if ($checked) {
            $this->Line($x, $y, $x + 5, $y + 5);
            $this->Line($x + 5, $y, $x, $y + 5);
        }
    }

    protected function writeLabel($x, $y, $label, $translation)
    {
        $this->SetFont('Arial', '', 9);
        $this->Text($x, $y + 3.5, $label);
        $this->SetFont('Arial', 'I', 8);
        $this->Text($x, $y + 7, $translation);
    }

    protected function formatDate($date)
    {
        if (empty($date)) {
            return '';
        }

        return Carbon::parse($date)->format('d/m/Y');
    }

    protected function drawNoteLines($x, $y, $width, $height)
    {
        $lineCount = 3;
        $gap = ($height - 8) / $lineCount;

        for ($i = 1; $i <= $lineCount; $i++) {
            $this->Line($x, $y + 8 + ($gap * $i), $x + $width, $y + 8 + ($gap * $i));
        }
    }

    public function formSection()
    {
        $left = 10;
        $top = $this->GetY();
        $boxWidth = 190;
        $midX = $left + ($boxWidth / 2);

        $rowHeight = 9;
        $noteHeight = 18;
        $declarationHeight = 32;
        $signatureTitleHeight = 8;
        $signatureAreaHeight = 35;

        $boxHeight = ($rowHeight * 4) + ($noteHeight * 2) + $declarationHeight + $signatureTitleHeight + $signatureAreaHeight;

        $this->Rect($left, $top, $boxWidth, $boxHeight);

        $y = $top;

        // Horizontal lines for first rows
        for ($i = 1; $i <= 4; $i++) {
            $this->Line($left, $y + ($rowHeight * $i), $left + $boxWidth, $y + ($rowHeight * $i));
        }

        // Vertical line for the first 4 rows (2 columns)
        $this->Line($midX, $y, $midX, $y + ($rowHeight * 4));

        // Row 1: Nama / Nomor Botol
        $this->writeLabel($left + 2, $y, 'Nama', 'Name');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 33, $y + 3.5, ':');
        $this->Text($left + 37, $y + 3.5, $this->pemeriksaan->pasien->nama ?? '');

        $this->writeLabel($midX + 2, $y, 'Nomor Botol', 'Botol Number');
        $this->Text($midX + 33, $y + 3.5, ':');
        $this->Text($midX + 37, $y + 3.5, $this->pemeriksaan->no_botol ?? '');

        // Row 2: Nomor Identitas / Jenis Sampel
        $y += $rowHeight;
        $this->writeLabel($left + 2, $y, 'Nomor Identitas', 'Identity Number');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 33, $y + 3.5, ':');
        $this->Text($left + 37, $y + 3.5, $this->pemeriksaan->pasien->nik ?? '');

        $this->writeLabel($midX + 2, $y, 'Jenis Sampel', 'Sample');
        $this->Text($midX + 33, $y + 3.5, ':');

        $sampleType = strtolower((string) ($this->pemeriksaan->jenis_sampel ?? ''));
        $this->checkbox($midX + 40, $y + 1.5, $sampleType === 'urin');
        $this->SetFont('Arial', '', 9);
        $this->Text($midX + 47, $y + 5, 'Urin');
        $this->checkbox($midX + 65, $y + 1.5, $sampleType === 'darah');
        $this->Text($midX + 72, $y + 5, 'Darah');

        // Row 3: Jenis Kelamin / Tanggal
        $y += $rowHeight;
        $this->writeLabel($left + 2, $y, 'Jenis Kelamin', 'Sex');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 33, $y + 3.5, ':');

        $isMale = ($this->pemeriksaan->pasien->jenis_kelamin ?? '') === 'Laki-laki';
        $isFemale = ($this->pemeriksaan->pasien->jenis_kelamin ?? '') === 'Perempuan';
        $this->checkbox($left + 40, $y + 1.5, $isMale);
        $this->Text($left + 47, $y + 5, 'Laki-laki');
        $this->checkbox($left + 70, $y + 1.5, $isFemale);
        $this->Text($left + 77, $y + 5, 'Perempuan');

        $this->writeLabel($midX + 2, $y, 'Tanggal', 'Date');
        $this->Text($midX + 33, $y + 3.5, ':');
        $this->Text($midX + 37, $y + 3.5, $this->formatDate($this->pemeriksaan->tanggal_pendaftaran ?? null));

        // Row 4: No Telepon / Waktu
        $y += $rowHeight;
        $this->writeLabel($left + 2, $y, 'No. Telepon', 'Phone Number');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 33, $y + 3.5, ':');
        $this->Text($left + 37, $y + 3.5, $this->pemeriksaan->pasien->no_telepon ?? '');

        $this->writeLabel($midX + 2, $y, 'Waktu', 'Time');
        $this->Text($midX + 33, $y + 3.5, ':');
        $this->Text($midX + 37, $y + 3.5, $this->pemeriksaan->waktu_pengambilan ?? '');

        // Notes: medicines last 3 days
        $y += $rowHeight;
        $this->Line($left, $y + $noteHeight, $left + $boxWidth, $y + $noteHeight);
        $this->SetFont('Arial', '', 9);
        $this->SetXY($left + 2, $y + 2);
        $this->Cell(0, 4, 'Catatan obat-obatan yang diminum dalam waktu 3 (tiga) hari terakhir', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->SetX($left + 2);
        $this->Cell(0, 4, 'record of medicines taken in the last 3 (three) days', 0, 1);
        $this->drawNoteLines($left + 2, $y, $boxWidth - 4, $noteHeight);

        // Notes: other
        $y += $noteHeight;
        $this->Line($left, $y + $noteHeight, $left + $boxWidth, $y + $noteHeight);
        $this->SetFont('Arial', '', 9);
        $this->SetXY($left + 2, $y + 2);
        $this->Cell(0, 4, 'Catatan lain-lain (hal yang perlu dilampirkan)', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->SetX($left + 2);
        $this->Cell(0, 4, 'Other notes (things that need to be reported)', 0, 1);
        $this->drawNoteLines($left + 2, $y, $boxWidth - 4, $noteHeight);

        // Declaration
        $y += $noteHeight;
        $this->Line($left, $y + $declarationHeight, $left + $boxWidth, $y + $declarationHeight);
        $this->SetFont('Arial', '', 8.5);
        $this->SetXY($left + 2, $y + 2);
        $this->MultiCell(
            $boxWidth - 4,
            4,
            "Saya menyatakan bahwa saya mengerti untuk pengambilan sampel ini dalam rangka pemeriksaan\n" .
                "Narkotika, Polikotropika, dan Zat Adiktif lainnya (NAPZA) dan harus dilakukan dengan\n" .
                "pengawasan petugas yang berjenis kelamin sama yang telah ditentukan.\n" .
                "I declare that I understand that this sampling is for examination purposes Narcotics,\n" .
                "Polytropic Drugs and Other Addictive Substances (NAPZA) and must be carried out under the\n" .
                "supervision of an officer of the same gender as determined"
        );

        // Signature title row
        $y += $declarationHeight;
        $this->Line($left, $y + $signatureTitleHeight, $left + $boxWidth, $y + $signatureTitleHeight);
        $this->SetFont('Arial', '', 9);
        $this->SetXY($left + 2, $y + 2);
        $this->Cell(0, 4, 'Nama dan tandatangan', 0, 1, 'C');
        $this->SetFont('Arial', 'I', 8);
        $this->SetX($left + 2);
        $this->Cell(0, 3, 'Name and signature', 0, 0, 'C');

        // Signature area
        $y += $signatureTitleHeight;
        $this->Line($left, $y + $signatureAreaHeight, $left + $boxWidth, $y + $signatureAreaHeight);

        $colWidth = $boxWidth / 3;
        $this->Line($left + $colWidth, $y, $left + $colWidth, $y + $signatureAreaHeight);
        $this->Line($left + ($colWidth * 2), $y, $left + ($colWidth * 2), $y + $signatureAreaHeight);

        $this->SetFont('Arial', '', 9);
        $this->SetXY($left + 2, $y + 2);
        $this->Cell($colWidth - 4, 4, 'Peserta', 0, 0, 'C');
        $this->Cell($colWidth, 4, 'Pendamping (bila ada)', 0, 0, 'C');
        $this->Cell($colWidth - 4, 4, 'Petugas', 0, 1, 'C');

        $this->SetFont('Arial', 'I', 8);
        $this->SetX($left + 2);
        $this->Cell($colWidth - 4, 3, 'Participant', 0, 0, 'C');
        $this->Cell($colWidth, 3, 'Companion (if any)', 0, 0, 'C');
        $this->Cell($colWidth - 4, 3, 'Officer', 0, 1, 'C');

        $this->SetFont('Arial', '', 9);
        $lineY = $y + $signatureAreaHeight - 6;
        $this->SetXY($left + 2, $lineY);
        $this->Cell($colWidth - 4, 4, '...............................', 0, 0, 'C');
        $this->Cell($colWidth, 4, '...............................', 0, 0, 'C');
        $this->Cell($colWidth - 4, 4, '...............................', 0, 1, 'C');

        $this->Ln(6);
        $this->SetFont('Arial', '', 9);
        $this->Cell(0, 6, 'Keperluan :', 0, 1);
    }
}
