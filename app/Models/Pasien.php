<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Pasien extends Model
{
    /** @use HasFactory<\Database\Factories\PasienFactory> */
    use HasFactory;
    use SoftDeletes;

    protected $table = 'pasien';
    protected $keyType = 'string';
    public $incrementing = false;
    public $fillable = ['nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'no_telepon', 'kecamatan_id', 'kelurahan_id', 'alamat', 'pekerjaan'];


    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
            $model->no_rm = self::generateNoRm();
        });
    }

    protected static function generateNoRm()
    {
        $lastPasien = self::orderBy('no_rm', 'desc')->first();
        if ($lastPasien) {
            $lastNoRm = intval($lastPasien->no_rm);
            $newNoRm = str_pad($lastNoRm + 1, 6, '0', STR_PAD_LEFT);
        } else {
            $newNoRm = '000001';
        }
        return $newNoRm;
    }

    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class);
    }

    public function kelurahan()
    {
        return $this->belongsTo(Kelurahan::class);
    }
}
