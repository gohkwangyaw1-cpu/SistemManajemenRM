<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasien;
use Illuminate\Http\Request;

class PasienController extends Controller
{
    /**
     * Search patient by No. RM, No. Registrasi, or Name (simulating SIMRS)
     */
    public function search(Request $request)
    {
        $query = trim($request->query('q', ''));

        if (empty($query)) {
            // Return top 8 recent patients for quick pick
            $pasiens = Pasien::withCount('berkas')->orderBy('id', 'desc')->limit(8)->get();
            return response()->json([
                'status' => 'success',
                'data' => $pasiens,
            ]);
        }

        $pasiens = Pasien::where('no_rekam_medis', 'LIKE', "%{$query}%")
            ->orWhere('no_registrasi', 'LIKE', "%{$query}%")
            ->orWhere('nama_pasien', 'LIKE', "%{$query}%")
            ->orWhere('nik', 'LIKE', "%{$query}%")
            ->withCount('berkas')
            ->get();

        return response()->json([
            'status' => 'success',
            'query' => $query,
            'count' => $pasiens->count(),
            'data' => $pasiens,
        ]);
    }

    /**
     * Get single patient by No. Rekam Medis
     */
    public function show($no_rekam_medis)
    {
        $pasien = Pasien::where('no_rekam_medis', $no_rekam_medis)
            ->withCount('berkas')
            ->first();

        if (!$pasien) {
            return response()->json([
                'status' => 'error',
                'message' => "Pasien dengan No. Rekam Medis '{$no_rekam_medis}' tidak ditemukan di database SIMRS.",
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pasien,
        ]);
    }
}
