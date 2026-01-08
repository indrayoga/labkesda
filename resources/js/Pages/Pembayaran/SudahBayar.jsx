import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button, TextInput } from 'flowbite-react';
import { useState } from 'react';

export default function SudahBayar({ tanggal, pembayaran }) {
  const [cariTanggalDaftar, setCariTanggalDaftar] = useState(tanggal || '');

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
      <Head title="Kwitansi" />
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
                    route('pembayaran.kwitansi', {
                      tanggal: cariTanggalDaftar,
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
                    Tanggal Bayar
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
                    Pemeriksaan
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pembayaran
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pilihan
                  </th>
                </tr>
              </thead>
              <tbody>
                {pembayaran.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data.
                    </td>
                  </tr>
                ) : (
                  pembayaran.data.map((p) => (
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
                        {new Date(p.tanggal_bayar).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.pemeriksaan.no_registrasi}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.pemeriksaan.id_spesimen}
                      </td>
                      <td className="text-nowrap px-4 py-2">{p.pasien.nama}</td>
                      <td className="text-nowrap px-4 py-2">
                        {p.pasien.jenis_kelamin}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {hitungUmur(p.pasien.tanggal_lahir)}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.pasien.no_telepon}
                      </td>
                      <td className="px-4 py-2">{p.dokter.nama}</td>
                      <td className="px-4 py-2">
                        {p.pemeriksaan.detail_pemeriksaan
                          .map((dp) => dp.jenis_layanan.nama)
                          .join(', ')}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                        {p.jumlah_bayar.toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        })}
                      </td>
                      <td className="flex items-center gap-2 text-nowrap px-4 py-2">
                        <a
                          href={route('pembayaran.kwitansi.cetak', p.id)}
                          className="text-primary-600 no-underline hover:underline dark:text-primary-500"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Cetak
                        </a>
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
              <span className="font-semibold">{pembayaran.from}</span> sampai{' '}
              <span className="font-semibold">{pembayaran.to}</span> dari total{' '}
              <span className="font-semibold">{pembayaran.total}</span> entri
            </span>
            <div className="xs:mt-0 mt-2 inline-flex">
              {pembayaran.links.map((link, index) => (
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
    </LabkesdaLayout>
  );
}
