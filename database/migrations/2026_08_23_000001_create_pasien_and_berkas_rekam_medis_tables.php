<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pasien', function (Blueprint $table) {
            $table->id();
            $table->string('no_rekam_medis', 20)->unique();
            $table->string('no_registrasi', 30)->index();
            $table->string('nama_pasien', 150)->index();
            $table->string('nik', 20)->nullable();
            $table->enum('jenis_kelamin', ['L', 'P'])->default('L');
            $table->date('tanggal_lahir');
            $table->string('dpjp', 100);
            $table->string('jenis_asuransi', 50)->default('BPJS Kesehatan');
            $table->string('poli_ruangan', 100)->default('Poli Penyakit Dalam');
            $table->string('alamat', 255)->nullable();
            $table->string('telepon', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('berkas_rekam_medis', function (Blueprint $table) {
            $table->id();
            $table->string('no_rekam_medis', 20)->index();
            $table->string('kategori', 50)->default('Resume Medis');
            $table->string('nama_file_asli', 255);
            $table->string('nama_file_tersimpan', 255);
            $table->string('path_file', 500);
            $table->string('tipe_file', 10);
            $table->bigInteger('ukuran_file');
            $table->text('keterangan')->nullable();
            $table->string('uploaded_by', 50)->default('Staff01 - Rekam Medis');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('berkas_rekam_medis');
        Schema::dropIfExists('pasien');
    }
};
