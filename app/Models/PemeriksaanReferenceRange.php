<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemeriksaanReferenceRange extends Model
{
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

    public function itemPemeriksaan()
    {
        return $this->belongsTo(ItemPemeriksaan::class, 'item_pemeriksaan_id');
    }
}
