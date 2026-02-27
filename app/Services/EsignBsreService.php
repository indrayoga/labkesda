<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use InvalidArgumentException;
use RuntimeException;

class EsignBsreService
{
    /**
     * Sign PDF document using BSR-E API.
     *
     * @param array<string, mixed> $options Optional body params:
     * page, image, linkQR, xAxis, yAxis, width, height,
     * tag_koordinat, reason, location, text, imageTTD (path png/jpg/jpeg).
     */
    public function signPdf(
        string $filePath,
        string $nik,
        string $passphrase,
        string $tampilan = 'invisible',
        array $options = []
    ): string {
        if (! is_file($filePath)) {
            throw new InvalidArgumentException("File tidak ditemukan: {$filePath}");
        }

        $baseUrl = (string) config('services.bsre.base_url');
        $username = (string) config('services.bsre.username');
        $password = (string) config('services.bsre.password');
        $timeout = (int) config('services.bsre.timeout', 120);

        if ($baseUrl === '' || $username === '' || $password === '') {
            throw new RuntimeException('Konfigurasi BSR-E belum lengkap. Isi BSRE_BASE_URL, BSRE_USERNAME, BSRE_PASSWORD di .env.');
        }

        $endpoint = rtrim($baseUrl, '/') . '/api/sign/pdf';
        $fileHandle = fopen($filePath, 'r');

        if ($fileHandle === false) {
            throw new RuntimeException("Gagal membuka file: {$filePath}");
        }

        $openedHandles = [$fileHandle];

        try {
            $client = new Client([
                'timeout' => $timeout,
                'allow_redirects' => true,
            ]);

            $multipart = [
                [
                    'name' => 'file',
                    'contents' => $fileHandle,
                    'filename' => basename($filePath),
                ],
                ['name' => 'nik', 'contents' => $nik],
                ['name' => 'passphrase', 'contents' => $passphrase],
                ['name' => 'tampilan', 'contents' => $tampilan],
            ];

            if (array_key_exists('imageTTD', $options) && $options['imageTTD'] !== null) {
                $imagePath = (string) $options['imageTTD'];

                if (! is_file($imagePath)) {
                    throw new InvalidArgumentException("File imageTTD tidak ditemukan: {$imagePath}");
                }

                $imageExtension = strtolower((string) pathinfo($imagePath, PATHINFO_EXTENSION));
                if (! in_array($imageExtension, ['png', 'jpg', 'jpeg'], true)) {
                    throw new InvalidArgumentException('Format imageTTD harus png, jpg, atau jpeg.');
                }

                $imageHandle = fopen($imagePath, 'r');
                if ($imageHandle === false) {
                    throw new RuntimeException("Gagal membuka file imageTTD: {$imagePath}");
                }

                $openedHandles[] = $imageHandle;

                $multipart[] = [
                    'name' => 'imageTTD',
                    'contents' => $imageHandle,
                    'filename' => basename($imagePath),
                ];
            }

            $allowedOptionalFields = [
                'page',
                'image',
                'linkQR',
                'xAxis',
                'yAxis',
                'width',
                'height',
                'tag_koordinat',
                'reason',
                'location',
                'text',
            ];

            foreach ($allowedOptionalFields as $field) {
                if (! array_key_exists($field, $options) || $options[$field] === null) {
                    continue;
                }

                $value = $options[$field];

                if (is_bool($value)) {
                    $value = $value ? 'true' : 'false';
                }

                $multipart[] = [
                    'name' => $field,
                    'contents' => (string) $value,
                ];
            }

            $response = $client->request('POST', $endpoint, [
                'auth' => [$username, $password],
                'multipart' => $multipart,
            ]);

            return (string) $response->getBody();
        } catch (GuzzleException $exception) {
            throw new RuntimeException('Gagal sign PDF ke BSR-E: ' . $exception->getMessage(), 0, $exception);
        } finally {
            foreach ($openedHandles as $handle) {
                if (is_resource($handle)) {
                    fclose($handle);
                }
            }
        }
    }
}
