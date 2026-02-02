import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function flattenItems(items, prefix = '') {
  const out = [];
  if (!Array.isArray(items)) return out;
  for (const n of items) {
    const label = prefix ? `${prefix} › ${n.name}` : n.name;
    out.push({ id: n.id, name: n.name, label });
    if (Array.isArray(n.children) && n.children.length) {
      out.push(...flattenItems(n.children, label));
    }
  }
  return out;
}

export default function FormReferenceRange() {
  const { props } = usePage();
  const items = props.items ?? [
    { id: 'hba1c', name: 'HbA1C' },
    { id: 'glukosa', name: 'Glukosa Puasa' },
  ];

  const options = useMemo(
    () =>
      flattenItems(items).map((o) => ({
        value: o.id,
        label: o.label ?? o.name,
      })),
    [items],
  );

  const [selectedTest, setSelectedTest] = useState(
    options[0]?.value ?? 'hba1c',
  );
  const [ranges, setRanges] = useState([
    {
      label: 'Normal',
      gender: 'ALL',
      min: '',
      max: '5.7',
      operator: '<',
      status: 'Aktif',
    },
  ]);

  const updateRange = (idx, key, value) => {
    setRanges((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)),
    );
  };

  const addRow = () =>
    setRanges((prev) => [
      ...prev,
      {
        label: '',
        gender: 'ALL',
        min: '',
        max: '',
        operator: '<',
        status: 'Aktif',
      },
    ]);
  const removeRow = (idx) =>
    setRanges((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Wire to backend route for saving reference ranges
    console.log('Save reference ranges for', selectedTest, ranges);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Test:</label>
        <div className="relative">
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="bg-slate-50 text-left text-sm font-semibold text-slate-700">
              <th className="w-48 border-b border-slate-300 px-3 py-2">
                Label
              </th>
              <th className="w-28 border-b border-slate-300 px-3 py-2">
                Gender
              </th>
              <th className="w-28 border-b border-slate-300 px-3 py-2">Min</th>
              <th className="w-28 border-b border-slate-300 px-3 py-2">Max</th>
              <th className="w-32 border-b border-slate-300 px-3 py-2">
                Operator
              </th>
              <th className="w-28 border-b border-slate-300 px-3 py-2">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {ranges.map((row, idx) => (
              <tr key={idx} className="text-sm">
                <td className="border-b border-slate-200 px-3 py-2">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateRange(idx, 'label', e.target.value)}
                    placeholder="Normal"
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <select
                    value={row.gender}
                    onChange={(e) => updateRange(idx, 'gender', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">ALL</option>
                    <option value="M">Laki-laki</option>
                    <option value="F">Perempuan</option>
                  </select>
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={row.min}
                    onChange={(e) => updateRange(idx, 'min', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={row.max}
                    onChange={(e) => updateRange(idx, 'max', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <select
                    value={row.operator}
                    onChange={(e) =>
                      updateRange(idx, 'operator', e.target.value)
                    }
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="<">&lt;</option>
                    <option value="<=">&le;</option>
                    <option value=">">&gt;</option>
                    <option value=">=">&ge;</option>
                    <option value="=">=</option>
                  </select>
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <select
                    value={row.status}
                    onChange={(e) => updateRange(idx, 'status', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Tambah Baris
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
