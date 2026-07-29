import InputError from '@/Components/InputError';
import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Select, Textarea, TextInput } from 'flowbite-react';

const formatReferenceRanges = (ranges = []) => {
  if (!ranges.length) {
    return '-';
  }

  return ranges
    .map((range) => {
      const genderLabel = range.jenis_kelamin ? `${range.jenis_kelamin}: ` : '';
      if (range.value_type === 'kualitatif') {
        return `${genderLabel}${range.kualitatif_value ?? '-'}`;
      }

      const minValue =
        range.min_value !== null && range.min_value !== undefined
          ? `${range.operator_min ?? ''}${range.min_value}`
          : '';
      const maxValue =
        range.max_value !== null && range.max_value !== undefined
          ? `${range.operator_max ?? ''}${range.max_value}`
          : '';
      const separator = minValue && maxValue ? ' - ' : '';

      return `${genderLabel}${minValue}${separator}${maxValue}`.trim();
    })
    .join(' | ');
};

const PemeriksaanRows = ({
  items = [],
  depth = 0,
  hasil = [],
  errors = [],
  onChangeHasil = () => {},
  onChangeStatus = () => {},
}) => {
  return items.map((item) => {
    const isGroup = Array.isArray(item.children) && item.children.length > 0;
    const showRow =
      !isGroup || item.satuan || item.metode || item.reference_ranges?.length;

    return (
      <div key={item.id}>
        {isGroup && (
          <div className="grid grid-cols-12 items-center bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
            <div className="col-span-12 flex items-center gap-2">
              <span className="text-slate-400" aria-hidden="true">
                ▸
              </span>
              <span>{item.name}</span>
            </div>
          </div>
        )}

        {showRow == true && (
          <div className="grid grid-cols-12 items-center px-4 py-3 text-sm text-slate-700">
            <div className="col-span-3 font-medium text-slate-900">
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: depth * 16 }}
              >
                {depth > 0 && (
                  <span className="text-slate-400" aria-hidden="true">
                    └
                  </span>
                )}
                <span>{item.name}</span>
              </div>
            </div>
            <div className="col-span-2">
              <TextInput
                type="text"
                value={
                  hasil.find((h) => h.item_pemeriksaan_id === item.id)?.hasil ??
                  ''
                }
                onChange={(e) => onChangeHasil(item.id, e.target.value)}
              />
              <InputError
                message={
                  errors &&
                  errors.find((err) => err.item_pemeriksaan_id === item.id)
                    ? errors.find((err) => err.item_pemeriksaan_id === item.id)
                        .hasil
                    : ''
                }
                className="mt-2"
              />
            </div>
            <div className="col-span-2 text-center text-slate-600">
              {item.satuan ?? '-'}
            </div>
            <div className="col-span-2 text-slate-600">
              {formatReferenceRanges(item.reference_ranges)}
            </div>
            <div className="col-span-2 text-slate-600">
              {item.metode ?? '-'}
            </div>
            <div className="col-span-1">
              <Select
                value={
                  hasil.find((h) => h.item_pemeriksaan_id === item.id)
                    ?.status ?? ''
                }
                onChange={(e) => onChangeStatus(item.id, e.target.value)}
              >
                <option value="">Pilih</option>
                <option value="normal">Normal</option>
                <option value="tidak_normal">Tidak Normal</option>
              </Select>
              <InputError
                message={
                  errors &&
                  errors.find((err) => err.item_pemeriksaan_id === item.id)
                    ? errors.find((err) => err.item_pemeriksaan_id === item.id)
                        .status
                    : ''
                }
                className="mt-2"
              />
            </div>
          </div>
        )}
        {isGroup && (
          <PemeriksaanRows
            items={item.children}
            depth={depth + 1}
            hasil={hasil}
            onChangeHasil={onChangeHasil}
            onChangeStatus={onChangeStatus}
          />
        )}
      </div>
    );
  });
};

