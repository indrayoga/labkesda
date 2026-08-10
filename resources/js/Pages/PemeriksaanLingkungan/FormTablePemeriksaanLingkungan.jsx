import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Combobox } from '@headlessui/react';
import axios from 'axios';
import clsx from 'clsx';
import { Button } from 'flowbite-react';
import { useMemo, useState } from 'react';

function PaketPemeriksaanCombobox({
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
        if (valuePrice)
            return items.find((i) => i.harga === valuePrice) || null;
        return null;
    }, [items, valueId, valueName, valuePrice]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((i) => {
            const kategori =
                i?.kategori_layanan?.nama || i?.kategoriLayanan?.nama;
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
                onChange(
                    {
                        paket_pemeriksaan_id: item?.id || '',
                        jenis_layanan_id: item?.id || '',
                        jenis_contoh_uji: item?.nama || '',
                        harga: item?.harga || '',
                    },
                    item,
                )
            }
        >
            <div className="relative">
                <Combobox.Input
                    className={clsx(
                        'block w-full rounded-md border-gray-300 pr-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
                        error && 'border-red-500',
                    )}
                    displayValue={displayValue}
                    placeholder="Contoh Uji"
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
                                item?.kategori_layanan?.nama ||
                                item?.kategoriLayanan?.nama;
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
                                        <div className="truncate font-medium">
                                            {item.nama}
                                        </div>
                                        <div className="truncate font-medium">
                                            {item.harga}
                                        </div>
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
    paketPemeriksaan,
    addDetailRow,
    updateDetailRow,
    removeDetailRow,
    detailFieldName = 'paket_pemeriksaan_lingkungan',
}) {
    const [loadingParameterByRow, setLoadingParameterByRow] = useState({});

    const parseParameterTags = (value) => {
        if (!value) return [];

        return value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    };

    const serializeParameterTags = (tags) => tags.join(', ');

    const fetchPaketParameterNames = async (paketPemeriksaanId) => {
        if (!paketPemeriksaanId) return [];

        const response = await axios.get(
            route('paket-pemeriksaan.items', paketPemeriksaanId),
        );

        return (response.data || [])
            .map((item) => item?.nama)
            .filter(
                (name) => typeof name === 'string' && name.trim().length > 0,
            );
    };

    const handlePaketPemeriksaanChange = async (index, patch, selectedItem) => {
        updateDetailRow(index, patch);

        if (!selectedItem?.id) {
            updateDetailRow(index, { parameter: '' });
            return;
        }

        setLoadingParameterByRow((prev) => ({ ...prev, [index]: true }));

        try {
            const names = await fetchPaketParameterNames(selectedItem.id);
            updateDetailRow(index, {
                parameter: serializeParameterTags(names),
            });
        } catch (error) {
            updateDetailRow(index, { parameter: '' });
            alert('Gagal mengambil item paket pemeriksaan.');
        } finally {
            setLoadingParameterByRow((prev) => ({ ...prev, [index]: false }));
        }
    };

    const removeParameterTag = (index, tagIndex) => {
        const tags = parseParameterTags(detailRows[index]?.parameter);
        const nextTags = tags.filter((_, i) => i !== tagIndex);

        updateDetailRow(index, {
            parameter: serializeParameterTags(nextTags),
        });
    };

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
                            <th className="px-3 py-2">Jenis Contoh Uji</th>
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
                                    <PaketPemeriksaanCombobox
                                        items={paketPemeriksaan || []}
                                        valueId={
                                            row.paket_pemeriksaan_id ||
                                            row.jenis_layanan_id
                                        }
                                        valueName={row.jenis_contoh_uji}
                                        valuePrice={row.harga}
                                        onChange={(patch, item) =>
                                            handlePaketPemeriksaanChange(
                                                index,
                                                patch,
                                                item,
                                            )
                                        }
                                        error={
                                            errors[
                                                detailFieldName +
                                                    '.' +
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
                                                detailFieldName +
                                                    '.' +
                                                    index +
                                                    '.no_lab_contoh_uji'
                                            ] && 'border-red-500',
                                        )}
                                        value={row.no_lab_contoh_uji}
                                        onChange={(e) =>
                                            updateDetailRow(index, {
                                                no_lab_contoh_uji:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="Contoh: LAB-001"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={
                                            errors[
                                                detailFieldName +
                                                    '.' +
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
                                                detailFieldName +
                                                    '.' +
                                                    index +
                                                    '.jam_pengambilan_contoh_uji'
                                            ] && 'border-red-500',
                                        )}
                                        value={(
                                            row.jam_pengambilan_contoh_uji || ''
                                        ).slice(0, 5)}
                                        onChange={(e) =>
                                            updateDetailRow(index, {
                                                jam_pengambilan_contoh_uji:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={
                                            errors[
                                                detailFieldName +
                                                    '.' +
                                                    index +
                                                    '.jam_pengambilan_contoh_uji'
                                            ]
                                        }
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    {loadingParameterByRow[index] ? (
                                        <div className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400">
                                            Mengambil item paket...
                                        </div>
                                    ) : parseParameterTags(row.parameter)
                                          .length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {parseParameterTags(
                                                row.parameter,
                                            ).map((tag, tagIndex) => (
                                                <span
                                                    key={`${tag}-${tagIndex}`}
                                                    className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        className="rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                                                        onClick={() =>
                                                            removeParameterTag(
                                                                index,
                                                                tagIndex,
                                                            )
                                                        }
                                                        aria-label={`Hapus parameter ${tag}`}
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400">
                                            Pilih paket untuk mengisi parameter.
                                        </div>
                                    )}
                                    <InputError
                                        className="mt-2"
                                        message={
                                            errors[
                                                detailFieldName +
                                                    '.' +
                                                    index +
                                                    '.parameter'
                                            ]
                                        }
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <TextInput
                                        type="text"
                                        className={clsx(
                                            errors[
                                                detailFieldName +
                                                    '.' +
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
                                                detailFieldName +
                                                    '.' +
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
                                            onClick={() =>
                                                removeDetailRow(index)
                                            }
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
                                {(data[detailFieldName] || [])
                                    .reduce(
                                        (sum, row) =>
                                            sum + (Number(row.harga) || 0),
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
            {typeof errors[detailFieldName + '.0.jenis_layanan_id'] ===
                'string' && <p className="mt-2 text-sm text-red-600">dfdf</p>}
        </div>
    );
}
