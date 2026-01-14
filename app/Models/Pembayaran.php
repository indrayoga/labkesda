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

    public function pemeriksaan()
    {
        return $this->belongsTo(Pemeriksaan::class, 'pemeriksaan_id');
    }

    public function pemeriksaanLingkungan()
    {
        return $this->belongsTo(PemeriksaanLingkungan::class, 'pemeriksaan_id');
    }

    public function pasien()
    {
        return $this->hasOneThrough(
            Pasien::class,
            Pemeriksaan::class,
            'id', // Foreign key on Pemeriksaan table...
            'id', // Foreign key on Pasien table...
            'pemeriksaan_id', // Local key on Pembayaran table...
            'pasien_id' // Local key on Pemeriksaan table...
        );
    }

    public function customer()
    {
        return $this->hasOneThrough(
            Customer::class,
            PemeriksaanLingkungan::class,
            'id', // Foreign key on Pemeriksaan table...
            'id', // Foreign key on Pasien table...
            'pemeriksaan_id', // Local key on Pembayaran table...
            'customer_id' // Local key on Pemeriksaan table...
        );
    }

    public function dokter()
    {
        return $this->hasOneThrough(
            Dokter::class,
            Pemeriksaan::class,
            'id', // Foreign key on Pemeriksaan table...
            'id', // Foreign key on Dokter table...
            'pemeriksaan_id', // Local key on Pembayaran table...
            'dokter_id' // Local key on Pemeriksaan table...
        );
    }
}
