import InputError from '@/Components/InputError';
import { Label, Select, TextInput } from 'flowbite-react';

export default function CreateItemPemeriksaanForm({
  kategoriPemeriksaan,
  itemPemeriksaan,
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
        {data.parent_id ? (
          <div>
            <Label
              htmlFor="parent_name"
              color={errors.parent_name ? 'failure' : 'gray'}
            >
              Parent Name
            </Label>
            <TextInput
              id="parent_name"
              readOnly={true}
              className="mt-1"
              value={data.parent_name}
              onChange={(e) => setData('parent_name', e.target.value)}
              required
              disabled={processing}
              color={errors.parent_name ? 'failure' : 'gray'}
            />
            <InputError className="mt-2" message={errors.parent_name} />
          </div>
        ) : (
          <div>
            <Label
              htmlFor="kategori_pemeriksaan_id"
              color={errors.kategori_pemeriksaan_id ? 'failure' : 'gray'}
            >
              Kategori
            </Label>
            <Select
              id="kategori_pemeriksaan_id"
              className="mt-1"
              value={data.kategori_pemeriksaan_id}
              disabled={processing}
              onChange={(e) => {
                setData({
                  ...data,
                  kategori_pemeriksaan_id: e.target.value,
                });
              }}
              color={errors.kategori_pemeriksaan_id ? 'failure' : 'gray'}
            >
              <option value="">Pilih Kategori</option>
              {kategoriPemeriksaan.map((kategori) => (
                <option key={kategori.id} value={kategori.id}>
                  {kategori.nama}
                </option>
              ))}
            </Select>
            <InputError
              className="mt-2"
              message={errors.kategori_pemeriksaan_id}
            />
          </div>
        )}

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
          <Label htmlFor="satuan" color={errors.satuan ? 'failure' : 'gray'}>
            Satuan
          </Label>
          <TextInput
            id="satuan"
            className="mt-1"
            value={data.satuan}
            onChange={(e) => setData('satuan', e.target.value)}
            autoComplete="satuan"
            color={errors.satuan ? 'failure' : 'gray'}
            disabled={processing}
          />
          <InputError className="mt-2" message={errors.satuan} />
        </div>
        <div>
          <Label htmlFor="metode" color={errors.metode ? 'failure' : 'gray'}>
            Metode
          </Label>
          <TextInput
            id="metode"
            className="mt-1"
            value={data.metode}
            onChange={(e) => setData('metode', e.target.value)}
            autoComplete="metode"
            color={errors.metode ? 'failure' : 'gray'}
            disabled={processing}
          />
          <InputError className="mt-2" message={errors.metode} />
        </div>
        <div>
          <Label htmlFor="urut" color={errors.urut ? 'failure' : 'gray'}>
            Urut
          </Label>
          <TextInput
            id="urut"
            className="mt-1"
            value={data.urut}
            onChange={(e) => setData('urut', e.target.value)}
            autoComplete="urut"
            color={errors.urut ? 'failure' : 'gray'}
            disabled={processing}
          />
          <InputError className="mt-2" message={errors.urut} />
        </div>
      </div>
    </form>
  );
}
