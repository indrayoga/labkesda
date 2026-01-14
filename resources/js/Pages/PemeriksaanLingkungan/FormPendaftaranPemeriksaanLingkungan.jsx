import InputError from '@/Components/InputError';
import { Combobox } from '@headlessui/react';
import clsx from 'clsx';
import { Label, TextInput } from 'flowbite-react';

export default function FormPendaftaranPemeriksaanLingkungan({
  data,
  setData,
  errors,
  selectedCustomer,
  setCustomerQuery,
  filteredCustomers,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <Label
          htmlFor="tanggal_pendaftaran"
          color={errors.tanggal_pendaftaran ? 'failure' : 'gray'}
        >
          {' '}
          Tanggal Pendaftaran
        </Label>
        <TextInput
          type="date"
          className={clsx(
            'mt-1 block w-full',
            errors.tanggal_pendaftaran && 'border-red-500',
          )}
          value={data.tanggal_pendaftaran}
          onChange={(e) => setData('tanggal_pendaftaran', e.target.value)}
        />
        <InputError className="mt-2" message={errors.tanggal_pendaftaran} />
      </div>

      <div className="md:col-span-2">
        <Label
          htmlFor="customer_id"
          color={errors.customer_id ? 'failure' : 'gray'}
        >
          Pengirim (Asal Contoh Uji)
        </Label>
        <Combobox
          value={selectedCustomer}
          onChange={(customer) => setData('customer_id', customer?.id || '')}
        >
          <div className="relative mt-1">
            <Combobox.Input
              className={clsx(
                'block w-full rounded-md border-gray-300 pr-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
                errors.customer_id && 'border-red-500',
              )}
              displayValue={(customer) => customer?.nama || ''}
              placeholder="Cari customer (nama / telepon / alamat)"
              onChange={(event) => setCustomerQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <svg
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </Combobox.Button>

            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-900">
              {filteredCustomers.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  Customer tidak ditemukan.
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <Combobox.Option
                    key={customer.id}
                    value={customer}
                    className={({ active }) =>
                      clsx(
                        'cursor-pointer select-none px-3 py-2',
                        active
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-900 dark:text-gray-100',
                      )
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {customer.nama}
                        </div>
                        <div className="truncate text-xs opacity-80">
                          {customer.no_telepon || '-'}
                          {customer.alamat ? ` • ${customer.alamat}` : ''}
                        </div>
                      </div>
                    </div>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </div>
        </Combobox>
        <InputError className="mt-2" message={errors.customer_id} />
      </div>

      <div>
        <Label
          htmlFor="tanggal_diambil"
          color={errors.tanggal_diambil ? 'failure' : 'gray'}
        >
          Tanggal Diambil
        </Label>
        <TextInput
          type="date"
          className={clsx(
            'mt-1 block w-full',
            errors.tanggal_diambil && 'border-red-500',
          )}
          value={data.tanggal_diambil}
          onChange={(e) => setData('tanggal_diambil', e.target.value)}
        />
        <InputError className="mt-2" message={errors.tanggal_diambil} />
      </div>

      <div>
        <Label
          htmlFor="tanggal_diterima"
          color={errors.tanggal_diterima ? 'failure' : 'gray'}
        >
          Tanggal Diterima
        </Label>
        <TextInput
          type="date"
          className={clsx(
            'mt-1 block w-full',
            errors.tanggal_diterima && 'border-red-500',
          )}
          value={data.tanggal_diterima}
          onChange={(e) => setData('tanggal_diterima', e.target.value)}
        />
        <InputError className="mt-2" message={errors.tanggal_diterima} />
      </div>

      <div>
        <Label
          htmlFor="jumlah_contoh_uji"
          color={errors.jumlah_contoh_uji ? 'failure' : 'gray'}
        >
          Jumlah Contoh Uji
        </Label>
        <TextInput
          type="text"
          inputMode="numeric"
          className={clsx(
            'mt-1 block w-full',
            errors.jumlah_contoh_uji && 'border-red-500',
          )}
          value={data.jumlah_contoh_uji}
          onChange={(e) => setData('jumlah_contoh_uji', e.target.value)}
          placeholder="Contoh: 3"
        />
        <InputError className="mt-2" message={errors.jumlah_contoh_uji} />
      </div>

      <div>
        <Label
          htmlFor="pengambil_contoh_uji"
          color={errors.pengambil_contoh_uji ? 'failure' : 'gray'}
        >
          Pengambil Contoh Uji
        </Label>
        <TextInput
          type="text"
          className={clsx(
            'mt-1 block w-full',
            errors.pengambil_contoh_uji && 'border-red-500',
          )}
          value={data.pengambil_contoh_uji}
          onChange={(e) => setData('pengambil_contoh_uji', e.target.value)}
          placeholder="Nama petugas"
        />
        <InputError className="mt-2" message={errors.pengambil_contoh_uji} />
      </div>

      <div>
        <Label
          htmlFor="wadah_contoh_uji"
          color={errors.wadah_contoh_uji ? 'failure' : 'gray'}
        >
          Wadah Contoh Uji
        </Label>
        <select
          className={clsx(
            'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
            errors.wadah_contoh_uji && 'border-red-500',
          )}
          value={data.wadah_contoh_uji}
          onChange={(e) => setData('wadah_contoh_uji', e.target.value)}
        >
          <option value="steril">Steril</option>
          <option value="non-steril">Non-steril</option>
        </select>
        <InputError className="mt-2" message={errors.wadah_contoh_uji} />
      </div>

      <div>
        <Label
          htmlFor="jenis_bayar"
          color={errors.jenis_bayar ? 'failure' : 'gray'}
        >
          Jenis Bayar
        </Label>
        <select
          className={clsx(
            'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600',
            errors.jenis_bayar && 'border-red-500',
          )}
          value={data.jenis_bayar}
          onChange={(e) => setData('jenis_bayar', e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="tagihan">Tagihan</option>
        </select>
        <InputError className="mt-2" message={errors.jenis_bayar} />
      </div>
    </div>
  );
}
