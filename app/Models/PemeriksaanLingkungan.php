<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemeriksaanLingkungan extends Model
{
    //
    protected $table = 'pemeriksaan_lingkungan';
    protected $guarded = ['id', 'no_registrasi'];
    protected $keyType = 'string';
    public $incrementing = false;
    protected $appends = ['total'];
    protected $with = ['detailPemeriksaanLingkungan'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) \Illuminate\Support\Str::uuid();
            $model->no_registrasi = self::generateNoRegistrasi();
        });
    }

    /*
     * Generate a unique no_registrasi format yearmonthday.XXXX
    */
    protected static function generateNoRegistrasi()
    {
        $datePart = date('Ymd');
        $lastRecord = self::whereDate('created_at', date('Y-m-d'))
            ->orderBy('no_registrasi', 'desc')
            ->first();

        if ($lastRecord) {
            $lastNumber = (int) substr($lastRecord->no_registrasi, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $datePart . '.K.' . $newNumber;
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function detailPemeriksaanLingkungan()
    {
        return $this->hasMany(DetailPemeriksaanLingkungan::class, 'pemeriksaan_lingkungan_id');
    }
}
