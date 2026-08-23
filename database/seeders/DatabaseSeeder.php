<?php

namespace Database\Seeders;

use App\Models\BerkasRekamMedis;
use App\Models\Pasien;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with RS Awal Bros sample data.
     */
    public function run(): void
    {
        $samplePatients = [
            [
                'no_rekam_medis' => 'RM001245',
                'no_registrasi' => 'REG00125',
                'nama_pasien' => 'Budi Santoso',
                'nik' => '3276011001900001',
                'jenis_kelamin' => 'L',
                'tanggal_lahir' => '1990-01-10',
                'dpjp' => 'dr. Andi Pratama, Sp.PD',
                'jenis_asuransi' => 'BPJS Kesehatan',
                'poli_ruangan' => 'Poli Penyakit Dalam / Lt. 3',
                'alamat' => 'Jl. Jenderal Sudirman No. 45, Pekanbaru',
                'telepon' => '081234567890',
            ],
            [
                'no_rekam_medis' => 'RM001246',
                'no_registrasi' => 'REG00126',
                'nama_pasien' => 'Siti Rahmawati',
                'nik' => '3276012005950002',
                'jenis_kelamin' => 'P',
                'tanggal_lahir' => '1995-05-20',
                'dpjp' => 'dr. Maya Kartika, Sp.OG',
                'jenis_asuransi' => 'Prudential (Swasta)',
                'poli_ruangan' => 'Poli Kebidanan & Kandungan',
                'alamat' => 'Jl. HR. Soebrantas No. 12, Panam',
                'telepon' => '082198765432',
            ],
            [
                'no_rekam_medis' => 'RM001247',
                'no_registrasi' => 'REG00127',
                'nama_pasien' => 'Ahmad Fauzi',
                'nik' => '3276011508820003',
                'jenis_kelamin' => 'L',
                'tanggal_lahir' => '1982-08-15',
                'dpjp' => 'dr. Hendra Wijaya, Sp.JP(K)',
                'jenis_asuransi' => 'Umum / Mandiri',
                'poli_ruangan' => 'Poli Jantung & Pembuluh Darah',
                'alamat' => 'Jl. Tuanku Tambusai No. 88, Pekanbaru',
                'telepon' => '085277889900',
            ],
            [
                'no_rekam_medis' => 'RM001248',
                'no_registrasi' => 'REG00128',
                'nama_pasien' => 'Dewi Lestari',
                'nik' => '3276013011980004',
                'jenis_kelamin' => 'P',
                'tanggal_lahir' => '1998-11-30',
                'dpjp' => 'dr. Rina Suryani, Sp.A',
                'jenis_asuransi' => 'BPJS Kesehatan',
                'poli_ruangan' => 'Poli Anak',
                'alamat' => 'Jl. Riau No. 102, Pekanbaru',
                'telepon' => '081366554433',
            ],
            [
                'no_rekam_medis' => 'RM001249',
                'no_registrasi' => 'REG00129',
                'nama_pasien' => 'H. Muhammad Arifin',
                'nik' => '3276010504650005',
                'jenis_kelamin' => 'L',
                'tanggal_lahir' => '1965-04-05',
                'dpjp' => 'dr. Bambang Irawan, Sp.OT',
                'jenis_asuransi' => 'Allianz Health',
                'poli_ruangan' => 'Poli Orthopedi & Traumatologi',
                'alamat' => 'Jl. Hangtuah No. 54, Pekanbaru',
                'telepon' => '081177665544',
            ],
        ];

        foreach ($samplePatients as $pData) {
            Pasien::updateOrCreate(
                ['no_rekam_medis' => $pData['no_rekam_medis']],
                $pData
            );
        }

        // Generate sample real PDF and JPG files in storage for RM001245
        $this->seedSampleFilesForRM001245();
    }

    private function seedSampleFilesForRM001245(): void
    {
        $noRm = 'RM001245';
        $storageDir = "rekam_medis/{$noRm}";

        if (!Storage::disk('local')->exists($storageDir)) {
            Storage::disk('local')->makeDirectory($storageDir);
        }

        // 1. Resume Medis Rawat Inap PDF (Valid minimal PDF)
        $pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 195 >>\nstream\nBT\n/F1 22 Tf\n50 720 Td\n(RS AWAL BROS - RESUME MEDIS RAWAT INAP) Tj\n/F1 12 Tf\n0 -35 Td\n(No. RM: RM001245  |  Nama: Budi Santoso  |  DPJP: dr. Andi Pratama, Sp.PD) Tj\n0 -25 Td\n(Diagnosa Utama: Dispepsia Kronis + Hipertensi Gr I) Tj\n0 -25 Td\n(Tindakan: Terapi PPI IV, Infus Asering, Diet Lambung) Tj\n0 -25 Td\n(Kondisi Keluar: Membaik, Kontrol Poli 1 Minggu) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000224 00000 n \n0000000295 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n543\n%%EOF";

        $file1Name = "20260812_1015_resume_medis_rawat_inap.pdf";
        $path1 = "{$storageDir}/{$file1Name}";
        Storage::disk('local')->put($path1, $pdfContent);

        BerkasRekamMedis::updateOrCreate(
            ['no_rekam_medis' => $noRm, 'nama_file_asli' => 'resume_medis_rawat_inap.pdf'],
            [
                'kategori' => 'Resume Medis',
                'nama_file_tersimpan' => $file1Name,
                'path_file' => $path1,
                'tipe_file' => 'pdf',
                'ukuran_file' => strlen($pdfContent),
                'keterangan' => 'Resume medis selesai rawat inap ruang Paviliun Anggrek 302',
                'uploaded_by' => 'Staff01 - Rekam Medis',
                'created_at' => now()->subDays(11)->setTime(10, 15),
            ]
        );

        // 2. Surat Kontrol Ulang PDF
        $file2Name = "20260814_0900_surat_kontrol_ulang.pdf";
        $path2 = "{$storageDir}/{$file2Name}";
        $pdfContent2 = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 175 >>\nstream\nBT\n/F1 20 Tf\n50 720 Td\n(RS AWAL BROS - SURAT KONTROL ULANG) Tj\n/F1 12 Tf\n0 -35 Td\n(No. RM: RM001245  |  Pasien: Budi Santoso) Tj\n0 -25 Td\n(Rencana Kontrol: 19 Agustus 2026 ke Poli Penyakit Dalam) Tj\n0 -25 Td\n(Catatan: Bawa hasil lab terakhir dan obat rutin) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000224 00000 n \n0000000295 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n523\n%%EOF";
        Storage::disk('local')->put($path2, $pdfContent2);

        BerkasRekamMedis::updateOrCreate(
            ['no_rekam_medis' => $noRm, 'nama_file_asli' => 'surat_kontrol_ulang.pdf'],
            [
                'kategori' => 'Surat Kontrol',
                'nama_file_tersimpan' => $file2Name,
                'path_file' => $path2,
                'tipe_file' => 'pdf',
                'ukuran_file' => strlen($pdfContent2),
                'keterangan' => 'Surat kontrol ulang poliklinik penyakit dalam',
                'uploaded_by' => 'Staff01 - Rekam Medis',
                'created_at' => now()->subDays(9)->setTime(9, 0),
            ]
        );

        // 3. Hasil Lab Darah (Sample PNG/JPG Image)
        // Create 1x1 transparent/colored PNG base64 for real preview
        $dummyImage = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
        $file3Name = "20260812_1020_hasil_lab_darah.png";
        $path3 = "{$storageDir}/{$file3Name}";
        Storage::disk('local')->put($path3, $dummyImage);

        BerkasRekamMedis::updateOrCreate(
            ['no_rekam_medis' => $noRm, 'nama_file_asli' => 'hasil_lab_darah.png'],
            [
                'kategori' => 'Laboratorium',
                'nama_file_tersimpan' => $file3Name,
                'path_file' => $path3,
                'tipe_file' => 'png',
                'ukuran_file' => strlen($dummyImage),
                'keterangan' => 'Hasil pemeriksaan Darah Rutin, SGOT, SGPT, Ureum, Kreatinin',
                'uploaded_by' => 'Staff01 - Rekam Medis',
                'created_at' => now()->subDays(11)->setTime(10, 20),
            ]
        );
    }
}
