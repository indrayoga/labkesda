# Desain Input Paket Pemeriksaan Klinis

## Ringkasan masalah

Pada halaman `Pasien/PendaftaranLaboratorium`, pilihan layanan saat ini mencampur dua jenis item:

- `jenis_layanan`, yaitu item pemeriksaan teknis yang valid untuk `detail_pemeriksaan.jenis_layanan_id`.
- `paket_pemeriksaan`, yaitu paket komersial/registrasi yang berisi banyak `jenis_layanan`.

Error `The selected layanan.0.id is invalid` muncul karena checkbox paket mengirim `paket_pemeriksaan.id` ke payload `layanan.*.id`, sedangkan `PemeriksaanController@store` memvalidasi field tersebut dengan `exists:jenis_layanan,id`.

Kebutuhan bisnis yang baru:

- Saat cetak kwitansi, cukup tampil nama paket, bukan semua isi paket.
- Saat proses pemeriksaan/hasil, sistem harus tetap mengetahui breakdown item pemeriksaan sesuai isi paket.
- Sistem tetap harus mendukung pilihan layanan satuan di luar paket.

## Prinsip desain

Pisahkan data tagihan/registrasi dari data teknis pemeriksaan.

`detail_pemeriksaan` sebaiknya tetap menjadi daftar teknis `jenis_layanan` yang akan dipakai untuk:

- menentukan item pemeriksaan,
- input hasil,
- cetak hasil,
- relasi ke `item_pemeriksaan_layanan`.

Untuk kebutuhan kwitansi, tambahkan layer baru sebagai daftar item registrasi/tagihan. Layer ini menyimpan apa yang dipilih petugas di UI: paket atau layanan satuan.

Dengan desain ini, satu paket dapat tampil satu baris di kwitansi, tetapi tetap dipecah menjadi banyak `detail_pemeriksaan` untuk proses laboratorium.

## Desain data yang direkomendasikan

Tambahkan tabel baru, misalnya `pemeriksaan_layanan_order`.

Kolom:

```text
id uuid primary
pemeriksaan_id uuid required
tipe enum('paket', 'layanan') required
paket_pemeriksaan_id uuid nullable
jenis_layanan_id uuid nullable
nama_snapshot string required
harga unsignedInteger required default 0
urutan unsignedInteger nullable
created_at timestamp
updated_at timestamp
```

Aturan:

- Jika `tipe = paket`, maka `paket_pemeriksaan_id` wajib ada dan `jenis_layanan_id` kosong.
- Jika `tipe = layanan`, maka `jenis_layanan_id` wajib ada dan `paket_pemeriksaan_id` kosong.
- `nama_snapshot` menyimpan nama saat transaksi dibuat, supaya kwitansi lama tidak berubah jika master paket/layanan diganti.
- `harga` menyimpan harga saat transaksi dibuat.

Relasi model:

```php
// App\Models\Pemeriksaan
public function layananOrder()
{
    return $this->hasMany(PemeriksaanLayananOrder::class, 'pemeriksaan_id');
}

// App\Models\PemeriksaanLayananOrder
public function pemeriksaan()
{
    return $this->belongsTo(Pemeriksaan::class, 'pemeriksaan_id');
}

public function paketPemeriksaan()
{
    return $this->belongsTo(PaketPemeriksaan::class, 'paket_pemeriksaan_id');
}

public function jenisLayanan()
{
    return $this->belongsTo(JenisLayanan::class, 'jenis_layanan_id');
}
```

## Shape payload frontend

Ganti payload `layanan` yang sekarang hanya berisi `{ id, harga }` menjadi payload eksplisit:

```json
{
  "items": [
    {
      "tipe": "paket",
      "id": "uuid-paket",
      "harga": 150000
    },
    {
      "tipe": "layanan",
      "id": "uuid-jenis-layanan",
      "harga": 25000
    }
  ]
}
```

Catatan:

- Nama field boleh tetap `layanan`, tetapi lebih jelas jika diganti menjadi `items` atau `layanan_order`.
- Frontend tidak perlu melakukan breakdown paket untuk disimpan ke `detail_pemeriksaan`; backend lebih aman untuk melakukan breakdown berdasarkan data master paket.
- Frontend boleh menampilkan preview isi paket, tetapi data final tetap dikirim sebagai ID paket.

## Validasi backend

Contoh validasi:

