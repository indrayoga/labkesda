<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HasilPemeriksaan extends Model
{
    protected $table = 'hasil_pemeriksaan';
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

    public function pemeriksaan()
    {
        return $this->belongsTo(Pemeriksaan::class);
    }

    public function detailPemeriksaan()
    {
        return $this->belongsTo(DetailPemeriksaan::class, 'detail_pemeriksaan_id');
    }

    public function itemPemeriksaan()
    {
        return $this->belongsTo(ItemPemeriksaan::class);
    }
}
