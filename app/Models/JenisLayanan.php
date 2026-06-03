<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JenisLayanan extends Model
{
    /** @use HasFactory<\Database\Factories\JenisLayananFactory> */
    use HasFactory;
    use SoftDeletes;

    protected $table = 'jenis_layanan';
    protected $guarded = ['id'];
    protected $keyType = 'string';
    public $incrementing = false;
    protected $appends = ['harga_umum'];
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function kategoriLayanan()
    {
        return $this->belongsTo(KategoriLayanan::class, 'kategori_layanan_id');
    }

    public function detailPemeriksaan()
    {
        return $this->hasMany(DetailPemeriksaan::class, 'jenis_layanan_id');
    }

    public function layananOrder()
    {
        return $this->hasMany(PemeriksaanLayananOrder::class, 'jenis_layanan_id');
    }

    public function tarif()
    {
        return $this->hasMany(DaftarHarga::class, 'jenis_layanan_id');
    }

    public function tarifUmum()
    {
        return $this->activeTarif()->where('jenis_pasien', 'UMUM');
    }

    public function activeTarif()
    {
        return $this->tarif()->active();
    }

    public function getHargaUmumAttribute()
    {
        $tarifUmum = $this->tarifUmum()->first();
        return $tarifUmum ? $tarifUmum->harga : 0;
    }

    public function paketPemeriksaan()
    {
        return $this
            ->belongsToMany(PaketPemeriksaan::class, 'item_paket_pemeriksaan', 'jenis_layanan_id', 'paket_pemeriksaan_id')
            ->withTimestamps();
    }

    public function itemPemeriksaan()
    {
        return $this->belongsToMany(ItemPemeriksaan::class, 'item_pemeriksaan_layanan', 'jenis_layanan_id', 'item_pemeriksaan_id');
    }
}
