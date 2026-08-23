<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pasien extends Model
{
    use HasFactory;

    protected $table = 'pasien';

    protected $fillable = [
        'no_rekam_medis',
        'no_registrasi',
        'nama_pasien',
        'nik',
        'jenis_kelamin',
        'tanggal_lahir',
        'dpjp',
        'jenis_asuransi',
        'poli_ruangan',
        'alamat',
        'telepon',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function berkas()
    {
        return $this->hasMany(BerkasRekamMedis::class, 'no_rekam_medis', 'no_rekam_medis');
    }
}
