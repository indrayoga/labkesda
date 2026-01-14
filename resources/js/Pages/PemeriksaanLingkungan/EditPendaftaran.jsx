import InputError from '@/Components/InputError';
import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Combobox } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import clsx from 'clsx';
import { Button } from 'flowbite-react';
import { useMemo, useState } from 'react';
import FormPendaftaranPemeriksaanLingkungan from './FormPendaftaranPemeriksaanLingkungan';
import FormTablePemeriksaanLingkungan from './FormTablePemeriksaanLingkungan';

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
          className={clsx(
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
                    clsx(
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

export default function EditPendaftaran({
  customers = [],
  jenisLayanan,
  pemeriksaanLingkungan,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, setData, put, processing, errors } = useForm({
    tanggal_pendaftaran: pemeriksaanLingkungan.tanggal_pendaftaran || today,
    customer_id: pemeriksaanLingkungan.customer_id || '',
    tanggal_diambil: pemeriksaanLingkungan.tanggal_diambil || '',
    tanggal_diterima: pemeriksaanLingkungan.tanggal_diterima || '',
    jumlah_contoh_uji: pemeriksaanLingkungan.jumlah_contoh_uji || '',
    pengambil_contoh_uji: pemeriksaanLingkungan.pengambil_contoh_uji || '',
    wadah_contoh_uji: pemeriksaanLingkungan.wadah_contoh_uji || 'steril',
    jenis_bayar: pemeriksaanLingkungan.jenis_bayar || 'cash',
    detail_pemeriksaan_lingkungan:
      pemeriksaanLingkungan.detail_pemeriksaan_lingkungan || [
        createEmptyDetailRow(),
      ],
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
    put(route('lab.lingkungan.update-pendaftaran', pemeriksaanLingkungan.id), {
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

          <form className="p-5">
            <FormPendaftaranPemeriksaanLingkungan
              data={data}
              setData={setData}
              errors={errors}
              selectedCustomer={selectedCustomer}
              setCustomerQuery={setCustomerQuery}
              filteredCustomers={filteredCustomers}
            />

            {/* Tabel dinamis: Detail Contoh Uji */}
            <FormTablePemeriksaanLingkungan
              data={data}
              setData={setData}
              errors={errors}
              detailRows={detailRows}
              jenisLayanan={jenisLayanan}
              addDetailRow={addDetailRow}
              updateDetailRow={updateDetailRow}
              removeDetailRow={removeDetailRow}
            />

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
