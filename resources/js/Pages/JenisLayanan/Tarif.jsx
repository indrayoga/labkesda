import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, router } from '@inertiajs/react';
import { Modal, ModalBody, ModalHeader } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';
import CreateTarif from './CreateTarif';
import EditTarif from './EditTarif';

export default function Tarif({ jenisLayanan, jenisPasien, existingTarif }) {
    console.log('existingTarif', existingTarif);
    const jenisPasienMap = useMemo(() => {
        return (jenisPasien || []).reduce((acc, jp) => {
            acc[jp.kode] = jp.nama;
            return acc;
        }, {});
    }, [jenisPasien]);

    const [tarifList, setTarifList] = useState(existingTarif || []);
    const [showInactive, setShowInactive] = useState(false);
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [selectedTarif, setSelectedTarif] = useState(null);

    useEffect(() => {
        setTarifList(existingTarif || []);
    }, [existingTarif]);

    const activeTarif = useMemo(() => {
        return (tarifList || []).filter(
            (t) => t.aktif === true || t.aktif === 1,
        );
    }, [tarifList]);

    const inactiveTarif = useMemo(() => {
        return (tarifList || []).filter(
            (t) => t.aktif === false || t.aktif === 0,
        );
    }, [tarifList]);

    const getJenisPasienNama = (item) => {
        if (item?.jenis_pasien?.nama) return item.jenis_pasien.nama;
        if (item?.jenis_pasien_nama) return item.jenis_pasien_nama;
        if (item?.jenis_pasien_id && jenisPasienMap[item.jenis_pasien_id]) {
            return jenisPasienMap[item.jenis_pasien_id];
        }
        return '—';
    };

    const formatRp = (value) => {
        if (value === null || value === undefined || value === '') return '—';
        const n = Number(value);
        if (Number.isNaN(n)) return '—';
        return n.toLocaleString('id-ID');
    };

    const handleRefresh = () => {
        router.reload();
    };

    const handleOpenEdit = (tarif) => {
        setSelectedTarif(tarif);
        setOpenModalEdit(true);
    };

    const handleCloseEdit = () => {
        setSelectedTarif(null);
        setOpenModalEdit(false);
    };
    return (
        <LabkesdaLayout>
            <Head
                title={`Tarif Aktif: ${jenisLayanan?.nama ?? 'Jenis Layanan'}`}
            />

            <div className="max-w-screen">
                {/* Panel Header */}
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800">
                    <div className="flex flex-col space-y-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-lg font-semibold">
                                Daftar Tarif Aktif: {jenisLayanan?.nama ?? '—'}
                            </h2>
                        </div>
                        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setOpenModalCreate(true)}
                                className="flex items-center justify-center rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            >
                                Tambah Tarif Baru
                            </button>
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                            >
                                Refresh
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowInactive((prev) => !prev)}
                                className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                {showInactive
                                    ? 'Sembunyikan Tarif Tidak Aktif'
                                    : 'Lihat Tarif Tidak Aktif'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Table */}
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-b-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="px-4 py-3">
                                        Jenis Pasien
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Tarif (Rp)
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Berlaku Dari
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Berlaku Sampai
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Keterangan
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTarif.length > 0 ? (
                                    activeTarif.map((row) => (
                                        <tr
                                            key={row.id ?? row.jenis_pasien_id}
                                            className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                        >
                                            <td className="text-nowrap px-4 py-2">
                                                {row.jenis_pasien?.nama}
                                            </td>
                                            <td className="px-4 py-2">
                                                {formatRp(row.harga)}
                                            </td>
                                            <td className="px-4 py-2">
                                                {new Date(
                                                    row.valid_dari,
                                                ).toLocaleDateString() || '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {row.valid_sampai
                                                    ? new Date(
                                                          row.valid_sampai,
                                                      ).toLocaleDateString()
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {row.keterangan || '—'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                    Aktif
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenEdit(row)
                                                    }
                                                    className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-4 py-3 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Tidak ada tarif aktif.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inactive Table */}
                {showInactive && (
                    <div className="relative mt-6 overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
                        <div className="border-b px-4 py-3 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Tarif Tidak Aktif
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">
                                            Jenis Pasien
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Tarif (Rp)
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Berlaku Dari
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Berlaku Sampai
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Keterangan
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Status
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inactiveTarif.length > 0 ? (
                                        inactiveTarif.map((row) => (
                                            <tr
                                                key={
                                                    row.id ??
                                                    row.jenis_pasien?.kode
                                                }
                                                className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                            >
                                                <td className="text-nowrap px-4 py-2">
                                                    {row.jenis_pasien?.nama}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {formatRp(row.harga)}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {new Date(
                                                        row.valid_dari,
                                                    ).toLocaleDateString() ||
                                                        '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {new Date(
                                                        row.valid_sampai,
                                                    ).toLocaleDateString() ||
                                                        '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {row.keterangan || '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                                        Tidak Aktif
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpenEdit(row)
                                                        }
                                                        className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-4 py-3 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                Tidak ada tarif tidak aktif.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                dismissible
                show={openModalCreate}
                size="2xl"
                onClose={() => setOpenModalCreate(false)}
            >
                <ModalHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Buat Tarif Baru
                    </h3>
                </ModalHeader>
                <ModalBody>
                    <CreateTarif
                        jenisPasien={jenisPasien}
                        jenisLayanan={jenisLayanan}
                        reloadTarif={handleRefresh}
                        closeModal={() => setOpenModalCreate(false)}
                    />
                </ModalBody>
            </Modal>

            <Modal
                dismissible
                show={openModalEdit}
                size="2xl"
                onClose={handleCloseEdit}
            >
                <ModalHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Edit Tarif
                    </h3>
                </ModalHeader>
                <ModalBody>
                    <EditTarif
                        jenisPasien={jenisPasien}
                        jenisLayanan={jenisLayanan}
                        tarif={selectedTarif}
                        closeModal={handleCloseEdit}
                    />
                </ModalBody>
            </Modal>
        </LabkesdaLayout>
    );
}
