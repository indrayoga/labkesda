import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Button, Checkbox, Label, Select, Textarea } from 'flowbite-react';
import { useEffect, useState } from 'react';

const flattenLayananMap = (kategoriLayanans) => {
  const map = {};

  Object.values(kategoriLayanans || {}).forEach((layanans) => {
    (layanans || []).forEach((layanan) => {
      map[layanan.id] = layanan;
    });
  });

  return map;
};

const buildInitialSelectedItems = (pemeriksaan, paketLayanan) => {
  if (pemeriksaan?.layanan_order?.length) {
    return pemeriksaan.layanan_order.map((item) => {
      if (item.tipe === 'paket') {
        const paket = (paketLayanan || []).find(
          (currentPaket) => currentPaket.id === item.paket_pemeriksaan_id,
        );

        return {
          tipe: 'paket',
          id: item.paket_pemeriksaan_id,
          nama: item.nama_snapshot,
          harga: item.harga || 0,
          children: paket?.jenis_layanan || [],
        };
      }

      return {
        tipe: 'layanan',
        id: item.jenis_layanan_id,
        nama: item.nama_snapshot,
        harga: item.harga || 0,
      };
    });
  }

  return (
    pemeriksaan?.detail_pemeriksaan?.map((detail) => ({
      tipe: 'layanan',
      id: detail.jenis_layanan_id,
      nama: detail.jenis_layanan?.nama || '',
      harga: detail.harga || 0,
    })) || []
  );
};