```php
$validated = $request->validate([
    'id_spesimen' => 'required|string',
    'pasien_id' => 'required|exists:pasien,id',
    'dokter_id' => 'required|exists:dokter,id',
    'email' => 'nullable|email',
    'jenis_pasien' => 'required|string',
    'tanggal_pendaftaran' => 'required|date',
    'jam_pendaftaran' => 'required',
    'diagnosa' => 'required|string',
    'items' => 'required|array|min:1',
    'items.*.tipe' => 'required|in:paket,layanan',
    'items.*.id' => 'required|string',
    'items.*.harga' => 'nullable|numeric|min:0',
]);
```

Setelah validasi dasar, lakukan validasi lanjutan per item:

- Untuk `tipe = paket`, cek `PaketPemeriksaan::where('jenis_lab', 'klinis')->whereKey($id)->exists()`.
- Untuk `tipe = layanan`, cek `JenisLayanan` yang kategorinya `jenis_lab = klinis`.
- Jika paket tidak punya isi `jenisLayanan`, tolak request dengan pesan yang jelas.

## Alur simpan

Saat `PemeriksaanController@store`:

1. Buat record `pemeriksaan`.
2. Loop setiap item dari payload.
3. Jika item adalah paket:
   - Ambil paket beserta `jenisLayanan`.
   - Simpan satu baris ke `pemeriksaan_layanan_order` dengan `tipe = paket`, `nama_snapshot = paket.nama`, dan `harga = harga paket saat transaksi`.
   - Loop semua `jenisLayanan` di dalam paket dan simpan ke `detail_pemeriksaan`.
4. Jika item adalah layanan satuan:
   - Ambil `JenisLayanan`.
   - Simpan satu baris ke `pemeriksaan_layanan_order` dengan `tipe = layanan`, `nama_snapshot = jenisLayanan.nama`, dan harga transaksi.
   - Simpan satu baris ke `detail_pemeriksaan`.
5. Hindari duplikasi `detail_pemeriksaan` jika layanan yang sama masuk dari dua paket atau dari paket plus layanan satuan.

Strategi duplikasi yang direkomendasikan:

- `detail_pemeriksaan` dibuat unik per `pemeriksaan_id + jenis_layanan_id`.
- Jika ada layanan duplikat, simpan sekali saja untuk kebutuhan teknis.
- Untuk kwitansi, tetap tampilkan semua baris order sesuai pilihan petugas. Namun UI sebaiknya memberi peringatan jika paket/layanan yang dipilih saling overlap.

## Harga dan total

Saat ini `Pemeriksaan::total` menjumlahkan `detailPemeriksaan->sum('harga')`. Jika paket tampil satu baris di kwitansi, total sebaiknya bersumber dari `pemeriksaan_layanan_order`.

Perubahan yang direkomendasikan:

```php
protected $with = ['detailPemeriksaan', 'layananOrder'];

protected function total(): Attribute
{
    return Attribute::make(
        get: fn() => $this->layananOrder->sum('harga'),
    );
}
```

Catatan:

- Harga di `detail_pemeriksaan` untuk hasil teknis boleh tetap diisi dengan harga layanan, tetapi jangan lagi dijadikan sumber total kwitansi.
- Jika paket punya harga khusus yang tidak sama dengan total layanan penyusunnya, desain ini tetap aman.
- Jika paket saat ini belum punya kolom harga sendiri dan `harga` berasal dari sum tarif umum, perlu diputuskan apakah harga paket mengikuti tarif jenis pasien atau harga paket tetap.

## Cetak kwitansi

`KwitansiPdf::table()` saat ini membaca:

```php
$this->pembayaran->pemeriksaan->detailPemeriksaan
```

Ubah menjadi:

```php
$this->pembayaran->pemeriksaan->layananOrder
```

Kolom `JENIS PELAYANAN` memakai `nama_snapshot`, bukan relasi master:

```php
foreach ($this->pembayaran->pemeriksaan->layananOrder as $index => $item) {
    $this->Cell(10, 7, $index + 1, 1, 0, 'C');
    $this->Cell(80, 7, $item->nama_snapshot, 1);
    $this->Cell(30, 7, number_format($item->harga, 2, ',', '.'), 1, 0, 'R');
    $this->Cell(20, 7, '1', 1, 0, 'C');
    $this->Cell(40, 7, number_format($item->harga, 2, ',', '.'), 1, 1, 'R');
}
```

Dengan begitu:

- Paket tampil sebagai satu baris nama paket.
- Layanan satuan tetap tampil sebagai nama layanan.
- Total kwitansi konsisten dengan baris yang terlihat.

## Proses pemeriksaan dan hasil

Tetap gunakan `detail_pemeriksaan`.

