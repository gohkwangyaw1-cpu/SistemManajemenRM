<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BerkasRekamMedis extends Model
{
    use HasFactory;

    protected $table = 'berkas_rekam_medis';

    protected $fillable = [
        'no_rekam_medis',
        'kategori',
        'nama_file_asli',
        'nama_file_tersimpan',
        'path_file',
        'tipe_file',
        'ukuran_file',
        'keterangan',
        'uploaded_by',
    ];

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'no_rekam_medis', 'no_rekam_medis');
    }
}