export default function PendaftaranLaboratorium({
  pasien,
  dokter,
  kategoriLayanans,
  pemeriksaan,
  paketLayanan,
  jenisPasien,
  idSpesimenTerakhir,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [jenisPasienQuery, setJenisPasienQuery] = useState('');
  const [showJenisPasienOptions, setShowJenisPasienOptions] = useState(false);
  const [selectedItems, setSelectedItems] = useState(() =>
    buildInitialSelectedItems(pemeriksaan, paketLayanan),
  );
  const [listKategoriLayanans, setListKategoriLayanans] =
    useState(kategoriLayanans);

  const { data, setData, post, put, processing, errors } = useForm({
    pasien_id: pasien?.id || '',
    dokter_id: pemeriksaan?.dokter_id || '',
    email: pemeriksaan?.email || '',
    jenis_pasien: pemeriksaan?.jenis_pasien || '',
    tanggal_pendaftaran:
      pemeriksaan?.tanggal_pendaftaran ||
      new Date().toISOString().split('T')[0],
    jam_pendaftaran:
      pemeriksaan?.jam_pendaftaran ||
      new Date().toTimeString().split(' ')[0].substring(0, 5),
    tanggal_periksa:
      pemeriksaan?.tanggal_periksa || new Date().toISOString().split('T')[0],
    diagnosa: pemeriksaan?.diagnosa || '',
    hasil_dikirim_ke_pasien: pemeriksaan?.hasil_dikirim_ke_pasien || false,
    hasil_dikirim_ke_dokter: pemeriksaan?.hasil_dikirim_ke_dokter || false,
    pasien_tidak_puasa: pemeriksaan?.pasien_tidak_puasa || false,
    pasien_puasa_jam: pemeriksaan?.pasien_puasa_jam || 0,
    persiapan_pasien: pemeriksaan?.persiapan_pasien || '',
    id_spesimen: pemeriksaan?.id_spesimen || idSpesimenTerakhir || '',
    items: buildInitialSelectedItems(pemeriksaan, paketLayanan).map((item) => ({
      tipe: item.tipe,
      id: item.id,
      harga: item.harga,
    })),
  });

  const layananMap = flattenLayananMap(listKategoriLayanans);
  const overlapWarnings = selectedItems
    .filter((item) => item.tipe === 'layanan')
    .filter((item) =>
      selectedItems.some(
        (selectedItem) =>
          selectedItem.tipe === 'paket' &&
          (selectedItem.children || []).some((child) => child.id === item.id),
      ),
    )
    .map((item) => item.nama);

  useEffect(() => {
    // Fetch jenis layanan when jenis_pasien changes
    const fetchJenisLayanan = async () => {
      if (!data.jenis_pasien) {
        setListKategoriLayanans(kategoriLayanans);
        return;
      }
      try {
        const response = await axios.get(route('jenis-layanan.jenis-pasien'), {
          params: { jenis_pasien: data.jenis_pasien },
        });
        const jenisLayanan = response.data.data;
        setListKategoriLayanans(jenisLayanan);
      } catch (error) {
        console.error('Error fetching jenis layanan:', error);
      }
    };
    fetchJenisLayanan();
  }, [data.jenis_pasien, kategoriLayanans]);

  useEffect(() => {
    if (!jenisPasien || jenisPasien.length === 0) return;

    const selectedJenisPasien = jenisPasien.find(
      (jp) => jp.kode === data.jenis_pasien,
    );

    if (selectedJenisPasien) {
      setJenisPasienQuery(selectedJenisPasien.nama);
    }
  }, [jenisPasien, data.jenis_pasien]);

  useEffect(() => {
    const nextLayananMap = flattenLayananMap(listKategoriLayanans);

    setSelectedItems((prev) => {
      const nextItems = prev.map((item) => {
        if (item.tipe === 'paket') {
          const nextChildren = (item.children || []).map(
            (child) => nextLayananMap[child.id] || child,
          );

          return {
            ...item,
            children: nextChildren,
            harga: nextChildren.reduce(
              (total, child) => total + (Number(child.harga) || 0),
              0,
            ),
          };
        }

        const nextLayanan = nextLayananMap[item.id];

        return {
          ...item,
          nama: nextLayanan?.nama || item.nama,
          harga: Number(nextLayanan?.harga) || 0,
        };
      });

      setData(
        'items',
        nextItems.map((item) => ({
          tipe: item.tipe,
          id: item.id,
          harga: item.harga,
        })),
      );

      return nextItems;
    });
  }, [listKategoriLayanans, setData]);

  const filteredJenisPasien = (jenisPasien || [])
    .filter((jp) => {
      const query = jenisPasienQuery.trim().toLowerCase();
      if (!query) return true;

      return (
        jp.nama?.toLowerCase().includes(query) ||
        jp.kode?.toLowerCase().includes(query)
      );
    })
    .slice(0, 15);

  const handleJenisPasienSelect = (jp) => {
    setJenisPasienQuery(jp.nama);
    setData('jenis_pasien', jp.kode);
    setShowJenisPasienOptions(false);
  };

  const commitJenisPasienInput = () => {
    const query = jenisPasienQuery.trim();

    if (!query) {
      setJenisPasienQuery('');
      setData('jenis_pasien', '');
      setShowJenisPasienOptions(false);
      return;
    }

    const exactMatch = (jenisPasien || []).find((jp) => {
      const nama = jp.nama?.trim().toLowerCase();
      const kode = jp.kode?.trim().toLowerCase();
      const normalizedQuery = query.toLowerCase();

      return nama === normalizedQuery || kode === normalizedQuery;
    });

    if (exactMatch) {
      setJenisPasienQuery(exactMatch.nama);
      setData('jenis_pasien', exactMatch.kode);
    } else {
      setJenisPasienQuery('');
      setData('jenis_pasien', '');
    }

    setShowJenisPasienOptions(false);
  };

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

  const syncSelectedItems = (updater) => {
    setSelectedItems((prev) => {
      const nextItems = updater(prev);
      setData(
        'items',
        nextItems.map((item) => ({
          tipe: item.tipe,
          id: item.id,
          harga: item.harga,
        })),
      );

      return nextItems;
    });
  };

  const handlePaketToggle = (paket) => {
    syncSelectedItems((prev) => {
      const exists = prev.some(
        (item) => item.tipe === 'paket' && item.id === paket.id,
      );

      if (exists) {
        return prev.filter(
          (item) => !(item.tipe === 'paket' && item.id === paket.id),
        );
      }

      const children = (paket.jenis_layanan || []).map(
        (child) => layananMap[child.id] || child,
      );

      return [
        ...prev,
        {
          tipe: 'paket',
          id: paket.id,
          nama: paket.nama,
          harga: children.reduce(
            (total, child) => total + (Number(child.harga) || 0),
            0,
          ),
          children,
        },
      ];
    });
  };

  const handleLayananToggle = (layanan) => {
    syncSelectedItems((prev) => {
      const exists = prev.some(
        (item) => item.tipe === 'layanan' && item.id === layanan.id,
      );

      if (exists) {
        return prev.filter(
          (item) => !(item.tipe === 'layanan' && item.id === layanan.id),
        );
      }

      return [
        ...prev,
        {
          tipe: 'layanan',
          id: layanan.id,
          nama: layanan.nama,
          harga: Number(layanan.harga) || 0,
        },
      ];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate layanan selection
    if (selectedItems.length === 0) {
      alert('Mohon pilih minimal satu layanan');
      return;
    }

    if (pemeriksaan) {
      put(
        route('update-pendaftaran-laboratorium', [pasien.id, pemeriksaan.id]),
        {
          onSuccess: () => {
            alert('Pendaftaran berhasil diperbarui!');
          },
          onError: () => {
            alert('Terjadi kesalahan saat memperbarui pendaftaran.');
          },
        },
      );
      return;
    }

    post(route('pemeriksaan.store'), {
      onSuccess: () => {
        alert('Pendaftaran berhasil!');
      },
      onError: () => {
        alert('Terjadi kesalahan saat menyimpan pendaftaran.');
      },
    });
  };

  return (
    <LabkesdaLayout>
      <Head title="Pendaftaran Laboratorium" />
      <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
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
                        htmlFor="jenis_pasien"
                        color={errors.jenis_pasien ? 'failure' : 'gray'}
                      >
                        Jenis Pasien <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <TextInput
                          id="jenis_pasien"
                          type="text"
                          value={jenisPasienQuery}
                          onFocus={() => setShowJenisPasienOptions(true)}
                          onChange={(e) => {
                            setJenisPasienQuery(e.target.value);
                            setData('jenis_pasien', '');
                            setShowJenisPasienOptions(true);
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              commitJenisPasienInput();
                            }, 150);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitJenisPasienInput();
                            }
                          }}
                          placeholder="Ketik nama/kode jenis pasien"
                          color={errors.jenis_pasien ? 'failure' : 'gray'}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          autoComplete="off"
                        />

                        {showJenisPasienOptions &&
                          filteredJenisPasien.length > 0 && (
                            <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                              {filteredJenisPasien.map((jp) => (
                                <button
                                  key={jp.kode}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => handleJenisPasienSelect(jp)}
                                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                  <span>{jp.nama}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-300">
                                    {jp.kode}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                      <InputError
                        className="mt-2"
                        message={errors.jenis_pasien}
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

                    <div>
                      <Label
                        htmlFor="tanggal_periksa"
                        color={errors.tanggal_periksa ? 'failure' : 'gray'}
                      >
                        Tanggal Pemeriksaan{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        id="tanggal_periksa"
                        type="date"
                        value={data.tanggal_periksa}
                        onChange={(e) =>
                          setData('tanggal_periksa', e.target.value)
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <InputError
                        className="mt-2"
                        message={errors.tanggal_periksa}
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
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:w-1/3"
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
                  <div
                    key={''}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50"
                  >
                    <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
                      Paket
                    </h3>
                    <div className="space-y-2">
                      {paketLayanan && paketLayanan.length > 0 ? (
                        paketLayanan.map((paket) => (
                          <label
                            key={paket.id}
                            className="flex cursor-pointer items-start gap-3 rounded-md p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          >
                            <Checkbox
                              id={`layanan_${paket.id}`}
                              type="checkbox"
                              checked={selectedItems.some(
                                (item) =>
                                  item.tipe === 'paket' && item.id === paket.id,
                              )}
                              onChange={() => handlePaketToggle(paket)}
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                            />
                            <div className="flex flex-1 flex-col gap-1">
                              <div className="flex flex-row justify-between">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                  {paket.nama}
                                </div>
                                <div className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
                                  Rp{' '}
                                  {(paket.jenis_layanan || [])
                                    .reduce(
                                      (total, child) =>
                                        total +
                                        (Number(layananMap[child.id]?.harga) ||
                                          0),
                                      0,
                                    )
                                    .toLocaleString('id-ID')}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {(paket.jenis_layanan || []).length} layanan
                                {(paket.jenis_layanan || []).length > 0
                                  ? `: ${(paket.jenis_layanan || [])
                                      .map((child) => child.nama)
                                      .join(', ')}`
                                  : ''}
                              </div>
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                          Tidak ada paket tersedia
                        </div>
                      )}
                    </div>
                  </div>
                  {listKategoriLayanans &&
                  Object.keys(listKategoriLayanans).length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(listKategoriLayanans).map(
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
                                    checked={selectedItems.some(
                                      (item) =>
                                        item.tipe === 'layanan' &&
                                        item.id === layanan.id,
                                    )}
                                    onChange={() =>
                                      handleLayananToggle(layanan)
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

                  {selectedItems.length > 0 && (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <span className="font-semibold">
                            {selectedItems.length}
                          </span>{' '}
                          item akan tampil di kwitansi
                        </p>
                        <div className="mt-3 space-y-2">
                          {selectedItems.map((item) => (
                            <div
                              key={`${item.tipe}-${item.id}`}
                              className="flex items-start justify-between gap-4 text-sm text-blue-900 dark:text-blue-200"
                            >
                              <div>
                                <div className="font-medium">{item.nama}</div>
                                {item.tipe === 'paket' && (
                                  <div className="text-xs text-blue-700 dark:text-blue-300">
                                    {(item.children || []).length} layanan
                                  </div>
                                )}
                              </div>
                              <div className="text-right font-semibold">
                                Rp{' '}
                                {Number(item.harga || 0).toLocaleString(
                                  'id-ID',
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {overlapWarnings.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                          Layanan satuan ini juga sudah tercakup di paket:{' '}
                          {Array.from(new Set(overlapWarnings)).join(', ')}
                        </div>
                      )}
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
                    <Button
                      type="submit"
                      disabled={processing || selectedItems.length === 0}
                      className="rounded-lg px-5 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-green-300 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                      {processing ? 'Menyimpan...' : 'Simpan Pendaftaran'}
                    </Button>
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
