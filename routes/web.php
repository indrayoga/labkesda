<?php

use App\Http\Controllers\BerandaController;
use App\Http\Controllers\PemeriksaanLingkunganController;
use App\Http\Controllers\PasienController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PemeriksaanController;
use App\Http\Controllers\ProfileController;
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
    Route::get('pemeriksaan/form-consent/{pemeriksaan}', [PemeriksaanController::class, 'printInformedConsent'])->name('pemeriksaan.form-consent');
    Route::get('pembayaran/kwitansi', [PembayaranController::class, 'kwitansi'])->name('pembayaran.kwitansi');
    Route::get('pembayaran/lingkungan', [PembayaranController::class, 'lingkungan'])->name('pembayaran.lingkungan');
    Route::get('pembayaran/cetak-kwitansi/{pembayaran}', [PembayaranController::class, 'printKwitansi'])->name('pembayaran.kwitansi.cetak');
    Route::resource('/pembayaran', PembayaranController::class);
    Route::get('pendaftaran-laboratorium/{pasien}', [PasienController::class, 'pendaftaranLaboratorium'])->name('pendaftaran-laboratorium');
    Route::get('pendaftaran-laboratorium/{pasien}/{pemeriksaan}', [PasienController::class, 'editPendaftaranLaboratorium'])->name('edit-pendaftaran-laboratorium');

    Route::prefix('lab-lingkungan')->group(function () {
        Route::get('list-register', [PemeriksaanLingkunganController::class, 'daftarregister'])->name('lab.lingkungan.list-register');
        Route::get('pendaftaran', [PemeriksaanLingkunganController::class, 'pendaftaran'])->name('lab.lingkungan.pendaftaran');
        Route::get('edit-pendaftaran/{pemeriksaanLingkungan}', [PemeriksaanLingkunganController::class, 'editPendaftaran'])->name('lab.lingkungan.edit-pendaftaran');
        Route::put('update-pendaftaran/{pemeriksaanLingkungan}', [PemeriksaanLingkunganController::class, 'updatePendaftaran'])->name('lab.lingkungan.update-pendaftaran');
        Route::delete('delete-pendaftaran/{pemeriksaanLingkungan}', [PemeriksaanLingkunganController::class, 'deletePendaftran'])->name('lab.lingkungan.delete-pendaftaran');
        Route::post('simpan-pendaftaran', [PemeriksaanLingkunganController::class, 'store'])->name('lab.lingkungan.pendaftaran.store');
    });
});

require __DIR__ . '/auth.php';
