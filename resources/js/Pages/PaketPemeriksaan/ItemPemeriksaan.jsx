import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Label } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';

export default function ItemPemeriksaan({ paketPemeriksaan, allItems }) {
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [processing, setProcessing] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize selected items from paketPemeriksaan
    useEffect(() => {
        if (paketPemeriksaan.jenis_layanan) {
            const items = paketPemeriksaan.jenis_layanan.map((item) => ({
                id: item.id,
                nama: item.nama,
                kategori: item.kategori_layanan?.nama || '-',
                harga: item.harga_umum || 0,
            }));
            setSelectedItems(items);
        }
    }, [paketPemeriksaan]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter items: match search query & exclude already selected
    const filteredItems = allItems.filter((item) => {
        const alreadySelected = selectedItems.some((s) => s.id === item.id);
        const matchesSearch = item.nama
            .toLowerCase()
            .includes(search.toLowerCase());
        return !alreadySelected && matchesSearch;
    });

    const handleSelectItem = (item) => {
        setSelectedItems((prev) => [
            ...prev,
            {
                id: item.id,
                nama: item.nama,
                kategori: item.kategori_layanan?.nama || '-',
                harga: item.harga_umum,
            },
        ]);
        setSearch('');
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const handleRemoveItem = (id) => {
        setSelectedItems((prev) => prev.filter((item) => item.id !== id));
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);
    };

    const handleSubmit = () => {
        setProcessing(true);
        router.put(
            route('paket-pemeriksaan.sync-items', paketPemeriksaan.id),
            {
                items: selectedItems.map((item) => ({
                    id: item.id,
                    harga: item.harga || 0,
                })),
            },
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <LabkesdaLayout>
            <Head title={`Item Pemeriksaan - ${paketPemeriksaan.nama}`} />
            <div className="mx-auto max-w-screen-xl px-4 py-6">
                {/* Header */}
                <div className="mb-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Item Pemeriksaan
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Paket:{' '}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {paketPemeriksaan.nama}
                                </span>
                                {' — '}
                                <span className="capitalize text-gray-600 dark:text-gray-400">
                                    {paketPemeriksaan.jenis_lab}
                                </span>
                            </p>
                        </div>
                        <Link
                            href={route('paket-pemeriksaan.index')}
                            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                        >
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Autocomplete Search */}
                <div className="mb-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                    <Label htmlFor="searchItem" className="mb-2 block">
                        Cari & Tambah Item Pemeriksaan
                    </Label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            id="searchItem"
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                            placeholder="Ketik nama item pemeriksaan..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            autoComplete="off"
                        />
                        {/* Dropdown Results */}
                        {showDropdown && search.length > 0 && (
                            <div
                                ref={dropdownRef}
                                className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700"
                            >
                                {filteredItems.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        Tidak ada item ditemukan.
                                    </div>
                                ) : (
                                    filteredItems.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() =>
                                                handleSelectItem(item)
                                            }
                                            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {item.nama}
                                                </span>
                                                {item.kategori_pemeriksaan && (
                                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                        (
                                                        {
                                                            item
                                                                .kategori_pemeriksaan
                                                                .nama
                                                        }
                                                        )
                                                    </span>
                                                )}
                                            </div>
                                            <svg
                                                className="h-4 w-4 flex-shrink-0 text-green-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Items Table */}
                <div className="mb-6 rounded-lg bg-white shadow-md dark:bg-gray-800">
                    <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Daftar Item Terpilih
                            <span className="ml-2 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                                {selectedItems.length}
                            </span>
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-4 py-3">
                                        No
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Nama Item
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Kategori
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Harga (Rp)
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-center"
                                    >
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
                                        >
                                            <div className="flex flex-col items-center">
                                                <svg
                                                    className="mb-2 h-10 w-10 text-gray-300 dark:text-gray-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                    />
                                                </svg>
                                                <span>
                                                    Belum ada item dipilih.
                                                    Gunakan pencarian di atas
                                                    untuk menambahkan.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    selectedItems.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-600"
                                        >
                                            <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                                {index + 1}
                                            </td>
                                            <td className="text-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                                                {item.nama}
                                            </td>
                                            <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                                {item.kategori}
                                            </td>
                                            <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                                {formatRupiah(item.harga)}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveItem(
                                                            item.id,
                                                        )
                                                    }
                                                    className="inline-flex items-center rounded-lg p-1.5 text-sm text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                    title="Hapus item"
                                                >
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Total & Submit */}
                    {selectedItems.length > 0 && (
                        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Total Harga:{' '}
                                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                                        {formatRupiah(
                                            selectedItems.reduce(
                                                (sum, item) =>
                                                    sum +
                                                    (parseFloat(item.harga) ||
                                                        0),
                                                0,
                                            ),
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <Link
                        href={route('paket-pemeriksaan.index')}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                    >
                        Batal
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className={
                            processing ? 'cursor-not-allowed opacity-50' : ''
                        }
                    >
                        {processing ? (
                            <>
                                <svg
                                    className="mr-2 h-4 w-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Item Pemeriksaan'
                        )}
                    </Button>
                </div>
            </div>
        </LabkesdaLayout>
    );
}
