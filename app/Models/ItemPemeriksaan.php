<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemPemeriksaan extends Model
{
    //
    protected $table = 'item_pemeriksaan';
    protected $guarded = [];
    public $incrementing = false;
    protected $keyType = 'string';

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function kategoriPemeriksaan()
    {
        return $this->belongsTo(KategoriPemeriksaan::class, 'kategori_pemeriksaan_id');
    }

    public function parent()
    {
        return $this->belongsTo(ItemPemeriksaan::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ItemPemeriksaan::class, 'parent_id');
    }

    public function referenceRanges()
    {
        return $this->hasMany(PemeriksaanReferenceRange::class, 'item_pemeriksaan_id');
    }

    public function jenisLayanan()
    {
        return $this->belongsToMany(JenisLayanan::class, 'item_pemeriksaan_layanan', 'item_pemeriksaan_id', 'jenis_layanan_id');
    }

    public function hasilPemeriksaan()
    {
        return $this->hasMany(HasilPemeriksaan::class, 'item_pemeriksaan_id');
    }
}
