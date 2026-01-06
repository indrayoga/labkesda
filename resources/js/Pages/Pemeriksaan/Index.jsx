import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Link } from '@inertiajs/react';

export default function Index({ pemeriksaan }) {
  return (
    <LabkesdaLayout>
      <Head title="Pemeriksaan Pasien" />
      <div className="max-w-screen">
        <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800">
          <div className="flex flex-col space-y-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
            <div className="flex flex-1 items-center space-x-4">
              <h2>Daftar Pasien ({pemeriksaan.total} entri)</h2>
            </div>
            <div className="flex flex-shrink-0 flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0 lg:justify-end"></div>
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
                    No Register
                  </th>
                  <th scope="col" className="px-4 py-3">
                    ID Spesimen
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Nama
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
                    Pilihan
                  </th>
                </tr>
              </thead>
              <tbody>
                {pemeriksaan.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada data pemeriksaan.
                    </td>
                  </tr>
                ) : (
                  pemeriksaan.map((p) => (
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
                      <td className="text-nowrap px-4 py-2">{p.nama}</td>
                      <td className="text-nowrap px-4 py-2">
                        {p.jenis_kelamin}
                      </td>
                      <td className="text-nowrap px-4 py-2">
                        {p.tempat_lahir},{' '}
                        {new Date(p.tanggal_lahir).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-2">{p.no_telepon}</td>
                      <td className="px-4 py-2">
                        {p.alamat}, {p.kelurahan.nama}, {p.kecamatan.nama}
                      </td>
                      <td className="text-nowrap px-4 py-2">{p.pekerjaan}</td>
                      <td className="flex items-center gap-2 text-nowrap px-4 py-2">
                        <Link
                          href={route('pendaftaran-laboratorium', p.id)}
                          className="rounded bg-primary-600 px-3 py-1 text-white hover:bg-primary-700"
                        >
                          Daftarkan
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
              Menampilkan <span className="font-semibold">{pasien.from}</span>{' '}
              sampai <span className="font-semibold">{pasien.to}</span> dari
              total <span className="font-semibold">{pasien.total}</span> entri
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
    </LabkesdaLayout>
  );
}
