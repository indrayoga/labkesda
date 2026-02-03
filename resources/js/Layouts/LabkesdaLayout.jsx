import { Link, usePage } from '@inertiajs/react';
import {
  Drawer,
  DrawerHeader,
  DrawerItems,
  Sidebar,
  SidebarItemGroup,
  SidebarItems,
  TextInput,
} from 'flowbite-react';
import { useEffect, useState } from 'react';

export default function LabkesdaLayout({ header, children }) {
  const user = usePage().props.auth.user;
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleClose = () => setIsOpen(false);

  const [showingNavigationDropdown, setShowingNavigationDropdown] =
    useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      <div className="bg-gray-50 antialiased dark:bg-gray-800">
        <div className="fixed inset-0 z-40 hidden bg-gray-900/50 dark:bg-gray-900/80" />
        <header className="antialiased">
          <nav className="border-gray-200 bg-white px-4 py-2.5 dark:bg-gray-900 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start">
                <a href="/dashboard" className="mr-6 flex">
                  <img
                    src="/images/logo.png"
                    className="mr-3 h-8"
                    alt="Labkesda"
                  />
                  <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                    Labkesda
                  </span>
                </a>
              </div>
              <div className="flex items-center justify-between lg:order-2">
                <button
                  onClick={toggleDarkMode}
                  className="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  {user.name}
                </a>
                <div className="mx-2 h-4 w-px border dark:border-gray-700" />
                <Link
                  href={route('logout')}
                  as="button"
                  method="post"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Logout
                </Link>

                <button
                  type="button"
                  id="toggleMobileMenuButton"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="items-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600 md:ml-2 lg:hidden"
                >
                  <span className="sr-only">Open menu</span>
                  <svg
                    className="h-[18px] w-[18px]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 17 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M1 1h15M1 7h15M1 13h15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </nav>
          <nav
            id="toggleMobileMenu"
            className={`${mobileMenuOpen ? 'block' : 'hidden'} border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:block`}
          >
            <div className="px-0 lg:px-6">
              <div className="flex items-center">
                <ul className="mt-0 flex w-full flex-col text-sm font-medium lg:flex-row">
                  <li className="block border-b dark:border-gray-700 lg:inline lg:border-b-0">
                    <Link
                      href={route('dashboard')}
                      className={`block px-4 py-3 ${route().current('dashboard') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                      aria-current="page"
                    >
                      Beranda
                    </Link>
                  </li>
                  <li className="block border-b dark:border-gray-700 lg:inline lg:border-b-0">
                    <Link
                      href={route('lab.lingkungan.list-register')}
                      className={`block px-4 py-3 ${route().current('lab.lingkungan.list-register') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                      aria-current="page"
                    >
                      Lab Lingkungan
                    </Link>
                  </li>
                  <li className="block border-b dark:border-gray-700 lg:inline lg:border-b-0">
                    <Link
                      href={route('pasien.index')}
                      className={`block px-4 py-3 ${route().current('pasien.index') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Pasien
                    </Link>
                  </li>
                  <li className="block border-b dark:border-gray-700 lg:inline lg:border-b-0">
                    <Link
                      href={route('pendaftaran')}
                      className={`block px-4 py-3 ${route().current('pendaftaran') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Pendaftaran
                    </Link>
                  </li>
                  <li className="block border-b dark:border-gray-700 lg:inline lg:border-b-0">
                    <Link
                      href={route('pemeriksaan.index')}
                      className={`block px-4 py-3 ${route().current('pemeriksaan.index') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Pemeriksaan
                    </Link>
                  </li>
                  <li className="block border-b dark:border-gray-700 lg:inline lg:border-b-0">
                    <Link
                      href={route('pembayaran.index')}
                      className={`block px-4 py-3 ${route().current('pembayaran.index') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Pembayaran
                    </Link>
                  </li>
                  <li className="block border-b dark:border-gray-700 lg:inline lg:border-b-0">
                    <Link
                      href={route('pembayaran.kwitansi')}
                      className={`block px-4 py-3 ${route().current('pembayaran.kwitansi') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Kwitansi
                    </Link>
                  </li>
                  <li className="block border-b dark:border-gray-700 lg:inline lg:border-b-0">
                    <div
                      onClick={() => setIsOpen(true)}
                      className={`hand block cursor-pointer px-4 py-3 ${
                        route().current('master-data.*') ||
                        usePage().url.includes('master-data')
                          ? 'border-b-2 border-primary-600 text-primary-600'
                          : 'text-gray-500'
                      } hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Master Data
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <Drawer open={isOpen} onClose={handleClose}>
        <DrawerHeader title="MENU" titleIcon={() => <></>} />
        <DrawerItems>
          <Sidebar
            aria-label="Sidebar with multi-level dropdown example"
            className="[&>div]:bg-transparent [&>div]:p-0"
          >
            <div className="flex h-full flex-col justify-between py-2">
              <div>
                <form className="pb-3 md:hidden">
                  <TextInput
                    type="search"
                    placeholder="Search"
                    required
                    size={32}
                  />
                </form>
                <SidebarItems>
                  <SidebarItemGroup>
                    <li>
                      <Link
                        className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                        href={route('jenis-layanan.index')}
                      >
                        <span className="flex-1 whitespace-nowrap px-3">
                          Jenis Layanan
                        </span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                        href={route('customers.index')}
                      >
                        <span className="flex-1 whitespace-nowrap px-3">
                          Customer
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                        href={route('dokter.index')}
                      >
                        <span className="flex-1 whitespace-nowrap px-3">
                          Dokter
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                        href={route('item-pemeriksaan.index')}
                      >
                        <span className="flex-1 whitespace-nowrap px-3">
                          Item Pemeriksaan
                        </span>
                      </Link>
                    </li>
                  </SidebarItemGroup>
                </SidebarItems>
              </div>
            </div>
          </Sidebar>
        </DrawerItems>
      </Drawer>
    </>
  );
}
