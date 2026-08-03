import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  TabItem,
  Tabs,
  TextInput,
} from 'flowbite-react';
import { useState } from 'react';

export default function Index({
  tanggal_awal,
  tanggal_akhir,
  pemeriksaan,
  jenis_pembayaran,
}) {
  const { auth } = usePage().props;
  const [cariTanggalAwalDaftar, setCariTanggalAwalDaftar] = useState(
    tanggal_awal || '',
  );
  const [cariTanggalAkhirDaftar, setCariTanggalAkhirDaftar] = useState(
    tanggal_akhir || '',
  );
  const [openModalBayar, setOpenModalBayar] = useState(false);
  const [selectedPemeriksaan, setSelectedPemeriksaan] = useState(null);
  const [prosesBayar, setProsesBayar] = useState(false);
  const [jenisPembayaran, setJenisPembayaran] = useState('');

  // Detail modal
  const [openModalDetail, setOpenModalDetail] = useState(false);

  const confirmBayar = (pemeriksaan) => {
    setOpenModalBayar(true);
    setSelectedPemeriksaan(pemeriksaan);
  };

  const handleBayar = () => {
    setProsesBayar(true);
    router.post(
      route('pembayaran.store'),
      {
        pemeriksaan_id: selectedPemeriksaan.id,
        jenis_pembayaran_id: jenisPembayaran,
      },
      {
        onSuccess: () => {
          alert('Pembayaran berhasil.');
          setOpenModalBayar(false);
          setProsesBayar(false);
        },
        onError: () => {
          alert('Terjadi kesalahan saat memproses pembayaran.');
          setProsesBayar(false);
        },
      },
    );
  };

  const openDetail = (p) => {
    setSelectedPemeriksaan(p);
    setOpenModalDetail(true);
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

  const getOrderItems = (currentPemeriksaan) => {
    if (currentPemeriksaan?.layanan_order?.length) {
      return currentPemeriksaan.layanan_order.map((item) => ({
        nama: item.nama_snapshot,
        harga: item.harga,
      }));
    }

    return (
      currentPemeriksaan?.detail_pemeriksaan?.map((detail) => ({
        nama: detail.jenis_layanan.nama,
        harga: detail.harga,
      })) || []
    );
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
                value={cariTanggalAwalDaftar}
                onChange={(e) => setCariTanggalAwalDaftar(e.target.value)}
              />
              <TextInput
                type="date"
                className="min-w-[15rem]"
                value={cariTanggalAkhirDaftar}
                onChange={(e) => setCariTanggalAkhirDaftar(e.target.value)}
              />
              <Button
                onClick={() =>
                  router.get(
                    route('pembayaran.index', {
                      tanggal_awal: cariTanggalAwalDaftar,
                      tanggal_akhir: cariTanggalAkhirDaftar,
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
                className="flex flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
              >
                Lab Lingkungan
              </Link>
              <Link
                href={route('pembayaran.index')}
                className="flex flex-shrink-0 items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
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
        {/* Desktop view */}
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
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Pilihan
                  </th>
                </tr>
              </thead>
              <tbody>
                {pemeriksaan.data.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input
                          id="checkbox-table-search-1"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                        />
                        <label
                          htmlFor="checkbox-table-search-1"
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.tanggal_pendaftaran}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.no_registrasi}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.id_spesimen}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.pasien.nama}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.pasien.jenis_kelamin}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {hitungUmur(p.pasien.tanggal_lahir)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.pasien.no_telepon}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.dokter?.nama}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.jenis_pasien}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badgeStatusPeriksa(p.status_periksa)}`}
                      >
                        {p.status_periksa || 'Menunggu'}
                      </span>
                      {p.status_bayar && (
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badgeStatusBayar(p.status_bayar)}`}
                        >
                          {p.status_bayar}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {p.total?.toLocaleString('id-ID')}
                      </span>
                    </td>

                    <td className="relative z-20 flex items-center gap-1 overflow-visible text-nowrap px-4 py-2">
                      <button
                        onClick={() => openDetail(p)}
                        className="rounded-lg bg-gray-200 p-3 text-xs text-gray-800 hover:bg-gray-300"
                      >
                        Detail
                      </button>
                      <Button size="sm" onClick={() => confirmBayar(p)}>
                        Bayar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav
            className="flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0"
            aria-label="Table navigation"
          >
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              Showing
              <span className="font-semibold text-gray-900 dark:text-white">
                {pemeriksaan.from}-{pemeriksaan.to}
              </span>
              of
              <span className="font-semibold text-gray-900 dark:text-white">
                {pemeriksaan.total}
              </span>
            </span>
            <ul className="inline-flex items-stretch -space-x-px">
              {pemeriksaan.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url || '#'}
                    className={`flex h-full items-center justify-center border border-gray-300 bg-white px-3 py-2 text-sm leading-tight text-gray-500 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                      link.active
                        ? 'z-10 border-primary-300 bg-primary-50 text-primary-600'
                        : ''
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  ></Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Mobile view */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:hidden">
          {pemeriksaan.data.map((p) => (
            <div
              key={p.id}
              className="space-y-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {p.pasien.nama}
                </span>
                <div className="flex items-center space-x-2">
                  {badgeStatusPeriksa(p.status_periksa)}
                  {badgeStatusBayar(p.status_bayar)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-bold">No. Registrasi</div>
                  <div>{p.no_registrasi}</div>
                </div>
                <div>
                  <div className="font-bold">ID Spesimen</div>
                  <div>{p.id_spesimen}</div>
                </div>
                <div>
                  <div className="font-bold">Tanggal Daftar</div>
                  <div>{p.tanggal_pendaftaran}</div>
                </div>
                <div>
                  <div className="font-bold">Jenis Pasien</div>
                  <div>{p.jenis_pasien}</div>
                </div>
                <div>
                  <div className="font-bold">Dokter</div>
                  <div>{p.dokter?.nama}</div>
                </div>
              </div>
              <div>
                <div className="font-bold">Pemeriksaan</div>
                <div className="flex flex-wrap">
                  {p.layanan_order.length > 0
                    ? p.layanan_order.map((item, index) => (
                        <Badge
                          color="purple"
                          key={index}
                          className="mb-1 mr-1 w-fit"
                        >
                          {item.nama_snapshot}
                        </Badge>
                      ))
                    : p.detail_pemeriksaan.map((item, index) => (
                        <Badge
                          color="purple"
                          key={index}
                          className="mb-1 mr-1 w-fit"
                        >
                          {item.jenis_layanan.nama}
                        </Badge>
                      ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button color="primary" onClick={() => confirmBayar(p)}>
                  Bayar
                </Button>
                <Button color="info" onClick={() => openDetail(p)}>
                  Detail
                </Button>
              </div>
            </div>
          ))}
        </div>
        {/* Mobile pagination */}
        <div className="mt-4 flex justify-center md:hidden">
          <nav aria-label="Table navigation">
            <ul className="inline-flex items-stretch -space-x-px">
              {pemeriksaan.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url || '#'}
                    className={`flex h-full items-center justify-center border border-gray-300 bg-white px-3 py-2 text-sm leading-tight text-gray-500 first:rounded-l-lg last:rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                      link.active
                        ? 'z-10 border-primary-300 bg-primary-50 text-primary-600'
                        : ''
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  ></Link>
                </li>
              ))}
            </ul>
          </nav>
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
                <dd className="mt-2 text-gray-500 dark:text-gray-400 sm:mt-0 sm:text-right">
                  {selectedPemeriksaan?.tanggal_pendaftaran}
                </dd>
              </dl>

              <dl className="py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <dt className="whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                  Nama
                </dt>
                <dd className="mt-2 text-gray-500 dark:text-gray-400 sm:mt-0 sm:text-right">
                  {selectedPemeriksaan?.pasien.nama}
                </dd>
              </dl>

              <dl className="py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <dt className="whitespace-nowrap text-base font-semibold text-gray-900 dark:text-white">
                  Telp
                </dt>
                <dd className="mt-2 text-gray-500 dark:text-gray-400 sm:mt-0 sm:text-right">
                  {selectedPemeriksaan?.pasien.no_telepon}
                </dd>
              </dl>

              <dl className="py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <dt className="whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                  Jenis Pasien
                </dt>
                <dd className="mt-2 flex items-center gap-2 sm:mt-0 sm:justify-end">
                  {selectedPemeriksaan?.jenis_pasien}
                </dd>
              </dl>

              <dl className="pt-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <dt className="whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                  Alamat
                </dt>
                <dd className="mt-2 text-gray-500 dark:text-gray-400 sm:mt-0 sm:text-right">
                  {selectedPemeriksaan?.pasien.alamat}
                </dd>
              </dl>
            </div>
          </div>
          <h4 className="mb-4 mt-5 text-lg font-semibold text-gray-900 dark:text-white">
            Jenis Layanan
          </h4>
          <div className="mb-5 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-gray-50 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
            {getOrderItems(selectedPemeriksaan).map((item, index) => (
              <div
                key={`${item.nama}-${index}`}
                className="items-center space-y-4 p-4 sm:flex sm:gap-6 sm:space-y-0"
              >
                <div className="w-full items-center space-y-4 sm:flex sm:space-x-6 sm:space-y-0 md:max-w-md lg:max-w-lg">
                  <div className="w-full md:max-w-sm lg:max-w-md">
                    {item.nama}
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
                      {`Rp${item.harga.toLocaleString('id-ID')}`}
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
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-lg font-bold text-gray-900 dark:text-white">
                  Jenis Pembayaran
                </dt>
                <dd className="text-lg font-bold text-gray-900 dark:text-white">
                  <Select
                    onChange={(e) => setJenisPembayaran(e.target.value)}
                    value={jenisPembayaran}
                    name="jenis_pembayaran"
                    id="jenis_pembayaran"
                  >
                    <option value="">Pilih Jenis Pembayaran</option>
                    {jenis_pembayaran.map((jenis) => (
                      <option key={jenis.id} value={jenis.id}>
                        {jenis.nama}
                      </option>
                    ))}
                  </Select>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4 items-center justify-end space-x-0 space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex sm:space-x-4 sm:space-y-0 md:mt-5 md:pt-5">
            <button
              type="button"
              onClick={() => setOpenModalBayar(false)}
              className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto"
            >
              Batal
            </button>
            <Button onClick={handleBayar} disabled={prosesBayar}>
              {prosesBayar ? 'Memproses...' : 'Bayar'}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Detail Modal */}
      <Modal
        dismissible
        size="2xl"
        show={openModalDetail}
        onClose={() => setOpenModalDetail(false)}
      >
        <ModalHeader>Detail Pemeriksaan</ModalHeader>
        <ModalBody>
          {selectedPemeriksaan && (
            <Tabs>
              <TabItem title="Data Pasien">
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    No. RM
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {selectedPemeriksaan.pasien.no_rm || '-'}
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
                    {selectedPemeriksaan.pasien.jenis_kelamin}
                  </dd>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    Tanggal Lahir
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {selectedPemeriksaan.pasien.tanggal_lahir
                      ? new Date(
                          selectedPemeriksaan.pasien.tanggal_lahir,
                        ).toLocaleDateString('id-ID')
                      : '-'}
                  </dd>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    Umur
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {hitungUmur(selectedPemeriksaan.pasien.tanggal_lahir)}
                  </dd>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    No. Telepon
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {selectedPemeriksaan.pasien.no_telepon || '-'}
                  </dd>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    Alamat
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {selectedPemeriksaan.pasien.alamat || '-'}
                  </dd>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    Pekerjaan
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {selectedPemeriksaan.pasien.pekerjaan || '-'}
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
                      {selectedPemeriksaan.status_periksa || 'Menunggu'}
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
                        {selectedPemeriksaan.status_bayar}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </dd>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">
                    Tanggal Sampling
                  </dt>
                  <dd className="text-gray-900 dark:text-white">
                    {selectedPemeriksaan.tanggal_sampling
                      ? new Date(
                          selectedPemeriksaan.tanggal_sampling,
                        ).toLocaleDateString('id-ID') +
                        (selectedPemeriksaan.jam_sampling
                          ? ' ' + selectedPemeriksaan.jam_sampling
                          : '')
                      : '-'}
                  </dd>
                </dl>
              </TabItem>
              <TabItem title="Item Pemeriksaan">
                {selectedPemeriksaan.detail_pemeriksaan.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tidak ada item pemeriksaan.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {selectedPemeriksaan.detail_pemeriksaan.map((dp) => (
                      <li
                        key={dp.id}
                        className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-sm dark:border-gray-600"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {dp.jenis_layanan.nama}
                        </span>
                        {dp.harga != null && (
                          <span className="text-gray-500 dark:text-gray-400">
                            Rp {Number(dp.harga).toLocaleString('id-ID')}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </TabItem>
            </Tabs>
          )}
        </ModalBody>
      </Modal>
    </LabkesdaLayout>
  );
}
