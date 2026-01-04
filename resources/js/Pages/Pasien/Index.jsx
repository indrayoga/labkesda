import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Button,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    TextInput,
} from 'flowbite-react';
import { useState } from 'react';
import CreatePasienForm from './CreatePasienForm';

export default function Index({ pasien, kecamatans, kelurahans }) {
    const [openModalFilter, setOpenModalFilter] = useState(false);
    const [openModalTambah, setOpenModalTambah] = useState(false);
    const [cariNama, setCariNama] = useState('');
    const [cariTanggalLahir, setCariTanggalLahir] = useState('');
    const handleFilter = () => {
        router.visit(route('pasien.index'), {
            method: 'get',
            data: {
                nama: cariNama,
                tanggal_lahir: cariTanggalLahir,
            },
            preserveState: true,
        });
    };

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm({
        no_rm: '',
        nama: '',
        jenis_kelamin: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        no_telepon: '',
        kecamatan_id: '',
        kelurahan_id: '',
        alamat: '',
        pekerjaan: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('pasien.store'), {
            onSuccess: () => {
                setOpenModalTambah(false);
                reset();
            },
        });
    };

    return (
        <LabkesdaLayout>
            <Head title="Daftar Pasien" />
            <div className="max-w-screen">
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800">
                    <div className="flex flex-col space-y-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
                        <div className="flex flex-1 items-center space-x-4">
                            <h2>Daftar Pasien ({pasien.total} entri)</h2>
                        </div>
                        <div className="flex flex-shrink-0 flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0 lg:justify-end">
                            <button
                                type="button"
                                onClick={() => setOpenModalTambah(true)}
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
                                        clip-rule="evenodd"
                                        fill-rule="evenodd"
                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                    ></path>
                                </svg>
                                Tambah
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpenModalFilter(true)}
                                className="flex flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                            >
                                <svg
                                    className="-ml-1 mr-2 h-3.5 w-3.5 text-gray-800 dark:text-white"
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
                                        strokeWidth="2"
                                        d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"
                                    />
                                </svg>
                                Pencarian
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
                                    stroke-width="2"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                    />
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden bg-white shadow-md sm:rounded-b-lg dark:bg-gray-800">
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
                                        No RM
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Nama
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        L/P
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Tempat/Tgl Lahir
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        No Telp
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Alamat
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Pekerjaan
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Terakhir Daftar
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pasien.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="11"
                                            className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Tidak ada data pasien.
                                        </td>
                                    </tr>
                                ) : (
                                    pasien.data.map((p) => (
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
                                            <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                                {p.no_rm}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.nama}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.jenis_kelamin}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.tempat_lahir},{' '}
                                                {new Date(
                                                    p.tanggal_lahir,
                                                ).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-2">
                                                {p.no_telepon}
                                            </td>
                                            <td className="px-4 py-2">
                                                {p.alamat}, {p.kelurahan.nama},{' '}
                                                {p.kecamatan.nama}
                                            </td>
                                            <td className="text-nowrap px-4 py-2">
                                                {p.pekerjaan}
                                            </td>
                                            <td className="px-4 py-2">
                                                {new Date(
                                                    p.created_at,
                                                ).toLocaleDateString('id-ID')}
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
                            <span className="font-semibold">{pasien.from}</span>{' '}
                            sampai{' '}
                            <span className="font-semibold">{pasien.to}</span>{' '}
                            dari total{' '}
                            <span className="font-semibold">
                                {pasien.total}
                            </span>{' '}
                            entri
                        </span>
                        <div className="xs:mt-0 mt-2 inline-flex">
                            {pasien.links.map((link, index) => (
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
                show={openModalFilter}
                onClose={() => setOpenModalFilter(false)}
                size="2xl"
            >
                <ModalHeader>Filter Pasien</ModalHeader>
                <ModalBody className="max-w-2xl">
                    {/* Isi filter form di sini */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <Label htmlFor="nama">Nama</Label>
                            <TextInput
                                type="text"
                                id="nama"
                                placeholder="Nama Pasien"
                                value={cariNama}
                                onChange={(e) => setCariNama(e.target.value)}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <Label htmlFor="tanggal_lahir">Tgl Lahir</Label>
                            <TextInput
                                type="date"
                                id="tanggal_lahir"
                                value={cariTanggalLahir}
                                onChange={(e) =>
                                    setCariTanggalLahir(e.target.value)
                                }
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button type="button" onClick={handleFilter}>
                        Terapkan
                    </Button>
                    <Button
                        type="button"
                        color="light"
                        onClick={() => setOpenModalFilter(false)}
                    >
                        Batal
                    </Button>
                </ModalFooter>
            </Modal>

            <Modal
                dismissible
                show={openModalTambah}
                size="2xl"
                onClose={() => setOpenModalTambah(false)}
            >
                <ModalHeader>Tambah Pasien</ModalHeader>
                <ModalBody className="max-w-2xl">
                    <CreatePasienForm
                        kecamatans={kecamatans}
                        kelurahans={kelurahans}
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
                    <button
                        type="button"
                        onClick={() => setOpenModalTambah(false)}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25"
                    >
                        Batal
                    </button>

                    <Button
                        className={`ml-3 ${processing ? 'cursor-not-allowed opacity-50' : ''}`}
                        onClick={submit}
                        disabled={processing}
                    >
                        Simpan
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Tersimpan.</p>
                    </Transition>
                </ModalFooter>
            </Modal>
        </LabkesdaLayout>
    );
}
