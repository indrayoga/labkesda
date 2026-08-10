import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head } from '@inertiajs/react';
import { Button } from 'flowbite-react';

export default function PendaftaranPasien({ data, laporan }) {
  const tahun = data.tahun || new Date().getFullYear();
  const months = [
    { label: 'Jan', key: 'jan' },
    { label: 'Feb', key: 'feb' },
    { label: 'Mar', key: 'mar' },
    { label: 'Apr', key: 'apr' },
    { label: 'Mei', key: 'mei' },
    { label: 'Jun', key: 'jun' },
    { label: 'Jul', key: 'jul' },
    { label: 'Ags', key: 'agu' },
    { label: 'Sep', key: 'sep' },
    { label: 'Okt', key: 'okt' },
    { label: 'Nov', key: 'nov' },
    { label: 'Des', key: 'des' },
  ];

  const exportLaporan = (type) => {
    window.location.href = route(`laporan.pendaftaran-pasien.export.${type}`, {
      tahun,
    });
  };

  return (
    <LabkesdaLayout>
      <Head title="Laporan Pendaftaran Pasien" />

      <div className="max-w-full overflow-x-auto rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Laporan Pendaftaran Pasien</h2>
            <p className="text-sm text-gray-500">Tahun {tahun}</p>
          </div>
          <div className="flex flex-wrap gap-3">
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
                  Pembayaran
                </th>
                {months.map((month) => (
                  <th
                    key={month.key}
                    className="whitespace-nowrap border border-gray-300 px-3 py-2 text-center text-xs font-semibold md:text-sm"
                  >
                    {month.label}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold md:text-base">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody>
              {laporan.map((row, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                    {row.jenis_pasien}
                  </td>
                  {months.map((month) => (
                    <td
                      key={month.key}
                      className="border border-gray-300 px-3 py-2 text-center text-sm md:text-base"
                    >
                      {row[month.key]}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm md:text-base">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-100">
                <td
                  colSpan="2"
                  className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold md:text-base"
                >
                  Total
                </td>
                {months.map((month) => (
                  <td
                    key={month.key}
                    className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold md:text-base"
                  >
                    {laporan.reduce(
                      (sum, row) => sum + parseInt(row[month.key] || 0, 10),
                      0,
                    )}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold md:text-base">
                  {laporan.reduce(
                    (sum, row) => sum + parseInt(row.total, 10),
                    0,
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </LabkesdaLayout>
  );
}
