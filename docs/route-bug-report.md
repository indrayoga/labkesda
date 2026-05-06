# Route Bug Report — `routes/web.php`

**Project:** Labkesda  
**Date:** 2026-05-04  
**Branch:** `fix-bug`  
**File audited:** `routes/web.php`

---

## Summary

A full audit of every route registered in `routes/web.php` was performed against the actual controller methods. Three bugs were found and fixed.

| #   | Severity  | Type                                          | Location                                |
| --- | --------- | --------------------------------------------- | --------------------------------------- |
| 1   | 🔴 High   | Duplicate named route (silent overwrite)      | `pendaftaran-laboratorium/{pasien}`     |
| 2   | 🔴 High   | Duplicate named route (silent overwrite)      | `pemeriksaan/{pemeriksaan}/preview-ttd` |
| 3   | 🟠 Medium | Missing route (controller method unreachable) | `updatePendaftaranLaboratorium`         |
| 4   | 🟡 Low    | Consistent typo in method name                | `deletePendaftran` (no fix needed)      |

---

## Bug #1 — Duplicate Route: `pendaftaran-laboratorium/{pasien}`

### Description

The route `GET pendaftaran-laboratorium/{pasien}` was registered **twice** with the same name `pendaftaran-laboratorium`. In Laravel, when two named routes share the same name, the **last registration silently overwrites the first** in the named-route registry. Any call to `route('pendaftaran-laboratorium')` resolves to the last-registered definition.

### Location in original file

```php
// FIRST definition (correct position — above pemeriksaan routes)
Route::get('pendaftaran-laboratorium/{pasien}', [
  PasienController::class,
  'pendaftaranLaboratorium',
])->name('pendaftaran-laboratorium');

// ... many other routes ...

// SECOND definition (erroneous — after Route::resource('/pembayaran', ...))
Route::get('pendaftaran-laboratorium/{pasien}', [
  PasienController::class,
  'pendaftaranLaboratorium',
])->name('pendaftaran-laboratorium'); // ← duplicate, silently overwrites the first
```

### Fix Applied

Removed the second (duplicate) registration. The first definition already covers the route correctly.

```php
// routes/web.php — after Route::resource('/pembayaran', ...)

// BUG FIX #1: Removed duplicate route 'pendaftaran-laboratorium/{pasien}' that was re-declared
// here after already being defined above. Duplicate named routes cause the first definition
// to be silently overwritten in the named-route registry.
Route::get('pendaftaran-laboratorium/{pasien}/{pemeriksaan}', [
  PasienController::class,
  'editPendaftaranLaboratorium',
])->name('edit-pendaftaran-laboratorium');
```

---

## Bug #2 — Duplicate Named Route: `pemeriksaan.preview-ttd`

### Description

Both the `POST` and `GET` methods for `pemeriksaan/{pemeriksaan}/preview-ttd` were given the **identical route name** `pemeriksaan.preview-ttd`. In Laravel, route names must be unique. The last-registered route wins, so:

- `route('pemeriksaan.preview-ttd')` → always resolved to the **GET** handler (`previewTtd`)
- The **POST** handler (`previewHasilPemeriksaanWithQr`) became **unreachable by name**, making any frontend call to `route('pemeriksaan.preview-ttd')` generate a GET URL even when a POST was intended.

### Location in original file

```php
// Both lines had the same name — BUG
Route::post('pemeriksaan/{pemeriksaan}/preview-ttd', [
  PemeriksaanController::class,
  'previewHasilPemeriksaanWithQr',
])->name('pemeriksaan.preview-ttd'); // ← overwritten by the GET below

Route::get('pemeriksaan/{pemeriksaan}/preview-ttd', [
  PemeriksaanController::class,
  'previewTtd',
])->name('pemeriksaan.preview-ttd'); // ← wins; POST name is lost
```

### Fix Applied

Renamed the POST route to `pemeriksaan.preview-ttd.generate` to distinguish it from the GET view route.

