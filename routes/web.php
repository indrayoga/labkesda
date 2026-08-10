<?php

use App\Http\Controllers\BerandaController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DokterController;
use App\Http\Controllers\ItemPemeriksaanController;
use App\Http\Controllers\JenisLayananController;
use App\Http\Controllers\JenisPasienController;
use App\Http\Controllers\laporanController;
use App\Http\Controllers\PaketPemeriksaanController;
use App\Http\Controllers\PemeriksaanLingkunganController;
use App\Http\Controllers\PasienController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PemeriksaanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Beranda');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [BerandaController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/pasien-terbaru', [BerandaController::class, 'pasienTerbaru'])->name('beranda.pasien-terbaru');
    Route::get('/dashboard/pemeriksaan-terbanyak', [BerandaController::class, 'pemeriksaanTerbanyakBulanIni'])->name('beranda.pemeriksaan-terbanyak');
    Route::get('/dashboard/kunjungan-pasien-mingguan', [BerandaController::class, 'kunjunganPasien7hariTerakhir'])->name('beranda.kunjungan-pasien-mingguan');
    Route::get('/dashboard/statistik-bulan-ini', [BerandaController::class, 'statistikBulanIni'])->name('beranda.statistik-bulan-ini');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('/pasien', PasienController::class);
    Route::get('pendaftaran', [PasienController::class, 'pendaftaran'])->name('pendaftaran');
    Route::get('pendaftaran-laboratorium/{pasien}', [PasienController::class, 'pendaftaranLaboratorium'])->name('pendaftaran-laboratorium');

    Route::resource('/pemeriksaan', PemeriksaanController::class);
    Route::patch('pemeriksaan/{pemeriksaan}/update-sampling', [PemeriksaanController::class, 'updateSampling'])->name('pemeriksaan.update-sampling');
    Route::post('pemeriksaan/{pemeriksaan}/update-hasil-pemeriksaan', [PemeriksaanController::class, 'updateHasilPemeriksaan'])->name('pemeriksaan.update-hasil-pemeriksaan');
    Route::get('pemeriksaan/form-consent/{pemeriksaan}', [PemeriksaanController::class, 'printInformedConsent'])->name('pemeriksaan.form-consent');
    Route::get('pemeriksaan/form-pengambilan-sample/{pemeriksaan}', [PemeriksaanController::class, 'printFormulirPengambilanSample'])->name('pemeriksaan.formulir-pengambilan-sample');
    Route::get('pemeriksaan/permintaan-pemeriksaan-napza/{pemeriksaan}', [PemeriksaanController::class, 'printPermintaanPemeriksaanNapza'])->name('pemeriksaan.permintaan-pemeriksaan-napza');
    Route::get('pemeriksaan/{pemeriksaan}/hasil-pemeriksaan', [PemeriksaanController::class, 'printHasilPemeriksaan'])->name('print.hasil-pemeriksaan');
    Route::get('pemeriksaan/{pemeriksaan}/hasil-uji-sementara', [PemeriksaanController::class, 'printLembarHasilUjiSementara'])->name('print.hasil-uji-sementara');
    // BUG FIX #2: Renamed POST route from 'pemeriksaan.preview-ttd' to 'pemeriksaan.preview-ttd.generate'.
    // Both POST and GET were sharing the same route name 'pemeriksaan.preview-ttd'. In Laravel,
    // the last registration wins, so the POST name was silently overwritten by the GET definition,
    // making route('pemeriksaan.preview-ttd') always resolve to the GET endpoint.
    Route::post('pemeriksaan/{pemeriksaan}/preview-ttd', [PemeriksaanController::class, 'previewHasilPemeriksaanWithQr'])->name('pemeriksaan.preview-ttd.generate');
    Route::get('pemeriksaan/{pemeriksaan}/preview-ttd', [PemeriksaanController::class, 'previewTtd'])->name('pemeriksaan.preview-ttd');
    Route::post('pemeriksaan/{pemeriksaan}/sign', [PemeriksaanController::class, 'signHasilPemeriksaan'])->name('pemeriksaan.sign');


    Route::get('pembayaran/kwitansi', [PembayaranController::class, 'kwitansi'])->name('pembayaran.kwitansi');
    Route::get('pembayaran/lingkungan', [PembayaranController::class, 'lingkungan'])->name('pembayaran.lingkungan');
    Route::get('pembayaran/cetak-kwitansi/{pembayaran}', [PembayaranController::class, 'printKwitansi'])->name('pembayaran.kwitansi.cetak');
    Route::resource('/pembayaran', PembayaranController::class);
    // BUG FIX #1: Removed duplicate route 'pendaftaran-laboratorium/{pasien}' that was re-declared
    // here after already being defined above. Duplicate named routes cause the first definition
    // to be silently overwritten in the named-route registry.
    Route::get('pendaftaran-laboratorium/{pasien}/{pemeriksaan}', [PasienController::class, 'editPendaftaranLaboratorium'])->name('edit-pendaftaran-laboratorium');
    // BUG FIX #3: Added missing PUT route for updatePendaftaranLaboratorium. The controller method
    // existed but had no corresponding route, making the edit form unable to submit changes.
    Route::put('pendaftaran-laboratorium/{pasien}/{pemeriksaan}', [PasienController::class, 'updatePendaftaranLaboratorium'])->name('update-pendaftaran-laboratorium');

    Route::prefix('lab-lingkungan')->group(function () {
        Route::get('list-register', [PemeriksaanLingkunganController::class, 'daftarregister'])->name('lab.lingkungan.list-register');
        Route::get('pendaftaran', [PemeriksaanLingkunganController::class, 'pendaftaran'])->name('lab.lingkungan.pendaftaran');
        Route::get('edit-pendaftaran/{pemeriksaanLingkungan}', [PemeriksaanLingkunganController::class, 'editPendaftaran'])->name('lab.lingkungan.edit-pendaftaran');
        Route::put('update-pendaftaran/{pemeriksaanLingkungan}', [PemeriksaanLingkunganController::class, 'updatePendaftaran'])->name('lab.lingkungan.update-pendaftaran');
        Route::delete('delete-pendaftaran/{pemeriksaanLingkungan}', [PemeriksaanLingkunganController::class, 'deletePendaftran'])->name('lab.lingkungan.delete-pendaftaran');
        Route::post('simpan-pendaftaran', [PemeriksaanLingkunganController::class, 'store'])->name('lab.lingkungan.pendaftaran.store');
    });

    Route::prefix('master-data')->group(function () {
        Route::resource('/customers', CustomerController::class);
        Route::resource('/dokter', DokterController::class);
        Route::resource('/users', UserController::class);
        Route::resource('/jenis-layanan', JenisLayananController::class);
        Route::resource('/jenis-pasien', JenisPasienController::class);
        Route::get('/jenis-layanan/{jenisLayanan}/tarif', [JenisLayananController::class, 'tarif'])->name('jenis-layanan.tarif');
        Route::post('/jenis-layanan/{jenisLayanan}/tarif', [JenisLayananController::class, 'storeTarif'])->name('jenis-layanan.tarif.store');
        Route::put('/jenis-layanan/{jenisLayanan}/tarif/{tarif}', [JenisLayananController::class, 'updateTarif'])->name('jenis-layanan.tarif.update');
        Route::resource('/item-pemeriksaan', ItemPemeriksaanController::class);
        Route::get('/item-pemeriksaan-lingkungan', [ItemPemeriksaanController::class, 'lingkungan'])->name('item-pemeriksaan.lingkungan');
        Route::post('/item-pemeriksaan/{itemPemeriksaan}/reference-range', [ItemPemeriksaanController::class, 'storeReferenceRange'])->name('item-pemeriksaan.reference-range.store');
        Route::resource('/paket-pemeriksaan', PaketPemeriksaanController::class);
        Route::put('/paket-pemeriksaan/{paketPemeriksaan}/sync-items', [PaketPemeriksaanController::class, 'syncItems'])->name('paket-pemeriksaan.sync-items');
        Route::put('/jenis-layanan/{jenisLayanan}/sync-items', [JenisLayananController::class, 'syncItemPemeriksaan'])->name('jenis-layanan.sync-items');
    });

    Route::prefix('laporan')->group(function () {
        Route::get('/pendaftaran-pasien/excel', [laporanController::class, 'exportPendaftaranPasienExcel'])->name('laporan.pendaftaran-pasien.export.excel');
        Route::get('/pendaftaran-pasien/pdf', [laporanController::class, 'exportPendaftaranPasienPdf'])->name('laporan.pendaftaran-pasien.export.pdf');
        Route::get('/pendaftaran-pasien', [laporanController::class, 'pendaftaranPasien'])->name('laporan.pendaftaran-pasien');
        Route::get('/pemeriksaan-pasien/excel', [laporanController::class, 'exportPemeriksaanPasienExcel'])->name('laporan.pemeriksaan-pasien.export.excel');
        Route::get('/pemeriksaan-pasien/pdf', [laporanController::class, 'exportPemeriksaanPasienPdf'])->name('laporan.pemeriksaan-pasien.export.pdf');
        Route::get('/pemeriksaan-pasien', [laporanController::class, 'pemeriksaanPasien'])->name('laporan.pemeriksaan-pasien');
    });

    Route::get('/fetch-jenis-layanan-with-tarif-by-jenis-pasien', [JenisLayananController::class, 'jenisLayananWithTarifByJenisPasien'])->name('jenis-layanan.jenis-pasien');
    Route::get('/fetch-item-paket-pemeriksaan/{paketPemeriksaan}', [PaketPemeriksaanController::class, 'items'])->name('paket-pemeriksaan.items');

    Route::get('/konfigurasi', [\App\Http\Controllers\KonfigurasiController::class, 'index'])->name('konfigurasi.index');
    Route::post('/konfigurasi', [\App\Http\Controllers\KonfigurasiController::class, 'updateAll'])->name('konfigurasi.updateAll');
});

require __DIR__ . '/auth.php';
