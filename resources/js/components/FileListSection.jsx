import React, { useState } from 'react';
import { 
    FilePlus, 
    FileText, 
    Image as ImageIcon, 
    Eye, 
    Trash2, 
    Download, 
    Filter, 
    Calendar, 
    HardDrive,
    Loader2,
    Search
} from 'lucide-react';

const CATEGORIES = [
    'Semua',
    'Resume Medis',
    'Laboratorium',
    'Radiologi',
    'Surat Kontrol',
    'Resep / Farmasi',
    'Lainnya'
];

export default function FileListSection({ 
    patient, 
    files, 
    isLoading, 
    selectedFile, 
    onSelectFile, 
    onDeleteFile, 
    onOpenUpload 
}) {
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');

    // Format bytes to human readable
    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Format datetime
    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    // Filter files
    const filteredFiles = files.filter(f => {
        const matchCategory = selectedCategory === 'Semua' || f.kategori === selectedCategory;
        const matchSearch = !searchTerm || f.nama_file_asli.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (f.keterangan && f.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchCategory && matchSearch;
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Section Header */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#BA1B1D]"></span>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-['Outfit']">
                            DAFTAR BERKAS REKAM MEDIS
                        </h3>
                        <span className="text-[11px] font-medium text-slate-500">
                            {files.length} dokumen tersimpan untuk {patient.no_rekam_medis}
                        </span>
                    </div>
                </div>

                {/* Upload Button RS Awal Bros Crimson */}
                <button
                    type="button"
                    onClick={onOpenUpload}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#BA1B1D] hover:bg-[#9E1618] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                >
                    <FilePlus className="w-4 h-4" />
                    <span>+ Upload / Scan Berkas</span>
                </button>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="p-3 border-b border-slate-100 bg-white space-y-2.5">
                {/* Search in files */}
                <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Filter nama berkas / catatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#BA1B1D]"
                    />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer text-[11px] ${
                                selectedCategory === cat
                                    ? 'bg-[#BA1B1D] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Files Container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[600px] min-h-[360px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#BA1B1D]" />
                        <span className="text-xs font-medium">Memuat berkas rekam medis...</span>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                            <FileText className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">Belum ada berkas rekam medis</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                            Klik tombol <strong>+ Upload / Scan Berkas</strong> di atas untuk mengarsipkan dokumen pasien ini.
                        </p>
                    </div>
                ) : (
                    filteredFiles.map((file) => {
                        const isSelected = selectedFile && selectedFile.id === file.id;
                        const isPdf = file.tipe_file === 'pdf';

                        return (
                            <div
                                key={file.id}
                                onClick={() => onSelectFile(file)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                                    isSelected
                                        ? 'border-[#BA1B1D] bg-red-50/40 shadow-xs ring-1 ring-[#BA1B1D]/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    {/* Icon & File Details */}
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                            isPdf 
                                                ? 'bg-rose-100 text-rose-700' 
                                                : 'bg-sky-100 text-sky-700'
                                        }`}>
                                            {isPdf ? (
                                                <FileText className="w-5 h-5" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate" title={file.nama_file_asli}>
                                                {file.nama_file_asli}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                                    {file.kategori || 'Dokumen'}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {formatDateTime(file.created_at)}
                                                </span>
                                                <span>•</span>
                                                <span>{formatBytes(file.ukuran_file)}</span>
                                            </div>
                                            {file.keterangan && (
                                                <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">
                                                    "{file.keterangan}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions Buttons */}
                                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => onSelectFile(file)}
                                            className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                                isSelected 
                                                    ? 'bg-[#BA1B1D] text-white' 
                                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                            }`}
                                            title="Lihat Dokumen di Previewer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        
                                        <a
                                            href={`/api/arsip/download/${file.id}`}
                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                            title="Unduh File Asli"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => onDeleteFile(file.id, file.nama_file_asli)}
                                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                                            title="Hapus Berkas dari Arsip"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Storage Info Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between px-4">
                <span className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    Storage: <strong className="text-slate-700">Protected e-RM Secure Disk</strong>
                </span>
                <span>Enkripsi Akses: Aktif</span>
            </div>
        </div>
    );
}
