<?php

use App\Http\Controllers\Api\ArsipRekamMedisController;
use App\Http\Controllers\Api\PasienController;
use Illuminate\Support\Facades\Route;

// SIMRS Pasien Endpoints
Route::get('/pasien/search', [PasienController::class, 'search']);
Route::get('/pasien/{no_rekam_medis}', [PasienController::class, 'show']);

// Arsip Rekam Medis Endpoints
Route::get('/arsip/{no_rekam_medis}', [ArsipRekamMedisController::class, 'index']);
Route::post('/arsip/upload', [ArsipRekamMedisController::class, 'upload']);
Route::get('/arsip/file/{id}', [ArsipRekamMedisController::class, 'showFile']);
Route::get('/arsip/download/{id}', [ArsipRekamMedisController::class, 'downloadFile']);
Route::delete('/arsip/{id}', [ArsipRekamMedisController::class, 'destroy']);
