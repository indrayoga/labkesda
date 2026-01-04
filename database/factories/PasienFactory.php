<?php

namespace Database\Factories;

use App\Models\Kecamatan;
use App\Models\Kelurahan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pasien>
 */
class PasienFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama' => $this->faker->name(),
            'jenis_kelamin' => $this->faker->randomElement(['Laki-laki', 'Perempuan']),
            'tempat_lahir' => $this->faker->city(),
            'tanggal_lahir' => $this->faker->date(),
            'no_telepon' => $this->faker->phoneNumber(),
            'kecamatan_id' => Kecamatan::inRandomOrder()->first()->id,
            'kelurahan_id' => Kelurahan::inRandomOrder()->first()->id,
            'alamat' => $this->faker->address(),
            'pekerjaan' => $this->faker->jobTitle(),
        ];
    }
}
