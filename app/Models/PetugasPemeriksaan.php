<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PetugasPemeriksaan extends Model
{
    use HasFactory;

    protected $table = 'petugas_pemeriksaan';

    protected $fillable = [
        'pemeriksaan_id',
        'user_id',
    ];

    public function pemeriksaan()
    {
        return $this->belongsTo(Pemeriksaan::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