```php
// routes/web.php

// BUG FIX #2: Renamed POST route from 'pemeriksaan.preview-ttd' to 'pemeriksaan.preview-ttd.generate'.
// Both POST and GET were sharing the same route name 'pemeriksaan.preview-ttd'. In Laravel,
// the last registration wins, so the POST name was silently overwritten by the GET definition,
// making route('pemeriksaan.preview-ttd') always resolve to the GET endpoint.
Route::post('pemeriksaan/{pemeriksaan}/preview-ttd', [
  PemeriksaanController::class,
  'previewHasilPemeriksaanWithQr',
])->name('pemeriksaan.preview-ttd.generate');

Route::get('pemeriksaan/{pemeriksaan}/preview-ttd', [
  PemeriksaanController::class,
  'previewTtd',
])->name('pemeriksaan.preview-ttd');
```

> **Action required:** Any frontend call that used `route('pemeriksaan.preview-ttd')` for a POST request must be updated to `route('pemeriksaan.preview-ttd.generate')`.

---

## Bug #3 — Missing Route: `updatePendaftaranLaboratorium`

### Description

The `PasienController` defines the method `updatePendaftaranLaboratorium(Request $request, Pasien $pasien, Pemeriksaan $pemeriksaan)` which handles updates submitted from the edit-pendaftaran-laboratorium form. However, **no route was registered** to dispatch requests to this method.

As a result, submitting the edit form would result in a `404 Not Found` or incorrect routing behavior.

### Evidence — controller method exists

```php
// app/Http/Controllers/PasienController.php — line 137
public function updatePendaftaranLaboratorium(Request $request, Pasien $pasien, Pemeriksaan $pemeriksaan)
{
    $request->validate([
        'id_spesimen'            => 'required|string',
        'pasien_id'              => 'required|exists:pasien,id',
        'dokter_id'              => 'required|exists:dokter,id',
        'email'                  => 'nullable|email',
        'jenis_pasien'           => 'required|string',
        'tanggal_pendaftaran'    => 'required|date',
        'jam_pendaftaran'        => 'required',
        'diagnosa'               => 'required|string',
        'layanan_ids'            => 'required|array',
        'layanan_ids.*'          => 'exists:jenis_layanan,id',
    ]);
    // ... DB transaction to update pemeriksaan ...
}
```

### Fix Applied

Added a `PUT` route that mirrors the existing `GET` edit route, completing the edit/update pair.

```php
// routes/web.php

Route::get('pendaftaran-laboratorium/{pasien}/{pemeriksaan}', [
  PasienController::class,
  'editPendaftaranLaboratorium',
])->name('edit-pendaftaran-laboratorium');

// BUG FIX #3: Added missing PUT route for updatePendaftaranLaboratorium. The controller method
// existed but had no corresponding route, making the edit form unable to submit changes.
Route::put('pendaftaran-laboratorium/{pasien}/{pemeriksaan}', [
  PasienController::class,
  'updatePendaftaranLaboratorium',
])->name('update-pendaftaran-laboratorium');
```

---

## Note #4 — Consistent Typo: `deletePendaftran`

### Description

The method name `deletePendaftran` (missing the `a` in "Pendaftaran") appears in both the route and the controller identically. Because the typo is **consistent** between the route registration and the controller definition, the feature works correctly at runtime.

```php
// routes/web.php
Route::delete('delete-pendaftaran/{pemeriksaanLingkungan}', [PemeriksaanLingkunganController::class, 'deletePendaftran'])
//                                                                                                    ^^^^^^^^^^^^^ typo

// app/Http/Controllers/PemeriksaanLingkunganController.php — line 198
public function deletePendaftran(PemeriksaanLingkungan $pemeriksaanLingkungan) { ... }
//              ^^^^^^^^^^^^^ same typo
```

**No functional bug.** Recommend renaming the controller method to `deletePendaftaran` in a separate refactoring task.

---

## Complete Route Inventory

### Public Routes (no auth)

