import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Modal, ModalBody, TextInput } from 'flowbite-react';
import { useState } from 'react';

export default function ListRegister({ tanggal, items }) {
  const [cariTanggalDaftar, setCariTanggalDaftar] = useState(tanggal || '');
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [prosesDelete, setProsesDelete] = useState(false);

  const confirmHapus = (id) => {
    setOpenModalDelete(true);
    setSelectedId(id);
  };

  const hapusPemeriksaan = () => {
    setProsesDelete(true);
    router.delete(route('lab.lingkungan.delete-pendaftaran', selectedId), {
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

  return (
    <LabkesdaLayout>
      <Head title="Daftar Pemeriksaan Lingkungan" />
      <div className="max-w-screen">
        <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800">
          <div className="flex flex-col space-y-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
            <div className="flex flex-1 items-center space-x-4">
              <TextInput
                type="date"
                className="min-w-[15rem]"
                value={cariTanggalDaftar}
                onChange={(e) => setCariTanggalDaftar(e.target.value)}
              />
              <Button
                onClick={() =>
                  router.get(
                    route('pemeriksaan.index', { tanggal: cariTanggalDaftar }),
                  )
                }
              >
                Cari
              </Button>
            </div>
            <div className="flex flex-shrink-0 flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0 lg:justify-end">
              <Link
                href={route('lab.lingkungan.pendaftaran')}
                className="flex flex-shrink-0 items-center justify-center rounded-lg border border-primary-200 bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
              >
                Registrasi
              </Link>
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
                      <label htmlFor="checkbox-all" className="sr-only">
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
                    Perusahaan/Customer
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Telepon
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Tanggal Diambil
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Tanggal Diterima
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Jumlah Contoh Uji
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pengambil Contoh Uji
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Wadah
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Layanan
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Biaya
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Jenis Bayar
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pilihan
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data.
                    </td>
                  </tr>
                ) : (
                  items.data.map((p) => (
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
                        {new Date(p.tanggal_pendaftaran).toLocaleDateString()}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.no_registrasi}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.customer.nama}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.customer.no_telepon}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {new Date(p.tanggal_diambil).toLocaleDateString()}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {new Date(p.tanggal_diterima).toLocaleDateString()}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.jumlah_contoh_uji}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.pengambil_contoh_uji}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.wadah_contoh_uji}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.detail_pemeriksaan_lingkungan
                          .map((dp) => dp.jenis_layanan.nama)
                          .join(', ')}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.detail_pemeriksaan_lingkungan
                          .reduce((total, dp) => total + dp.harga, 0)
                          .toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          })}
                      </td>
                      <td className="text-nowrap px-4 py-2">{p.jenis_bayar}</td>
                      <td className="flex items-center gap-2 text-nowrap px-4 py-2">
                        <Link
                          href={route('lab.lingkungan.edit-pendaftaran', p.id)}
                          className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                        >
                          Ubah
                        </Link>
                        <button
                          onClick={() => confirmHapus(p.id)}
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
              Menampilkan <span className="font-semibold">{items.from}</span>{' '}
              sampai <span className="font-semibold">{items.to}</span> dari
              total <span className="font-semibold">{items.total}</span> entri
            </span>
            <div className="xs:mt-0 mt-2 inline-flex">
              {items.links.map((link, index) => (
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
                Apakah anda yakin ingin menghapus data pendaftaran ini?
              </h3>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={hapusPemeriksaan} disabled={prosesDelete}>
                {prosesDelete ? 'Menghapus...' : 'Ya, Saya yakin'}
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