export default function Show({ pemeriksaan, pemeriksaanItems, analisLab }) {
  const { data, setData, post, processing, errors, recentlySuccessful, reset } =
    useForm({
      nomor_sampel: pemeriksaan.nomor_sampel || '',
      tanggal_sampling:
        pemeriksaan.tanggal_sampling || new Date().toISOString().split('T')[0],
      jam_sampling:
        pemeriksaan.jam_sampling ||
        new Date().toISOString().split('T')[1].substring(0, 5),
      tanggal_sampel_diterima:
        pemeriksaan.tanggal_sampel_diterima ||
        new Date().toISOString().split('T')[0],
      jam_sampel_diterima:
        pemeriksaan.jam_sampel_diterima ||
        new Date().toISOString().split('T')[1].substring(0, 5),
      tanggal_hasil_selesai:
        pemeriksaan.tanggal_hasil_selesai ||
        new Date().toISOString().split('T')[0],
      jam_hasil_selesai:
        pemeriksaan.jam_hasil_selesai ||
        new Date().toISOString().split('T')[1].substring(0, 5),
      keterangan: pemeriksaan.keterangan || '',
      hasil_pemeriksaan:
        pemeriksaan.hasil_pemeriksaan?.map((h) => ({
          item_pemeriksaan_id: h.item_pemeriksaan_id,
          hasil: h.hasil,
          status: h.status,
        })) || [],
      petugas: pemeriksaan.petugas_pemeriksaan?.map((p) => p.user_id) || [],
      petugas_validasi:
        pemeriksaan.petugas_validasi?.map((p) => p.user_id) || [],
    });

  const handleChangeHasil = (itemId, value) => {
    const existing = data.hasil_pemeriksaan.find(
      (h) => h.item_pemeriksaan_id === itemId,
    );
    if (existing) {
      setData(
        'hasil_pemeriksaan',
        data.hasil_pemeriksaan.map((h) =>
          h.item_pemeriksaan_id === itemId ? { ...h, hasil: value } : h,
        ),
      );
    } else {
      setData('hasil_pemeriksaan', [
        ...data.hasil_pemeriksaan,
        { item_pemeriksaan_id: itemId, hasil: value },
      ]);
    }
    console.log(data);
  };

  const handleChangeStatus = (itemId, status) => {
    const existing = data.hasil_pemeriksaan.find(
      (h) => h.item_pemeriksaan_id === itemId,
    );
    if (existing) {
      setData(
        'hasil_pemeriksaan',
        data.hasil_pemeriksaan.map((h) =>
          h.item_pemeriksaan_id === itemId ? { ...h, status: status } : h,
        ),
      );
    } else {
      setData('hasil_pemeriksaan', [
        ...data.hasil_pemeriksaan,
        { item_pemeriksaan_id: itemId, status: status },
      ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('pemeriksaan.update-hasil-pemeriksaan', pemeriksaan.id), {
      onSuccess: () => {
        alert('Hasil pemeriksaan berhasil disimpan.');
      },
      onError: () => {
        alert('Terjadi kesalahan saat menyimpan hasil pemeriksaan.');
      },
    });
  };

  return (
    <LabkesdaLayout>
      <Head title="Input Hasil Laboratorium" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Input Hasil Laboratorium
              </h1>
              <p className="text-sm text-slate-500">
                Pastikan data pasien sudah sesuai sebelum menyimpan.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                No. Registrasi: {pemeriksaan.no_registrasi}
              </div>
              {/* link ttd hasil */}
              <Link href={route('pemeriksaan.preview-ttd', pemeriksaan.id)}>
                <Button
                  size="sm"
                  outline={true}
                  className="border-green-700 text-green-700 hover:border-green-700 hover:bg-green-700 hover:text-white focus:ring-green-700"
                >
                  Validasi Hasil
                </Button>
              </Link>

              <Link href={route('pemeriksaan.preview-ttd', pemeriksaan.id)}>
                <Button
                  size="sm"
                  outline={true}
                  className="border-blue-700 text-blue-700 hover:border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-blue-700"
                >
                  Tanda Tangan Hasil
                </Button>
              </Link>

              <a
                href={route('print.hasil-pemeriksaan', pemeriksaan.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" outline={true}>
                  Cetak Hasil Pemeriksaan
                </Button>
              </a>

              <a
                href={route('print.hasil-uji-sementara', pemeriksaan.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  outline={true}
                  className="border-amber-600 text-amber-700 hover:border-amber-600 hover:bg-amber-600 hover:text-white focus:ring-amber-600"
                >
                  Cetak Hasil Uji Sementara
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span aria-hidden="true">&#128100;</span>
              <span>Informasi Pasien</span>
            </div>
            <div className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">Nama Pasien</span>
                  <span className="font-semibold text-slate-900">
                    {pemeriksaan.pasien.nama}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">Tanggal Lahir</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(
                      pemeriksaan.pasien.tanggal_lahir,
                    ).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    ({pemeriksaan.pasien.umur})
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">NIK</span>
                  <span className="font-semibold text-slate-900">
                    {pemeriksaan.pasien.nik}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">Jenis Kelamin</span>
                  <span className="font-semibold text-slate-900">
                    {pemeriksaan.pasien.jenis_kelamin}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">No. Telepon</span>
                  <span className="font-semibold text-slate-900">
                    {pemeriksaan.pasien.no_telepon}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">Alamat</span>
                  <span className="font-semibold text-slate-900">
                    {pemeriksaan.pasien.alamat}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">No. Sampel</span>
                  <div>
                    <TextInput
                      value={data.nomor_sampel}
                      onChange={(e) => setData('nomor_sampel', e.target.value)}
                      placeholder="Masukkan nomor sampel"
                    />
                    <InputError
                      message={errors.nomor_sampel}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">Waktu Sampling</span>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex gap-2">
                        <TextInput
                          type="date"
                          value={data.tanggal_sampling}
                          onChange={(e) =>
                            setData('tanggal_sampling', e.target.value)
                          }
                        />
                        <TextInput
                          type="time"
                          value={data.jam_sampling}
                          onChange={(e) =>
                            setData('jam_sampling', e.target.value)
                          }
                        />
                      </div>
                      <InputError
                        message={errors.tanggal_sampling}
                        className="mt-2"
                      />
                      <InputError
                        message={errors.jam_sampling}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">Sampel Diterima</span>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex gap-2">
                        <TextInput
                          type="date"
                          value={data.tanggal_sampel_diterima}
                          onChange={(e) =>
                            setData('tanggal_sampel_diterima', e.target.value)
                          }
                        />
                        <TextInput
                          type="time"
                          value={data.jam_sampel_diterima}
                          onChange={(e) =>
                            setData('jam_sampel_diterima', e.target.value)
                          }
                        />
                      </div>
                      <InputError
                        message={errors.tanggal_sampel_diterima}
                        className="mt-2"
                      />
                      <InputError
                        message={errors.jam_sampel_diterima}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">Waktu Hasil Selesai</span>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex gap-2">
                        <TextInput
                          type="date"
                          value={data.tanggal_hasil_selesai}
                          onChange={(e) =>
                            setData('tanggal_hasil_selesai', e.target.value)
                          }
                        />
                        <TextInput
                          type="time"
                          value={data.jam_hasil_selesai}
                          onChange={(e) =>
                            setData('jam_hasil_selesai', e.target.value)
                          }
                        />
                      </div>
                      <InputError
                        message={errors.tanggal_hasil_selesai}
                        className="mt-2"
                      />
                      <InputError
                        message={errors.jam_hasil_selesai}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">Rujukan Dari</span>
                  <span className="font-semibold text-slate-900">
                    {pemeriksaan.dokter.nama}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                  <span className="text-slate-500">No. Telp Dokter</span>
                  <span className="font-semibold text-slate-900">
                    {pemeriksaan.dokter.no_telepon}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span aria-hidden="true">&#129658;</span>
              <span>Hasil Pemeriksaan</span>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-12 bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div className="col-span-3">Nama Tes</div>
                <div className="col-span-2">Hasil</div>
                <div className="col-span-2">Satuan</div>
                <div className="col-span-2">Nilai Rujukan</div>
                <div className="col-span-2">Metode</div>
                <div className="col-span-1">Status</div>
              </div>
              <div className="divide-y divide-slate-100">
                {pemeriksaanItems.length > 0 &&
                  pemeriksaanItems.map((item) => (
                    <PemeriksaanRows
                      items={item}
                      hasil={data.hasil_pemeriksaan}
                      errors={errors?.hasil_pemeriksaan}
                      onChangeHasil={handleChangeHasil}
                      onChangeStatus={handleChangeStatus}
                    />
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span aria-hidden="true">&#128221;</span>
              <span>Keterangan</span>
            </div>
            <Textarea
              rows={4}
              value={data.keterangan}
              onChange={(e) => setData('keterangan', e.target.value)}
              placeholder="Opsional - keterangan tambahan hasil lab"
            />
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span aria-hidden="true">&#128100;</span>
              <span>Petugas Pemeriksaan</span>
            </div>
            <div className="mt-4 space-y-2">
              {data.petugas.map((petugasId, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    className="flex-1"
                    value={petugasId}
                    onChange={(e) => {
                      const newPetugas = [...data.petugas];
                      newPetugas[index] = e.target.value;
                      setData('petugas', newPetugas);
                    }}
                  >
                    <option value="">Pilih Petugas</option>
                    {analisLab.map((analis) => (
                      <option key={analis.id} value={analis.id}>
                        {analis.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    onClick={() => {
                      const newPetugas = data.petugas.filter(
                        (_, i) => i !== index,
                      );
                      setData('petugas', newPetugas);
                    }}
                    className="border-red-500 text-red-500 hover:border-red-600 hover:bg-red-600 hover:text-white"
                    outline={true}
                  >
                    Hapus
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => setData('petugas', [...data.petugas, ''])}
                outline={true}
              >
                Tambah Petugas
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span aria-hidden="true">&#9989;</span>
              <span>Petugas Validasi</span>
            </div>
            <div className="mt-4 space-y-2">
              {data.petugas_validasi.map((petugasId, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    className="flex-1"
                    value={petugasId}
                    onChange={(e) => {
                      const newPetugasValidasi = [...data.petugas_validasi];
                      newPetugasValidasi[index] = e.target.value;
                      setData('petugas_validasi', newPetugasValidasi);
                    }}
                  >
                    <option value="">Pilih Petugas Validasi</option>
                    {analisLab.map((analis) => (
                      <option key={analis.id} value={analis.id}>
                        {analis.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    onClick={() => {
                      const newPetugasValidasi = data.petugas_validasi.filter(
                        (_, i) => i !== index,
                      );
                      setData('petugas_validasi', newPetugasValidasi);
                    }}
                    className="border-red-500 text-red-500 hover:border-red-600 hover:bg-red-600 hover:text-white"
                    outline={true}
                  >
                    Hapus
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() =>
                  setData('petugas_validasi', [...data.petugas_validasi, ''])
                }
                outline={true}
              >
                Tambah Petugas Validasi
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              outline={true}
              onClick={() => history.back()}
              disabled={processing}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={processing}>
              Simpan Hasil
            </Button>
          </div>
        </section>
      </div>
    </LabkesdaLayout>
  );
}
