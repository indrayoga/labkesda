import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    TabItem,
    Tabs,
    TextInput,
} from 'flowbite-react';
import { useState } from 'react';

export default function Pendaftaran({ tanggal, tanggal_akhir, pemeriksaan }) {
    const [cariTanggalDaftar, setCariTanggalDaftar] = useState(tanggal || '');
    const [cariTanggalTerakhirDaftar, setCariTanggalTerakhirDaftar] = useState(
        tanggal_akhir || '',
    );
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [prosesDelete, setProsesDelete] = useState(false);

    // Detail modal
    const [openModalDetail, setOpenModalDetail] = useState(false);
    const [selectedPemeriksaan, setSelectedPemeriksaan] = useState(null);

    const confirmHapus = (id) => {
        setOpenModalDelete(true);
        setSelectedId(id);
    };

    const hapusPemeriksaan = () => {
        setProsesDelete(true);
        router.delete(route('pemeriksaan.destroy', selectedId), {
            onSuccess: () => {
                setProsesDelete(false);
                setOpenModalDelete(false);
            },
            onError: (errors) => {
                setProsesDelete(false);
                console.error('Error deleting pemeriksaan:', errors);
            },
        });
    };

    /*
    Fungsi untuk menghitung umur berdasarkan tanggal lahir
    Input: tanggalLahir (string dalam format 'YYYY-MM-DD')
    Output: umur dan bulan dalam format "X tahun Y bulan"
  */
    const hitungUmur = (tanggalLahir) => {
        const today = new Date();
        const birthDate = new Date(tanggalLahir);
        let age = today.getFullYear() - birthDate.getFullYear();
        let month = today.getMonth() - birthDate.getMonth();

        if (
            month < 0 ||
            (month === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
            month += 12;
        }
        return `${age} tahun ${month} bulan`;
    };

    const badgeStatusPeriksa = (status) => {
        const map = {
            Menunggu: 'bg-yellow-100 text-yellow-800',
            Proses: 'bg-blue-100 text-blue-800',
            Selesai: 'bg-green-100 text-green-800',
        };
        return map[status] ?? 'bg-gray-100 text-gray-800';
    };

    const badgeStatusBayar = (status) => {
        if (!status) return null;
        const map = {
            Lunas: 'bg-green-100 text-green-800',
            Belum: 'bg-red-100 text-red-800',
        };
        return map[status] ?? 'bg-gray-100 text-gray-800';
    };

    const openDetail = (p) => {
        setSelectedPemeriksaan(p);
        setOpenModalDetail(true);
    };

    return (
        <LabkesdaLayout>
            <Head title="Pemeriksaan Pasien" />
            <div className="max-w-screen">
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800">
                    <div className="flex flex-col space-y-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
                        <div className="flex flex-1 items-center space-x-4">
                            <TextInput
                                type="date"
                                className="min-w-[15rem]"
                                value={cariTanggalDaftar}
                                onChange={(e) =>
                                    setCariTanggalDaftar(e.target.value)
                                }
                            />
                            <TextInput
                                type="date"
                                className="min-w-[15rem]"
                                value={cariTanggalTerakhirDaftar}
                                onChange={(e) =>
                                    setCariTanggalTerakhirDaftar(e.target.value)
                                }
                            />
                            <Button
                                onClick={() =>
                                    router.get(
                                        route('pendaftaran', {
                                            tanggal: cariTanggalDaftar,
                                            tanggal_akhir:
                                                cariTanggalTerakhirDaftar,
                                        }),
                                    )
                                }
                            >
                                Cari
                            </Button>
                        </div>
                        <div className="flex flex-shrink-0 flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0 lg:justify-end">
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
                <div className="relative hidden overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-b-lg md:block">
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
                                        Tanggal Daftar
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        No Register
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        ID Spesimen
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Nama
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        L/P
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Umur
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Telepon
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Dokter
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Jenis Pasien
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Pilihan
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pemeriksaan.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="13"
                                            className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Tidak ada data pemeriksaan.
                                        </td>
                                    </tr>
                                ) : (
                                    pemeriksaan.data.map((p) => (
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
                                            <td className="text-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                                                {new Date(
                                                    p.tanggal_pendaftaran,
                                                ).toLocaleDateString() +
                                                    ' ' +
                                                    p.jam_pendaftaran}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.no_registrasi}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.id_spesimen}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.pasien.nama}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.pasien.jenis_kelamin}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {hitungUmur(
                                                    p.pasien.tanggal_lahir,
                                                )}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.pasien.no_telepon}
                                            </td>
                                            <td className="px-4 py-2">
                                                {p.dokter.nama}
                                            </td>
                                            <td className="px-4 py-2">
                                                {p.jenis_pasien}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badgeStatusPeriksa(p.status_periksa)}`}
                                                    >
                                                        {p.status_periksa ||
                                                            'Menunggu'}
                                                    </span>
                                                    {p.status_bayar && (
                                                        <span
                                                            className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badgeStatusBayar(p.status_bayar)}`}
                                                        >
                                                            {p.status_bayar}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="flex items-center gap-1 text-nowrap px-4 py-2">
                                                <button
                                                    onClick={() =>
                                                        openDetail(p)
                                                    }
                                                    className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-800 hover:bg-gray-300"
                                                >
                                                    Detail
                                                </button>
                                                <Link
                                                    href={route(
                                                        'edit-pendaftaran-laboratorium',
                                                        {
                                                            pasien: p.pasien.id,
                                                            pemeriksaan: p.id,
                                                        },
                                                    )}
                                                    className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                                                >
                                                    Ubah
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        confirmHapus(p.id)
                                                    }
                                                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
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
                                {pemeriksaan.from}
                            </span>{' '}
                            sampai{' '}
                            <span className="font-semibold">
                                {pemeriksaan.to}
                            </span>{' '}
                            dari total{' '}
                            <span className="font-semibold">
                                {pemeriksaan.total}
                            </span>{' '}
                            entri
                        </span>
                        <div className="xs:mt-0 mt-2 inline-flex">
                            {pemeriksaan.links.map((link, index) => (
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

                {/* Mobile Cards */}
                <div className="md:hidden">
                    {pemeriksaan.data.length === 0 ? (
                        <div className="bg-white px-4 py-8 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400 sm:rounded-b-lg">
                            Tidak ada data pemeriksaan.
                        </div>
                    ) : (
                        <div className="space-y-3 py-3">
                            {pemeriksaan.data.map((p) => (
                                <div
                                    key={p.id}
                                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {p.pasien.nama}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {p.no_registrasi}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span
                                                className={`rounded px-2 py-0.5 text-xs font-medium ${badgeStatusPeriksa(p.status_periksa)}`}
                                            >
                                                {p.status_periksa || 'Menunggu'}
                                            </span>
                                            {p.status_bayar && (
                                                <span
                                                    className={`rounded px-2 py-0.5 text-xs font-medium ${badgeStatusBayar(p.status_bayar)}`}
                                                >
                                                    {p.status_bayar}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <p>
                                            <span className="font-medium">
                                                Tanggal:
                                            </span>{' '}
                                            {new Date(
                                                p.tanggal_pendaftaran,
                                            ).toLocaleDateString()}{' '}
                                            {p.jam_pendaftaran}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                ID Spesimen:
                                            </span>{' '}
                                            {p.id_spesimen || '-'}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                {p.pasien.jenis_kelamin}
                                            </span>{' '}
                                            &bull;{' '}
                                            {hitungUmur(p.pasien.tanggal_lahir)}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                No Telepon:
                                            </span>{' '}
                                            {p.pasien.no_telepon}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Dokter:
                                            </span>{' '}
                                            {p.dokter.nama}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Jenis Pasien:
                                            </span>{' '}
                                            {p.jenis_pasien}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => openDetail(p)}
                                            className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                        >
                                            Detail
                                        </button>
                                        <Link
                                            href={route(
                                                'edit-pendaftaran-laboratorium',
                                                {
                                                    pasien: p.pasien.id,
                                                    pemeriksaan: p.id,
                                                },
                                            )}
                                            className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                                        >
                                            Ubah
                                        </Link>
                                        <button
                                            onClick={() => confirmHapus(p.id)}
                                            className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col gap-2 border-t bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 sm:flex-row sm:items-center sm:justify-between sm:rounded-b-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-400">
                            Menampilkan{' '}
                            <span className="font-semibold">
                                {pemeriksaan.from}
                            </span>{' '}
                            sampai{' '}
                            <span className="font-semibold">
                                {pemeriksaan.to}
                            </span>{' '}
                            dari total{' '}
                            <span className="font-semibold">
                                {pemeriksaan.total}
                            </span>{' '}
                            entri
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {pemeriksaan.links.map((link, index) => (
                                <Link
                                    href={link.url || '#'}
                                    key={index}
                                    className={`rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 ${
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

            {/* Detail Modal */}
            <Modal
                dismissible={true}
                size="2xl"
                show={openModalDetail}
                onClose={() => setOpenModalDetail(false)}
            >
                <ModalHeader>Detail Pendaftaran</ModalHeader>
                <ModalBody>
                    {selectedPemeriksaan && (
                        <Tabs>
                            <TabItem title="Data Pasien">
                                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        No. RM
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.pasien.no_rm ||
                                            '-'}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        NIK
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.pasien.nik || '-'}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Nama
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.pasien.nama}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Jenis Kelamin
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {
                                            selectedPemeriksaan.pasien
                                                .jenis_kelamin
                                        }
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Tanggal Lahir
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.pasien
                                            .tanggal_lahir
                                            ? new Date(
                                                  selectedPemeriksaan.pasien
                                                      .tanggal_lahir,
                                              ).toLocaleDateString('id-ID')
                                            : '-'}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Umur
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {hitungUmur(
                                            selectedPemeriksaan.pasien
                                                .tanggal_lahir,
                                        )}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        No. Telepon
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.pasien
                                            .no_telepon || '-'}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Alamat
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.pasien.alamat ||
                                            '-'}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Pekerjaan
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.pasien.pekerjaan ||
                                            '-'}
                                    </dd>
                                </dl>
                            </TabItem>
                            <TabItem title="Data Pendaftaran">
                                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        No. Registrasi
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.no_registrasi}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        ID Spesimen
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.id_spesimen || '-'}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Tanggal Pendaftaran
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {new Date(
                                            selectedPemeriksaan.tanggal_pendaftaran,
                                        ).toLocaleDateString('id-ID')}{' '}
                                        {selectedPemeriksaan.jam_pendaftaran}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Dokter
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.dokter.nama}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Jenis Pasien
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.jenis_pasien}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Diagnosa
                                    </dt>
                                    <dd className="text-gray-900 dark:text-white">
                                        {selectedPemeriksaan.diagnosa || '-'}
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Status Periksa
                                    </dt>
                                    <dd>
                                        <span
                                            className={`rounded px-2 py-0.5 text-xs font-medium ${badgeStatusPeriksa(selectedPemeriksaan.status_periksa)}`}
                                        >
                                            {selectedPemeriksaan.status_periksa ||
                                                'Menunggu'}
                                        </span>
                                    </dd>
                                    <dt className="font-medium text-gray-600 dark:text-gray-400">
                                        Status Bayar
                                    </dt>
                                    <dd>
                                        {selectedPemeriksaan.status_bayar ? (
                                            <span
                                                className={`rounded px-2 py-0.5 text-xs font-medium ${badgeStatusBayar(selectedPemeriksaan.status_bayar)}`}
                                            >
                                                {
                                                    selectedPemeriksaan.status_bayar
                                                }
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">
                                                -
                                            </span>
                                        )}
                                    </dd>
                                </dl>
                            </TabItem>
                            <TabItem title="Item Pemeriksaan">
                                {selectedPemeriksaan.detail_pemeriksaan
                                    .length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Tidak ada item pemeriksaan.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {selectedPemeriksaan.detail_pemeriksaan.map(
                                            (dp) => (
                                                <li
                                                    key={dp.id}
                                                    className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-sm dark:border-gray-600"
                                                >
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {dp.jenis_layanan.nama}
                                                    </span>
                                                    {dp.harga != null && (
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            Rp{' '}
                                                            {Number(
                                                                dp.harga,
                                                            ).toLocaleString(
                                                                'id-ID',
                                                            )}
                                                        </span>
                                                    )}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                )}
                            </TabItem>
                        </Tabs>
                    )}
                </ModalBody>
            </Modal>

            <Modal
                size="md"
                show={openModalDelete}
                onClose={() => setOpenModalDelete(false)}
            >
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
                                Apakah anda yakin ingin menghapus data
                                pendaftaran ini?
                            </h3>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={hapusPemeriksaan}
                                disabled={prosesDelete}
                            >
                                {prosesDelete
                                    ? 'Menghapus...'
                                    : 'Ya, Saya yakin'}
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
        </LabkesdaLayout>
    );
}
