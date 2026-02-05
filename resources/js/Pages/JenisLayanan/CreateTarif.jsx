import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { Button, Label, Select, TextInput } from 'flowbite-react';

export default function CreateTarif({
  jenisLayanan,
  jenisPasien,
  reloadTarif = () => {},
  closeModal = () => {},
}) {
  const {
    data,
    setData,
    post,
    put,
    processing,
    errors,
    reset,
    recentlySuccessful,
  } = useForm({
    jenis_layanan_id: jenisLayanan.id,
    jenis_pasien: '',
    harga: 0,
    aktif: true,
    valid_dari: '',
    valid_sampai: '',
    keterangan: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('jenis-layanan.tarif.store', jenisLayanan.id), {
      onSuccess: () => {
        // reloadTarif();
        closeModal();
      },
    });
  };
  return (
    <>
      <div className="space-y-4">
        <Label>Jenis Pasien</Label>
        <Select
          id="jenis-pasien"
          name="jenis-pasien"
          value={data.jenis_pasien}
          onChange={(e) => setData('jenis_pasien', e.target.value)}
        >
          <option value="">Pilih Jenis Pasien</option>
          {(jenisPasien || []).map((jp) => (
            <option key={jp.kode} value={jp.kode}>
              {jp.nama}
            </option>
          ))}
        </Select>
        <InputError message={errors.jenis_pasien} className="mt-2" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Tarif (Rp)</Label>
            <TextInput
              type="number"
              min="0"
              value={data.harga}
              onChange={(e) => setData('harga', e.target.value)}
              placeholder="0"
              className="mt-2"
            />
            <InputError message={errors.harga} className="mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Berlaku Dari</Label>
            <TextInput
              type="date"
              value={data.valid_dari}
              onChange={(e) => setData('valid_dari', e.target.value)}
              className="mt-2"
            />
            <InputError message={errors.valid_dari} className="mt-2" />
          </div>
          <div>
            <Label>Berlaku Sampai</Label>
            <TextInput
              type="date"
              value={data.valid_sampai}
              onChange={(e) => setData('valid_sampai', e.target.value)}
              className="mt-2"
            />
            <InputError message={errors.valid_sampai} className="mt-2" />
          </div>
        </div>

        <div>
          <Label>Keterangan</Label>
          <TextInput
            type="text"
            value={data.keterangan}
            onChange={(e) => setData('keterangan', e.target.value)}
            placeholder="—"
            className="mt-2"
          />
          <InputError message={errors.keterangan} className="mt-2" />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t py-3 dark:border-gray-700">
        <Button
          type="button"
          color={'alternative'}
          outline={true}
          onClick={closeModal}
          className="border border-gray-200 bg-white text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
        >
          Batal
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={processing}>
          Simpan Tarif
        </Button>
      </div>
    </>
  );
}
