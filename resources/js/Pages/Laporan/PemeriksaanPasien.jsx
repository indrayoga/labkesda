import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, router } from '@inertiajs/react';
import clsx from 'clsx';
import { Button, Label, TextInput } from 'flowbite-react';
import { useMemo, useState } from 'react';

function JenisLayananMultiSelect({ items, selectedIds, onChange }) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      item.nama.toLowerCase().includes(normalizedQuery),
    );
  }, [items, query]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  const toggleItem = (itemId) => {
    if (selectedIds.includes(itemId)) {
      onChange(selectedIds.filter((id) => id !== itemId));
      return;
    }

    onChange([...selectedIds, itemId]);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <span>{selectedIds.length} item dipilih</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onChange(items.map((item) => item.id))}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Pilih semua
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="font-medium text-gray-500 hover:text-gray-700"
          >
            Kosongkan
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 p-3">
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari jenis layanan"
        />
      </div>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-gray-200 p-3">
          {selectedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
            >
              {item.nama} ×
            </button>
          ))}
        </div>
      )}

      <div className="max-h-60 overflow-y-auto p-2">
        {filteredItems.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500">
            Jenis layanan tidak ditemukan.
          </div>
        ) : (
          filteredItems.map((item) => {
            const checked = selectedIds.includes(item.id);

            return (
              <label
                key={item.id}
                className={clsx(
                  'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm',
                  checked ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{item.nama}</span>
                </div>
                {checked && (
                  <span className="text-xs font-medium text-blue-700">
                    Dipilih
                  </span>
                )}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function PemeriksaanPasien({
  data,
  laporan,
  jenisLayanan,
  tanggalLaporan,
}) {
  const [tanggalAwal, setTanggalAwal] = useState(data.tanggal_awal || '');
  const [tanggalAkhir, setTanggalAkhir] = useState(data.tanggal_akhir || '');
  const [selectedItems, setSelectedItems] = useState(
    data.jenis_layanan_ids || [],
  );

  const buildFilterParams = (applyDefaultItems = false) => {
    let itemIds = selectedItems;

    if (
      applyDefaultItems &&
      tanggalAwal &&
      tanggalAkhir &&
      itemIds.length === 0
    ) {
      itemIds = jenisLayanan.map((item) => item.id);
    }

    return {
      tanggal_awal: tanggalAwal || undefined,
      tanggal_akhir: tanggalAkhir || undefined,
      jenis_layanan_ids: itemIds.length ? itemIds : undefined,
    };
  };

  const submitFilter = () => {
    const params = buildFilterParams(true);

    if (selectedItems.length === 0 && params.item_pemeriksaan_ids) {
      setSelectedItems(params.item_pemeriksaan_ids);
    }

    router.get(route('laporan.pemeriksaan-pasien'), params);
  };

  const exportLaporan = (type) => {
    const params = buildFilterParams(true);

    if (selectedItems.length === 0 && params.item_pemeriksaan_ids) {
      setSelectedItems(params.item_pemeriksaan_ids);
    }

    window.location.href = route(
      `laporan.pemeriksaan-pasien.export.${type}`,
      params,
    );
  };

  const totalKeseluruhan = laporan.reduce((sum, row) => sum + row.total, 0);

  return (
    <LabkesdaLayout>
      <Head title="Laporan Pemeriksaan Pasien" />

      <div className="max-w-full overflow-x-auto rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-bold">Laporan Pemeriksaan Pasien</h2>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div>
            <Label
              htmlFor="tanggal-awal"
              value="Tanggal Awal"
              className="mb-2 block"
            />
            <TextInput
              id="tanggal-awal"
              type="date"
              value={tanggalAwal}
              onChange={(event) => setTanggalAwal(event.target.value)}
            />
          </div>
          <div>
            <Label
              htmlFor="tanggal-akhir"
              value="Tanggal Akhir"
              className="mb-2 block"
            />
            <TextInput
              id="tanggal-akhir"
              type="date"
              value={tanggalAkhir}
              onChange={(event) => setTanggalAkhir(event.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label
              htmlFor="item-pemeriksaan"
              value="Jenis Layanan"
              className="mb-2 block"
            />
            <JenisLayananMultiSelect
              items={jenisLayanan}
              selectedIds={selectedItems}
              onChange={setSelectedItems}
            />
            <p className="mt-1 text-xs text-gray-500">
              Jika tanggal dipilih tetapi jenis layanan belum dipilih, sistem
              akan otomatis memakai semua jenis layanan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-4">
            <Button onClick={submitFilter}>Cari</Button>
            <Button color="success" onClick={() => exportLaporan('excel')}>
              Export Excel
            </Button>
            <Button color="failure" onClick={() => exportLaporan('pdf')}>
              Export PDF
            </Button>
          </div>
        </div>

        <div className="min-w-full overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold md:text-base">
                  No
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold md:text-base">
                  Indikator Pemeriksaan
                </th>
                {tanggalLaporan.map((tanggal) => (
                  <th
                    key={tanggal.key}
                    className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold md:text-base"
                    title={tanggal.full_label}
                  >
                    {tanggal.label}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold md:text-base">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody>
              {laporan.length === 0 ? (
                <tr>
                  <td
                    colSpan={tanggalLaporan.length + 3}
                    className="border border-gray-300 px-4 py-4 text-center text-sm text-gray-500 md:text-base"
                  >
                    Belum ada data untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                laporan.map((row) => (
                  <tr
                    key={row.jenis_layanan_id}
                    className="border-b border-gray-300"
                  >
                    <td className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                      {row.no}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                      {row.indikator_pemeriksaan}
                    </td>
                    {tanggalLaporan.map((tanggal) => (
                      <td
                        key={`${row.jenis_layanan_id}-${tanggal.key}`}
                        className="border border-gray-300 px-4 py-2 text-center text-sm md:text-base"
                      >
                        {row.jumlah_per_tanggal[tanggal.key]}
                      </td>
                    ))}
                    <td className="border border-gray-300 px-4 py-2 text-center text-sm md:text-base">
                      {row.total}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {laporan.length > 0 && (
              <tfoot>
                <tr className="bg-blue-100">
                  <td
                    colSpan="2"
                    className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold md:text-base"
                  >
                    Total
                  </td>
                  {tanggalLaporan.map((tanggal) => (
                    <td
                      key={`total-${tanggal.key}`}
                      className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold md:text-base"
                    >
                      {laporan.reduce(
                        (sum, row) =>
                          sum + (row.jumlah_per_tanggal[tanggal.key] || 0),
                        0,
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold md:text-base">
                    {totalKeseluruhan}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </LabkesdaLayout>
  );
}
