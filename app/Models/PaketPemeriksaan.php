<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketPemeriksaan extends Model
{
    /** @use HasFactory<\Database\Factories\PaketPemeriksaanFactory> */
    use HasFactory;

    protected $table = 'paket_pemeriksaan';
    protected $guarded = [];
    public $incrementing = false;
    protected $keyType = 'string';
    protected $appends = ['jumlah', 'harga'];
    static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function jenisLayanan()
    {
        return $this
            ->belongsToMany(JenisLayanan::class, 'item_paket_pemeriksaan', 'paket_pemeriksaan_id', 'jenis_layanan_id')
            ->withTimestamps();
    }

    public function getJumlahAttribute()
    {
        return $this->jenisLayanan()->count();
    }

    public function getHargaAttribute()
    {
        return $this->jenisLayanan()->get()->sum(function ($layanan) {
            $tarifUmum = $layanan->tarifUmum()->first();
            return $tarifUmum ? $tarifUmum->harga : 0;
        });
    }
}
