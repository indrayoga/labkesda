<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    //
    protected $table = 'pembayaran';
    protected $guarded = ['id'];
    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) \Illuminate\Support\Str::uuid();
            $model->no_bayar = self::generateNoBayar();
        });
    }

    protected static function generateNoBayar()
    {
        $datePart = date('Ymd');
        $lastRecord = self::whereDate('created_at', date('Y-m-d'))
            ->orderBy('no_bayar', 'desc')
            ->first();

        if ($lastRecord) {
            $lastNumber = (int) substr($lastRecord->no_bayar, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $datePart . '.' . $newNumber;
    }
}
