import InputError from '@/Components/InputError';
import { useForm, usePage } from '@inertiajs/react';
import { FiPlus, FiSend } from 'react-icons/fi';

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

export default function FormReferenceRange({
  item,
  setOpenModalReferenceRange = () => {},
}) {
  const { props } = usePage();

  const { data, setData, post, processing, errors, reset } = useForm({
    ranges: item.reference_ranges.length
      ? item.reference_ranges.map((r) => ({
          label: r.label,
          gender: r.jenis_kelamin,
          value_type: r.value_type,
          min_enabled:
            r.value_type === 'numeric' && r.min_value !== null ? true : false,
          max_enabled:
            r.value_type === 'numeric' && r.max_value !== null ? true : false,
          min: r.min_value,
          max: r.max_value,
          operator_min: r.operator_min,
          operator_max: r.operator_max,
          kualitatif_value: r.kualitatif_value,
        }))
      : [
          {
            label: 'NORMAL',
            gender: 'ALL',
            value_type: '',
            min_enabled: false,
            max_enabled: false,
            min: '',
            max: '',
            operator_min: '>',
            operator_max: '<',
            kualitatif_value: '',
            status: 'Aktif',
          },
        ],
  });

  const updateRange = (idx, key, value) => {
    setData((prev) => ({
      ...prev,
      ranges: prev.ranges.map((r, i) =>
        i === idx ? { ...r, [key]: value } : r,
      ),
    }));
  };

  const addRow = () =>
    setData((prev) => ({
      ...prev,
      ranges: [
        ...prev.ranges,
        {
          label: 'NORMAL',
          gender: 'ALL',
          value_type: '',
          min_enabled: false,
          max_enabled: false,
          min: '',
          max: '',
          operator_min: '>',
          operator_max: '<',
          kualitatif_value: '',
          status: 'Aktif',
        },
      ],
    }));

  const removeRow = (idx) =>
    setData((prev) => ({
      ...prev,
      ranges: prev.ranges.filter((_, i) => i !== idx),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('item-pemeriksaan.reference-range.store', item.id), {
      onSuccess: () => {
        reset('ranges');
        setOpenModalReferenceRange(false);
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full p-4"
      disabled={processing}
    >
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">
          Item Pemeriksaan:
        </label>
        <div className="relative">
          <input
            type="text"
            disabled={true}
            readOnly={true}
            value={item.name}
            className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm">
        {/* add overlay hover table loading icon when processing */}
        <table
          className={`min-w-full table-fixed ${processing ? 'opacity-50' : ''}`}
        >
          <thead>
            <tr className="bg-slate-50 text-left text-sm font-semibold text-slate-700">
              <th className="w-48 border-b border-slate-300 px-3 py-2">
                Label
              </th>
              <th className="w-28 border-b border-slate-300 px-3 py-2">
                Gender
              </th>
              <th className="w-28 border-b border-slate-300 px-3 py-2">
                Tipe Nilai
              </th>
              <th className="w-28 border-b border-slate-300 px-3 py-2">
                Nilai Minimal
              </th>
              <th className="w-28 border-b border-slate-300 px-3 py-2">
                Nilai Maksimal
              </th>
              <th className="w-28 border-b border-slate-300 px-3 py-2">
                Nilai Kualitatif
              </th>
              {/* <th className="w-28 border-b border-slate-300 px-3 py-2">
                Status
              </th> */}
            </tr>
          </thead>
          <tbody>
            {data.ranges.map((row, idx) => (
              <tr key={idx} className="text-sm">
                <td className="border-b border-slate-200 px-3 py-2">
                  <select
                    value={row.label}
                    onChange={(e) => updateRange(idx, 'label', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="NORMAL">Normal</option>
                    {item.kategori_pemeriksaan_nama == 'LINGKUNGAN' ? (
                      <>
                        <option value="KELAS 1">KELAS 1</option>
                        <option value="KELAS 2">KELAS 2</option>
                        <option value="KELAS 3">KELAS 3</option>
                        <option value="KELAS 4">KELAS 4</option>
                      </>
                    ) : (
                      <>
                        <option value="DM">DM</option>
                        <option value="PRE DM">Pre DM</option>
                      </>
                    )}
                  </select>
                  <InputError message={errors[`ranges.${idx}.label`]} />
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <select
                    value={row.gender}
                    onChange={(e) => updateRange(idx, 'gender', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">ALL</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  <InputError message={errors[`ranges.${idx}.gender`]} />
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <select
                    value={row.value_type}
                    onChange={(e) => {
                      if (e.target.value === 'kualitatif') {
                        updateRange(idx, 'value_type', e.target.value);
                        updateRange(idx, 'min_enabled', false);
                        updateRange(idx, 'max_enabled', false);
                      } else {
                        updateRange(idx, 'value_type', e.target.value);
                        updateRange(idx, 'kualitatif_value', '');
                      }
                    }}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Pilih</option>
                    <option value="numeric">Numeric</option>
                    <option value="kualitatif">Kualitatif</option>
                  </select>
                  <InputError message={errors[`ranges.${idx}.value_type`]} />
                </td>

                <td className="w-44 border-b border-slate-200 px-3 py-2">
                  <div className="flex gap-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.min_enabled ?? true}
                        onChange={(e) =>
                          updateRange(idx, 'min_enabled', e.target.checked)
                        }
                        disabled={row.value_type !== 'numeric'}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    <select
                      value={row.operator_min}
                      onChange={(e) =>
                        updateRange(idx, 'operator_min', e.target.value)
                      }
                      disabled={!row.min_enabled}
                      className="w-16 rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="<">&lt;</option>
                      <option value="<=">&le;</option>
                      <option value=">">&gt;</option>
                      <option value=">=">&ge;</option>
                      <option value="=">=</option>
                    </select>

                    <input
                      type="number"
                      inputMode="decimal"
                      value={row.min}
                      onChange={(e) => updateRange(idx, 'min', e.target.value)}
                      disabled={!row.min_enabled}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <InputError message={errors[`ranges.${idx}.min`]} />
                </td>
                <td className="w-44 border-b border-slate-200 px-3 py-2">
                  <div className="flex gap-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.max_enabled ?? true}
                        onChange={(e) =>
                          updateRange(idx, 'max_enabled', e.target.checked)
                        }
                        disabled={row.value_type !== 'numeric'}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    <select
                      value={row.operator_max}
                      onChange={(e) =>
                        updateRange(idx, 'operator_max', e.target.value)
                      }
                      disabled={!row.max_enabled}
                      className="w-16 rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="<">&lt;</option>
                      <option value="<=">&le;</option>
                      <option value=">">&gt;</option>
                      <option value=">=">&ge;</option>
                      <option value="=">=</option>
                    </select>

                    <input
                      type="number"
                      inputMode="decimal"
                      value={row.max}
                      onChange={(e) => updateRange(idx, 'max', e.target.value)}
                      disabled={!row.max_enabled}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <InputError message={errors[`ranges.${idx}.max`]} />
                </td>
                <td className="border-b border-slate-200 px-3 py-2">
                  <input
                    type="text"
                    value={row.kualitatif_value}
                    onChange={(e) =>
                      updateRange(idx, 'kualitatif_value', e.target.value)
                    }
                    disabled={row.value_type !== 'kualitatif'}
                    readOnly={row.value_type !== 'kualitatif'}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <InputError
                    message={errors[`ranges.${idx}.kualitatif_value`]}
                  />
                </td>
                {/* <td className="border-b border-slate-200 px-3 py-2">
                  <select
                    value={row.status}
                    onChange={(e) => updateRange(idx, 'status', e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                  <InputError message={errors[`ranges.${idx}.status`]} />
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <FiPlus className="mr-1 inline-block h-4 w-4" />
          Tambah Baris
        </button>
        <button
          type="submit"
          disabled={processing}
          className={`rounded-md bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 ${processing ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <FiSend className="mr-1 inline-block h-4 w-4" />
          Simpan
        </button>
      </div>
    </form>
  );
}
