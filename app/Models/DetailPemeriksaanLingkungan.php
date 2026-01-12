<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailPemeriksaanLingkungan extends Model
{
    protected $table = 'detail_pemeriksaan_lingkungan';
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

    public function pemeriksaanLingkungan()
    {
        return $this->belongsTo(PemeriksaanLingkungan::class, 'pemeriksaan_lingkungan_id');
    }

    public function jenisLayanan()
    {
        return $this->belongsTo(JenisLayanan::class, 'jenis_layanan_id');
    }
}
