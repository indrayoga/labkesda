import Navbar from '@/Layouts/Navbar';
import { Head } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
  const handleImageError = () => {
    document.getElementById('screenshot-container')?.classList.add('!hidden');
    document.getElementById('docs-card')?.classList.add('!row-span-1');
    document.getElementById('docs-card-content')?.classList.add('!flex-row');
    document.getElementById('background')?.classList.add('!hidden');
  };

  return (
    <>
      <Head title="Welcome" />
      <Navbar />
      <section className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-screen-xl px-4 py-8 lg:py-16">
          <div className="mb-8 grid items-center gap-8 lg:mb-16 lg:grid-cols-12 lg:gap-12">
            <div className="col-span-6 text-center sm:mb-6 lg:mb-0 lg:text-left">
              <a
                href="#"
                className="mb-6 inline-flex items-center justify-between rounded-full bg-gray-100 px-1 py-1 pr-4 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                role="alert"
              >
                <span className="bg-primary-600 mr-3 rounded-full px-3 py-1 text-xs text-white">
                  Info
                </span>{' '}
                <span className="text-sm font-medium">
                  Sistem Informasi Lab Kesehatan Daerah Balikpapan
                </span>
                <svg
                  className="ml-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl xl:text-6xl dark:text-white">
                Laboratorium Kesehatan Daerah Kota Balikpapan
              </h1>
              <p className="mx-auto mb-6 max-w-xl font-light text-gray-500 md:text-lg lg:mx-0 xl:mb-8 xl:text-xl dark:text-gray-400">
                Sistem informasi manajemen pemeriksaan laboratorium yang modern,
                akurat, dan terpercaya untuk mendukung pelayanan kesehatan
                masyarakat Kota Balikpapan.
              </p>
              <form className="mx-auto max-w-lg lg:ml-0" action="#">
                <label
                  htmlFor="default-search"
                  className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Cari
                </label>
                <div className="relative">
                  <input
                    type="search"
                    id="default-search"
                    className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="Cari Hasil Lab, Pasien, Sampel..."
                    required
                  />
                  <button
                    type="submit"
                    className="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 absolute bottom-2.5 right-2.5 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-4"
                  >
                    <svg
                      className="-ml-1 mr-2 h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cari
                  </button>
                </div>
              </form>
            </div>
            <div className="col-span-6">
              <img
                src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/search-mockup.png"
                className="dark:hidden"
                alt="Lab Kesehatan Dashboard"
              />
              <img
                src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/search-mockup-dark.png"
                className="hidden dark:block"
                alt="Lab Kesehatan Dashboard Dark"
              />
            </div>
          </div>
          <div className="grid gap-8 sm:gap-12 md:grid-cols-3">
            <div className="flex justify-center">
              <svg
                className="text-primary-600 dark:text-primary-500 mr-3 h-6 w-6 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="mb-1 text-lg font-semibold leading-tight text-gray-900 dark:text-white">
                  Pemeriksaan Komprehensif
                </h3>
                <p className="font-light text-gray-500 dark:text-gray-400">
                  Layanan pemeriksaan laboratorium lengkap meliputi kimia
                  klinik, hematologi, mikrobiologi, dan patologi klinik.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <svg
                className="text-primary-600 dark:text-primary-500 mr-3 h-6 w-6 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="mb-1 text-lg font-semibold leading-tight text-gray-900 dark:text-white">
                  Data Aman & Terenkripsi
                </h3>
                <p className="font-light text-gray-500 dark:text-gray-400">
                  Keamanan data pasien terjamin dengan sistem enkripsi dan akses
                  terbatas sesuai regulasi kesehatan.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <svg
                className="text-primary-600 dark:text-primary-500 mr-3 h-6 w-6 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="mb-1 text-lg font-semibold leading-tight text-gray-900 dark:text-white">
                  Tracking & Monitoring Real-time
                </h3>
                <p className="font-light text-gray-500 dark:text-gray-400">
                  Pantau status sampel dan hasil pemeriksaan secara real-time
                  dengan laporan yang terintegrasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
