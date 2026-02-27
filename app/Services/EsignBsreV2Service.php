<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use InvalidArgumentException;
use RuntimeException;

class EsignBsreV2Service
{
    /**
     * Sign PDF using BSR-E V2 API (JSON payload).
     *
     * @param string|array<int, string> $files Path file PDF, base64 string, atau array keduanya.
     * @param array<int, array<string, mixed>> $signatureProperties
     */
    public function signPdf(
        string|array $files,
        string $nik,
        string $passphrase,
        array $signatureProperties
    ): string {
        if ($nik === '' || $passphrase === '') {
            throw new InvalidArgumentException('NIK dan passphrase wajib diisi.');
        }

        if (empty($signatureProperties)) {
            throw new InvalidArgumentException('signatureProperties wajib diisi minimal 1 item.');
        }

        $bsreConfig = (array) config('services.bsre', []);
        $baseUrl = (string) ($bsreConfig['base_url'] ?? '');
        $username = (string) ($bsreConfig['username'] ?? '');
        $password = (string) ($bsreConfig['password'] ?? '');
        $timeout = (int) ($bsreConfig['timeout'] ?? 120);
        $v2Endpoint = (string) ($bsreConfig['v2_endpoint'] ?? '/api/sign/pdf');

        if ($baseUrl === '' || $username === '' || $password === '') {
            throw new RuntimeException('Konfigurasi BSR-E belum lengkap. Isi BSRE_BASE_URL, BSRE_USERNAME, BSRE_PASSWORD di .env.');
        }

        $endpoint = rtrim($baseUrl, '/') . '/' . ltrim($v2Endpoint, '/');
        // dd($this->normalizeFilesToBase64($files));
        $payload = [
            'file' => $this->normalizeFilesToBase64($files),
            'nik' => $nik,
            'passphrase' => $passphrase,
            'signatureProperties' => $this->normalizeSignatureProperties($signatureProperties),
        ];

        try {
            $client = new Client([
                'timeout' => $timeout,
                'allow_redirects' => true,
            ]);

            $response = $client->request('POST', $endpoint, [
                'auth' => [$username, $password],
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
            ]);

            $responseBody = (string) $response->getBody();
            $decodedResponse = json_decode($responseBody, true);

            if (! is_array($decodedResponse)) {
                throw new RuntimeException('Respons BSR-E V2 tidak valid (bukan JSON object).');
            }

            $fileList = $decodedResponse['file'] ?? null;
            if (! is_array($fileList) || empty($fileList)) {
                throw new RuntimeException('Respons BSR-E V2 tidak memiliki field file yang valid.');
            }

            $signedFileBase64 = $fileList[0] ?? null;
            if (! is_string($signedFileBase64) || trim($signedFileBase64) === '') {
                throw new RuntimeException('Field file[0] pada respons BSR-E V2 tidak valid.');
            }

            $signedFileBinary = base64_decode($signedFileBase64, true);
            if ($signedFileBinary === false) {
                throw new RuntimeException('Gagal decode base64 file hasil tanda tangan dari BSR-E V2.');
            }

            return $signedFileBinary;
        } catch (GuzzleException $exception) {
            throw new RuntimeException('Gagal sign PDF ke BSR-E V2: ' . $exception->getMessage(), 0, $exception);
        }
    }

    /**
     * @param string|array<int, string> $files
     * @return array<int, string>
     */
    protected function normalizeFilesToBase64(string|array $files): array
    {
        $items = is_array($files) ? $files : [$files];

        if (empty($items)) {
            throw new InvalidArgumentException('Parameter file wajib diisi.');
        }

        $result = [];

        foreach ($items as $item) {
            if (! is_string($item) || trim($item) === '') {
                throw new InvalidArgumentException('Setiap item file harus berupa string path file atau base64.');
            }

            $value = trim($item);

            if (is_file($value)) {
                $binary = file_get_contents($value);
                if ($binary === false) {
                    throw new RuntimeException("Gagal membaca file: {$value}");
                }

                $result[] = base64_encode($binary);
                continue;
            }

            if (! $this->isBase64($value)) {
                throw new InvalidArgumentException('Nilai file harus path file yang valid atau string base64 yang valid.');
            }

            $result[] = $value;
        }

        return $result;
    }

    /**
     * @param array<int, array<string, mixed>> $signatureProperties
     * @return array<int, array<string, mixed>>
     */
    protected function normalizeSignatureProperties(array $signatureProperties): array
    {
        $allowedFields = [
            'certificateChainBase64',
            'certificationPermission',
            'contactInfo',
            'documentDigestBase64',
            'fieldId',
            'height',
            'imageBase64',
            'location',
            'originX',
            'originY',
            'page',
            'passphrase',
            'reason',
            'signatureLevel',
            'signingDate',
            'tag',
            'tampilan',
            'width',
        ];

        $normalized = [];

        foreach ($signatureProperties as $index => $property) {
            if (! is_array($property)) {
                throw new InvalidArgumentException('Setiap item signatureProperties harus berupa object/array.');
            }

            $item = [];
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $property) && $property[$field] !== null) {
                    $item[$field] = $property[$field];
                }
            }

            if (! array_key_exists('reason', $item)) {
                $item['reason'] = 'TTE';
            }

            if (! array_key_exists('signingDate', $item)) {
                $item['signingDate'] = now()->toISOString();
            }

            if (empty($item)) {
                throw new InvalidArgumentException('signatureProperties index ' . $index . ' tidak memiliki field yang valid.');
            }

            $normalized[] = $item;
        }

        return $normalized;
    }

    protected function isBase64(string $value): bool
    {
        if ($value === '') {
            return false;
        }

        $decoded = base64_decode($value, true);
        if ($decoded === false) {
            return false;
        }

        return base64_encode($decoded) === preg_replace('/\s+/', '', $value);
    }
}
