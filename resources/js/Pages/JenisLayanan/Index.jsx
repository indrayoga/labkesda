import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Button,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Select,
    TextInput,
} from 'flowbite-react';
import { useState } from 'react';
import CreateJenisLayananForm from './CreateJenisLayananForm';

function filterItemTree(items, query) {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    const filterNode = (node) => {
        const nameMatch = String(node.name || '')
            .toLowerCase()
            .includes(q);
        const children = Array.isArray(node.children) ? node.children : [];
        const filteredChildren = children
            .map(filterNode)
            .filter((child) => child !== null);

        if (nameMatch || filteredChildren.length > 0) {
            return {
                ...node,
                children: filteredChildren,
            };
        }

        return null;
    };

    return items.map(filterNode).filter((node) => node !== null);
}

function TreeItemRow({
    node,
    level = 0,
    isLast = false,
    onPick,
    expandAll,
    isPicking,
}) {
    const hasChildren =
        Array.isArray(node.children) && node.children.length > 0;
    const [expanded, setExpanded] = useState(true);
    const indent = level * 20;
    const isExpanded = expandAll ? true : expanded;

    return (
        <div className="relative">
            <div className="flex items-stretch divide-x divide-slate-200 border-b border-slate-200">
                <div
                    className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2"
                    style={{ paddingLeft: indent }}
                >
                    {hasChildren ? (
                        <button
                            type="button"
                            className="text-slate-600 hover:text-slate-900"
                            onClick={() => !expandAll && setExpanded((v) => !v)}
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? '▾' : '▸'}
                        </button>
                    ) : (
                        <span className="inline-block w-4" />
                    )}
                    <span className="truncate font-medium text-slate-800">
                        <span className="mr-1 text-slate-400">
                            {isLast ? '└─' : '├─'}
                        </span>
                        {node.name}
                    </span>
                </div>
                <div className="w-40 shrink-0 px-2 py-1">
                    <button
                        type="button"
                        onClick={() => onPick?.(node)}
                        disabled={isPicking}
                        className="rounded bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-600"
                    >
                        Pilih
                    </button>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div>
                    {node.children.map((child, idx) => (
                        <TreeItemRow
                            key={child.id ?? `${child.name}-${idx}`}
                            node={child}
                            level={level + 1}
                            isLast={idx === node.children.length - 1}
                            onPick={onPick}
                            expandAll={expandAll}
                            isPicking={isPicking}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Index({
    kategoriLayanan,
    jenisLayanan,
    itemPemeriksaanTree,
}) {
    const urlParams = new URLSearchParams(window.location.search);
    const [openModalTambah, setOpenModalTambah] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const [openModalTreeItemPemeriksaan, setOpenModalTreeItemPemeriksaan] =
        useState(false);
    const [cariNama, setCariNama] = useState(urlParams.get('nama') || '');
    const [cariKategori, setCariKategori] = useState(
        urlParams.get('kategori_layanan_id') || '',
    );
    const [selectedJenisLayanan, setSelectedJenisLayanan] = useState(null);
    const [cariItemPemeriksaan, setCariItemPemeriksaan] = useState('');
    const [isPickingItem, setIsPickingItem] = useState(false);
    const [pickItemError, setPickItemError] = useState('');

    const handleFilter = () => {
        router.visit(route('jenis-layanan.index'), {
            method: 'get',
            data: {
                nama: cariNama,
                kategori_layanan_id: cariKategori,
            },
            preserveState: true,
        });
    };

    const handleReset = () => {
        setCariNama('');
        setCariKategori('');
        router.visit(route('jenis-layanan.index'), {
            method: 'get',
            preserveState: true,
        });
    };

    const handleTambah = () => {
        setSelectedJenisLayanan(null);
        resetData();
        setOpenModalTambah(true);
    };

    const handleEdit = (p) => {
        setData({
            nama: p.nama,
            kategori_layanan_id: p.kategori_layanan_id,
        });
        setSelectedJenisLayanan(p);
        setOpenModalTambah(true);
    };

    const handleDelete = (p) => {
        setSelectedJenisLayanan(p);
        setOpenModalDelete(true);
    };

    const handleAddItemPemeriksaan = (p) => {
        setSelectedJenisLayanan(p);
        setOpenModalTreeItemPemeriksaan(true);
        setPickItemError('');
    };

    const resetData = () => {
        setData({
            nama: '',
            kategori_layanan_id: '',
        });
        setSelectedJenisLayanan(null);
    };

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm({
        nama: '',
        kategori_layanan_id: '',
        harga: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (selectedJenisLayanan) {
            put(route('jenis-layanan.update', selectedJenisLayanan.id), {
                onSuccess: () => {
                    setOpenModalTambah(false);
                    setSelectedJenisLayanan(null);
                    resetData();
                },
            });
        } else {
            post(route('jenis-layanan.store'), {
                onSuccess: () => {
                    setOpenModalTambah(false);
                    resetData();
                },
            });
        }
    };

    const hapusJenisLayanan = (jenisLayanan) => {
        router.delete(route('jenis-layanan.destroy', jenisLayanan.id), {
            onSuccess: () => {
                setOpenModalDelete(false);
            },
        });
    };

    const itemsTree = Array.isArray(itemPemeriksaanTree)
        ? itemPemeriksaanTree
        : [];
    const filteredItemsTree = filterItemTree(itemsTree, cariItemPemeriksaan);
    const expandAllItems = cariItemPemeriksaan.trim().length > 0;

    const handlePickItemPemeriksaan = (node) => {
        if (!selectedJenisLayanan?.id) return;
        setIsPickingItem(true);
        setPickItemError('');
        router.put(
            route('jenis-layanan.sync-items', selectedJenisLayanan.id),
            {
                item_pemeriksaan_id: node.id,
            },
            {
                onSuccess: () => {
                    setOpenModalTreeItemPemeriksaan(false);
                    setIsPickingItem(false);
                    router.reload();
                },
                onError: (err) => {
                    const firstError =
                        err && typeof err === 'object'
                            ? Object.values(err)[0]
                            : null;
                    setPickItemError(
                        Array.isArray(firstError)
                            ? firstError[0]
                            : firstError || 'Gagal memilih item pemeriksaan.',
                    );
                    setIsPickingItem(false);
                },
                onFinish: () => {
                    setIsPickingItem(false);
                },
            },
        );
    };

    return (
        <LabkesdaLayout>
            <Head title="Daftar Jenis Layanan" />
            <div className="max-w-screen">
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800">
                    <div className="flex flex-col space-y-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
                        <div className="flex flex-1 items-center space-x-4">
                            <h2>
                                Daftar Jenis Layanan ({jenisLayanan.total}{' '}
                                entri)
                            </h2>
                        </div>
                        <div className="flex flex-shrink-0 flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0 lg:justify-end">
                            <button
                                type="button"
                                onClick={handleTambah}
                                className="flex items-center justify-center rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            >
                                <svg
                                    className="-ml-1 mr-2 h-3.5 w-3.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        clipRule="evenodd"
                                        fillRule="evenodd"
                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                    ></path>
                                </svg>
                                Tambah
                            </button>
                            <button
                                type="button"
                                className="flex flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                    />
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-b-lg">
                    <div className="flex flex-col space-y-3 border-b border-gray-200 px-4 py-3 dark:border-gray-600 lg:flex-row lg:items-end lg:space-x-4 lg:space-y-0">
                        <div className="flex-1">
                            <Label htmlFor="searchNama">Cari Nama</Label>
                            <TextInput
                                type="text"
                                id="searchNama"
                                placeholder="Cari nama layanan..."
                                value={cariNama}
                                onChange={(e) => setCariNama(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleFilter()
                                }
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="searchKategori">Kategori</Label>
                            <Select
                                id="searchKategori"
                                value={cariKategori}
                                onChange={(e) =>
                                    setCariKategori(e.target.value)
                                }
                            >
                                <option value="">Semua Kategori</option>
                                {kategoriLayanan.map((kategori) => (
                                    <option
                                        key={kategori.id}
                                        value={kategori.id}
                                    >
                                        {kategori.nama}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleFilter}>Cari</Button>
                            <Button color="light" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <div className="flex items-center">
                                            <input
                                                id="checkbox-all"
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                                            />
                                            <label
                                                htmlFor="checkbox-all"
                                                className="sr-only"
                                            >
                                                checkbox
                                            </label>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Nama
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Kategori
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Harga (UMUM)
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Item Pemeriksaan
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Pilihan
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {jenisLayanan.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="12"
                                            className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Tidak ada data jenis layanan.
                                        </td>
                                    </tr>
                                ) : (
                                    jenisLayanan.data.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                                        >
                                            <td className="w-4 px-4 py-2">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.nama}
                                            </td>
                                            <td className="px-4 py-2">
                                                {p.kategori_layanan?.nama}
                                            </td>
                                            <td className="px-4 py-2">
                                                {p.harga_umum.toLocaleString(
                                                    'id-ID',
                                                    {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                    },
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {p.item_pemeriksaan?.length
                                                    ? p.item_pemeriksaan
                                                          .map((i) => i.nama)
                                                          .join(', ')
                                                    : ''}
                                            </td>
                                            <td className="flex justify-center gap-2 text-nowrap px-4 py-2">
                                                {/* tombol tarif */}
                                                <Link
                                                    href={route(
                                                        'jenis-layanan.tarif',
                                                        p.id,
                                                    )}
                                                    className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                                                >
                                                    Tarif
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleAddItemPemeriksaan(
                                                            p,
                                                        )
                                                    }
                                                    className="rounded bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-600"
                                                >
                                                    Item Pemeriksaan
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEdit(p)
                                                    }
                                                    className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                                                >
                                                    Ubah
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(p)
                                                    }
                                                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* tampilkan navigasi pagination */}
                    <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
                        <span className="text-sm text-gray-700 dark:text-gray-400">
                            Menampilkan{' '}
                            <span className="font-semibold">
                                {jenisLayanan.from}
                            </span>{' '}
                            sampai{' '}
                            <span className="font-semibold">
                                {jenisLayanan.to}
                            </span>{' '}
                            dari total{' '}
                            <span className="font-semibold">
                                {jenisLayanan.total}
                            </span>{' '}
                            entri
                        </span>
                        <div className="xs:mt-0 mt-2 inline-flex">
                            {jenisLayanan.links.map((link, index) => (
                                <Link
                                    href={link.url || '#'}
                                    key={index}
                                    className={`mx-1 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 ${
                                        link.active
                                            ? 'bg-primary-600 text-gray-700 hover:bg-primary-700 hover:text-white'
                                            : ''
                                    }`}
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    ></span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                dismissible
                show={openModalTambah}
                size="2xl"
                onClose={() => setOpenModalTambah(false)}
            >
                <ModalHeader>Tambah Jenis Layanan</ModalHeader>
                <ModalBody className="max-w-2xl">
                    <CreateJenisLayananForm
                        jenisLayanan={selectedJenisLayanan}
                        kategoriLayanan={kategoriLayanan}
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        recentlySuccessful={recentlySuccessful}
                        onClose={() => setOpenModalTambah(false)}
                        onSubmit={submit}
                    />
                </ModalBody>
                <ModalFooter className="flex justify-end">
                    <Button
                        type="button"
                        onClick={() => setOpenModalTambah(false)}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25"
                    >
                        Batal
                    </Button>

                    <Button
                        className={`ml-3 ${processing ? 'cursor-not-allowed opacity-50' : ''}`}
                        onClick={submit}
                        disabled={processing}
                    >
                        Simpan
                    </Button>
                </ModalFooter>
            </Modal>

            <Modal
                show={openModalDelete}
                size="md"
                onClose={() => setOpenModalDelete(false)}
                popup
            >
                <ModalHeader />
                <ModalBody>
                    <div className="max-w-md text-center">
                        <div className="flex items-center">
                            <svg
                                className="-ml-1 mr-2 h-14 w-14 text-red-500 dark:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                            </svg>
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Apakah anda yakin ingin menghapus data Jenis
                                Pelayanan ini?
                            </h3>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={() =>
                                    hapusJenisLayanan(selectedJenisLayanan)
                                }
                            >
                                Ya, Saya yakin
                            </Button>
                            <Button
                                color="alternative"
                                onClick={() => setOpenModalDelete(false)}
                            >
                                Tidak, batal
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>

            <Modal
                dismissible
                show={openModalTreeItemPemeriksaan}
                size="7xl"
                onClose={() => setOpenModalTreeItemPemeriksaan(false)}
            >
                <ModalHeader>Item Pemeriksaan</ModalHeader>
                <ModalBody>
                    <div className="relative overflow-hidden border bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        {isPickingItem && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm font-medium text-slate-700">
                                Memproses pilihan...
                            </div>
                        )}
                        <div className="border-b border-slate-200 bg-white px-4 py-3 dark:bg-gray-800">
                            <Label htmlFor="searchItemPemeriksaan">
                                Cari Item
                            </Label>
                            <TextInput
                                type="text"
                                id="searchItemPemeriksaan"
                                placeholder="Cari item pemeriksaan..."
                                value={cariItemPemeriksaan}
                                onChange={(e) =>
                                    setCariItemPemeriksaan(e.target.value)
                                }
                            />
                            {pickItemError ? (
                                <div className="mt-2 text-sm text-red-600">
                                    {pickItemError}
                                </div>
                            ) : null}
                        </div>
                        <div className="flex items-center divide-x divide-slate-200 border-b border-slate-300 bg-slate-50 text-sm font-semibold text-slate-700">
                            <div className="flex-1 px-3 py-2">
                                Item Pemeriksaan
                            </div>
                            <div className="w-40 px-3 py-2">Pilih</div>
                        </div>

                        <div>
                            {filteredItemsTree.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-slate-500">
                                    Tidak ada data item pemeriksaan.
                                </div>
                            ) : (
                                filteredItemsTree.map((item, idx) => (
                                    <TreeItemRow
                                        key={item.id ?? `${item.name}-${idx}`}
                                        node={item}
                                        level={0}
                                        isLast={idx === itemsTree.length - 1}
                                        onPick={handlePickItemPemeriksaan}
                                        expandAll={expandAllItems}
                                        isPicking={isPickingItem}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </LabkesdaLayout>
    );
}
