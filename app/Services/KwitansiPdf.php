<?php

namespace App\Services;

use App\Models\Pembayaran;
use Carbon\Carbon;
use FPDF;
use Ngekoding\Terbilang\Terbilang;

class KwitansiPdf extends FPDF
{
    public function __construct(
        protected Pembayaran $pembayaran
    ) {
        return parent::__construct();
    }

    public function Header()
    {
        // Logo kiri
        $this->Image(\public_path('images/logo.png'), 10, 8, 25);

        // Logo kanan (akreditasi)
        $this->Image(\public_path('images/logo-kemenkes.png'), 170, 8, 25);

        // Judul Instansi
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
        $this->Line(10, 45, 200, 45);

        // Judul kanan
        $this->SetFont('Arial', 'B', 11);
        $this->SetXY(160, 47);
        $this->Cell(40, 6, 'BILL / KWITANSI', 0, 1, 'R');

        $this->Ln(5);
    }

    public function patientInfo()
    {
        $this->SetFont('Arial', '', 10);

        // Kiri
        $this->SetX(10);
        $this->Cell(30, 6, 'No. Register', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(60, 6, $this->pembayaran->pemeriksaan->no_registrasi, 0, 0);

        // Kanan
        $this->Cell(30, 6, 'Tgl. Pemeriksaan', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(40, 6, Carbon::parse($this->pembayaran->pemeriksaan->tanggal_pendaftaran)->format('d-m-Y'), 0, 1);

        $this->SetX(10);
        $this->Cell(30, 6, 'Nama', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(60, 6, $this->pembayaran->pasien->nama, 0, 0);

        $this->Cell(30, 6, 'No. Sampel', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(40, 6, '', 0, 1);

        $this->SetX(10);
        $this->Cell(30, 6, 'Kelamin', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(60, 6, $this->pembayaran->pasien->jenis_kelamin, 0, 0);

        $this->Cell(30, 6, 'Dokter', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(40, 6, $this->pembayaran->dokter->nama, 0, 1);

        $this->SetX(10);
        $this->Cell(30, 6, 'Umur', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $tanggalLahir = Carbon::parse($this->pembayaran->pasien->tanggal_lahir);
        $umur = $tanggalLahir->diff(Carbon::now());
        $this->Cell(60, 6, $umur->y . ' Tahun ' . $umur->m . ' Bulan', 0, 0);

        $this->Cell(30, 6, 'Pembayaran', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(40, 6, $this->pembayaran->pemeriksaan->jenis_bayar, 0, 1);

        $this->SetX(10);
        $this->Cell(30, 6, 'Alamat', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->MultiCell(155, 6, $this->pembayaran->pasien->alamat);

        $this->Ln(3);
    }

    public function table()
    {
        $this->SetFont('Arial', 'B', 10);

        $this->Cell(10, 8, 'NO', 1, 0, 'C');
        $this->Cell(80, 8, 'JENIS PELAYANAN', 1, 0, 'C');
        $this->Cell(30, 8, 'H. SATUAN', 1, 0, 'C');
        $this->Cell(20, 8, 'VOLUME', 1, 0, 'C');
        $this->Cell(40, 8, 'JUMLAH (Rp)', 1, 1, 'C');

        $this->SetFont('Arial', '', 10);

        foreach ($this->pembayaran->pemeriksaan->detailPemeriksaan as $index => $detail) {
            $this->Cell(10, 7, $index + 1, 1, 0, 'C');
            $this->Cell(80, 7, $detail->jenisLayanan->nama, 1);
            $this->Cell(30, 7, number_format($detail->harga, 2, ',', '.'), 1, 0, 'R');
            $this->Cell(20, 7, '1', 1, 0, 'C');
            $this->Cell(40, 7, number_format($detail->harga, 2, ',', '.'), 1, 1, 'R');
        }

        // Baris kosong
        for ($i = 0; $i < 2; $i++) {
            $this->Cell(10, 7, '', 1);
            $this->Cell(80, 7, '', 1);
            $this->Cell(30, 7, '', 1);
            $this->Cell(20, 7, '', 1);
            $this->Cell(40, 7, '', 1, 1);
        }

        // Total
        $this->Cell(140, 8, 'Jumlah (Rp)', 1, 0, 'R');
        $this->Cell(40, 8, number_format($this->pembayaran->pemeriksaan->total, 2, ',', '.'), 1, 1, 'R');
    }

    public function footerSection()
    {
        $this->Ln(5);

        $this->SetFont('Arial', 'I', 10);
        $this->MultiCell(0, 6, 'Dengan huruf : ' . Terbilang::convert($this->pembayaran->pemeriksaan->total, true) . ' rupiah');

        $this->Ln(5);

        $this->SetFont('Arial', '', 10);
        $this->Cell(40, 6, 'Lembar I   : Pasien', 0, 0);
        $this->Cell(60, 6, 'Kasir', 0, 0, 'C');
        $this->Cell(20);
        $this->Cell(60, 6, 'Balikpapan, ' . Carbon::parse($this->pembayaran->tanggal_bayar)->format('d F Y'), 0, 1);

        $this->Cell(40, 6, 'Lembar II  : UPTD', 0, 0);
        $this->Cell(60, 6, '', 0, 0);
        $this->Cell(20);
        $this->Cell(60, 6, 'Bendahara Penerimaan', 0, 1);

        $this->Cell(40, 6, 'Lembar III : DKK', 0, 1);

        $this->Ln(20);
        $this->Cell(40);
        $this->Cell(60, 6, 'Sherly Shelviana', 0, 0, 'C');
        $this->Cell(20);
        $this->Cell(60, 6, 'Renny Prasetyowati', 0, 1, 'C');

        $this->Cell(60, 6, '', 0, 0);
        $this->Cell(60, 6, '', 0, 0);
        $this->Cell(60, 6, 'NIP. 198202182001122001', 0, 1, 'C');
    }
}
