import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Button, Checkbox, Label, Select, Textarea } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';

const flattenLayananMap = (kategoriLayanans) => {
  const map = {};

  Object.values(kategoriLayanans || {}).forEach((layanans) => {
    (layanans || []).forEach((layanan) => {
      map[layanan.id] = layanan;
    });
  });

  return map;
};

const normalizeQuantity = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
};

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const resolvePackageChildren = (paket, layananMap = {}) =>
  (paket?.jenis_layanan || []).map((child) => layananMap[child.id] || child);

const calculateChildrenUnitPrice = (children = []) =>
  children.reduce((total, child) => total + (Number(child.harga) || 0), 0);

const createSelectedItem = ({
  tipe,
  id,
  nama,
  hargaSatuan,
  qty = 1,
  children = [],
  kategori = '',
}) => {
  const normalizedQuantity = normalizeQuantity(qty);
  const normalizedUnitPrice = Number(hargaSatuan) || 0;

  return {
    tipe,
    id,
    nama,
    kategori,
    qty: normalizedQuantity,
    hargaSatuan: normalizedUnitPrice,
    harga: normalizedUnitPrice * normalizedQuantity,
    children,
  };
};

const syncSelectedItemPricing = (item, layananMap) => {
  const normalizedQuantity = normalizeQuantity(item.qty);

  if (item.tipe === 'paket') {
    const nextChildren = (item.children || []).map(
      (child) => layananMap[child.id] || child,
    );
    const hargaSatuan = calculateChildrenUnitPrice(nextChildren);

    return {
      ...item,
      qty: normalizedQuantity,
      children: nextChildren,
      hargaSatuan,
      harga: hargaSatuan * normalizedQuantity,
    };
  }

  const nextLayanan = layananMap[item.id];
  const fallbackUnitPrice =
    Number(item.hargaSatuan) ||
    Math.round((Number(item.harga) || 0) / normalizedQuantity);
  const hargaSatuan = Number(nextLayanan?.harga) || fallbackUnitPrice || 0;

  return {
    ...item,
    qty: normalizedQuantity,
    nama: nextLayanan?.nama || item.nama,
    hargaSatuan,
    harga: hargaSatuan * normalizedQuantity,
  };
};

