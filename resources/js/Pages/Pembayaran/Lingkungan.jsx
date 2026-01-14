import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from 'flowbite-react';
import { useState } from 'react';

export default function Lingkungan({ tanggal, pemeriksaan }) {
  const [cariTanggalDaftar, setCariTanggalDaftar] = useState(tanggal || '');
  const [openModalBayar, setOpenModalBayar] = useState(false);
  const [selectedPemeriksaan, setSelectedPemeriksaan] = useState(null);
  const [prosesBayar, setProsesBayar] = useState(false);

  const confirmBayar = (pemeriksaan) => {
    setOpenModalBayar(true);
    setSelectedPemeriksaan(pemeriksaan);
  };

  const handleBayar = () => {
    setProsesBayar(true);
    router.post(
      route('pembayaran.store'),
      {
        pemeriksaan_lingkungan_id: selectedPemeriksaan.id,
      },
      {
        onSuccess: () => {
          alert('Pembayaran berhasil.');
          setOpenModalBayar(false);
          setProsesBayar(false);
        },
        onError: (errors) => {
          alert('Terjadi kesalahan saat memproses pembayaran.');
          setProsesBayar(false);
        },
      },
    );
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

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
      month += 12;
    }
    return `${age} tahun ${month} bulan`;
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
                onChange={(e) => setCariTanggalDaftar(e.target.value)}
              />
              <Button
                onClick={() =>
                  router.get(
                    route('pembayaran.lingkungan', {
                      tanggal: cariTanggalDaftar,
                    }),
                  )
                }
              >
                Cari
              </Button>
            </div>
            <div className="flex flex-shrink-0 flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0 lg:justify-end">
              <Link
                href={route('pembayaran.lingkungan')}
                className="flex flex-shrink-0 items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Lab Lingkungan
              </Link>
              <Link
                href={route('pembayaran.index')}
                className="flex flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
              >
                Lab Klinis
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
                {pemeriksaan.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
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
                        <Button size="sm" onClick={() => confirmBayar(p)}>
                          Bayar
                        </Button>
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
              <span className="font-semibold">{pemeriksaan.from}</span> sampai{' '}
              <span className="font-semibold">{pemeriksaan.to}</span> dari total{' '}
              <span className="font-semibold">{pemeriksaan.total}</span> entri
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
      </div>

      <Modal
        size="lg"
        show={openModalBayar}
        onClose={() => setOpenModalBayar(false)}
      >
        <ModalHeader>Ringkasan Pemeriksaan</ModalHeader>
        <ModalBody>
          <div className="flow-root">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <dl className="pb-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <dt className="whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                  Tanggal Daftar
                </dt>
                <dd className="mt-2 text-gray-500 sm:mt-0 sm:text-right dark:text-gray-400">
                  {selectedPemeriksaan?.tanggal_pendaftaran}
                </dd>
              </dl>

              <dl className="py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <dt className="whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                  Nama
                </dt>
                <dd className="mt-2 text-gray-500 sm:mt-0 sm:text-right dark:text-gray-400">
                  {selectedPemeriksaan?.customer.nama}
                </dd>
              </dl>

              <dl className="py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <dt className="whitespace-nowrap text-base font-semibold text-gray-900 dark:text-white">
                  Telp
                </dt>
                <dd className="mt-2 text-gray-500 sm:mt-0 sm:text-right dark:text-gray-400">
                  {selectedPemeriksaan?.customer.no_telepon}
                </dd>
              </dl>

              <dl className="py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <dt className="whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                  Jenis Pembayaran
                </dt>
                <dd className="mt-2 flex items-center gap-2 sm:mt-0 sm:justify-end">
                  {selectedPemeriksaan?.jenis_bayar}
                </dd>
              </dl>

              <dl className="pt-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <dt className="whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                  Alamat
                </dt>
                <dd className="mt-2 text-gray-500 sm:mt-0 sm:text-right dark:text-gray-400">
                  {selectedPemeriksaan?.customer.alamat}
                </dd>
              </dl>
            </div>
          </div>
          <h4 className="mb-4 mt-5 text-lg font-semibold text-gray-900 dark:text-white">
            Jenis Layanan
          </h4>
          <div className="mb-5 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-gray-50 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
            {selectedPemeriksaan?.detail_pemeriksaan_lingkungan.map((dp) => (
              <div className="items-center space-y-4 p-4 sm:flex sm:gap-6 sm:space-y-0">
                <div className="w-full items-center space-y-4 sm:flex sm:space-x-6 sm:space-y-0 md:max-w-md lg:max-w-lg">
                  <div className="w-full md:max-w-sm lg:max-w-md">
                    {dp.jenis_layanan.nama}
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-8 shrink-0">
                    <p className="text-base font-normal text-gray-900 dark:text-white">
                      x1
                    </p>
                  </div>

                  <div className="md:w-24 md:text-right">
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {`Rp${dp.harga.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ringkasan Pembayaran
            </h4>
            <div className="space-y-4">
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-lg font-bold text-gray-900 dark:text-white">
                  Total
                </dt>
                <dd className="text-lg font-bold text-gray-900 dark:text-white">
                  {`Rp${selectedPemeriksaan?.total?.toLocaleString('id-ID')}`}
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4 items-center justify-end space-x-0 space-y-4 border-t border-gray-200 pt-4 sm:flex sm:space-x-4 sm:space-y-0 md:mt-5 md:pt-5 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setOpenModalBayar(false)}
              className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 sm:w-auto dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
            >
              Batal
            </button>
            <Button onClick={handleBayar} disabled={prosesBayar}>
              {prosesBayar ? 'Memproses...' : 'Bayar'}
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </LabkesdaLayout>
  );
}
