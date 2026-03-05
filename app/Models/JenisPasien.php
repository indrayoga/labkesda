<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JenisPasien extends Model
{
    use SoftDeletes;
    //
    protected $table = 'jenis_pasien';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['kode', 'nama', 'urut', 'kategori'];

    public function pemeriksaan()
    {
        return $this->hasMany(Pemeriksaan::class, 'jenis_pasien', 'kode');
    }
}
