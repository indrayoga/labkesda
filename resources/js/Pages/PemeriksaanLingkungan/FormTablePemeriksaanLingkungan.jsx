import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Combobox } from '@headlessui/react';
import clsx from 'clsx';
import { Button } from 'flowbite-react';
import { useMemo, useState } from 'react';

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

export default function FormTablePemeriksaanLingkungan({
  data,
  setData,
  errors,
  detailRows,
  jenisLayanan,
  addDetailRow,
  updateDetailRow,
  removeDetailRow,
}) {
  return (
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
                    className={clsx(
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
                    className={clsx(
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
                    className={clsx(
                      'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
                      errors[
                        'detail_pemeriksaan_lingkungan.' + index + '.parameter'
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
                        'detail_pemeriksaan_lingkungan.' + index + '.parameter'
                      ]
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <TextInput
                    type="text"
                    className={clsx(
                      errors[
                        'detail_pemeriksaan_lingkungan.' + index + '.uraian'
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
                        'detail_pemeriksaan_lingkungan.' + index + '.uraian'
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
                  .reduce((sum, row) => sum + (Number(row.harga) || 0), 0)
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
      {typeof errors['detail_pemeriksaan_lingkungan.0.jenis_layanan_id'] ===
        'string' && <p className="mt-2 text-sm text-red-600">dfdf</p>}
    </div>
  );
}