| Method | URI | Name | Controller#Method        |
| ------ | --- | ---- | ------------------------ |
| GET    | `/` | —    | Closure → `Welcome` view |

### Auth Routes (`require __DIR__.'/auth.php'`)

Login, register, password-reset routes handled by Laravel Breeze / Fortify.

### Authenticated Routes (`middleware('auth')`)

#### Dashboard — `BerandaController`

| Method | URI                                    | Name                                | Controller#Method                                |
| ------ | -------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| GET    | `/dashboard`                           | `dashboard`                         | `BerandaController@index`                        |
| GET    | `/dashboard/pasien-terbaru`            | `beranda.pasien-terbaru`            | `BerandaController@pasienTerbaru`                |
| GET    | `/dashboard/pemeriksaan-terbanyak`     | `beranda.pemeriksaan-terbanyak`     | `BerandaController@pemeriksaanTerbanyakBulanIni` |
| GET    | `/dashboard/kunjungan-pasien-mingguan` | `beranda.kunjungan-pasien-mingguan` | `BerandaController@kunjunganPasien7hariTerakhir` |
| GET    | `/dashboard/statistik-bulan-ini`       | `beranda.statistik-bulan-ini`       | `BerandaController@statistikBulanIni`            |

#### Profile — `ProfileController`

| Method | URI        | Name              | Controller#Method           |
| ------ | ---------- | ----------------- | --------------------------- |
| GET    | `/profile` | `profile.edit`    | `ProfileController@edit`    |
| PATCH  | `/profile` | `profile.update`  | `ProfileController@update`  |
| DELETE | `/profile` | `profile.destroy` | `ProfileController@destroy` |

#### Pasien — `PasienController`

| Method    | URI                                                | Name                                     | Controller#Method                                |
| --------- | -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| GET       | `/pasien`                                          | `pasien.index`                           | `PasienController@index`                         |
| GET       | `/pasien/create`                                   | `pasien.create`                          | `PasienController@create`                        |
| POST      | `/pasien`                                          | `pasien.store`                           | `PasienController@store`                         |
| GET       | `/pasien/{pasien}`                                 | `pasien.show`                            | `PasienController@show`                          |
| GET       | `/pasien/{pasien}/edit`                            | `pasien.edit`                            | `PasienController@edit`                          |
| PUT/PATCH | `/pasien/{pasien}`                                 | `pasien.update`                          | `PasienController@update`                        |
| DELETE    | `/pasien/{pasien}`                                 | `pasien.destroy`                         | `PasienController@destroy`                       |
| GET       | `/pendaftaran`                                     | `pendaftaran`                            | `PasienController@pendaftaran`                   |
| GET       | `/pendaftaran-laboratorium/{pasien}`               | `pendaftaran-laboratorium`               | `PasienController@pendaftaranLaboratorium`       |
| GET       | `/pendaftaran-laboratorium/{pasien}/{pemeriksaan}` | `edit-pendaftaran-laboratorium`          | `PasienController@editPendaftaranLaboratorium`   |
| PUT       | `/pendaftaran-laboratorium/{pasien}/{pemeriksaan}` | `update-pendaftaran-laboratorium` ✅ new | `PasienController@updatePendaftaranLaboratorium` |

#### Pemeriksaan — `PemeriksaanController`

