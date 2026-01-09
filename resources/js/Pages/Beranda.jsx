import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Beranda({
  pasien_hari_ini,
  menunggu_pemeriksaan,
  selesai_pemeriksaan,
}) {
  const [pasienTerbaru, setPasienTerbaru] = useState([]);
  const [pemeriksaanTerbanyak, setPemeriksaanTerbanyak] = useState([]);
  const [kunjunganMingguan, setKunjunganMingguan] = useState([]);
  const [statistikBulanan, setStatistikBulanan] = useState({});
  const [isLoadingPasienTerbaru, setIsLoadingPasienTerbaru] = useState(true);
  const [isLoadingPemeriksaanTerbanyak, setIsLoadingPemeriksaanTerbanyak] =
    useState(true);
  const [isLoadingKunjunganMingguan, setIsLoadingKunjunganMingguan] =
    useState(true);
  const [isLoadingStatistikBulanan, setIsLoadingStatistikBulanan] =
    useState(true);

  useEffect(() => {
    const fetchPasienTerbaru = async () => {
      try {
        const response = await axios.get(route('beranda.pasien-terbaru'));
        setPasienTerbaru(response.data.data);
      } catch (error) {
        console.error('Error fetching pasien terbaru');
      } finally {
        setIsLoadingPasienTerbaru(false);
      }
    };

    const fetchPemeriksaanTerbanyak = async () => {
      try {
        const response = await axios.get(
          route('beranda.pemeriksaan-terbanyak'),
        );
        setPemeriksaanTerbanyak(response.data.data);
      } catch (error) {
        console.error('Error fetching pemeriksaan terbanyak');
      } finally {
        setIsLoadingPemeriksaanTerbanyak(false);
      }
    };

    const fetchKunjunganMingguan = async () => {
      try {
        const response = await axios.get(
          route('beranda.kunjungan-pasien-mingguan'),
        );
        setKunjunganMingguan(response.data.data);
      } catch (error) {
        console.error('Error fetching kunjungan mingguan');
      } finally {
        setIsLoadingKunjunganMingguan(false);
      }
    };

    const fetchStatistikBulanan = async () => {
      try {
        const response = await axios.get(route('beranda.statistik-bulan-ini'));
        setStatistikBulanan(response.data.data);
      } catch (error) {
        console.error('Error fetching statistik bulanan');
      } finally {
        setIsLoadingStatistikBulanan(false);
      }
    };

    fetchPasienTerbaru();
    fetchPemeriksaanTerbanyak();
    fetchKunjunganMingguan();
    fetchStatistikBulanan();

    const intervalId = setInterval(() => {
      fetchPasienTerbaru();
      fetchPemeriksaanTerbanyak();
      fetchKunjunganMingguan();
      fetchStatistikBulanan();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const getInitials = (name = '') => {
    const cleaned = String(name).trim();
    if (!cleaned) return '-';
    return cleaned
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase();
  };

  const maxTotalLayanan = Math.max(
    0,
    ...pemeriksaanTerbanyak.map((item) => Number(item?.total) || 0),
  );
  const maxKunjungan = Math.max(
    0,
    ...kunjunganMingguan.map((k) => Number(k?.jumlah_kunjungan) || 0),
  );
  const totalKunjungan7Hari = kunjunganMingguan.reduce(
    (acc, k) => acc + (Number(k?.jumlah_kunjungan) || 0),
    0,
  );

  return (
    <LabkesdaLayout>
      <Head title="Dashboard" />
      <section className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Labkesda Kota Balikpapan
            </p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Auto refresh setiap 1 menit
          </p>
        </div>

        {/* Ringkasan Hari Ini */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Pasien hari ini
              </p>
              <span className="h-2 w-2 rounded-full bg-blue-600/80 dark:bg-blue-400/80" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {pasien_hari_ini}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Total registrasi hari ini
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Menunggu pemeriksaan
              </p>
              <span className="h-2 w-2 rounded-full bg-blue-600/80 dark:bg-blue-400/80" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {menunggu_pemeriksaan}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Antrian yang belum diproses
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Hasil siap diambil
              </p>
              <span className="h-2 w-2 rounded-full bg-blue-600/80 dark:bg-blue-400/80" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {selesai_pemeriksaan}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Pemeriksaan selesai hari ini
            </p>
          </div>
        </div>

        {/* Statistik Bulanan */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Statistik bulan ini
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Ringkasan
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pasien baru terdaftar
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {isLoadingStatistikBulanan
                  ? '—'
                  : statistikBulanan.total_pasien_baru || 0}
              </p>
            </div>
            <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total registrasi
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {isLoadingStatistikBulanan
                  ? '—'
                  : statistikBulanan.total_registrasi || 0}
              </p>
            </div>
            <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total pemeriksaan
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {isLoadingStatistikBulanan
                  ? '—'
                  : statistikBulanan.total_pemeriksaan || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Pasien Terbaru & Layanan Populer */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Pasien terbaru
              </h2>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {isLoadingPasienTerbaru
                  ? 'Memuat…'
                  : `${pasienTerbaru.length} data`}
              </span>
            </div>

            <div className="mt-4 max-h-80 space-y-2 overflow-auto">
              {isLoadingPasienTerbaru ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Memuat data…
                  </p>
                </div>
              ) : pasienTerbaru.length === 0 ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Belum ada data.
                  </p>
                </div>
              ) : (
                pasienTerbaru.map((p) => {
                  const layanan =
                    p?.detail_pemeriksaan
                      ?.map((dp) => dp?.jenis_layanan?.nama)
                      ?.filter(Boolean)
                      ?.join(', ') || '-';

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                          {getInitials(p?.pasien?.nama)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {p?.pasien?.nama || '-'}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {layanan}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                          {p?.jam_pendaftaran || '-'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Layanan populer
              </h2>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {isLoadingPemeriksaanTerbanyak
                  ? 'Memuat…'
                  : `${pemeriksaanTerbanyak.length} layanan`}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {isLoadingPemeriksaanTerbanyak ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Memuat data…
                  </p>
                </div>
              ) : pemeriksaanTerbanyak.length === 0 ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Belum ada data.
                  </p>
                </div>
              ) : (
                pemeriksaanTerbanyak.map((item, index) => {
                  const total = Number(item?.total) || 0;
                  const percentage =
                    maxTotalLayanan > 0 ? (total / maxTotalLayanan) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="w-6 text-xs font-semibold text-gray-400 dark:text-gray-500">
                            {index + 1}
                          </span>
                          <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item?.nama || '-'}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {total}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className="h-1.5 rounded-full bg-blue-600 dark:bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Kunjungan Mingguan */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Kunjungan 7 hari terakhir
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {isLoadingKunjunganMingguan
                ? 'Memuat…'
                : `Total: ${totalKunjungan7Hari}`}
            </span>
          </div>

          <div className="mt-4">
            {isLoadingKunjunganMingguan ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Memuat data…
                </p>
              </div>
            ) : kunjunganMingguan.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Belum ada data.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {kunjunganMingguan.map((item, index) => {
                  const value = Number(item?.jumlah_kunjungan) || 0;
                  const percentage =
                    maxKunjungan > 0 ? (value / maxKunjungan) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 items-center gap-3"
                    >
                      <span className="col-span-3 text-xs text-gray-600 sm:col-span-2 dark:text-gray-400">
                        {item?.tanggal || '-'}
                      </span>
                      <div className="col-span-7 sm:col-span-9">
                        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-blue-600 dark:bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="col-span-2 text-right text-xs font-semibold text-gray-900 sm:col-span-1 dark:text-gray-100">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </LabkesdaLayout>
  );
}
