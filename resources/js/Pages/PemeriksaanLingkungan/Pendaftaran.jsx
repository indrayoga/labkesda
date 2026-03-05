import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from 'flowbite-react';
import { useMemo, useState } from 'react';
import FormPendaftaranPemeriksaanLingkungan from './FormPendaftaranPemeriksaanLingkungan';
import FormTablePemeriksaanLingkungan from './FormTablePemeriksaanLingkungan';

function createEmptyDetailRow() {
  return {
    paket_pemeriksaan_id: '',
    jenis_layanan_id: '',
    jenis_contoh_uji: '',
    harga: '',
    no_lab_contoh_uji: '',
    jam_pengambilan_contoh_uji: '',
    parameter: '',
    uraian: '',
  };
}

export default function Pendaftaran({ customers = [], paketPemeriksaan }) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, setData, post, processing, errors } = useForm({
    tanggal_pendaftaran: today,
    customer_id: '',
    tanggal_diambil: '',
    tanggal_diterima: '',
    jumlah_contoh_uji: '',
    pengambil_contoh_uji: '',
    wadah_contoh_uji: 'steril',
    jenis_bayar: 'cash',
    paket_pemeriksaan_lingkungan: [createEmptyDetailRow()],
  });

  const [customerQuery, setCustomerQuery] = useState('');
  const selectedCustomer = useMemo(() => {
    if (!data.customer_id) return null;
    return customers.find((c) => c.id === data.customer_id) || null;
  }, [customers, data.customer_id]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const haystack = `${c.nama || ''} ${c.no_telepon || ''} ${c.alamat || ''}`
        .trim()
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, customerQuery]);

  const submit = (e) => {
    e.preventDefault();
    post(route('lab.lingkungan.pendaftaran.store'), {
      onSuccess: () => {
        alert('Pendaftaran pemeriksaan lingkungan berhasil disimpan.');
      },
      onError: () => {
        alert('Terjadi kesalahan saat menyimpan pendaftaran.');
      },
    });
  };

  const detailRows = data.paket_pemeriksaan_lingkungan || [];

  const updateDetailRow = (index, patch) => {
    setData((prev) => {
      const rows = prev.paket_pemeriksaan_lingkungan || [];
      const next = rows.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      );

      return {
        ...prev,
        paket_pemeriksaan_lingkungan: next,
      };
    });
  };

  const addDetailRow = () => {
    setData('paket_pemeriksaan_lingkungan', [
      ...detailRows,
      createEmptyDetailRow(),
    ]);
  };

  const removeDetailRow = (index) => {
    if (detailRows.length <= 1) {
      setData('paket_pemeriksaan_lingkungan', [createEmptyDetailRow()]);
      return;
    }
    setData(
      'paket_pemeriksaan_lingkungan',
      detailRows.filter((_, i) => i !== index),
    );
  };

  return (
    <LabkesdaLayout>
      <Head title="Pendaftaran Pemeriksaan Lingkungan" />

      <div className="max-w-8xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Pendaftaran Pemeriksaan Lingkungan
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Isi data pendaftaran dan informasi contoh uji.
            </p>
          </div>

          <form onSubmit={submit} className="p-5">
            <FormPendaftaranPemeriksaanLingkungan
              data={data}
              setData={setData}
              errors={errors}
              selectedCustomer={selectedCustomer}
              setCustomerQuery={setCustomerQuery}
              filteredCustomers={filteredCustomers}
            />

            <FormTablePemeriksaanLingkungan
              data={data}
              setData={setData}
              errors={errors}
              detailRows={detailRows}
              paketPemeriksaan={paketPemeriksaan}
              addDetailRow={addDetailRow}
              updateDetailRow={updateDetailRow}
              removeDetailRow={removeDetailRow}
              detailFieldName="paket_pemeriksaan_lingkungan"
            />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" onClick={submit} disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan Pendaftaran'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </LabkesdaLayout>
  );
}
