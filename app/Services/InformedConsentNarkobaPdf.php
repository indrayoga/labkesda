<?php

namespace App\Services;

use App\Models\Pemeriksaan;
use Carbon\Carbon;
use FPDF;

class InformedConsentNarkobaPdf extends FPDF
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
        $this->Cell(0, 7, 'PENJELASAN DAN PERSETUJUAN', 0, 1, 'C');

        $this->SetFont('Arial', 'I', 11);
        $this->Cell(0, 6, 'informed Consent', 0, 1, 'C');

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

    function sectionPenjelasan()
    {
        $this->SetFont('Arial', 'B', 11);
        $this->Cell(0, 6, 'A. PENJELASAN', 0, 1);

        $this->SetFont('Arial', '', 10);

        $this->MultiCell(
            0,
            6,
            "1. Pengambilan spesimen urine dan/atau darah dilakukan untuk keperluan pemeriksaan narkoba guna mengetahui ada atau tidaknya kandungan zat narkotika, psikotropika dan bahan adiktif lainnya di dalam tubuh.\n\n" .
                "2. Prosedur pengambilan spesimen dilakukan sesuai dengan standar operasional prosedur yang berlaku dan dilaksanakan oleh petugas laboratorium yang berwenang.\n\n" .
                "3. Risiko atau efek samping yang mungkin timbul akibat tindakan pengambilan spesimen sangat minimal, seperti rasa tidak nyaman pada saat pengambilan urine atau nyeri ringan pada saat pengambilan darah.\n\n" .
                "4. Identitas pasien dan hasil pemeriksaan laboratorium dijamin kerahasiaannya dan hanya digunakan sesuai dengan tujuan pemeriksaan."
        );

        $this->Ln(2);
    }

    function sectionPersetujuan()
    {
        $this->SetFont('Arial', 'B', 11);
        $this->Cell(0, 6, 'B. PERSETUJUAN', 0, 1);

        $this->SetFont('Arial', '', 10);
        $this->Cell(0, 6, 'Saya yang bertanda tangan di bawah ini:', 0, 1);

        // Identitas
        $this->Cell(35, 6, 'Nama', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(80, 6, '........................................', 0, 0);

        $this->checkbox(145, $this->GetY() + 1, false);
        $this->Cell(25, 6, 'Laki-laki', 0, 0);

        $this->checkbox(175, $this->GetY() + 1, false);
        $this->Cell(0, 6, 'Perempuan', 0, 1);

        $this->Cell(35, 6, 'Tanggal lahir', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(0, 6, '........................................', 0, 1);

        $this->Cell(35, 6, 'Alamat', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->MultiCell(0, 6, '.................................................................');

        $this->Ln(2);

        $this->MultiCell(
            0,
            6,
            'Dengan ini saya menyatakan SETUJU / TIDAK SETUJU* untuk dilakukan pemeriksaan narkoba terhadap diri saya.'
        );

        $this->Ln(2);

        $this->MultiCell(
            0,
            6,
            'Saya telah mendapatkan penjelasan yang cukup mengenai tujuan, prosedur, serta kemungkinan hasil pemeriksaan dan saya memahami sepenuhnya.'
        );

        $this->MultiCell(
            0,
            6,
            'Pernyataan persetujuan ini saya buat dengan sadar dan tanpa paksaan dari pihak manapun.'
        );
    }

    function signatureSection()
    {
        $this->Ln(5);
        $this->Cell(0, 6, 'Balikpapan, .........................', 0, 1);

        $this->Ln(2);
        $this->SetFont('Arial', '', 10);

        $this->Cell(63, 7, 'Petugas', 1, 0, 'C');
        $this->Cell(63, 7, 'Yang Diperiksa', 1, 0, 'C');
        $this->Cell(64, 7, 'Saksi', 1, 1, 'C');

        $this->Cell(63, 25, '', 1, 0);
        $this->Cell(63, 25, '', 1, 0);
        $this->Cell(64, 25, '', 1, 1);

        $this->Cell(63, 7, '(....................)', 1, 0, 'C');
        $this->Cell(63, 7, '(....................)', 1, 0, 'C');
        $this->Cell(64, 7, '(....................)', 1, 1, 'C');
    }
}
