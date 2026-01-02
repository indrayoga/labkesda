import InputError from '@/Components/InputError';
import { Label, Select, Textarea, TextInput } from 'flowbite-react';

export default function CreatePasienForm({
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
                    <Label
                        htmlFor="no_rm"
                        color={errors.no_rm ? 'failure' : 'gray'}
                    >
                        No. RM
                    </Label>
                    <TextInput
                        id="no_rm"
                        className="mt-1"
                        value={data.no_rm}
                        onChange={(e) => setData('no_rm', e.target.value)}
                        required
                        autoFocus
                        autoComplete="no_rm"
                        color={errors.no_rm ? 'failure' : 'gray'}
                    />
                    <InputError className="mt-2" message={errors.no_rm} />
                </div>
                <div>
                    <Label
                        htmlFor="nama"
                        color={errors.nama ? 'failure' : 'gray'}
                    >
                        Nama
                    </Label>
                    <TextInput
                        id="nama"
                        className="mt-1"
                        value={data.nama}
                        onChange={(e) => setData('nama', e.target.value)}
                        required
                        autoComplete="nama"
                        color={errors.nama ? 'failure' : 'gray'}
                    />
                    <InputError className="mt-2" message={errors.nama} />
                </div>
                <div>
                    <Label
                        htmlFor="jenis_kelamin"
                        color={errors.jenis_kelamin ? 'failure' : 'gray'}
                    >
                        Jenis Kelamin
                    </Label>
                    <Select
                        id="jenis_kelamin"
                        className="mt-1"
                        value={data.jenis_kelamin}
                        onChange={(e) =>
                            setData('jenis_kelamin', e.target.value)
                        }
                        color={errors.jenis_kelamin ? 'failure' : 'gray'}
                    >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                    </Select>
                    <InputError
                        className="mt-2"
                        message={errors.jenis_kelamin}
                    />
                </div>
                <div>
                    <Label
                        htmlFor="tempat_lahir"
                        color={errors.tempat_lahir ? 'failure' : 'gray'}
                    >
                        Tempat Lahir
                    </Label>
                    <TextInput
                        id="tempat_lahir"
                        className="mt-1"
                        value={data.tempat_lahir}
                        onChange={(e) =>
                            setData('tempat_lahir', e.target.value)
                        }
                        autoComplete="tempat_lahir"
                        color={errors.tempat_lahir ? 'failure' : 'gray'}
                    />
                    <InputError
                        className="mt-2"
                        message={errors.tempat_lahir}
                    />
                </div>
                <div>
                    <Label
                        htmlFor="tanggal_lahir"
                        color={errors.tanggal_lahir ? 'failure' : 'gray'}
                    >
                        Tanggal Lahir
                    </Label>
                    <TextInput
                        id="tanggal_lahir"
                        type="date"
                        className="mt-1"
                        value={data.tanggal_lahir}
                        onChange={(e) =>
                            setData('tanggal_lahir', e.target.value)
                        }
                        color={errors.tanggal_lahir ? 'failure' : 'gray'}
                    />
                    <InputError
                        className="mt-2"
                        message={errors.tanggal_lahir}
                    />
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
                    <InputError
                        className="mt-2"
                        message={errors.kecamatan_id}
                    />
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
                        onChange={(e) =>
                            setData('kelurahan_id', e.target.value)
                        }
                        disabled={!data.kecamatan_id}
                        color={errors.kelurahan_id ? 'failure' : 'gray'}
                    >
                        <option value="">Pilih Kelurahan</option>
                        {data.kecamatan_id &&
                            kelurahans
                                .filter(
                                    (kelurahan) =>
                                        kelurahan.kecamatan_id ==
                                        data.kecamatan_id,
                                )
                                .map((kelurahan) => (
                                    <option
                                        key={kelurahan.id}
                                        value={kelurahan.id}
                                    >
                                        {kelurahan.nama}
                                    </option>
                                ))}
                    </Select>
                    <InputError
                        className="mt-2"
                        message={errors.kelurahan_id}
                    />
                </div>
                <div>
                    <Label
                        htmlFor="alamat"
                        color={errors.alamat ? 'failure' : 'gray'}
                    >
                        Alamat
                    </Label>
                    <Textarea
                        id="alamat"
                        className="mt-1"
                        value={data.alamat}
                        onChange={(e) => setData('alamat', e.target.value)}
                        autoComplete="alamat"
                        color={errors.alamat ? 'failure' : 'gray'}
                    />
                    <InputError className="mt-2" message={errors.alamat} />
                </div>
                <div>
                    <Label
                        htmlFor="pekerjaan"
                        color={errors.pekerjaan ? 'failure' : 'gray'}
                    >
                        Pekerjaan
                    </Label>
                    <TextInput
                        id="pekerjaan"
                        className="mt-1"
                        value={data.pekerjaan}
                        onChange={(e) => setData('pekerjaan', e.target.value)}
                        autoComplete="pekerjaan"
                        color={errors.pekerjaan ? 'failure' : 'gray'}
                    />
                    <InputError className="mt-2" message={errors.pekerjaan} />
                </div>
            </div>

            {/* <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                >
                    Batal
                </button>

                <PrimaryButton className="ms-3" disabled={processing}>
                    Simpan
                </PrimaryButton>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-gray-600">Tersimpan.</p>
                </Transition>
            </div> */}
        </form>
    );
}
