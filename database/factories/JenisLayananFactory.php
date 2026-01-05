<?php

namespace Database\Factories;

use App\Models\KategoriLayanan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JenisLayanan>
 */
class JenisLayananFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kategori_layanan_id' => KategoriLayanan::inRandomOrder()->first()->id,
            'nama' => $this->faker->word(),
            'harga' => $this->faker->numberBetween(50000, 500000),
        ];
    }
}
