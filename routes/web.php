<?php

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

Route::get('/dashboard', function () {
    return Inertia::render('Beranda');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('/pasien', PasienController::class);
    Route::get('pendaftaran-laboratorium', [PasienController::class, 'pendaftaran'])->name('pendaftaran-laboratorium');

    Route::resource('/pemeriksaan', PemeriksaanController::class);
    Route::get('pemeriksaan/form-consent/{pemeriksaan}', [PemeriksaanController::class, 'printInformedConsent'])->name('pemeriksaan.form-consent');
    Route::get('pembayaran/kwitansi', [PembayaranController::class, 'kwitansi'])->name('pembayaran.kwitansi');
    Route::get('pembayaran/cetak-kwitansi/{pembayaran}', [PembayaranController::class, 'printKwitansi'])->name('pembayaran.kwitansi.cetak');
    Route::resource('/pembayaran', PembayaranController::class);
    Route::get('pendaftaran-laboratorium/{pasien}', [PasienController::class, 'pendaftaranLaboratorium'])->name('pendaftaran-laboratorium');
    Route::get('pendaftaran-laboratorium/{pasien}/{pemeriksaan}', [PasienController::class, 'editPendaftaranLaboratorium'])->name('edit-pendaftaran-laboratorium');
});

require __DIR__ . '/auth.php';
