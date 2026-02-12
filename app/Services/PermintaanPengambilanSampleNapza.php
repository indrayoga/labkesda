<?php

namespace App\Services;

use App\Models\Pemeriksaan;
use Carbon\Carbon;
use FPDF;

class PermintaanPengambilanSampleNapza extends FPDF
{
    public function __construct(
        protected Pemeriksaan $pemeriksaan
    ) {
        return parent::__construct();
    }

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
        $this->SetFont('Arial', 'B', 12);
        $this->Cell(0, 7, 'PERMINTAAN PEMERIKSAAN DAN SAMPEL NAPZA', 0, 1, 'C');
        $this->SetFont('Arial', 'I', 10);
        $this->Cell(0, 6, 'Drug Abuse Analysis Request', 0, 1, 'C');
        $this->Ln(4);
    }

    protected function writeLabel($x, $y, $label, $translation)
    {
        $this->SetFont('Arial', '', 9);
        $this->Text($x, $y + 3.5, $label);
        $this->SetFont('Arial', 'I', 8);
        $this->Text($x, $y + 7, $translation);
    }

    protected function checkbox($x, $y, $checked = false)
    {
        $this->Rect($x, $y, 5, 5);
        if ($checked) {
            $this->Line($x, $y, $x + 5, $y + 5);
            $this->Line($x + 5, $y, $x, $y + 5);
        }
    }

    protected function formatDate($date)
    {
        if (empty($date)) {
            return '';
        }

        return Carbon::parse($date)->format('d/m/Y');
    }

    protected function formatDateTime($dateTime)
    {
        if (empty($dateTime)) {
            return '';
        }

        return Carbon::parse($dateTime)->format('d/m/Y h:i:s A');
    }

    protected function formatAge()
    {
        $tanggalLahir = $this->pemeriksaan->pasien->tanggal_lahir ?? null;
        if (empty($tanggalLahir)) {
            return '';
        }

        $umur = Carbon::parse($tanggalLahir)->diff(Carbon::now());
        return $umur->y . ' Tahun';
    }

    public function formSection()
    {
        $left = 10;
        $right = 200;
        $y = $this->GetY();
        $rowHeight = 8;

        // Row 1: Tanggal / Nomor Lab
        $this->writeLabel($left, $y, 'Tanggal', 'Date');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 28, $y + 3.5, ':');
        $this->Text($left + 32, $y + 3.5, $this->formatDate($this->pemeriksaan->tanggal_pendaftaran ?? null));

        $this->writeLabel(130, $y, 'Nomor Lab', 'Lab Number');
        $this->Text(160, $y + 3.5, ':');
        $this->Text(164, $y + 3.5, $this->pemeriksaan->no_lab ?? '');

        // Row 2: Nama / Umur
        $y += $rowHeight;
        $this->writeLabel($left, $y, 'Nama', 'Name');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 28, $y + 3.5, ':');
        $this->Text($left + 32, $y + 3.5, $this->pemeriksaan->pasien->nama ?? '');

        $this->writeLabel(130, $y, 'Umur', 'Age');
        $this->Text(160, $y + 3.5, ':');
        $this->Text(164, $y + 3.5, $this->formatAge());

        // Row 3: Jenis Kelamin
        $y += $rowHeight;
        $this->writeLabel($left, $y, 'Jenis Kelamin', 'Sex');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 28, $y + 3.5, ':');

        $isMale = ($this->pemeriksaan->pasien->jenis_kelamin ?? '') === 'Laki-laki';
        $isFemale = ($this->pemeriksaan->pasien->jenis_kelamin ?? '') === 'Perempuan';
        $this->checkbox($left + 36, $y + 1.5, $isMale);
        $this->Text($left + 43, $y + 5, 'Laki-laki');
        $this->checkbox($left + 75, $y + 1.5, $isFemale);
        $this->Text($left + 82, $y + 5, 'Perempuan');

        // Row 4: Alamat
        $y += $rowHeight;
        $this->writeLabel($left, $y, 'Alamat', 'Address');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 28, $y + 3.5, ':');
        $this->SetXY($left + 32, $y + 1.5);
        $this->MultiCell(160, 4, $this->pemeriksaan->pasien->alamat ?? '');
        $y = max($y + $rowHeight, $this->GetY());

        // Row 5: Dokter/Instansi
        $this->writeLabel($left, $y, 'Dokter/Instansi', 'Doctor Company');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 28, $y + 3.5, ':');
        $this->Text($left + 32, $y + 3.5, $this->pemeriksaan->dokter->nama ?? '');

        // Row 6: Jenis Sampel
        $y += $rowHeight;
        $this->writeLabel($left, $y, 'Jenis Sampel', 'Sample');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 28, $y + 3.5, ':');
        $sampleType = strtolower((string) ($this->pemeriksaan->jenis_sampel ?? ''));
        $this->checkbox($left + 36, $y + 1.5, $sampleType === 'urin');
        $this->Text($left + 43, $y + 5, 'Urin');
        $this->checkbox($left + 70, $y + 1.5, $sampleType === 'darah');
        $this->Text($left + 77, $y + 5, 'Darah');

        // Row 7: Metode Pemeriksaan
        $y += $rowHeight;
        $this->writeLabel($left, $y, 'Metode Pemeriksaan', 'Analysis Method');
        $this->SetFont('Arial', '', 9);
        $this->Text($left + 28, $y + 3.5, ':');
        $method = strtolower((string) ($this->pemeriksaan->metode_pemeriksaan ?? ''));
        $this->checkbox($left + 60, $y + 1.5, $method === 'skrining');
        $this->Text($left + 67, $y + 5, 'Skrining');
        $this->checkbox($left + 100, $y + 1.5, $method === 'konfirmasi');
        $this->Text($left + 107, $y + 5, 'Konfirmasi');

        $y += $rowHeight + 2;
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(0, 5, 'Pengambilan Sampel', 0, 1);
        $this->SetFont('Arial', '', 9);
        $this->Cell(0, 5, '- Pengambilan sampel dilakukan di bawah pengawasan petugas Labkesda', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 4, 'Sample is taken under Labkesda officer supervised', 0, 1);
        $this->SetFont('Arial', '', 9);
        $this->Cell(0, 5, '- Sampel diantar ke Labkesda', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 4, 'Sample is delivered to Labkesda', 0, 1);

        $this->SetFont('Arial', '', 9);
        $this->Cell(55, 5, '- Kondisi fisik sampel', 0, 0);
        $this->Cell(5, 5, ':', 0, 0);
        $this->Cell(70, 5, '.................................', 0, 0);

        $this->Cell(35, 5, 'Nomor Botol', 0, 0);
        $this->Cell(5, 5, ':', 0, 0);
        $this->Cell(0, 5, $this->pemeriksaan->no_botol ?? '', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(55, 4, 'Condition of sample', 0, 0);
        $this->Cell(75, 4, '', 0, 0);
        $this->Cell(35, 4, 'Bottle Number', 0, 1);

        $this->SetFont('Arial', '', 9);
        $this->Cell(55, 5, '', 0, 0);
        $this->Cell(5, 5, '', 0, 0);
        $this->Cell(70, 5, '', 0, 0);
        $this->Cell(35, 5, 'Waktu', 0, 0);
        $this->Cell(5, 5, ':', 0, 0);
        $this->Cell(0, 5, $this->formatDateTime($this->pemeriksaan->waktu_pengambilan ?? null), 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(130, 4, '', 0, 0);
        $this->Cell(35, 4, 'Time', 0, 1);

        $this->Ln(2);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(0, 5, 'Jenis Pemeriksaan', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 4, 'Substances', 0, 1);
        $this->SetFont('Arial', '', 9);

        $items = [
            'Amphetamines (Amphetamine, Methamphetamine, MDA, MDMA, Ectasy, Sabu-sabu, Inex)',
            'Opiates (Putaw, Heroin, Morphine, Opium)',
            'Benzodiazepines (Pil KB, Mogadon, Rohypnol)',
            'Barbiturates',
            'Cannabis (Ganja, Marijuana, Gele, Hash)',
            'Cocaine (Coke, Crack)',
            'Methadone',
            'Phencyclidine',
            'Propoxyphene',
            'Alocohol',
            'Narkoba 5 Parameter',
            '...............................'
        ];

        foreach ($items as $item) {
            $this->Cell(4, 4.5, '-', 0, 0);
            $this->Cell(0, 4.5, $item, 0, 1);
        }

        $this->Ln(1);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(0, 5, 'Biaya Pemeriksaan', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 4, 'Cost', 0, 1);

        $this->SetFont('Arial', '', 9);
        $this->Cell(35, 5, 'Pembayaran', 0, 0);
        $this->Cell(5, 5, ':', 0, 0);
        $this->Cell(0, 5, '', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(35, 4, 'Payment', 0, 1);

        $this->SetFont('Arial', '', 9);
        $this->Cell(6, 5, '-', 0, 0);
        $this->Cell(25, 5, 'Lunas', 0, 0);
        $this->Cell(5, 5, ':', 0, 0);
        $this->Cell(50, 5, '', 0, 0);
        $this->Cell(80, 5, 'Nama dan tanda tangan pengirim', 0, 1, 'C');
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(6, 4, '', 0, 0);
        $this->Cell(25, 4, 'Paid', 0, 0);
        $this->Cell(55, 4, '', 0, 0);
        $this->Cell(80, 4, "Sender's name and signature", 0, 1, 'C');

        $this->SetFont('Arial', '', 9);
        $this->Cell(6, 5, '-', 0, 0);
        $this->Cell(25, 5, 'Uang muka', 0, 0);
        $this->Cell(5, 5, ':', 0, 0);
        $this->Cell(50, 5, '', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(6, 4, '', 0, 0);
        $this->Cell(25, 4, 'D.P.', 0, 1);

        $this->SetFont('Arial', '', 9);
        $this->Cell(6, 5, '-', 0, 0);
        $this->Cell(25, 5, 'Lain-lain', 0, 0);
        $this->Cell(5, 5, ':', 0, 0);
        $this->Cell(50, 5, '', 0, 1);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(6, 4, '', 0, 0);
        $this->Cell(25, 4, 'Other', 0, 1);

        $this->Ln(12);
        $this->SetFont('Arial', '', 9);
        $this->Cell(0, 5, '(............................... )', 0, 1, 'R');

        $this->Line($left, $this->GetY() + 2, $right, $this->GetY() + 2);
        $this->Ln(3);
        $this->SetFont('Arial', '', 8);
        $this->Cell(0, 4, 'F.20260124.1.011', 0, 1);
    }
}
