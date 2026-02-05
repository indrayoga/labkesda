<?php

namespace App\Rules;

use App\Models\DaftarHarga;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class IsTarifLayananValidExists implements ValidationRule
{
    /**
     * @var array<string, mixed>
     */
    protected array $payload = [];

    /**
     * Create a new rule instance.
     *
     * @param array<string, mixed> $payload
     */
    public function __construct(array $payload = [])
    {
        $this->payload = $payload;
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $data = $this->payload;

        if (empty($data['jenis_layanan_id']) || empty($data['valid_dari'])) {
            return;
        }

        $validDari = $data['valid_dari'];
        $validSampai = $data['valid_sampai'] ?? null;

        // buat kustom validasi jika masih ada jenis pasien dengan tarif yang berlaku pada rentang tanggal yang sama
        $exists = DaftarHarga::where('jenis_layanan_id', $data['jenis_layanan_id'])
            ->where('jenis_pasien', $value)
            ->where(function ($query) use ($validDari, $validSampai) {
                // Jika existing valid_sampai NULL => aktif selamanya, otomatis bentrok
                $query->whereNull('valid_sampai')
                    ->orWhere(function ($query) use ($validDari, $validSampai) {
                        if ($validSampai === null) {
                            // Baru open-ended: bentrok jika existing masih aktif pada valid_dari
                            $query->where('valid_sampai', '>=', $validDari);
                        } else {
                            // Ada valid_sampai: bentrok jika rentang beririsan
                            $query->where('valid_sampai', '>=', $validDari)
                                ->where('valid_dari', '<=', $validSampai);
                        }
                    });
            })
            ->exists();

        if ($exists) {
            $fail('Tarif untuk jenis pasien dan layanan ini masih ada yang aktif pada rentang tanggal yang sama. silahkan non aktifkan tarif yang lama terlebih dahulu.');
        }
    }
}
