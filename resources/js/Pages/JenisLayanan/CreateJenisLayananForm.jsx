import InputError from '@/Components/InputError';
import { Label, Select, TextInput } from 'flowbite-react';

export default function CreateJenisLayananForm({
  jenisLayanan,
  kategoriLayanan,
  data,
  setData,
  errors,
  processing,
  recentlySuccessful,
  onClose,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="nama" color={errors.nama ? 'failure' : 'gray'}>
            Nama
          </Label>
          <TextInput
            id="nama"
            className="mt-1"
            value={data.nama}
            onChange={(e) => setData('nama', e.target.value)}
            required
            disabled={processing}
            autoComplete="nama"
            color={errors.nama ? 'failure' : 'gray'}
          />
          <InputError className="mt-2" message={errors.nama} />
        </div>
        <div>
          <Label
            htmlFor="kategori_layanan_id"
            color={errors.kategori_layanan_id ? 'failure' : 'gray'}
          >
            Kategori
          </Label>
          <Select
            id="kategori_layanan_id"
            className="mt-1"
            value={data.kategori_layanan_id}
            disabled={processing}
            onChange={(e) => {
              setData({
                ...data,
                kategori_layanan_id: e.target.value,
              });
            }}
            color={errors.kategori_layanan_id ? 'failure' : 'gray'}
          >
            <option value="">Pilih Kategori</option>
            {kategoriLayanan.map((kategori) => (
              <option key={kategori.id} value={kategori.id}>
                {kategori.nama}
              </option>
            ))}
          </Select>
          <InputError className="mt-2" message={errors.kategori_layanan_id} />
        </div>
        <div>
          <Label htmlFor="harga" color={errors.harga ? 'failure' : 'gray'}>
            Harga
          </Label>
          <TextInput
            id="harga"
            className="mt-1"
            value={data.harga}
            onChange={(e) => setData('harga', e.target.value)}
            autoComplete="harga"
            color={errors.harga ? 'failure' : 'gray'}
            disabled={processing}
          />
          <InputError className="mt-2" message={errors.harga} />
        </div>
      </div>
    </form>
  );
}
