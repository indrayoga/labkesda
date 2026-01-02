import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head } from '@inertiajs/react';

export default function Beranda() {
  return (
    <LabkesdaLayout>
      <Head title="Dashboard" />
      <section className='space-y-4 p-4'>
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-3 lg:gap-4">
        <div className="col-span-1 mb-4 grid gap-4 lg:mb-0">
          {/* Total Pasien Hari Ini */}
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border-2 border-blue-200 bg-blue-50 lg:h-48 dark:border-blue-600 dark:bg-blue-900">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Pasien Hari Ini
            </h3>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              47
            </p>
          </div>

          {/* Pemeriksaan Menunggu */}
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border-2 border-yellow-200 bg-yellow-50 lg:h-48 dark:border-yellow-600 dark:bg-yellow-900">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Menunggu Pemeriksaan
            </h3>
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
              12
            </p>
          </div>

          {/* Hasil Siap */}
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border-2 border-green-200 bg-green-50 lg:h-48 dark:border-green-600 dark:bg-green-900">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Hasil Siap Diambil
            </h3>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              8
            </p>
          </div>

          {/* Total Lab Aktif */}
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border-2 border-purple-200 bg-purple-50 lg:h-48 dark:border-purple-600 dark:bg-purple-900">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Laboratorium Aktif
            </h3>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              3
            </p>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-4">
          {/* Daftar Pasien Terbaru */}
          <div className="flex h-32 flex-col rounded-xl border-2 border-gray-200 bg-white p-4 lg:h-64 dark:border-gray-600 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-200">
              Pasien Terbaru
            </h3>
            <div className="space-y-2 overflow-auto">
              <div className="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-700">
                <div>
                  <span className="font-semibold">Budi Santoso</span> -
                  Hematologi
                </div>
                <span className="text-sm text-gray-500">08:30</span>
              </div>
              <div className="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-700">
                <div>
                  <span className="font-semibold">Siti Aminah</span> - Kimia
                  Darah
                </div>
                <span className="text-sm text-gray-500">09:15</span>
              </div>
              <div className="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-700">
                <div>
                  <span className="font-semibold">Ahmad Yani</span> - Urinalisis
                </div>
                <span className="text-sm text-gray-500">10:00</span>
              </div>
            </div>
          </div>

          {/* Pemeriksaan Populer */}
          <div className="flex h-32 flex-col rounded-xl border-2 border-gray-200 bg-white p-4 lg:h-64 dark:border-gray-600 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-200">
              Pemeriksaan Populer Bulan Ini
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Hematologi Lengkap</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  156
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Kimia Darah</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  132
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Urinalisis</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  98
                </span>
              </div>
            </div>
          </div>

          {/* Jadwal Laboratorium */}
          <div className="flex h-32 flex-col rounded-xl border-2 border-gray-200 bg-white p-4 lg:h-64 dark:border-gray-600 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-200">
              Jadwal Operasional
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Lab Hematologi</span>
                <span className="text-sm text-green-600">
                  ● Buka - 07:00-15:00
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Lab Kimia Klinik</span>
                <span className="text-sm text-green-600">
                  ● Buka - 07:00-15:00
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Lab Mikrobiologi</span>
                <span className="text-sm text-green-600">
                  ● Buka - 08:00-14:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Grafik Kunjungan Mingguan */}
        <div className="flex h-32 w-full flex-1 flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-4 lg:h-64 dark:border-gray-600 dark:bg-gray-800">
          <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-gray-200">
            Grafik Kunjungan Pasien (7 Hari Terakhir)
          </h3>
          <p className="text-sm text-gray-500">
            Sen: 45 | Sel: 52 | Rab: 48 | Kam: 61 | Jum: 47 | Sab: 38 | Min: 12
          </p>
        </div>

        {/* Statistik Bulanan */}
        <div className="flex h-32 w-full flex-1 flex-col rounded-xl border-2 border-gray-200 bg-white p-4 lg:h-64 dark:border-gray-600 dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-200">
            Statistik Bulan Ini - Labkesda Kota Balikpapan
          </h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">1,247</p>
              <p className="text-sm text-gray-600">Total Pasien</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">2,154</p>
              <p className="text-sm text-gray-600">Total Pemeriksaan</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">1,892</p>
              <p className="text-sm text-gray-600">Hasil Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">95%</p>
              <p className="text-sm text-gray-600">Tingkat Kepuasan</p>
            </div>
          </div>
        </div>
      </div>
      </section>
    </LabkesdaLayout>
  );
}
