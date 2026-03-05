import InputError from '@/Components/InputError';
import { Label, Select, TextInput } from 'flowbite-react';

export default function CreateUserForm({
  user,
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
          <Label htmlFor="name" color={errors.name ? 'failure' : 'gray'}>
            Nama
          </Label>
          <TextInput
            id="name"
            className="mt-1"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            required
            disabled={processing}
            autoComplete="name"
            color={errors.name ? 'failure' : 'gray'}
          />
          <InputError className="mt-2" message={errors.name} />
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
          <Label htmlFor="jabatan" color={errors.jabatan ? 'failure' : 'gray'}>
            Jabatan
          </Label>
          <TextInput
            id="jabatan"
            className="mt-1"
            value={data.jabatan}
            onChange={(e) => setData('jabatan', e.target.value)}
            autoComplete="jabatan"
            color={errors.jabatan ? 'failure' : 'gray'}
            disabled={processing}
          />
          <InputError className="mt-2" message={errors.jabatan} />
        </div>

        <div>
          <Label htmlFor="role" color={errors.role ? 'failure' : 'gray'}>
            Role
          </Label>
          <Select
            id="role"
            className="mt-1"
            value={data.role}
            onChange={(e) => setData('role', e.target.value)}
            disabled={processing}
            color={errors.role ? 'failure' : 'gray'}
          >
            <option value="">Pilih Role</option>
            <option value="loket">Loket</option>
            <option value="kasir">Kasir</option>
            <option value="analis_lab">Analis Lab</option>
            <option value="kepala">Kepala</option>
            <option value="admin">Admin</option>
          </Select>
          <InputError className="mt-2" message={errors.role} />
        </div>

        <div>
          <Label
            htmlFor="password"
            color={errors.password ? 'failure' : 'gray'}
          >
            Password
          </Label>
          <TextInput
            id="password"
            className="mt-1"
            type="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            autoComplete="current-password"
            color={errors.password ? 'failure' : 'gray'}
            disabled={processing}
          />
          <span className="text-sm text-gray-500">
            Biarkan kosong jika tidak ingin mengubah password
          </span>
          <InputError className="mt-2" message={errors.password} />
        </div>

        <div>
          <Label
            htmlFor="password_confirmation"
            color={errors.password_confirmation ? 'failure' : 'gray'}
          >
            Konfirmasi Password
          </Label>
          <TextInput
            id="password_confirmation"
            className="mt-1"
            type="password"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            autoComplete="current-password"
            color={errors.password_confirmation ? 'failure' : 'gray'}
            disabled={processing}
          />
          <InputError className="mt-2" message={errors.password_confirmation} />
        </div>
      </div>
    </form>
  );
}
