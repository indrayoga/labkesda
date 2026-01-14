import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Combobox } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Button, Label, TextInput } from 'flowbite-react';
import { useMemo, useState } from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function createEmptyDetailRow() {
  return {
    jenis_layanan_id: '',
    jenis_contoh_uji: '',
    harga: '',
    no_lab_contoh_uji: '',
    jam_pengambilan_contoh_uji: '',
    parameter: '',
    uraian: '',
  };
}

function JenisLayananCombobox({
  items,
  valueId,
  valueName,
  valuePrice,
  onChange,
  error,
}) {
  const [query, setQuery] = useState('');

  const selected = useMemo(() => {
    if (valueId) return items.find((i) => i.id === valueId) || null;
    if (valueName) return items.find((i) => i.nama === valueName) || null;
    if (valuePrice) return items.find((i) => i.harga === valuePrice) || null;
    return null;
  }, [items, valueId, valuePrice]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      const kategori = i?.kategori_layanan?.nama || i?.kategoriLayanan?.nama;
      const haystack = `${i?.nama || ''} ${kategori || ''}`
        .trim()
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  const displayValue = (item) => {
    if (!item) return '';
    const kategori =
      item?.kategori_layanan?.nama || item?.kategoriLayanan?.nama;
    return kategori ? `${item.nama} — ${kategori}` : item.nama;
  };

  return (
    <Combobox
      value={selected}
      onChange={(item) =>
        onChange({
          jenis_layanan_id: item?.id || '',
          jenis_contoh_uji: item?.nama || '',
          harga: item?.harga || '',
        })
      }
    >
      <div className="relative">
        <Combobox.Input
          className={cx(
            'block w-full rounded-md border-gray-300 pr-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
            error && 'border-red-500',
          )}
          displayValue={displayValue}
          placeholder="Cari jenis layanan"
          onChange={(event) => setQuery(event.target.value)}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </Combobox.Button>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-900">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
              Jenis layanan tidak ditemukan.
            </div>
          ) : (
            filtered.map((item) => {
              const kategori =
                item?.kategori_layanan?.nama || item?.kategoriLayanan?.nama;
              return (
                <Combobox.Option
                  key={item.id}
                  value={item}
                  className={({ active }) =>
                    cx(
                      'cursor-pointer select-none px-3 py-2',
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-900 dark:text-gray-100',
                    )
                  }
                >
                  <div className="flex justify-between">
                    <div className="truncate font-medium">{item.nama}</div>
                    <div className="truncate font-medium">{item.harga}</div>
                  </div>
                  {kategori && (
                    <div className="truncate text-xs opacity-80">
                      {kategori}
                    </div>
                  )}
                </Combobox.Option>
              );
            })
          )}
        </Combobox.Options>
        <InputError className="mt-2" message={error} />
      </div>
    </Combobox>
  );
}

