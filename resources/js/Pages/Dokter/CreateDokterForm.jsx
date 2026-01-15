import InputError from '@/Components/InputError';
import { Label, Textarea, TextInput } from 'flowbite-react';

export default function CreateDokterForm({
  dokter,
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
            htmlFor="no_telepon"
            color={errors.no_telepon ? 'failure' : 'gray'}
          >
            No. Telepon
          </Label>
          <TextInput
            id="no_telepon"
            className="mt-1"
            value={data.no_telepon}
            onChange={(e) => setData('no_telepon', e.target.value)}
            autoComplete="no_telepon"
            color={errors.no_telepon ? 'failure' : 'gray'}
            disabled={processing}
          />
          <InputError className="mt-2" message={errors.no_telepon} />
        </div>
        <div>
          <Label htmlFor="email" color={errors.email ? 'failure' : 'gray'}>
            Email
          </Label>
          <TextInput
            id="email"
            className="mt-1"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            autoComplete="email"
            color={errors.email ? 'failure' : 'gray'}
            disabled={processing}
          />
          <InputError className="mt-2" message={errors.email} />
        </div>

        <div>
          <Label htmlFor="alamat" color={errors.alamat ? 'failure' : 'gray'}>
            Alamat
          </Label>
          <Textarea
            id="alamat"
            className="mt-1"
            value={data.alamat}
            onChange={(e) => setData('alamat', e.target.value)}
            autoComplete="alamat"
            color={errors.alamat ? 'failure' : 'gray'}
            disabled={processing}
          />
          <InputError className="mt-2" message={errors.alamat} />
        </div>
      </div>
    </form>
  );
}
