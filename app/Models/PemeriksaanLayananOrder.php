<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemeriksaanLayananOrder extends Model
{
    protected $table = 'pemeriksaan_layanan_order';
    protected $guarded = ['id'];
    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->id = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function pemeriksaan()
    {
        return $this->belongsTo(Pemeriksaan::class, 'pemeriksaan_id');
    }

    public function paketPemeriksaan()
    {
        return $this->belongsTo(PaketPemeriksaan::class, 'paket_pemeriksaan_id');
    }

    public function jenisLayanan()
    {
        return $this->belongsTo(JenisLayanan::class, 'jenis_layanan_id');
    }
}
