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
import CreatePaketPemeriksaanForm from './CreatePaketPemeriksaanForm';

export default function Index({ paketPemeriksaan }) {
  const urlParams = new URLSearchParams(window.location.search);
  const [openModalTambah, setOpenModalTambah] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openModalItemPemeriksaan, setOpenModalItemPemeriksaan] =
    useState(false);
  const [cariNama, setCariNama] = useState(urlParams.get('nama') || '');
  const [cariJenisLab, setCariJenisLab] = useState(
    urlParams.get('jenis_lab') || '',
  );
  const [selectedPaketPemeriksaan, setSelectedPaketPemeriksaan] =
    useState(null);

  const handleFilter = () => {
    router.visit(route('paket-pemeriksaan.index'), {
      method: 'get',
      data: {
        nama: cariNama,
        jenis_lab: cariJenisLab,
      },
      preserveState: true,
    });
  };

  const handleReset = () => {
    setCariNama('');
    setCariJenisLab('');
    router.visit(route('paket-pemeriksaan.index'), {
      method: 'get',
      preserveState: true,
    });
  };

  const handleTambah = () => {
    setSelectedPaketPemeriksaan(null);
    resetData();
    setOpenModalTambah(true);
  };

  const handleEdit = (p) => {
    setData({
      nama: p.nama,
      kategori_layanan_id: p.kategori_layanan_id,
      harga: p.harga,
    });
    setSelectedPaketPemeriksaan(p);
    setOpenModalTambah(true);
  };

  const handleDelete = (p) => {
    setSelectedPaketPemeriksaan(p);
    setOpenModalDelete(true);
  };

  const resetData = () => {
    setData({
      nama: '',
      jenis_lab: '',
      deskripsi: '',
    });
    setSelectedPaketPemeriksaan(null);
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
    jenis_lab: '',
    deskripsi: '',
  });

  const submit = (e) => {
    e.preventDefault();
    if (selectedPaketPemeriksaan) {
      put(route('paket-pemeriksaan.update', selectedPaketPemeriksaan.id), {
        onSuccess: () => {
          setOpenModalTambah(false);
          setSelectedPaketPemeriksaan(null);
          resetData();
        },
      });
    } else {
      post(route('paket-pemeriksaan.store'), {
        onSuccess: () => {
          setOpenModalTambah(false);
          resetData();
        },
      });
    }
  };

  const hapusPaketPemeriksaan = (paketPemeriksaan) => {
    router.delete(route('paket-pemeriksaan.destroy', paketPemeriksaan.id), {
      onSuccess: () => {
        setOpenModalDelete(false);
      },
    });
  };

  return (
    <LabkesdaLayout>
      <Head title="Daftar Paket Pemeriksaan" />
      <div className="max-w-screen">
        <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800">
          <div className="flex flex-col space-y-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
            <div className="flex flex-1 items-center space-x-4">
              <h2>Daftar Paket Pemeriksaan ({paketPemeriksaan.total} entri)</h2>
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
                    clip-rule="evenodd"
                    fill-rule="evenodd"
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
        <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-b-lg">
          <div className="flex flex-col space-y-3 border-b border-gray-200 px-4 py-3 dark:border-gray-600 lg:flex-row lg:items-end lg:space-x-4 lg:space-y-0">
            <div className="flex-1">
              <Label htmlFor="searchNama">Cari Nama</Label>
              <TextInput
                type="text"
                id="searchNama"
                placeholder="Cari nama paket pemeriksaan..."
                value={cariNama}
                onChange={(e) => setCariNama(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="searchJenisLab">Jenis Lab</Label>
              <Select
                id="searchJenisLab"
                value={cariJenisLab}
                onChange={(e) => setCariJenisLab(e.target.value)}
              >
                <option value="">Semua Jenis Lab</option>
                <option key={'klinis'} value={'klinis'}>
                  Klinis
                </option>
                <option key={'lingkungan'} value={'lingkungan'}>
                  Lingkungan
                </option>
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
                      <label htmlFor="checkbox-all" className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Nama
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Jenis Lab
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Jumlah Item
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Total Harga
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pilihan
                  </th>
                </tr>
              </thead>
              <tbody>
                {paketPemeriksaan.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="12"
                      className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data paket pemeriksaan.
                    </td>
                  </tr>
                ) : (
                  paketPemeriksaan.data.map((p) => (
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
                      <td className="text-nowrap px-4 py-2">{p.nama}</td>
                      <td className="px-4 py-2">{p.jenis_lab}</td>
                      <td className="px-4 py-2">{p.deskripsi}</td>
                      <td className="flex justify-center gap-2 text-nowrap px-4 py-2">
                        {p.jumlah}
                      </td>
                      <td className="px-4 py-2">
                        {p.harga.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })}
                      </td>
                      <td className="flex justify-center gap-2 text-nowrap px-4 py-2">
                        <Link
                          href={route('paket-pemeriksaan.show', p.id)}
                          className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                        >
                          Item Pemeriksaan
                        </Link>
                        <button
                          onClick={() => handleEdit(p)}
                          className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
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
              <span className="font-semibold">{paketPemeriksaan.from}</span>{' '}
              sampai{' '}
              <span className="font-semibold">{paketPemeriksaan.to}</span> dari
              total{' '}
              <span className="font-semibold">{paketPemeriksaan.total}</span>{' '}
              entri
            </span>
            <div className="xs:mt-0 mt-2 inline-flex">
              {paketPemeriksaan.links.map((link, index) => (
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
        <ModalHeader>Tambah Paket Pemeriksaan</ModalHeader>
        <ModalBody className="max-w-2xl">
          <CreatePaketPemeriksaanForm
            paketPemeriksaan={selectedPaketPemeriksaan}
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
                Apakah anda yakin ingin menghapus data Paket Pemeriksaan ini?
              </h3>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => hapusPaketPemeriksaan(selectedPaketPemeriksaan)}
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
    </LabkesdaLayout>
  );
}
