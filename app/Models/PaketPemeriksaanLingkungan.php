<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaketPemeriksaanLingkungan extends Model
{
    //
    protected $table = 'paket_pemeriksaan_lingkungan';
    protected $guarded = [];
    public $incrementing = false;
    protected $keyType = 'string';

    static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function pemeriksaanLingkungan()
    {
        return $this->belongsTo(PemeriksaanLingkungan::class, 'pemeriksaan_lingkungan_id');
    }

    public function paketPemeriksaan()
    {
        return $this->belongsTo(PaketPemeriksaan::class, 'paket_pemeriksaan_id');
    }
}