Bagian ini sudah cocok dengan desain breakdown:

```php
$itemPemeriksaan = ItemPemeriksaan::whereHas('jenisLayanan', function ($query) use ($pemeriksaan) {
    $query->whereIn('jenis_layanan.id', $pemeriksaan->detailPemeriksaan->pluck('jenis_layanan_id'));
})->with(['referenceRanges', 'parent'])->get();
```

Karena paket sudah di-breakdown menjadi `detail_pemeriksaan`, proses hasil tidak perlu tahu apakah asal layanan berasal dari paket atau layanan satuan.

Jika di masa depan perlu audit asal layanan, tambahkan kolom nullable ke `detail_pemeriksaan`:

```text
pemeriksaan_layanan_order_id uuid nullable
```

Kolom ini menghubungkan detail teknis ke baris order asalnya. Ini berguna untuk tracing, tetapi tidak wajib untuk kebutuhan awal.

## Desain UI

Rekomendasi UI di `PendaftaranLaboratorium.jsx`:

- State utama: `selectedItems`, bukan `selectedLayanans`.
- Bentuk item state:

```js
{
  tipe: 'paket',
  id: paket.id,
  nama: paket.nama,
  harga: paket.harga,
  children: paket.jenis_layanan || []
}
```

atau:

```js
{
  tipe: 'layanan',
  id: layanan.id,
  nama: layanan.nama,
  harga: layanan.harga
}
```

Interaksi:

- Checkbox paket memilih/menghapus paket sebagai satu item.
- Checkbox layanan satuan memilih/menghapus layanan sebagai satu item.
- Tampilkan ringkasan pilihan berisi nama item yang akan muncul di kwitansi.
- Untuk paket, tampilkan jumlah isi paket dan optional detail expand/collapse.
- Jika user memilih layanan yang sudah termasuk paket, tampilkan warning overlap.

Payload submit:

```js
setData('items', selectedItems.map((item) => ({
  tipe: item.tipe,
  id: item.id,
  harga: item.harga,
})));
```

## Rekomendasi implementasi bertahap

Tahap 1: Perbaiki bug validasi cepat.

- Bedakan handler paket dan handler layanan.
- Untuk sementara, ketika paket dipilih, frontend bisa mengirim semua `paket.jenis_layanan` ke `layanan`.
- Kekurangan tahap ini: kwitansi masih tampil breakdown layanan, belum nama paket.

Tahap 2: Tambahkan persistence order klinis.

- Buat tabel `pemeriksaan_layanan_order`.
- Tambah model dan relasi.
- Update `PemeriksaanController@store`.
- Update `Pemeriksaan::total`.
- Update `KwitansiPdf::table()`.

Tahap 3: Rapikan UI dan edit flow.

- Ubah form menggunakan `selectedItems`.
- Pada edit pendaftaran, load `layananOrder` untuk membangun ulang pilihan paket/layanan.
- Tetap generate ulang `detail_pemeriksaan` dari order saat update.

Tahap 4: Tambah proteksi kualitas data.

- Tambah unique index pada `detail_pemeriksaan` untuk `pemeriksaan_id + jenis_layanan_id`.
- Tambah warning overlap di frontend.
- Tambah feature test:
  - submit paket valid,
  - submit layanan satuan valid,
  - paket muncul satu baris di kwitansi,
  - detail pemeriksaan berisi semua layanan penyusun paket,
  - paket kosong ditolak.

## Catatan migrasi data lama

Data pemeriksaan lama hanya punya `detail_pemeriksaan`, tidak punya baris order.

Pilihan migrasi:

- Biarkan data lama memakai fallback kwitansi lama jika `layananOrder` kosong.
- Atau buat backfill order satuan dari setiap `detail_pemeriksaan`.

Fallback yang aman untuk `KwitansiPdf`:

- Jika `layananOrder` ada, pakai `layananOrder`.
- Jika kosong, pakai `detailPemeriksaan` seperti sekarang.

Dengan fallback ini, kwitansi lama tetap bisa dicetak tanpa migrasi besar.

## Kesimpulan

Solusi yang paling sesuai adalah menyimpan dua representasi:

- `pemeriksaan_layanan_order` untuk apa yang dipilih dan dibayar pasien.
- `detail_pemeriksaan` untuk apa yang harus dikerjakan laboratorium.

Pendekatan ini memenuhi kebutuhan kwitansi yang menampilkan nama paket, sekaligus menjaga proses pemeriksaan tetap berjalan berdasarkan breakdown `jenis_layanan`.