| Method    | URI                                                       | Name                                          | Controller#Method                                       |
| --------- | --------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| GET       | `/pemeriksaan`                                            | `pemeriksaan.index`                           | `PemeriksaanController@index`                           |
| GET       | `/pemeriksaan/create`                                     | `pemeriksaan.create`                          | `PemeriksaanController@create`                          |
| POST      | `/pemeriksaan`                                            | `pemeriksaan.store`                           | `PemeriksaanController@store`                           |
| GET       | `/pemeriksaan/{pemeriksaan}`                              | `pemeriksaan.show`                            | `PemeriksaanController@show`                            |
| GET       | `/pemeriksaan/{pemeriksaan}/edit`                         | `pemeriksaan.edit`                            | `PemeriksaanController@edit`                            |
| PUT/PATCH | `/pemeriksaan/{pemeriksaan}`                              | `pemeriksaan.update`                          | `PemeriksaanController@update`                          |
| DELETE    | `/pemeriksaan/{pemeriksaan}`                              | `pemeriksaan.destroy`                         | `PemeriksaanController@destroy`                         |
| POST      | `/pemeriksaan/{pemeriksaan}/update-hasil-pemeriksaan`     | `pemeriksaan.update-hasil-pemeriksaan`        | `PemeriksaanController@updateHasilPemeriksaan`          |
| GET       | `/pemeriksaan/form-consent/{pemeriksaan}`                 | `pemeriksaan.form-consent`                    | `PemeriksaanController@printInformedConsent`            |
| GET       | `/pemeriksaan/form-pengambilan-sample/{pemeriksaan}`      | `pemeriksaan.formulir-pengambilan-sample`     | `PemeriksaanController@printFormulirPengambilanSample`  |
| GET       | `/pemeriksaan/permintaan-pemeriksaan-napza/{pemeriksaan}` | `pemeriksaan.permintaan-pemeriksaan-napza`    | `PemeriksaanController@printPermintaanPemeriksaanNapza` |
| GET       | `/pemeriksaan/{pemeriksaan}/hasil-pemeriksaan`            | `print.hasil-pemeriksaan`                     | `PemeriksaanController@printHasilPemeriksaan`           |
| POST      | `/pemeriksaan/{pemeriksaan}/preview-ttd`                  | `pemeriksaan.preview-ttd.generate` ✅ renamed | `PemeriksaanController@previewHasilPemeriksaanWithQr`   |
| GET       | `/pemeriksaan/{pemeriksaan}/preview-ttd`                  | `pemeriksaan.preview-ttd`                     | `PemeriksaanController@previewTtd`                      |
| POST      | `/pemeriksaan/{pemeriksaan}/sign`                         | `pemeriksaan.sign`                            | `PemeriksaanController@signHasilPemeriksaan`            |

#### Pembayaran — `PembayaranController`

| Method    | URI                                       | Name                        | Controller#Method                    |
| --------- | ----------------------------------------- | --------------------------- | ------------------------------------ |
| GET       | `/pembayaran/kwitansi`                    | `pembayaran.kwitansi`       | `PembayaranController@kwitansi`      |
| GET       | `/pembayaran/lingkungan`                  | `pembayaran.lingkungan`     | `PembayaranController@lingkungan`    |
| GET       | `/pembayaran/cetak-kwitansi/{pembayaran}` | `pembayaran.kwitansi.cetak` | `PembayaranController@printKwitansi` |
| GET       | `/pembayaran`                             | `pembayaran.index`          | `PembayaranController@index`         |
| POST      | `/pembayaran`                             | `pembayaran.store`          | `PembayaranController@store`         |
| GET       | `/pembayaran/{pembayaran}`                | `pembayaran.show`           | `PembayaranController@show`          |
| PUT/PATCH | `/pembayaran/{pembayaran}`                | `pembayaran.update`         | `PembayaranController@update`        |
| DELETE    | `/pembayaran/{pembayaran}`                | `pembayaran.destroy`        | `PembayaranController@destroy`       |

#### Lab Lingkungan — `PemeriksaanLingkunganController` (prefix: `/lab-lingkungan`)

| Method | URI                                                          | Name                                | Controller#Method                                          |
| ------ | ------------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------- |
| GET    | `/lab-lingkungan/list-register`                              | `lab.lingkungan.list-register`      | `PemeriksaanLingkunganController@daftarregister`           |
| GET    | `/lab-lingkungan/pendaftaran`                                | `lab.lingkungan.pendaftaran`        | `PemeriksaanLingkunganController@pendaftaran`              |
| GET    | `/lab-lingkungan/edit-pendaftaran/{pemeriksaanLingkungan}`   | `lab.lingkungan.edit-pendaftaran`   | `PemeriksaanLingkunganController@editPendaftaran`          |
| PUT    | `/lab-lingkungan/update-pendaftaran/{pemeriksaanLingkungan}` | `lab.lingkungan.update-pendaftaran` | `PemeriksaanLingkunganController@updatePendaftaran`        |
| DELETE | `/lab-lingkungan/delete-pendaftaran/{pemeriksaanLingkungan}` | `lab.lingkungan.delete-pendaftaran` | `PemeriksaanLingkunganController@deletePendaftran` ⚠️ typo |
| POST   | `/lab-lingkungan/simpan-pendaftaran`                         | `lab.lingkungan.pendaftaran.store`  | `PemeriksaanLingkunganController@store`                    |

