<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DaftarHarga extends Model
{
    //
    protected $table = 'daftar_harga';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'jenis_pasien', 'jenis_layanan_id', 'harga', 'valid_dari', 'valid_sampai', 'keterangan'];

    protected $casts = [
        'valid_dari' => 'date:Y-m-d',
        'valid_sampai' => 'date:Y-m-d',
    ];

    protected $appends = ['aktif'];

    static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function scopeActive($query)
    {
        $today = date('Y-m-d');
        return $query->where('valid_dari', '<=', $today)
            ->where(fn($q) => $q->where('valid_sampai', '>=', $today)->orWhereNull('valid_sampai'));
    }

    public function getAktifAttribute()
    {
        $today = date('Y-m-d');
        $validDari = $this->valid_dari ? $this->valid_dari->format('Y-m-d') : null;
        $validSampai = $this->valid_sampai ? $this->valid_sampai->format('Y-m-d') : null;

        if (!$validDari) {
            return false;
        }

        return $validDari <= $today && ($validSampai === null || $validSampai >= $today);
    }

    public function setAktifAttribute($value)
    {
        $isActive = filter_var($value, FILTER_VALIDATE_BOOLEAN);
        $today = date('Y-m-d');

        if ($isActive) {
            if ($this->valid_dari === null) {
                $this->valid_dari = $today;
            }
            $this->valid_sampai = null;
        } else {
            if ($this->valid_dari === null) {
                $this->valid_dari = $today;
            }
            $this->valid_sampai = $today;
        }
    }

    public function jenisLayanan()
    {
        return $this->belongsTo(JenisLayanan::class, 'jenis_layanan_id');
    }

    public function jenisPasien()
    {
        return $this->belongsTo(JenisPasien::class, 'jenis_pasien', 'kode');
    }
}
