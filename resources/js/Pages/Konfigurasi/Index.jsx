import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

export default function Index({ konfigurasi = [] }) {
    const [formData, setFormData] = useState(
        konfigurasi.map((item) => ({ ...item })),
    );
    const [processing, setProcessing] = useState(false);

    const handleChange = (index, value) => {
        setFormData((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], nilai: value };
            return copy;
        });
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await axios.post(route('konfigurasi.updateAll'), {
                konfigurasi: formData,
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <LabkesdaLayout>
            <Head title="Konfigurasi" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6">
                            <form onSubmit={submit}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                            >
                                                Nama
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                            >
                                                Nilai
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {formData.map((item, index) => (
                                            <tr key={item.id || index}>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {item.nama}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {item.keterangan}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <TextInput
                                                        value={item.nilai}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                index,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="mt-1 block w-full"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-4 flex items-center justify-end">
                                    <PrimaryButton
                                        className={
                                            processing ? 'opacity-25' : ''
                                        }
                                        disabled={processing}
                                    >
                                        Simpan
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </LabkesdaLayout>
    );
}
