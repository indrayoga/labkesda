<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriPemeriksaan extends Model
{
    //
    protected $table = 'kategori_pemeriksaan';
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

    public function parent()
    {
        return $this->belongsTo(KategoriPemeriksaan::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(KategoriPemeriksaan::class, 'parent_id');
    }

    public function itemPemeriksaan()
    {
        return $this->hasMany(ItemPemeriksaan::class, 'kategori_pemeriksaan_id');
    }
}
