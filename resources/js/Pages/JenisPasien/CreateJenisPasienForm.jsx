import InputError from '@/Components/InputError';
import { Label, Select, TextInput } from 'flowbite-react';

export default function CreateJenisPasienForm({
  jenisPasien,
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
          <Label htmlFor="kode" color={errors.kode ? 'failure' : 'gray'}>
            Kode
          </Label>
          <TextInput
            id="kode"
            className="mt-1"
            value={data.kode}
            onChange={(e) => setData('kode', e.target.value)}
            required
            disabled={processing}
            autoComplete="kode"
            color={errors.kode ? 'failure' : 'gray'}
          />
          <InputError className="mt-2" message={errors.kode} />
        </div>
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
            htmlFor="kategori"
            color={errors.kategori ? 'failure' : 'gray'}
          >
            Kategori
          </Label>
          <Select
            id="kategori"
            className="mt-1"
            value={data.kategori}
            onChange={(e) => setData('kategori', e.target.value)}
            required
            disabled={processing}
            color={errors.kategori ? 'failure' : 'gray'}
          >
            <option value="">Pilih Kategori</option>
            <option value="umum">Umum</option>
            <option value="perusahaan">Perusahaan</option>
            <option value="asuransi">Asuransi</option>
          </Select>
          <InputError className="mt-2" message={errors.kategori} />
        </div>
      </div>
    </form>
  );
}
