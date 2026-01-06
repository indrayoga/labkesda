import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, useForm } from '@inertiajs/react';
import { Checkbox, Label, Select, Textarea } from 'flowbite-react';
import { useState } from 'react';

export default function PendaftaranLaboratorium({
  pasien,
  dokter,
  kategoriLayanans,
  auth,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLayanans, setSelectedLayanans] = useState([]);

  const { data, setData, post, processing, errors } = useForm({
    pasien_id: pasien?.id || '',
    dokter_id: '',
    email: '',
    jenis_bayar: '',
    tanggal_pendaftaran: new Date().toISOString().split('T')[0],
    jam_pendaftaran: new Date().toTimeString().split(' ')[0].substring(0, 5),
    diagnosa: '',
    hasil_dikirim_ke_pasien: false,
    hasil_dikirim_ke_dokter: false,
    pasien_tidak_puasa: false,
    pasien_puasa_jam: 0,
    persiapan_pasien: '',
    id_spesimen: '',
    layanan_ids: [],
  });

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validasi step 1
      if (!data.pasien_id || !data.dokter_id || !data.diagnosa) {
        alert('Mohon lengkapi data yang wajib diisi');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleLayananToggle = (layananId) => {
    setSelectedLayanans((prev) => {
      if (prev.includes(layananId)) {
        return prev.filter((id) => id !== layananId);
      } else {
        return [...prev, layananId];
      }
    });
    setData('layanan_ids', selectedLayanans);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...data,
      layanan_ids: selectedLayanans,
    };
    post(route('pemeriksaan.store'), {
      data: submitData,
      onSuccess: () => {
        alert('Pendaftaran berhasil!');
      },
      onError: (errors) => {
        alert('Terjadi kesalahan saat menyimpan pendaftaran.');
        console.log(errors);
      },
    });
  };

  return (
    <LabkesdaLayout>
      <Head title="Pendaftaran Laboratorium" />
      <section className="bg-white py-8 antialiased md:py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          {/* Stepper Header */}
          <div className="mb-10">
            <div className="relative">
              <div className="flex items-center justify-between">
                {/* Step 1 */}
                <div className="flex flex-1 flex-col items-center">
                  <div
                    className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 transition-all duration-300 ${
                      currentStep >= 1
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/50 dark:border-blue-500 dark:bg-blue-500'
                        : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {currentStep > 1 ? (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-xl font-bold">1</span>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div
                      className={`text-sm font-semibold transition-colors ${
                        currentStep >= 1
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      Data Pendaftaran
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Isi informasi pasien
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                <div className="mx-4 mb-14 flex-1">
                  <div className="relative h-1">
                    <div className="absolute inset-0 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        currentStep >= 2
                          ? 'w-full bg-blue-600 dark:bg-blue-500'
                          : 'w-0 bg-blue-600 dark:bg-blue-500'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-1 flex-col items-center">
                  <div
                    className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 transition-all duration-300 ${
                      currentStep >= 2
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/50 dark:border-blue-500 dark:bg-blue-500'
                        : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div className="mt-3 text-center">
                    <div
                      className={`text-sm font-semibold transition-colors ${
                        currentStep >= 2
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      Pilih Layanan
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Pilih jenis layanan lab
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Form Pendaftaran */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    Data Pendaftaran
                  </h2>

                  {/* Informasi Pasien */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="nama_pasien">
                        Nama Pasien <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        type="text"
                        value={pasien?.nama || ''}
                        disabled
                        id="nama_pasien"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="no_rm">
                        No. RM <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        id="no_rm"
                        type="text"
                        value={pasien?.no_rm || ''}
                        disabled
                        className="block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="dokter_id"
                        color={errors.dokter_id ? 'failure' : 'gray'}
                      >
                        Dokter Pengirim <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        id="dokter_id"
                        value={data.dokter_id}
                        onChange={(e) => setData('dokter_id', e.target.value)}
                        color={errors.dokter_id ? 'failure' : 'gray'}
                      >
                        <option value="">Pilih Dokter</option>
                        {dokter?.map((dok) => (
                          <option key={dok.id} value={dok.id}>
                            {dok.nama}
                          </option>
                        ))}
                      </Select>
                      <InputError className="mt-2" message={errors.dokter_id} />
                    </div>

                    <div>
                      <Label
                        htmlFor="id_spesimen"
                        color={errors.id_spesimen ? 'failure' : 'gray'}
                      >
                        ID Spesimen
                      </Label>
                      <TextInput
                        id="id_spesimen"
                        type="text"
                        value={data.id_spesimen}
                        onChange={(e) => setData('id_spesimen', e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        color={errors.email ? 'failure' : 'gray'}
                      >
                        Email
                      </Label>
                      <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <InputError className="mt-2" message={errors.email} />
                    </div>
                    <div>
                      <Label
                        htmlFor="jenis_bayar"
                        color={errors.jenis_bayar ? 'failure' : 'gray'}
                      >
                        Jenis Bayar <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        id="jenis_bayar"
                        value={data.jenis_bayar}
                        onChange={(e) => setData('jenis_bayar', e.target.value)}
                        color={errors.jenis_bayar ? 'failure' : 'gray'}
                      >
                        <option value="">Pilih Jenis Bayar</option>
                        <option value="Umum">Umum</option>
                        <option value="BPJS">BPJS</option>
                      </Select>
                      <InputError
                        className="mt-2"
                        message={errors.jenis_bayar}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="tanggal_pendaftaran"
                        color={errors.tanggal_pendaftaran ? 'failure' : 'gray'}
                      >
                        Tanggal Pendaftaran{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        id="tanggal_pendaftaran"
                        type="date"
                        value={data.tanggal_pendaftaran}
                        onChange={(e) =>
                          setData('tanggal_pendaftaran', e.target.value)
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <InputError
                        className="mt-2"
                        message={errors.tanggal_pendaftaran}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="jam_pendaftaran"
                        color={errors.jam_pendaftaran ? 'failure' : 'gray'}
                      >
                        Jam Pendaftaran <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        id="jam_pendaftaran"
                        type="time"
                        value={data.jam_pendaftaran}
                        onChange={(e) =>
                          setData('jam_pendaftaran', e.target.value)
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      {errors.jam_pendaftaran && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.jam_pendaftaran}
                        </p>
                      )}
                      <InputError
                        className="mt-2"
                        message={errors.jam_pendaftaran}
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="diagnosa"
                      color={errors.diagnosa ? 'failure' : 'gray'}
                    >
                      Diagnosa / Keterangan Klinis{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      rows="3"
                      value={data.diagnosa}
                      onChange={(e) => setData('diagnosa', e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Masukkan diagnosa pasien"
                    />
                    <InputError className="mt-2" message={errors.diagnosa} />
                  </div>

                  {/* Kondisi Pasien */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Kondisi Pasien
                    </h3>

                    <div className="flex items-center">
                      <Checkbox
                        id="pasien_tidak_puasa"
                        type="checkbox"
                        checked={data.pasien_tidak_puasa}
                        onChange={(e) =>
                          setData('pasien_tidak_puasa', e.target.checked)
                        }
                      />
                      <Label
                        htmlFor="pasien_tidak_puasa"
                        className="ms-2"
                        color={errors.pasien_tidak_puasa ? 'failure' : 'gray'}
                      >
                        Pasien Tidak Puasa
                      </Label>
                    </div>

                    {!data.pasien_tidak_puasa && (
                      <div>
                        <Label
                          htmlFor="pasien_puasa_jam"
                          color={errors.pasien_puasa_jam ? 'failure' : 'gray'}
                        >
                          Pasien Puasa (jam)
                        </Label>
                        <TextInput
                          id="pasien_puasa_jam"
                          type="number"
                          value={data.pasien_puasa_jam}
                          onChange={(e) =>
                            setData(
                              'pasien_puasa_jam',
                              parseInt(e.target.value) || 0,
                            )
                          }
                          min="0"
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 md:w-1/3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}

                    <div>
                      <Label
                        htmlFor="persiapan_pasien"
                        color={errors.persiapan_pasien ? 'failure' : 'gray'}
                      >
                        Persiapan Pasien
                      </Label>
                      <Textarea
                        id="persiapan_pasien"
                        rows="2"
                        value={data.persiapan_pasien}
                        onChange={(e) =>
                          setData('persiapan_pasien', e.target.value)
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Catatan persiapan pasien (opsional)"
                      />
                    </div>
                  </div>

                  {/* Pengiriman Hasil */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Pengiriman Hasil
                    </h3>

                    <div className="flex gap-6">
                      <div className="flex items-center">
                        <Checkbox
                          id="hasil_dikirim_ke_pasien"
                          checked={data.hasil_dikirim_ke_pasien}
                          onChange={(e) =>
                            setData('hasil_dikirim_ke_pasien', e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                        />
                        <Label
                          htmlFor="hasil_dikirim_ke_pasien"
                          color={
                            errors.hasil_dikirim_ke_pasien ? 'failure' : 'gray'
                          }
                          className="ms-2"
                        >
                          Kirim Hasil ke Pasien
                        </Label>
                      </div>

                      <div className="flex items-center">
                        <Checkbox
                          id="hasil_dikirim_ke_dokter"
                          checked={data.hasil_dikirim_ke_dokter}
                          onChange={(e) =>
                            setData('hasil_dikirim_ke_dokter', e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                        />
                        <Label
                          htmlFor="hasil_dikirim_ke_dokter"
                          color={
                            errors.hasil_dikirim_ke_dokter ? 'failure' : 'gray'
                          }
                          className="ms-2"
                        >
                          Kirim Hasil ke Dokter
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Pilih Layanan */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    Pilih Layanan Laboratorium
                  </h2>

                  {kategoriLayanans &&
                  Object.keys(kategoriLayanans).length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(kategoriLayanans).map(
                        ([namaKategori, layanans]) => (
                          <div
                            key={namaKategori}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50"
                          >
                            <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
                              {namaKategori}
                            </h3>
                            <div className="space-y-2">
                              {layanans?.map((layanan) => (
                                <label
                                  key={layanan.id}
                                  className="flex cursor-pointer items-start gap-3 rounded-md p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                >
                                  <Checkbox
                                    id={`layanan_${layanan.id}`}
                                    type="checkbox"
                                    checked={selectedLayanans.includes(
                                      layanan.id,
                                    )}
                                    onChange={() =>
                                      handleLayananToggle(layanan.id)
                                    }
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                                  />
                                  <div className="flex flex-1 flex-row justify-between">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                      {layanan.nama}
                                    </div>
                                    {layanan.harga && (
                                      <div className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
                                        Rp{' '}
                                        {parseInt(layanan.harga).toLocaleString(
                                          'id-ID',
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Tidak ada layanan tersedia
                    </div>
                  )}

                  {selectedLayanans.length > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <span className="font-semibold">
                          {selectedLayanans.length}
                        </span>{' '}
                        layanan dipilih
                      </p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={processing || selectedLayanans.length === 0}
                      className="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                      {processing ? 'Menyimpan...' : 'Simpan Pendaftaran'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </LabkesdaLayout>
  );
}
