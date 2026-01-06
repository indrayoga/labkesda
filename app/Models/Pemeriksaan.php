<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pemeriksaan extends Model
{
    /** @use HasFactory<\Database\Factories\PemeriksaanFactory> */
    use HasFactory;

    protected $table = 'pemeriksaan';
    protected $guarded = ['id', 'no_registrasi'];
    protected $keyType = 'string';
    public $incrementing = false;

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

        return $datePart . '.' . $newNumber;
    }

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'pasien_id');
    }

    public function dokter()
    {
        return $this->belongsTo(Dokter::class, 'dokter_id');
    }

    public function detailPemeriksaan()
    {
        return $this->hasMany(DetailPemeriksaan::class, 'pemeriksaan_id');
    }
}