#### Master Data (prefix: `/master-data`)

| Method   | URI                                                               | Name                                     | Controller#Method                               |
| -------- | ----------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| resource | `/master-data/customers`                                          | `customers.*`                            | `CustomerController`                            |
| resource | `/master-data/dokter`                                             | `dokter.*`                               | `DokterController`                              |
| resource | `/master-data/users`                                              | `users.*`                                | `UserController`                                |
| resource | `/master-data/jenis-layanan`                                      | `jenis-layanan.*`                        | `JenisLayananController`                        |
| resource | `/master-data/jenis-pasien`                                       | `jenis-pasien.*`                         | `JenisPasienController`                         |
| GET      | `/master-data/jenis-layanan/{jenisLayanan}/tarif`                 | `jenis-layanan.tarif`                    | `JenisLayananController@tarif`                  |
| POST     | `/master-data/jenis-layanan/{jenisLayanan}/tarif`                 | `jenis-layanan.tarif.store`              | `JenisLayananController@storeTarif`             |
| PUT      | `/master-data/jenis-layanan/{jenisLayanan}/tarif/{tarif}`         | `jenis-layanan.tarif.update`             | `JenisLayananController@updateTarif`            |
| resource | `/master-data/item-pemeriksaan`                                   | `item-pemeriksaan.*`                     | `ItemPemeriksaanController`                     |
| GET      | `/master-data/item-pemeriksaan-lingkungan`                        | `item-pemeriksaan.lingkungan`            | `ItemPemeriksaanController@lingkungan`          |
| POST     | `/master-data/item-pemeriksaan/{itemPemeriksaan}/reference-range` | `item-pemeriksaan.reference-range.store` | `ItemPemeriksaanController@storeReferenceRange` |
| resource | `/master-data/paket-pemeriksaan`                                  | `paket-pemeriksaan.*`                    | `PaketPemeriksaanController`                    |
| PUT      | `/master-data/paket-pemeriksaan/{paketPemeriksaan}/sync-items`    | `paket-pemeriksaan.sync-items`           | `PaketPemeriksaanController@syncItems`          |
| PUT      | `/master-data/jenis-layanan/{jenisLayanan}/sync-items`            | `jenis-layanan.sync-items`               | `JenisLayananController@syncItemPemeriksaan`    |

#### API / Fetch Endpoints

| Method | URI                                                | Name                         | Controller#Method                                           |
| ------ | -------------------------------------------------- | ---------------------------- | ----------------------------------------------------------- |
| GET    | `/fetch-jenis-layanan-with-tarif-by-jenis-pasien`  | `jenis-layanan.jenis-pasien` | `JenisLayananController@jenisLayananWithTarifByJenisPasien` |
| GET    | `/fetch-item-paket-pemeriksaan/{paketPemeriksaan}` | `paket-pemeriksaan.items`    | `PaketPemeriksaanController@items`                          |

---

## Files Changed

| File             | Change                                                                      |
| ---------------- | --------------------------------------------------------------------------- |
| `routes/web.php` | Removed duplicate `pendaftaran-laboratorium/{pasien}` route                 |
| `routes/web.php` | Renamed POST `preview-ttd` route name to `pemeriksaan.preview-ttd.generate` |
| `routes/web.php` | Added missing `PUT pendaftaran-laboratorium/{pasien}/{pemeriksaan}` route   |
