import InputError from '@/Components/InputError';
import { Label, Select, TextInput } from 'flowbite-react';

export default function CreatePaketPemeriksaanForm({
    paketPemeriksaan,
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
                        disabled={processing}
                        autoComplete="nama"
                        color={errors.nama ? 'failure' : 'gray'}
                    />
                    <InputError className="mt-2" message={errors.nama} />
                </div>
                <div>
                    <Label
                        htmlFor="jenis_lab"
                        color={errors.jenis_lab ? 'failure' : 'gray'}
                    >
                        Kategori
                    </Label>
                    <Select
                        id="jenis_lab"
                        className="mt-1"
                        value={data.jenis_lab}
                        disabled={processing}
                        onChange={(e) => {
                            setData({
                                ...data,
                                jenis_lab: e.target.value,
                            });
                        }}
                        color={errors.jenis_lab ? 'failure' : 'gray'}
                    >
                        <option value="">Pilih</option>
                        <option value="klinis">Klinis</option>
                        <option value="lingkungan">Lingkungan</option>
                    </Select>
                    <InputError className="mt-2" message={errors.jenis_lab} />
                </div>
                <div>
                    <Label
                        htmlFor="deskripsi"
                        color={errors.deskripsi ? 'failure' : 'gray'}
                    >
                        Deskripsi
                    </Label>
                    <TextInput
                        id="deskripsi"
                        className="mt-1"
                        value={data.deskripsi}
                        onChange={(e) => setData('deskripsi', e.target.value)}
                        autoComplete="deskripsi"
                        color={errors.deskripsi ? 'failure' : 'gray'}
                        disabled={processing}
                    />
                    <InputError className="mt-2" message={errors.deskripsi} />
                </div>
            </div>
        </form>
    );
}
