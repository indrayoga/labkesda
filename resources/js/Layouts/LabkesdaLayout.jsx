import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function LabkesdaLayout({ header, children }) {
  const user = usePage().props.auth.user;

  const [showingNavigationDropdown, setShowingNavigationDropdown] =
    useState(false);

  return (
    <div className="bg-white antialiased dark:bg-gray-800">
      <header>
        <nav className="border-gray-200 bg-white px-4 py-3 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <a href="https://flowbite.com" className="mr-6 flex">
                <img
                  src="https://flowbite.s3.amazonaws.com/logo.svg"
                  className="mr-3 h-8"
                  alt="Flowbite Logo"
                />
                <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
                  Flowbite
                </span>
              </a>
            </div>
            <div className="flex items-center justify-between space-x-4 text-sm lg:order-2">
              <a
                href="#"
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                My profile
              </a>
              <div className="mx-2 h-4 w-px border dark:border-gray-700" />
              <a
                href="#"
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                Logout
              </a>
            </div>
          </div>
        </nav>

        <nav
          id="toggleMobileMenu"
          className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-700"
        >
          <div className="px-4 py-2">
            <div className="flex items-center">
              <ul className="flex items-center text-sm font-medium text-gray-600">
                <li className="block lg:inline">
                  <a
                    href="#"
                    className="inline-block rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                  >
                    Overview
                  </a>
                </li>
                <li className="block lg:inline">
                  <a
                    href="#"
                    className="inline-block rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                  >
                    Sales
                  </a>
                </li>
                <li className="block lg:inline">
                  <a
                    href="#"
                    className="inline-block rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                  >
                    Billing
                  </a>
                </li>
                <li className="hidden md:block lg:inline">
                  <a
                    href="#"
                    className="inline-block rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                  >
                    Team
                  </a>
                </li>
                <li className="hidden md:block lg:inline">
                  <a
                    href="#"
                    className="inline-block rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                  >
                    Resources
                  </a>
                </li>
                <li className="hidden md:block lg:inline">
                  <a
                    href="#"
                    className="inline-block rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                  >
                    Messages
                  </a>
                </li>
                <li className="hidden md:block lg:inline">
                  <a
                    href="#"
                    className="inline-block rounded-lg px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                  >
                    Support
                  </a>
                </li>
                <li className="block md:hidden">
                  <button
                    id="navigationDropdownButton"
                    aria-expanded="false"
                    data-dropdown-toggle="navigationDropdown"
                    className="inline-flex items-center justify-center rounded-xl px-2 py-2 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>

                  <div
                    className="z-50 my-4 hidden w-56 list-none divide-y divide-gray-100 rounded-xl bg-white text-base shadow dark:divide-gray-600 dark:bg-gray-700"
                    id="navigationDropdown"
                  >
                    <ul
                      className="py-1 text-gray-700 dark:text-gray-300"
                      aria-labelledby="navigationDropdownButton"
                    >
                      <li>
                        <a
                          href="#"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Overview
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Sales
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Billing
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Team
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Resources
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Messages
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Support
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1 space-y-4 p-4">{children}</main>
    </div>
  );
}