const buildInitialSelectedItems = (
  pemeriksaan,
  paketLayanan,
  kategoriLayanans,
) => {
  const layananMap = flattenLayananMap(kategoriLayanans);
  const detailMap = new Map(
    (pemeriksaan?.detail_pemeriksaan || []).map((detail) => [
      detail.jenis_layanan_id,
      detail,
    ]),
  );

  if (pemeriksaan?.layanan_order?.length) {
    return pemeriksaan.layanan_order.map((item) => {
      if (item.tipe === 'paket') {
        const paket = (paketLayanan || []).find(
          (currentPaket) => currentPaket.id === item.paket_pemeriksaan_id,
        );
        const children = resolvePackageChildren(paket, layananMap);
        const hargaSatuan = calculateChildrenUnitPrice(children);
        const inferredQuantity =
          hargaSatuan > 0 && Number(item.harga) > 0
            ? Math.max(1, Math.round(Number(item.harga) / hargaSatuan))
            : 1;

        return createSelectedItem({
          tipe: 'paket',
          id: item.paket_pemeriksaan_id,
          nama: item.nama_snapshot,
          hargaSatuan,
          qty: inferredQuantity,
          children,
          kategori: 'Paket pemeriksaan',
        });
      }

      const detail = detailMap.get(item.jenis_layanan_id);
      const quantity = normalizeQuantity(detail?.qty ?? 1);
      const totalPrice = Number(item.harga ?? detail?.harga) || 0;
      const unitPrice = quantity > 0 ? Math.round(totalPrice / quantity) : 0;

      return createSelectedItem({
        tipe: 'layanan',
        id: item.jenis_layanan_id,
        nama: item.nama_snapshot,
        hargaSatuan: unitPrice,
        qty: quantity,
      });
    });
  }

  return (
    pemeriksaan?.detail_pemeriksaan?.map((detail) => {
      const quantity = normalizeQuantity(detail.qty ?? 1);
      const totalPrice = Number(detail.harga) || 0;
      const unitPrice = quantity > 0 ? Math.round(totalPrice / quantity) : 0;

      return createSelectedItem({
        tipe: 'layanan',
        id: detail.jenis_layanan_id,
        nama: detail.jenis_layanan?.nama || '',
        hargaSatuan: unitPrice,
        qty: quantity,
      });
    }) || []
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
  const [itemQuery, setItemQuery] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [showItemOptions, setShowItemOptions] = useState(false);
  const initialSelectedItems = useMemo(
    () =>
      buildInitialSelectedItems(pemeriksaan, paketLayanan, kategoriLayanans),
    [pemeriksaan, paketLayanan, kategoriLayanans],
  );
  const [selectedItems, setSelectedItems] = useState(initialSelectedItems);
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
    penanggung_jawab: pemeriksaan?.penanggung_jawab || '',
    tempat_lahir_penanggung_jawab:
      pemeriksaan?.tempat_lahir_penanggung_jawab || '',
    tanggal_lahir_penanggung_jawab:
      pemeriksaan?.tanggal_lahir_penanggung_jawab || '',
    alamat_penanggung_jawab: pemeriksaan?.alamat_penanggung_jawab || '',
    telepon_penanggung_jawab: pemeriksaan?.telepon_penanggung_jawab || '',
    hubungan_penanggung_jawab: pemeriksaan?.hubungan_penanggung_jawab || '',
    jenis_kelamin_penanggung_jawab:
      pemeriksaan?.jenis_kelamin_penanggung_jawab || '',
    id_spesimen: pemeriksaan?.id_spesimen || idSpesimenTerakhir || '',
    items: initialSelectedItems.map((item) => ({
      tipe: item.tipe,
      id: item.id,
      harga: item.harga,
      qty: item.qty,
    })),
  });

  const layananMap = flattenLayananMap(listKategoriLayanans);
  const selectedItemKeys = useMemo(
    () => new Set(selectedItems.map((item) => `${item.tipe}-${item.id}`)),
    [selectedItems],
  );
  const availableItems = useMemo(() => {
    const paketItems = (paketLayanan || []).map((paket) => {
      const children = resolvePackageChildren(paket, layananMap);

      return createSelectedItem({
        tipe: 'paket',
        id: paket.id,
        nama: paket.nama,
        kategori: 'Paket pemeriksaan',
        hargaSatuan: calculateChildrenUnitPrice(children),
        children,
      });
    });

    const layananItems = Object.entries(listKategoriLayanans || {}).flatMap(
      ([namaKategori, layanans]) =>
        (layanans || []).map((layanan) =>
          createSelectedItem({
            tipe: 'layanan',
            id: layanan.id,
            nama: layanan.nama,
            kategori: namaKategori,
            hargaSatuan: Number(layanan.harga) || 0,
          }),
        ),
    );

    return [...paketItems, ...layananItems];
  }, [paketLayanan, listKategoriLayanans, layananMap]);
  const filteredAvailableItems = useMemo(() => {
    const query = itemQuery.trim().toLowerCase();

    return availableItems
      .filter(
        (item) => itemTypeFilter === 'all' || item.tipe === itemTypeFilter,
      )
      .filter((item) => {
        if (!query) return true;

        return (
          item.nama?.toLowerCase().includes(query) ||
          item.kategori?.toLowerCase().includes(query) ||
          String(item.id).toLowerCase().includes(query) ||
          (item.children || []).some((child) =>
            child.nama?.toLowerCase().includes(query),
          )
        );
      })
      .slice(0, 12);
  }, [availableItems, itemQuery, itemTypeFilter]);
  const totalSelectedPrice = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + (Number(item.harga) || 0),
        0,
      ),
    [selectedItems],
  );
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
      const nextItems = prev.map((item) =>
        syncSelectedItemPricing(item, nextLayananMap),
      );

      setData(
        'items',
        nextItems.map((item) => ({
          tipe: item.tipe,
          id: item.id,
          harga: item.harga,
          qty: item.qty,
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
      const nextItems = updater(prev).map((item) =>
        syncSelectedItemPricing(item, layananMap),
      );

      setData(
        'items',
        nextItems.map((item) => ({
          tipe: item.tipe,
          id: item.id,
          harga: item.harga,
          qty: item.qty,
        })),
      );

      return nextItems;
    });
  };

  const handleRemoveSelectedItem = (itemToRemove) => {
    syncSelectedItems((prev) => {
      return prev.filter(
        (item) =>
          !(item.tipe === itemToRemove.tipe && item.id === itemToRemove.id),
      );
    });
  };

  const handleSelectedItemQuantityChange = (itemToUpdate, nextQuantity) => {
    syncSelectedItems((prev) =>
      prev.map((item) => {
        if (item.tipe !== itemToUpdate.tipe || item.id !== itemToUpdate.id) {
          return item;
        }

        return {
          ...item,
          qty: normalizeQuantity(nextQuantity),
        };
      }),
    );
  };

  const addSelectedItem = (nextItem) => {
    syncSelectedItems((prev) => {
      const exists = prev.some(
        (item) => item.tipe === nextItem.tipe && item.id === nextItem.id,
      );

      if (exists) {
        return prev;
      }

      return [...prev, nextItem];
    });

    setItemQuery('');
    setShowItemOptions(false);
  };

  const buildPaketItem = (paket) => {
    const children = resolvePackageChildren(paket, layananMap);

    return createSelectedItem({
      tipe: 'paket',
      id: paket.id,
      nama: paket.nama,
      kategori: 'Paket pemeriksaan',
      hargaSatuan: calculateChildrenUnitPrice(children),
      children,
    });
  };

  const buildLayananItem = (layanan, namaKategori = '') =>
    createSelectedItem({
      tipe: 'layanan',
      id: layanan.id,
      nama: layanan.nama,
      kategori: namaKategori,
      hargaSatuan: Number(layanan.harga) || 0,
    });

  const togglePaketSelection = (paket) => {
    const itemKey = `paket-${paket.id}`;

    if (selectedItemKeys.has(itemKey)) {
      handleRemoveSelectedItem({ tipe: 'paket', id: paket.id });
      return;
    }

    addSelectedItem(buildPaketItem(paket));
  };

  const toggleLayananSelection = (layanan, namaKategori = '') => {
    const itemKey = `layanan-${layanan.id}`;

    if (selectedItemKeys.has(itemKey)) {
      handleRemoveSelectedItem({ tipe: 'layanan', id: layanan.id });
      return;
    }

    addSelectedItem(buildLayananItem(layanan, namaKategori));
  };

  const handleSearchItemSelect = (item) => {
    addSelectedItem(item);
  };

  const handleItemSearchCommit = () => {
    if (!itemQuery.trim()) {
      setShowItemOptions(false);
      return;
    }

    if (filteredAvailableItems.length === 0) {
      setShowItemOptions(false);
      return;
    }

    handleSearchItemSelect(filteredAvailableItems[0]);
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

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Penanggung Jawab
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <Label
                          htmlFor="penanggung_jawab"
                          color={errors.penanggung_jawab ? 'failure' : 'gray'}
                        >
                          Nama Penanggung Jawab
                        </Label>
                        <TextInput
                          id="penanggung_jawab"
                          type="text"
                          value={data.penanggung_jawab}
                          onChange={(e) =>
                            setData('penanggung_jawab', e.target.value)
                          }
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <InputError
                          className="mt-2"
                          message={errors.penanggung_jawab}
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="hubungan_penanggung_jawab"
                          color={
                            errors.hubungan_penanggung_jawab
                              ? 'failure'
                              : 'gray'
                          }
                        >
                          Hubungan Pasien dengan Penangung Jawab
                        </Label>
                        <Select
                          id="hubungan_penanggung_jawab"
                          value={data.hubungan_penanggung_jawab}
                          onChange={(e) =>
                            setData('hubungan_penanggung_jawab', e.target.value)
                          }
                          color={
                            errors.hubungan_penanggung_jawab
                              ? 'failure'
                              : 'gray'
                          }
                        >
                          <option value="">Pilih Hubungan</option>
                          <option value="suami">Suami</option>
                          <option value="istri">Istri</option>
                          <option value="ayah">Ayah</option>
                          <option value="ibu">Ibu</option>
                          <option value="anak">Anak</option>
                          <option value="keluarga">Keluarga</option>
                        </Select>
                        <InputError
                          className="mt-2"
                          message={errors.hubungan_penanggung_jawab}
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="tempat_lahir_penanggung_jawab"
                          color={
                            errors.tempat_lahir_penanggung_jawab
                              ? 'failure'
                              : 'gray'
                          }
                        >
                          Tempat Lahir
                        </Label>
                        <TextInput
                          id="tempat_lahir_penanggung_jawab"
                          type="text"
                          value={data.tempat_lahir_penanggung_jawab}
                          onChange={(e) =>
                            setData(
                              'tempat_lahir_penanggung_jawab',
                              e.target.value,
                            )
                          }
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <InputError
                          className="mt-2"
                          message={errors.tempat_lahir_penanggung_jawab}
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="tanggal_lahir_penanggung_jawab"
                          color={
                            errors.tanggal_lahir_penanggung_jawab
                              ? 'failure'
                              : 'gray'
                          }
                        >
                          Tanggal Lahir
                        </Label>
                        <TextInput
                          id="tanggal_lahir_penanggung_jawab"
                          type="date"
                          value={data.tanggal_lahir_penanggung_jawab}
                          onChange={(e) =>
                            setData(
                              'tanggal_lahir_penanggung_jawab',
                              e.target.value,
                            )
                          }
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <InputError
                          className="mt-2"
                          message={errors.tanggal_lahir_penanggung_jawab}
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="telepon_penanggung_jawab"
                          color={
                            errors.telepon_penanggung_jawab ? 'failure' : 'gray'
                          }
                        >
                          No. Telepon
                        </Label>
                        <TextInput
                          id="telepon_penanggung_jawab"
                          type="text"
                          value={data.telepon_penanggung_jawab}
                          onChange={(e) =>
                            setData('telepon_penanggung_jawab', e.target.value)
                          }
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <InputError
                          className="mt-2"
                          message={errors.telepon_penanggung_jawab}
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="jenis_kelamin_penanggung_jawab"
                          color={
                            errors.jenis_kelamin_penanggung_jawab
                              ? 'failure'
                              : 'gray'
                          }
                        >
                          Jenis Kelamin
                        </Label>
                        <Select
                          id="jenis_kelamin_penanggung_jawab"
                          className="mt-1"
                          value={data.jenis_kelamin_penanggung_jawab}
                          onChange={(e) =>
                            setData(
                              'jenis_kelamin_penanggung_jawab',
                              e.target.value,
                            )
                          }
                          color={
                            errors.jenis_kelamin_penanggung_jawab
                              ? 'failure'
                              : 'gray'
                          }
                          disabled={processing}
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </Select>
                        <InputError
                          className="mt-2"
                          message={errors.jenis_kelamin_penanggung_jawab}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label
                          htmlFor="alamat_penanggung_jawab"
                          color={
                            errors.alamat_penanggung_jawab ? 'failure' : 'gray'
                          }
                        >
                          Alamat
                        </Label>
                        <Textarea
                          id="alamat_penanggung_jawab"
                          rows="2"
                          value={data.alamat_penanggung_jawab}
                          onChange={(e) =>
                            setData('alamat_penanggung_jawab', e.target.value)
                          }
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <InputError
                          className="mt-2"
                          message={errors.alamat_penanggung_jawab}
                        />
                      </div>
                    </div>
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
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Pilih Layanan Laboratorium
                      </h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Cari paket atau layanan, tambahkan ke tabel, lalu atur
                        qty sesuai kebutuhan.
                      </p>
                    </div>
                    <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {selectedItems.length} item terpilih
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
                        <div className="relative">
                          <Label htmlFor="item_query">
                            Cari paket atau layanan
                          </Label>
                          <TextInput
                            id="item_query"
                            type="text"
                            value={itemQuery}
                            onFocus={() => setShowItemOptions(true)}
                            onBlur={() => {
                              setTimeout(() => {
                                setShowItemOptions(false);
                              }, 150);
                            }}
                            onChange={(e) => {
                              setItemQuery(e.target.value);
                              setShowItemOptions(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleItemSearchCommit();
                              }
                            }}
                            placeholder="Ketik nama layanan, paket, atau kategori"
                            autoComplete="off"
                            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />

                          {showItemOptions && (
                            <div className="absolute z-10 mt-2 max-h-80 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                              {filteredAvailableItems.length > 0 ? (
                                filteredAvailableItems.map((item) => {
                                  const itemKey = `${item.tipe}-${item.id}`;
                                  const isSelected =
                                    selectedItemKeys.has(itemKey);

                                  return (
                                    <button
                                      key={itemKey}
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() =>
                                        handleSearchItemSelect(item)
                                      }
                                      disabled={isSelected}
                                      className="flex w-full items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:bg-gray-800"
                                    >
                                      <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                          {item.nama}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                                          {item.tipe === 'paket'
                                            ? 'Paket pemeriksaan'
                                            : item.kategori || 'Layanan'}
                                        </div>
                                        {item.tipe === 'paket' && (
                                          <div className="mt-1 text-xs text-gray-400 dark:text-gray-300">
                                            {(item.children || []).length}{' '}
                                            layanan:{' '}
                                            {(item.children || [])
                                              .map((child) => child.nama)
                                              .join(', ')}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                                          {formatCurrency(item.hargaSatuan)}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                                          {isSelected
                                            ? 'Sudah dipilih'
                                            : 'Tambah'}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-300">
                                  Tidak ada item yang cocok dengan pencarian.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="item_type_filter">
                            Filter jenis item
                          </Label>
                          <Select
                            id="item_type_filter"
                            value={itemTypeFilter}
                            onChange={(e) => setItemTypeFilter(e.target.value)}
                          >
                            <option value="all">Semua item</option>
                            <option value="paket">Paket pemeriksaan</option>
                            <option value="layanan">Layanan satuan</option>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        Tekan Enter untuk menambahkan hasil teratas dari kotak
                        pencarian. Gunakan panel di bawah jika ingin menelusuri
                        berdasarkan paket atau kategori layanan.
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
                      <h3 className="text-base font-semibold text-blue-900 dark:text-blue-200">
                        Ringkasan Pilihan
                      </h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <div className="rounded-lg bg-white/80 p-4 dark:bg-gray-800/70">
                          <div className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                            Total item
                          </div>
                          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedItems.length}
                          </div>
                        </div>
                        <div className="rounded-lg bg-white/80 p-4 dark:bg-gray-800/70">
                          <div className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                            Estimasi nilai
                          </div>
                          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(totalSelectedPrice)}
                          </div>
                        </div>
                      </div>

                      {errors.items && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                          {errors.items}
                        </div>
                      )}

                      {overlapWarnings.length > 0 && (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                          Layanan satuan ini juga sudah tercakup di paket:{' '}
                          {Array.from(new Set(overlapWarnings)).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Tabel Item Terpilih
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Qty akan disimpan ke detail pemeriksaan dan subtotal
                          dihitung otomatis.
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Total: {formatCurrency(totalSelectedPrice)}
                      </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">
                              Item
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">
                              Jenis
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-200">
                              Harga Satuan
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-200">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-200">
                              Subtotal
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-200">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {selectedItems.length > 0 ? (
                            selectedItems.map((item) => (
                              <tr
                                key={`${item.tipe}-${item.id}`}
                                className="align-top"
                              >
                                <td className="px-4 py-4">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {item.nama}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                                    {item.tipe === 'paket'
                                      ? `${(item.children || []).length} layanan dalam paket`
                                      : item.kategori || 'Layanan pemeriksaan'}
                                  </div>
                                  {item.tipe === 'paket' &&
                                    (item.children || []).length > 0 && (
                                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                                        {(item.children || [])
                                          .map((child) => child.nama)
                                          .join(', ')}
                                      </div>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                                  {item.tipe === 'paket'
                                    ? 'Paket'
                                    : item.kategori || 'Layanan'}
                                </td>
                                <td className="px-4 py-4 text-right font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(item.hargaSatuan)}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="mx-auto max-w-32 text-right">
                                    <TextInput
                                      type="number"
                                      min="1"
                                      value={item.qty}
                                      onChange={(e) =>
                                        handleSelectedItemQuantityChange(
                                          item,
                                          e.target.value,
                                        )
                                      }
                                      className="w-20 text-center"
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-right font-semibold text-blue-700 dark:text-blue-300">
                                  {formatCurrency(item.harga)}
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveSelectedItem(item)
                                    }
                                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                                  >
                                    Hapus
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="6"
                                className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                              >
                                Belum ada item dipilih. Gunakan pencarian di
                                atas atau tambah dari daftar paket dan kategori.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    {/* <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Paket Pemeriksaan
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Quick add
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {paketLayanan && paketLayanan.length > 0 ? (
                          paketLayanan.map((paket) => {
                            const itemKey = `paket-${paket.id}`;
                            const isSelected = selectedItemKeys.has(itemKey);
                            const children = resolvePackageChildren(
                              paket,
                              layananMap,
                            );

                            return (
                              <div
                                key={paket.id}
                                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {paket.nama}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                                      {children.length} layanan
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => togglePaketSelection(paket)}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                      isSelected
                                        ? 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                  >
                                    {isSelected ? 'Dipilih' : 'Tambah'}
                                  </button>
                                </div>
                                <div className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  {formatCurrency(
                                    calculateChildrenUnitPrice(children),
                                  )}
                                </div>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                                  {children
                                    .map((child) => child.nama)
                                    .join(', ')}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Tidak ada paket tersedia.
                          </div>
                        )}
                      </div>
                    </div> */}

                    {/* <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Jelajahi per Kategori
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Klik tambah untuk masukkan ke tabel
                        </span>
                      </div>

                      {listKategoriLayanans &&
                      Object.keys(listKategoriLayanans).length > 0 ? (
                        <div className="mt-4 max-h-[34rem] space-y-4 overflow-y-auto pr-1">
                          {Object.entries(listKategoriLayanans).map(
                            ([namaKategori, layanans]) => (
                              <div
                                key={namaKategori}
                                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
                              >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {namaKategori}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-300">
                                      {(layanans || []).length} layanan
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {(layanans || []).map((layanan) => {
                                    const itemKey = `layanan-${layanan.id}`;
                                    const isSelected =
                                      selectedItemKeys.has(itemKey);

                                    return (
                                      <div
                                        key={layanan.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-3 dark:border-gray-700"
                                      >
                                        <div>
                                          <div className="font-medium text-gray-900 dark:text-white">
                                            {layanan.nama}
                                          </div>
                                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                                            {formatCurrency(layanan.harga)}
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleLayananSelection(
                                              layanan,
                                              namaKategori,
                                            )
                                          }
                                          className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                            isSelected
                                              ? 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                          }`}
                                        >
                                          {isSelected ? 'Dipilih' : 'Tambah'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          Tidak ada layanan tersedia untuk jenis pasien ini.
                        </div>
                      )}
                    </div> */}
                  </div>

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
