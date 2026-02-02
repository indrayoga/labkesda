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
}
