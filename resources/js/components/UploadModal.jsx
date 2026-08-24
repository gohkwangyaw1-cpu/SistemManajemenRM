import React, { useState, useRef } from 'react';
import { 
    X, 
    UploadCloud, 
    FileText, 
    AlertCircle, 
    CheckCircle2, 
    Loader2,
    HardDrive,
    Camera,
    Sparkles
} from 'lucide-react';
import axios from 'axios';
import DocumentScannerModal from './DocumentScannerModal';

const CATEGORIES = [
    'Resume Medis',
    'Laboratorium',
    'Radiologi',
    'Surat Kontrol',
    'Resep / Farmasi',
    'Lainnya'
];

export default function UploadModal({ patient, onClose, onSuccess }) {
    const [selectedCategory, setSelectedCategory] = useState('Resume Medis');
    const [keterangan, setKeterangan] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    
    const fileInputRef = useRef(null);

    // Format bytes
    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // File validation
    const validateAndSetFile = (uploadedFile) => {
        setErrorMsg('');
        if (!uploadedFile) return;

        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        const extension = uploadedFile.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            setErrorMsg('Format file tidak didukung! Hanya file PDF, JPG, dan PNG yang diizinkan.');
            return;
        }

        // Max 10MB (10 * 1024 * 1024 bytes)
        if (uploadedFile.size > 10 * 1024 * 1024) {
            setErrorMsg('Ukuran file melebihi batas maksimal 10 MB!');
            return;
        }

        setFile(uploadedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setErrorMsg('Silakan pilih berkas rekam medis terlebih dahulu.');
            return;
        }

        setIsUploading(true);
        setErrorMsg('');

        try {
            const formData = new FormData();
            formData.append('no_rekam_medis', patient.no_rekam_medis);
            formData.append('kategori', selectedCategory);
            formData.append('keterangan', keterangan);
            formData.append('uploaded_by', 'Staff01 - Rekam Medis');
            formData.append('file', file);

            const res = await axios.post('/api/arsip/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            onSuccess(res.data.data);
        } catch (err) {
            console.error("Upload error:", err);
            const message = err.response?.data?.message || 'Gagal mengunggah berkas. Periksa koneksi dan coba lagi.';
            setErrorMsg(message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                
                {/* Header Modal */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold tracking-tight">
                            Upload Berkas Rekam Medis
                        </h3>
                        <p className="text-xs text-slate-300">
                            No. RM: <strong className="text-red-400 font-mono">{patient.no_rekam_medis}</strong> — {patient.nama_pasien}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                    
                    {/* Error alert */}
                    {errorMsg && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Kategori Berkas */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Kategori Berkas Medis <span className="text-[#BA1B1D]">*</span>
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#BA1B1D]/20 focus:border-[#BA1B1D]"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tombol Scanner Kamera / Auto Edge Detection */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-2xl border border-red-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#BA1B1D] text-white flex items-center justify-center shadow-md shadow-red-900/20">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Scan Dokumen Otomatis</p>
                                <p className="text-[10px] text-slate-500">Ambil foto & deteksi sudut kertas ala Adobe Scan</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsScannerOpen(true)}
                            className="px-3.5 py-2 bg-white hover:bg-slate-50 active:scale-95 border border-red-300 text-[#BA1B1D] text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Buka Scanner</span>
                        </button>
                    </div>

                    {/* Drag & Drop Zone */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Pilih Dokumen / Scan <span className="text-[#BA1B1D]">*</span>
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                                isDragging 
                                    ? 'border-[#BA1B1D] bg-red-50/50' 
                                    : file
                                        ? 'border-emerald-400 bg-emerald-50/40'
                                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        validateAndSetFile(e.target.files[0]);
                                    }
                                }}
                            />

                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    file ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-[#BA1B1D]'
                                }`}>
                                    {file ? <CheckCircle2 className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                                </div>

                                {file ? (
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-slate-800">{file.name}</p>
                                        <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                                            Ukuran: {formatBytes(file.size)} • Siap diunggah
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 underline">Klik untuk mengganti file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700">
                                            📂 Drag & Drop file di sini atau <span className="text-[#BA1B1D] font-bold underline">Pilih Berkas</span>
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            Format: <strong>PDF, JPG, PNG</strong> (Maks. 10 MB per file)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Keterangan / Catatan Tambahan */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Catatan / Keterangan Berkas (Opsional)
                        </label>
                        <input
                            type="text"
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            placeholder="Contoh: Hasil lab darah lengkap pre-operasi..."
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#BA1B1D]"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUploading}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                        >
                            BATAL
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading || !file}
                            className="px-6 py-2.5 bg-[#BA1B1D] hover:bg-[#9E1618] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-red-900/15 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>MENGUNGGAH...</span>
                                </>
                            ) : (
                                <span>UPLOAD DOKUMEN</span>
                            )}
                        </button>
                    </div>
                </form>

            </div>

            {/* Modal Scanner Kamera & Auto Crop Kertas */}
            <DocumentScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanComplete={(scannedFile) => {
                    validateAndSetFile(scannedFile);
                }}
            />
        </div>
    );
}
