import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
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

export default function Index({ kecamatans, kelurahans }) {
    const [openModalFilter, setOpenModalFilter] = useState(false);
    const [openModalTambah, setOpenModalTambah] = useState(false);

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
                            <h5>
                                <span className="text-gray-500">
                                    Jumlah Pencarian:
                                </span>
                                <span className="dark:text-white">146</span>
                            </h5>
                            <h5>
                                <span className="text-gray-500">
                                    Total Pasien:
                                </span>
                                <span className="dark:text-white">88.4k</span>
                            </h5>
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
                                        Kecamatan
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                        Kelurahan
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
                                <tr className="border-b hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                                    <td className="w-4 px-4 py-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                        RM001234
                                    </td>
                                    <td className="px-4 py-2">Budi Santoso</td>
                                    <td className="px-4 py-2">L</td>
                                    <td className="px-4 py-2">
                                        Jakarta, 15/03/1985
                                    </td>
                                    <td className="px-4 py-2">081234567890</td>
                                    <td className="px-4 py-2">
                                        Kebayoran Baru
                                    </td>
                                    <td className="px-4 py-2">Senayan</td>
                                    <td className="px-4 py-2">
                                        Jl. Sudirman No. 123
                                    </td>
                                    <td className="px-4 py-2">
                                        Karyawan Swasta
                                    </td>
                                    <td className="px-4 py-2">20/01/2024</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                                    <td className="w-4 px-4 py-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                        RM001235
                                    </td>
                                    <td className="px-4 py-2">
                                        Siti Nurhaliza
                                    </td>
                                    <td className="px-4 py-2">P</td>
                                    <td className="px-4 py-2">
                                        Bandung, 22/07/1990
                                    </td>
                                    <td className="px-4 py-2">082345678901</td>
                                    <td className="px-4 py-2">Ciputat</td>
                                    <td className="px-4 py-2">Ciputat Timur</td>
                                    <td className="px-4 py-2">
                                        Jl. Raya Ciputat No. 45
                                    </td>
                                    <td className="px-4 py-2">
                                        Ibu Rumah Tangga
                                    </td>
                                    <td className="px-4 py-2">18/01/2024</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                                    <td className="w-4 px-4 py-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                        RM001236
                                    </td>
                                    <td className="px-4 py-2">Ahmad Fauzi</td>
                                    <td className="px-4 py-2">L</td>
                                    <td className="px-4 py-2">
                                        Surabaya, 10/11/1978
                                    </td>
                                    <td className="px-4 py-2">083456789012</td>
                                    <td className="px-4 py-2">Tanah Abang</td>
                                    <td className="px-4 py-2">Petamburan</td>
                                    <td className="px-4 py-2">
                                        Jl. KH Mas Mansyur No. 78
                                    </td>
                                    <td className="px-4 py-2">Wiraswasta</td>
                                    <td className="px-4 py-2">15/01/2024</td>
                                </tr>
                            </tbody>
                        </table>
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
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <Label htmlFor="tanggal_lahir">Tgl Lahir</Label>
                            <TextInput type="date" id="tanggal_lahir" />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button>Terapkan</Button>
                    <Button
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
                        className="ms-3"
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
