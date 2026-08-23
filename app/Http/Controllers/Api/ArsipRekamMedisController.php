<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BerkasRekamMedis;
use App\Models\Pasien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArsipRekamMedisController extends Controller
{
    /**
     * Get list of archive files for a patient
     */
    public function index($no_rekam_medis)
    {
        $berkas = BerkasRekamMedis::where('no_rekam_medis', $no_rekam_medis)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'no_rekam_medis' => $no_rekam_medis,
            'count' => $berkas->count(),
            'data' => $berkas,
        ]);
    }

    /**
     * Upload medical record file (secure private storage)
     */
    public function upload(Request $request)
    {
        $request->validate([
            'no_rekam_medis' => 'required|string|max:20',
            'kategori' => 'nullable|string|max:50',
            'keterangan' => 'nullable|string|max:500',
            'uploaded_by' => 'nullable|string|max:50',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // Max 10MB
        ]);

        $noRm = $request->input('no_rekam_medis');
        
        // Verify patient exists in SIMRS
        $pasien = Pasien::where('no_rekam_medis', $noRm)->first();
        if (!$pasien) {
            return response()->json([
                'status' => 'error',
                'message' => "Gagal upload: No. Rekam Medis {$noRm} tidak terdaftar di SIMRS.",
            ], 422);
        }

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = strtolower($uploadedFile->getClientOriginalExtension());
        $fileSize = $uploadedFile->getSize();
        $timestamp = now()->format('Ymd_His');
        $randomStr = Str::random(5);
        $cleanName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME));
        $savedFilename = "{$timestamp}_{$cleanName}_{$randomStr}.{$extension}";

        // Directory structure: storage/app/rekam_medis/{no_rekam_medis}/...
        $relativeDir = "rekam_medis/{$noRm}";
        $path = $uploadedFile->storeAs($relativeDir, $savedFilename, 'local');

        $berkas = BerkasRekamMedis::create([
            'no_rekam_medis' => $noRm,
            'kategori' => $request->input('kategori', 'Resume Medis'),
            'nama_file_asli' => $originalName,
            'nama_file_tersimpan' => $savedFilename,
            'path_file' => $path,
            'tipe_file' => $extension,
            'ukuran_file' => $fileSize,
            'keterangan' => $request->input('keterangan'),
            'uploaded_by' => $request->input('uploaded_by', 'Staff01 - Rekam Medis'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Berkas rekam medis berhasil diunggah dan diarsipkan.',
            'data' => $berkas,
        ], 201);
    }

    /**
     * Securely stream / preview file with authenticated authorization & proper headers
     */
    public function showFile($id)
    {
        $berkas = BerkasRekamMedis::find($id);

        if (!$berkas) {
            return response()->json(['status' => 'error', 'message' => 'Berkas tidak ditemukan.'], 404);
        }

        if (!Storage::disk('local')->exists($berkas->path_file)) {
            return response()->json(['status' => 'error', 'message' => 'File fisik dokumen tidak ditemukan di penyimpanan server.'], 404);
        }

        $filePath = Storage::disk('local')->path($berkas->path_file);
        $mimeType = match ($berkas->tipe_file) {
            'pdf' => 'application/pdf',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            default => mime_content_type($filePath) ?: 'application/octet-stream',
        };

        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . addslashes($berkas->nama_file_asli) . '"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }

    /**
     * Secure download file with original filename
     */
    public function downloadFile($id)
    {
        $berkas = BerkasRekamMedis::find($id);

        if (!$berkas || !Storage::disk('local')->exists($berkas->path_file)) {
            return response()->json(['status' => 'error', 'message' => 'Berkas tidak ditemukan.'], 404);
        }

        $filePath = Storage::disk('local')->path($berkas->path_file);
        return response()->download($filePath, $berkas->nama_file_asli);
    }

    /**
     * Delete medical record file
     */
    public function destroy($id)
    {
        $berkas = BerkasRekamMedis::find($id);

        if (!$berkas) {
            return response()->json(['status' => 'error', 'message' => 'Berkas tidak ditemukan.'], 404);
        }

        // Delete physical file if exists
        if (Storage::disk('local')->exists($berkas->path_file)) {
            Storage::disk('local')->delete($berkas->path_file);
        }

        $berkas->delete();

        return response()->json([
            'status' => 'success',
            'message' => "Berkas '{$berkas->nama_file_asli}' berhasil dihapus dari arsip.",
        ]);
    }
}
