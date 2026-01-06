<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailPemeriksaan extends Model
{
    //
    protected $table = 'detail_pemeriksaan';
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
}