export default function Pendaftaran({ customers = [], jenisLayanan }) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, setData, post, processing, errors } = useForm({
    tanggal_pendaftaran: today,
    customer_id: '',
    tanggal_diambil: '',
    tanggal_diterima: '',
    jumlah_contoh_uji: '',
    pengambil_contoh_uji: '',
    wadah_contoh_uji: 'steril',
    jenis_bayar: 'cash',
    detail_pemeriksaan_lingkungan: [createEmptyDetailRow()],
  });

  const [customerQuery, setCustomerQuery] = useState('');
  const selectedCustomer = useMemo(() => {
    if (!data.customer_id) return null;
    return customers.find((c) => c.id === data.customer_id) || null;
  }, [customers, data.customer_id]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const haystack = `${c.nama || ''} ${c.no_telepon || ''} ${c.alamat || ''}`
        .trim()
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, customerQuery]);

  const submit = (e) => {
    e.preventDefault();
    post(route('lab.lingkungan.pendaftaran.store'), {
      onSuccess: () => {
        alert('Pendaftaran pemeriksaan lingkungan berhasil disimpan.');
      },
      onError: () => {
        alert('Terjadi kesalahan saat menyimpan pendaftaran.');
      },
    });
  };

  const detailRows = data.detail_pemeriksaan_lingkungan || [];
  const updateDetailRow = (index, patch) => {
    const next = detailRows.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    setData('detail_pemeriksaan_lingkungan', next);
  };

  const addDetailRow = () => {
    setData('detail_pemeriksaan_lingkungan', [
      ...detailRows,
      createEmptyDetailRow(),
    ]);
  };

  const removeDetailRow = (index) => {
    if (detailRows.length <= 1) {
      setData('detail_pemeriksaan_lingkungan', [createEmptyDetailRow()]);
      return;
    }
    setData(
      'detail_pemeriksaan_lingkungan',
      detailRows.filter((_, i) => i !== index),
    );
  };

  return (
    <LabkesdaLayout>
      <Head title="Pendaftaran Pemeriksaan Lingkungan" />

      <div className="max-w-8xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Pendaftaran Pemeriksaan Lingkungan
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Isi data pendaftaran dan informasi contoh uji.
            </p>
          </div>

          <form onSubmit={submit} className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label
                  htmlFor="tanggal_pendaftaran"
                  color={errors.tanggal_pendaftaran ? 'failure' : 'gray'}
                >
                  {' '}
                  Tanggal Pendaftaran
                </Label>
                <TextInput
                  type="date"
                  className={cx(
                    'mt-1 block w-full',
                    errors.tanggal_pendaftaran && 'border-red-500',
                  )}
                  value={data.tanggal_pendaftaran}
                  onChange={(e) =>
                    setData('tanggal_pendaftaran', e.target.value)
                  }
                />
                <InputError
                  className="mt-2"
                  message={errors.tanggal_pendaftaran}
                />
              </div>

              <div className="md:col-span-2">
                <Label
                  htmlFor="customer_id"
                  color={errors.customer_id ? 'failure' : 'gray'}
                >
                  Pengirim (Asal Contoh Uji)
                </Label>
                <Combobox
                  value={selectedCustomer}
                  onChange={(customer) =>
                    setData('customer_id', customer?.id || '')
                  }
                >
                  <div className="relative mt-1">
                    <Combobox.Input
                      className={cx(
                        'block w-full rounded-md border-gray-300 pr-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
                        errors.customer_id && 'border-red-500',
                      )}
                      displayValue={(customer) => customer?.nama || ''}
                      placeholder="Cari customer (nama / telepon / alamat)"
                      onChange={(event) => setCustomerQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg
                        className="h-5 w-5 text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Combobox.Button>

                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-900">
                      {filteredCustomers.length === 0 ? (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                          Customer tidak ditemukan.
                        </div>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <Combobox.Option
                            key={customer.id}
                            value={customer}
                            className={({ active }) =>
                              cx(
                                'cursor-pointer select-none px-3 py-2',
                                active
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-gray-900 dark:text-gray-100',
                              )
                            }
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {customer.nama}
                                </div>
                                <div className="truncate text-xs opacity-80">
                                  {customer.no_telepon || '-'}
                                  {customer.alamat
                                    ? ` • ${customer.alamat}`
                                    : ''}
                                </div>
                              </div>
                            </div>
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
                <InputError className="mt-2" message={errors.customer_id} />
              </div>

              <div>
                <Label
                  htmlFor="tanggal_diambil"
                  color={errors.tanggal_diambil ? 'failure' : 'gray'}
                >
                  Tanggal Diambil
                </Label>
                <TextInput
                  type="date"
                  className={cx(
                    'mt-1 block w-full',
                    errors.tanggal_diambil && 'border-red-500',
                  )}
                  value={data.tanggal_diambil}
                  onChange={(e) => setData('tanggal_diambil', e.target.value)}
                />
                <InputError className="mt-2" message={errors.tanggal_diambil} />
              </div>

              <div>
                <Label
                  htmlFor="tanggal_diterima"
                  color={errors.tanggal_diterima ? 'failure' : 'gray'}
                >
                  Tanggal Diterima
                </Label>
                <TextInput
                  type="date"
                  className={cx(
                    'mt-1 block w-full',
                    errors.tanggal_diterima && 'border-red-500',
                  )}
                  value={data.tanggal_diterima}
                  onChange={(e) => setData('tanggal_diterima', e.target.value)}
                />
                <InputError
                  className="mt-2"
                  message={errors.tanggal_diterima}
                />
              </div>

              <div>
                <Label
                  htmlFor="jumlah_contoh_uji"
                  color={errors.jumlah_contoh_uji ? 'failure' : 'gray'}
                >
                  Jumlah Contoh Uji
                </Label>
                <TextInput
                  type="text"
                  inputMode="numeric"
                  className={cx(
                    'mt-1 block w-full',
                    errors.jumlah_contoh_uji && 'border-red-500',
                  )}
                  value={data.jumlah_contoh_uji}
                  onChange={(e) => setData('jumlah_contoh_uji', e.target.value)}
                  placeholder="Contoh: 3"
                />
                <InputError
                  className="mt-2"
                  message={errors.jumlah_contoh_uji}
                />
              </div>

              <div>
                <Label
                  htmlFor="pengambil_contoh_uji"
                  color={errors.pengambil_contoh_uji ? 'failure' : 'gray'}
                >
                  Pengambil Contoh Uji
                </Label>
                <TextInput
                  type="text"
                  className={cx(
                    'mt-1 block w-full',
                    errors.pengambil_contoh_uji && 'border-red-500',
                  )}
                  value={data.pengambil_contoh_uji}
                  onChange={(e) =>
                    setData('pengambil_contoh_uji', e.target.value)
                  }
                  placeholder="Nama petugas"
                />
                <InputError
                  className="mt-2"
                  message={errors.pengambil_contoh_uji}
                />
              </div>

              <div>
                <Label
                  htmlFor="wadah_contoh_uji"
                  color={errors.wadah_contoh_uji ? 'failure' : 'gray'}
                >
                  Wadah Contoh Uji
                </Label>
                <select
                  className={cx(
                    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
                    errors.wadah_contoh_uji && 'border-red-500',
                  )}
                  value={data.wadah_contoh_uji}
                  onChange={(e) => setData('wadah_contoh_uji', e.target.value)}
                >
                  <option value="steril">Steril</option>
                  <option value="non-steril">Non-steril</option>
                </select>
                <InputError
                  className="mt-2"
                  message={errors.wadah_contoh_uji}
                />
              </div>

              <div>
                <Label
                  htmlFor="jenis_bayar"
                  color={errors.jenis_bayar ? 'failure' : 'gray'}
                >
                  Jenis Bayar
                </Label>
                <select
                  className={cx(
                    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
                    errors.jenis_bayar && 'border-red-500',
                  )}
                  value={data.jenis_bayar}
                  onChange={(e) => setData('jenis_bayar', e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="tagihan">Tagihan</option>
                </select>
                <InputError className="mt-2" message={errors.jenis_bayar} />
              </div>
            </div>

            {/* Tabel dinamis: Detail Contoh Uji */}
            <div className="mt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Detail Contoh Uji
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Tambahkan minimal 1 baris detail pemeriksaan.
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                    <tr>
                      <th className="px-3 py-2">Jenis layanan</th>
                      <th className="px-3 py-2">No lab</th>
                      <th className="px-3 py-2">Jam ambil</th>
                      <th className="px-3 py-2">Parameter</th>
                      <th className="px-3 py-2">Uraian</th>
                      <th className="px-3 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {detailRows.map((row, index) => (
                      <tr key={index} className="align-top">
                        <td className="px-3 py-2">
                          <JenisLayananCombobox
                            items={jenisLayanan || []}
                            valueId={row.jenis_layanan_id}
                            valueName={row.jenis_contoh_uji}
                            valuePrice={row.harga}
                            onChange={(patch) => updateDetailRow(index, patch)}
                            error={
                              errors[
                                'detail_pemeriksaan_lingkungan.' +
                                  index +
                                  '.jenis_layanan_id'
                              ]
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <TextInput
                            type="text"
                            className={cx(
                              errors[
                                'detail_pemeriksaan_lingkungan.' +
                                  index +
                                  '.no_lab_contoh_uji'
                              ] && 'border-red-500',
                            )}
                            value={row.no_lab_contoh_uji}
                            onChange={(e) =>
                              updateDetailRow(index, {
                                no_lab_contoh_uji: e.target.value,
                              })
                            }
                            placeholder="Contoh: LAB-001"
                          />
                          <InputError
                            className="mt-2"
                            message={
                              errors[
                                'detail_pemeriksaan_lingkungan.' +
                                  index +
                                  '.no_lab_contoh_uji'
                              ]
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <TextInput
                            type="time"
                            className={cx(
                              errors[
                                'detail_pemeriksaan_lingkungan.' +
                                  index +
                                  '.jam_pengambilan_contoh_uji'
                              ] && 'border-red-500',
                            )}
                            value={row.jam_pengambilan_contoh_uji}
                            onChange={(e) =>
                              updateDetailRow(index, {
                                jam_pengambilan_contoh_uji: e.target.value,
                              })
                            }
                          />
                          <InputError
                            className="mt-2"
                            message={
                              errors[
                                'detail_pemeriksaan_lingkungan.' +
                                  index +
                                  '.jam_pengambilan_contoh_uji'
                              ]
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <TextInput
                            type="text"
                            className={cx(
                              'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
                              errors[
                                'detail_pemeriksaan_lingkungan.' +
                                  index +
                                  '.parameter'
                              ] && 'border-red-500',
                            )}
                            value={row.parameter}
                            onChange={(e) =>
                              updateDetailRow(index, {
                                parameter: e.target.value,
                              })
                            }
                            placeholder="Contoh: pH"
                          />
                          <InputError
                            className="mt-2"
                            message={
                              errors[
                                'detail_pemeriksaan_lingkungan.' +
                                  index +
                                  '.parameter'
                              ]
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <TextInput
                            type="text"
                            className={cx(
                              errors[
                                'detail_pemeriksaan_lingkungan.' +
                                  index +
                                  '.uraian'
                              ] && 'border-red-500',
                            )}
                            value={row.uraian}
                            onChange={(e) =>
                              updateDetailRow(index, {
                                uraian: e.target.value,
                              })
                            }
                            placeholder="Uraian singkat"
                          />
                          <InputError
                            className="mt-2"
                            message={
                              errors[
                                'detail_pemeriksaan_lingkungan.' +
                                  index +
                                  '.uraian'
                              ]
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={() => removeDetailRow(index)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                      <th colSpan="5" className="px-3 py-2 text-right">
                        TOTAL
                      </th>
                      <th className="px-3 py-2 text-right">
                        {data.detail_pemeriksaan_lingkungan
                          .reduce(
                            (sum, row) => sum + (Number(row.harga) || 0),
                            0,
                          )
                          .toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          })}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-3 flex justify-end">
                <PrimaryButton type="button" onClick={addDetailRow}>
                  Tambah baris
                </PrimaryButton>
              </div>
              {/* tampilkan error detail pmeriksaan jika ada */}
              {typeof errors[
                'detail_pemeriksaan_lingkungan.0.jenis_layanan_id'
              ] === 'string' && (
                <p className="mt-2 text-sm text-red-600">dfdf</p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" onClick={submit} disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan Pendaftaran'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </LabkesdaLayout>
  );
}
