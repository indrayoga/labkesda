import InputError from '@/Components/InputError';
import { Label, Select, Textarea, TextInput } from 'flowbite-react';

export default function CreateCustomerForm({
  pasien,
  kecamatans,
  kelurahans,
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
          <Label
            htmlFor="kecamatan_id"
            color={errors.kecamatan_id ? 'failure' : 'gray'}
          >
            Kecamatan
          </Label>
          <Select
            id="kecamatan_id"
            className="mt-1"
            value={data.kecamatan_id}
            disabled={processing}
            onChange={(e) => {
              setData({
                ...data,
                kecamatan_id: e.target.value,
                kelurahan_id: '',
              });
            }}
            color={errors.kecamatan_id ? 'failure' : 'gray'}
          >
            <option value="">Pilih Kecamatan</option>
            {kecamatans.map((kecamatan) => (
              <option key={kecamatan.id} value={kecamatan.id}>
                {kecamatan.nama}
              </option>
            ))}
          </Select>
          <InputError className="mt-2" message={errors.kecamatan_id} />
        </div>
        <div>
          <Label
            htmlFor="kelurahan_id"
            color={errors.kelurahan_id ? 'failure' : 'gray'}
          >
            Kelurahan
          </Label>
          <Select
            id="kelurahan_id"
            className="mt-1"
            value={data.kelurahan_id}
            onChange={(e) => setData('kelurahan_id', e.target.value)}
            disabled={!data.kecamatan_id || processing}
            color={errors.kelurahan_id ? 'failure' : 'gray'}
          >
            <option value="">Pilih Kelurahan</option>
            {data.kecamatan_id &&
              kelurahans
                .filter(
                  (kelurahan) =>
                    kelurahan.no_kec ==
                    kecamatans.find((kec) => kec.id == data.kecamatan_id)
                      .no_kec,
                )
                .map((kelurahan) => (
                  <option key={kelurahan.id} value={kelurahan.id}>
                    {kelurahan.nama}
                  </option>
                ))}
          </Select>
          <InputError className="mt-2" message={errors.kelurahan_id} />
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
