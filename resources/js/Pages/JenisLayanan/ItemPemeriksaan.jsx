import axios from 'axios';
import { useMemo, useState } from 'react';

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().substr(0, 10);
};

export default function ItemPemeriksaan({
    barang = [],
    outlets = [],
    tanggal = new Date(),
    onClose = () => {},
    onRefresh = () => {},
}) {
    const [query, setQuery] = useState('');
    const [rows, setRows] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOutlet, setSelectedOutlet] = useState('');
    const [selectedDate, setSelectedDate] = useState(formatDate(tanggal));
    const [selectedType, setSelectedType] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const filteredItems = useMemo(() => {
        if (!query.trim()) {
            return barang;
        }
        const lower = query.toLowerCase();
        return barang.filter(
            (item) =>
                (item.name ?? '').toLowerCase().includes(lower) ||
                (item.code ?? '').toLowerCase().includes(lower),
        );
    }, [barang, query]);

    const handleSelectItem = (item) => {
        setRows((prev) => {
            if (prev.some((row) => row.id === item.id)) {
                return prev;
            }
            return [
                ...prev,
                {
                    ...item,
                    quantity: item.quantity ?? 0,
                },
            ];
        });
        setQuery('');
        setIsOpen(false);
    };

    const handleQuantityChange = (id, value) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, quantity: value } : row,
            ),
        );
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrors({});
        try {
            const response = await axios.post(
                route('sirkulasi-material.store'),
                {
                    outlet_id: selectedOutlet,
                    tanggal: selectedDate,
                    type: selectedType,
                    items: rows.map((row) => ({
                        product_id: row.id,
                        quantity: row.quantity ?? 0,
                    })),
                },
            );
            // Handle response if needed
            onClose();
            onRefresh();
        } catch (error) {
            // ambil data error dari response jika ada
            if (error.response && error.response.data) {
                setErrors(error.response.data.errors || {});
            }
            console.error('Error submitting circulation material:', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="relative mx-auto w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                        Menyimpan data...
                    </div>
                </div>
            )}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Add New Transaction
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-700"
                >
                    ✕
                </button>
            </div>

            <div className="mt-5 flex gap-3">
                <select
                    value={selectedOutlet}
                    onChange={(event) => setSelectedOutlet(event.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm"
                >
                    <option value="">Pilih Outlet</option>
                    {outlets.map((outlet) => (
                        <option
                            key={outlet.id ?? outlet.name}
                            value={outlet.id ?? outlet.name}
                        >
                            {outlet.name ?? ''}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm"
                />
            </div>

            <div className="mt-5 flex gap-3">
                <select
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm"
                >
                    <option value="">Pilih Kategori</option>
                    <option value="in">Stock In</option>
                    <option value="out">Stock Out</option>
                </select>
            </div>

            <div className="mt-6">
                <label className="text-sm font-medium text-slate-600">
                    Cari item barang
                </label>
                <div className="relative mt-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => {
                            setTimeout(() => setIsOpen(false), 150);
                        }}
                        placeholder="Ketik nama barang atau material ID"
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm"
                    />
                    {isOpen && (
                        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                            {filteredItems.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-slate-500">
                                    Barang tidak ditemukan
                                </div>
                            ) : (
                                filteredItems.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onMouseDown={() =>
                                            handleSelectItem(item)
                                        }
                                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-700">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {item.code ?? item.material_id}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                                            {item.unit?.name ?? item.unit}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* tampilkan error */}
            {errors && (
                <div className="mt-2 text-sm text-red-600">
                    {Object.values(errors).map((error, index) => (
                        <div key={index}>{error}</div>
                    ))}
                </div>
            )}
            <div className="mt-6 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                    <div className="col-span-5">Material Name</div>
                    <div className="col-span-2">Material ID</div>
                    <div className="col-span-3">Qty</div>
                    <div className="col-span-1 text-left">Satuan</div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                    {rows.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">
                            Pilih barang untuk menambahkan ke tabel
                        </div>
                    ) : (
                        rows.map((row) => (
                            <div
                                key={row.id}
                                className="grid grid-cols-12 items-center gap-2 border-b border-slate-100 px-4 py-4 text-sm text-slate-600"
                            >
                                <div className="col-span-5 font-medium text-slate-700">
                                    {row.name}
                                </div>
                                <div className="col-span-2 text-slate-500">
                                    {row.code}
                                </div>
                                <div className="col-span-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={row.quantity ?? 0}
                                            onChange={(event) =>
                                                handleQuantityChange(
                                                    row.id,
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-1 text-left font-medium text-slate-500">
                                    {row.purchase_unit?.name ?? '-'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                className="mt-6 w-full rounded-lg bg-red-600 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
            >
                Submit
            </button>
        </div>
    );
}
