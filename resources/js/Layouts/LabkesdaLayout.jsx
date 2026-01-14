import { Link, usePage } from '@inertiajs/react';
import {
  Drawer,
  DrawerHeader,
  DrawerItems,
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  TextInput,
} from 'flowbite-react';
import { useState } from 'react';

export default function LabkesdaLayout({ header, children }) {
  const user = usePage().props.auth.user;
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => setIsOpen(false);

  const [showingNavigationDropdown, setShowingNavigationDropdown] =
    useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-gray-50 antialiased dark:bg-gray-800">
        <div className="fixed inset-0 z-40 hidden bg-gray-900/50 dark:bg-gray-900/80" />
        <header className="antialiased">
          <nav className="border-gray-200 bg-white px-4 py-2.5 lg:px-6 dark:bg-gray-900">
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
                  className="items-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-300 md:ml-2 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600"
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
            className={`${mobileMenuOpen ? 'block' : 'hidden'} border-b border-gray-200 bg-white shadow-sm lg:block dark:border-gray-800 dark:bg-gray-900`}
          >
            <div className="px-0 lg:px-6">
              <div className="flex items-center">
                <ul className="mt-0 flex w-full flex-col text-sm font-medium lg:flex-row">
                  <li className="block border-b lg:inline lg:border-b-0 dark:border-gray-700">
                    <Link
                      href={route('dashboard')}
                      className={`block px-4 py-3 ${route().current('dashboard') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                      aria-current="page"
                    >
                      Beranda
                    </Link>
                  </li>
                  <li className="block border-b lg:inline lg:border-b-0 dark:border-gray-700">
                    <Link
                      href={route('lab.lingkungan.list-register')}
                      className={`block px-4 py-3 ${route().current('lab.lingkungan.list-register') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                      aria-current="page"
                    >
                      Lab Lingkungan
                    </Link>
                  </li>
                  <li className="block border-b lg:inline lg:border-b-0 dark:border-gray-700">
                    <Link
                      href={route('pasien.index')}
                      className={`block px-4 py-3 ${route().current('pasien.index') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Pasien
                    </Link>
                  </li>
                  <li className="block border-b lg:inline lg:border-b-0 dark:border-gray-700">
                    <Link
                      href={route('pendaftaran')}
                      className={`block px-4 py-3 ${route().current('pendaftaran') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Pendaftaran
                    </Link>
                  </li>
                  <li className="block border-b lg:inline lg:border-b-0 dark:border-gray-700">
                    <Link
                      href={route('pemeriksaan.index')}
                      className={`block px-4 py-3 ${route().current('pemeriksaan.index') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Pemeriksaan
                    </Link>
                  </li>
                  <li className="block border-b lg:inline lg:border-b-0 dark:border-gray-700">
                    <Link
                      href={route('pembayaran.index')}
                      className={`block px-4 py-3 ${route().current('pembayaran.index') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Pembayaran
                    </Link>
                  </li>
                  <li className="block border-b lg:inline lg:border-b-0 dark:border-gray-700">
                    <Link
                      href={route('pembayaran.kwitansi')}
                      className={`block px-4 py-3 ${route().current('pembayaran.kwitansi') ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'} hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
                    >
                      Kwitansi
                    </Link>
                  </li>
                  <li className="block border-b lg:inline lg:border-b-0 dark:border-gray-700">
                    <div
                      onClick={() => setIsOpen(true)}
                      className={`block px-4 py-3 text-gray-500 hover:text-primary-600 dark:border-primary-500 dark:text-primary-500`}
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
                    <SidebarItem href="/">Dashboard</SidebarItem>
                    <SidebarItem href="/e-commerce/products">
                      Products
                    </SidebarItem>
                    <SidebarItem href="/users/list">Users list</SidebarItem>
                    <SidebarItem href="/authentication/sign-in">
                      Sign in
                    </SidebarItem>
                    <SidebarItem href="/authentication/sign-up">
                      Sign up
                    </SidebarItem>
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
