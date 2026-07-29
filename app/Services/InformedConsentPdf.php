<?php

namespace App\Services;

use App\Models\Pemeriksaan;
use Carbon\Carbon;
use FPDF;
use Indrayoga\Bday\Bday;
use Indrayoga\Bday\ValueObjects\Age;

class InformedConsentPdf extends FPDF
{
    protected bool $usesPenanggungJawab = false;

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

    function sectionPenjelasan()
    {
        $this->SetFont('Arial', 'B', 11);
        $this->Cell(0, 6, 'A. PENJELASAN', 0, 1);

        $this->SetFont('Arial', '', 10);

        $items = [
            'Pengambilan spesimen (darah, urine, sputum, rectal swab, dan cairan tubuh lainnya) untuk mendapatkan spesimen yang representatif/adekuat untuk dilakukan pemeriksaan laboratorium yang hasilnya digunakan untuk keperluan skrining, penegakan diagnosis, prognosis maupun monitoring penyakit.',
            'Pengambilan spesimen seperti dijelaskan pada butir 1 dilakukan sesuai dengan prosedur standar.',
            'Efek samping yang diakibatkan oleh prosedur pengambilan spesimen sangat minim atau hampir tidak ada. Efek samping yang paling umum terjadi adalah rasa nyeri akibat tusukan jarum dan timbulnya memar (hematome) pada area tusukan jarum. Efek memar dapat dikurangi dengan melakukan kompres air hangat pada bagian tersebut.',
            'Identitas pasien dan hasil pemeriksaan laboratorium dijamin kerahasiaannya.'
        ];

        foreach ($items as $i => $text) {
            $this->MultiCell(0, 6, ($i + 1) . '. ' . $text);
            $this->Ln(1);
        }

        $this->Ln(2);
    }

    function checkbox($x, $y, $checked = false)
    {
        $this->Rect($x, $y, 5, 5);
        if ($checked) {
            $this->Line($x, $y, $x + 5, $y + 5);
            $this->Line($x + 5, $y, $x, $y + 5);
        }
    }

    protected function hasPenanggungJawab(): bool
    {
        return !empty($this->pemeriksaan->penanggung_jawab);
    }

    protected function getPersetujuanPihakPertama(): array
    {
        if ($this->hasPenanggungJawab()) {
            return [
                'nama' => $this->pemeriksaan->penanggung_jawab,
                'jenis_kelamin' => $this->pemeriksaan->jenis_kelamin_penanggung_jawab,
                'tempat_lahir' => $this->pemeriksaan->tempat_lahir_penanggung_jawab,
                'tanggal_lahir' => $this->pemeriksaan->tanggal_lahir_penanggung_jawab,
                'alamat' => $this->pemeriksaan->alamat_penanggung_jawab,
                'telepon' => $this->pemeriksaan->telepon_penanggung_jawab,
            ];
        }

        $pasien = $this->pemeriksaan->pasien;

        return [
            'nama' => $pasien->nama,
            'jenis_kelamin' => $pasien->jenis_kelamin,
            'tempat_lahir' => $pasien->tempat_lahir,
            'tanggal_lahir' => $pasien->tanggal_lahir,
            'alamat' => trim($pasien->alamat . ' ' . $pasien->kelurahan->nama . ' ' . $pasien->kecamatan->nama),
            'telepon' => $pasien->no_telepon,
        ];
    }

    protected function getPersetujuanPihakKedua(): array
    {
        $pasien = $this->pemeriksaan->pasien;

        return [
            'nama' => $pasien->nama,
            'jenis_kelamin' => $pasien->jenis_kelamin,
            'tanggal_lahir' => $pasien->tanggal_lahir,
            'alamat' => trim($pasien->alamat . ' ' . $pasien->kelurahan->nama . ' ' . $pasien->kecamatan->nama),
            'telepon' => $pasien->no_telepon,
        ];
    }

    protected function formatTanggalLahir(?string $tempatLahir, $tanggalLahir): string
    {
        if (empty($tanggalLahir)) {
            return (string) ($tempatLahir ?? '');
        }

        $tanggal = Carbon::parse($tanggalLahir)->format('d/m/Y');

        if (!empty($tempatLahir)) {
            return $tempatLahir . ', ' . $tanggal;
        }

        return $tanggal;
    }

    protected function renderGender(?string $jenisKelamin = null): void
    {
        $this->checkbox(140, $this->GetY() + 1, $jenisKelamin === 'Laki-laki');
        $this->Cell(20, 6, '', 0, 0);
        $this->Cell(25, 6, 'Laki-laki', 0, 0);

        $this->checkbox(165, $this->GetY() + 1, $jenisKelamin === 'Perempuan');
        $this->Cell(1, 6, '', 0, 0);
        $this->Cell(20, 6, 'Perempuan', 0, 1);
    }

