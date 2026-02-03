<?php

namespace App\Services;

use App\Models\ItemPemeriksaan;
use App\Models\PemeriksaanReferenceRange;

class ItemPemeriksaanService
{
    /**
     * Build hierarchical tree of ItemPemeriksaan in desired format.
     *
     * @param string|null $kategoriId Optional filter by kategori_pemeriksaan_id
     * @return array
     */
    public static function getTree(?string $kategoriId = null): array
    {
        $query = ItemPemeriksaan::query()
            ->select(['id', 'nama', 'satuan', 'metode', 'parent_id', 'urut'])
            ->orderBy('urut')
            ->orderBy('nama');

        if ($kategoriId) {
            $query->where('kategori_pemeriksaan_id', $kategoriId);
        }

        $items = $query->get();

        // Group items by parent_id for fast tree assembly
        $byParent = [];
        foreach ($items as $item) {
            $parentId = $item->parent_id ?: null;
            $byParent[$parentId][] = $item;
        }

        // Build recursively from parent_id = null
        return self::buildChildren(null, $byParent);
    }

    /**
     * Recursively build children nodes
     *
     * @param string|null $parentId
     * @param array<string|null, array<ItemPemeriksaan>> $byParent
     * @return array
     */
    protected static function buildChildren(?string $parentId, array $byParent): array
    {
        $children = $byParent[$parentId] ?? [];
        $nodes = [];

        foreach ($children as $item) {
            $node = [
                'id' => $item->id,
                'name' => $item->nama,
                'satuan' => $item->satuan,
                'metode' => $item->metode,
                'urut' => $item->urut,
                'parent_id' => $item->parent_id,
                'parent_name' => $item->parent?->nama ?? null,
                'kategori_pemeriksaan_id' => $item->kategori_pemeriksaan_id,
                'reference_ranges' => $item->referenceRanges->map(function ($range) {
                    return [
                        'id' => $range->id,
                        'label' => $range->label,
                        'jenis_kelamin' => $range->jenis_kelamin,
                        'value_type' => $range->value_type,
                        'min_value' => $range->min_value,
                        'max_value' => $range->max_value,
                        'kualitatif_value' => $range->kualitatif_value,
                        'operator_min' => $range->operator_min,
                        'operator_max' => $range->operator_max,
                    ];
                })->toArray(),
                'used' => self::isItemUsed($item->id),
            ];

            $grandChildren = self::buildChildren($item->id, $byParent);
            if (!empty($grandChildren)) {
                $node['children'] = $grandChildren;
            }

            $nodes[] = $node;
        }

        return $nodes;
    }

    /**
     * Determine whether an item is used somewhere in the system.
     * Currently checks existence in pemeriksaan_reference_ranges.
     */
    protected static function isItemUsed(string $itemId): bool
    {
        return PemeriksaanReferenceRange::where('item_pemeriksaan_id', $itemId)->exists();
    }

    /**
     * Provide a static sample structure matching the requested format.
     * Useful for testing when DB is empty.
     */
    public static function sample(): array
    {
        return [
            [
                'id' => 'sample-1',
                'name' => 'Darah Lengkap',
                'used' => false,
                'children' => [
                    [
                        'id' => 'sample-11',
                        'name' => 'Hemoglobine',
                        'satuan' => 'g/dL',
                        'metode' => 'Photometry',
                        'used' => false,
                    ],
                    [
                        'id' => 'sample-12',
                        'name' => 'Eritrosit',
                        'satuan' => '10^6/µL',
                        'metode' => 'Impedance',
                        'used' => true,
                    ],
                    [
                        'id' => 'sample-13',
                        'name' => 'Leukosit',
                        'satuan' => '10^3/µL',
                        'metode' => 'Impedance',
                        'used' => false,
                    ],
                    [
                        'id' => 'sample-14',
                        'name' => 'Diff Count',
                        'used' => false,
                        'children' => [
                            [
                                'id' => 'sample-141',
                                'name' => 'Eosinofil',
                                'satuan' => '%',
                                'metode' => 'Manual/Auto',
                                'used' => false,
                            ],
                            [
                                'id' => 'sample-142',
                                'name' => 'Basofil',
                                'satuan' => '%',
                                'metode' => 'Manual/Auto',
                                'used' => false,
                            ],
                            [
                                'id' => 'sample-143',
                                'name' => 'Limfosit',
                                'satuan' => '%',
                                'metode' => 'Manual/Auto',
                                'used' => true,
                            ],
                            [
                                'id' => 'sample-144',
                                'name' => 'Monosit',
                                'satuan' => '%',
                                'metode' => 'Manual/Auto',
                                'used' => false,
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
