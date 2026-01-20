<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JenisPembayaran extends Model
{
    /** @use HasFactory<\Database\Factories\JenisPembayaranFactory> */
    use HasFactory;
    use SoftDeletes;

    protected $table = 'jenis_pembayaran';
    protected $guarded = ['id'];
    protected $keyType = 'string';
    public $incrementing = false;

    static protected function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'jenis_pembayaran_id');
    }
}