    protected function renderUsiaLine($tanggalLahir): void
    {
        $this->Cell(30, 6, 'Usia', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);

        if (empty($tanggalLahir)) {
            $this->Cell(0, 6, '-', 0, 1);

            return;
        }

        /** @var Age $usia */
        $usia = Bday::age($tanggalLahir);
        $this->Cell(0, 6, $usia->years() . ' tahun ' . $usia->months() . ' bulan', 0, 1);
    }

    function sectionPersetujuan()
    {
        $pihakPertama = $this->getPersetujuanPihakPertama();
        $pihakKedua = $this->getPersetujuanPihakKedua();
        $this->usesPenanggungJawab = $this->hasPenanggungJawab();

        $this->SetFont('Arial', 'B', 11);
        $this->Cell(0, 6, 'B. PERSETUJUAN', 0, 1);

        $this->SetFont('Arial', '', 10);
        $this->Cell(0, 6, 'Saya yang bertandatangan di bawah ini :', 0, 1);

        // Nama + gender
        $this->Cell(30, 6, 'Nama', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(80, 6, $pihakPertama['nama'], 0, 0);
        $this->renderGender($pihakPertama['jenis_kelamin']);

        $this->Cell(30, 6, 'Tempat/Tanggal lahir', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(0, 6, $this->formatTanggalLahir($pihakPertama['tempat_lahir'], $pihakPertama['tanggal_lahir']), 0, 1);

        $this->renderUsiaLine($pihakPertama['tanggal_lahir']);

        $this->Cell(30, 6, 'Alamat/No. Telp', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->MultiCell(0, 6, trim(($pihakPertama['alamat'] ?? '') . ' / ' . ($pihakPertama['telepon'] ?? '')));

        $this->Ln(2);

        $this->MultiCell(
            0,
            6,
            'Menyatakan SETUJU / TIDAK SETUJU* untuk dilakukan tindakan pengambilan spesimen terhadap diri / suami / istri / ayah / ibu / anak / keluarga* saya :'
        );

        $this->Ln(1);

        // Data kedua
        $this->Cell(30, 6, 'Nama', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(80, 6, $pihakKedua['nama'], 0, 0);
        $this->renderGender($pihakKedua['jenis_kelamin']);

        $this->Cell(30, 6, 'Tanggal lahir', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->Cell(0, 6, $this->formatTanggalLahir(null, $pihakKedua['tanggal_lahir']), 0, 1);

        $this->renderUsiaLine($pihakKedua['tanggal_lahir']);

        $this->Cell(30, 6, 'Alamat/No. Telp', 0, 0);
        $this->Cell(5, 6, ':', 0, 0);
        $this->MultiCell(0, 6, trim(($pihakKedua['alamat'] ?? '') . ' / ' . ($pihakKedua['telepon'] ?? '')));
        $this->Ln(3);

        $this->MultiCell(
            0,
            6,
            'Segala tujuan dan kemungkinan yang dapat terjadi telah cukup dijelaskan oleh petugas dan saya telah mengerti sepenuhnya.'
        );
        $this->MultiCell(
            0,
            6,
            'Demikian pernyataan persetujuan ini saya buat dengan penuh kesadaran dan tanpa paksaan dari pihak manapun.'
        );
    }

    function signatureSection()
    {
        $this->Ln(5);
        $this->Cell(0, 6, 'Balikpapan, ' . Carbon::now()->format('d F Y'), 0, 1);

        $this->Ln(2);

        // Tabel tanda tangan
        $this->SetFont('Arial', '', 10);
        $this->Cell(63, 7, 'Dijelaskan oleh', 1, 0, 'C');
        $this->Cell(63, 7, 'Disetujui oleh', 1, 0, 'C');
        $this->Cell(64, 7, 'Disaksikan oleh', 1, 1, 'C');

        $this->Cell(63, 25, '', 1, 0);
        $this->Cell(63, 25, '', 1, 0);
        $this->Cell(64, 25, '', 1, 1);

        $this->Cell(63, 7, 'Petugas', 1, 0, 'C');
        $this->Cell(63, 7, $this->usesPenanggungJawab ? 'Penanggung Jawab' : 'Pasien / Keluarga pasien*', 1, 0, 'C');
        $this->Cell(64, 7, '(.......................)', 1, 1, 'C');
    }
}
