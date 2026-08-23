import React, { useState } from 'react';
import { 
    FileText, 
    ZoomIn, 
    ZoomOut, 
    RotateCw, 
    Printer, 
    Download, 
    Maximize2, 
    FileQuestion,
    ExternalLink,
    RefreshCw
} from 'lucide-react';

export default function DocumentViewer({ file, patient }) {
    const [zoomLevel, setZoomLevel] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!file) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center h-full min-h-[480px] p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                    <FileQuestion className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Preview Dokumen Rekam Medis</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Pilih salah satu berkas dari daftar di sebelah kiri atau unggah berkas baru untuk melihat pratinjau dokumen di area ini.
                </p>
            </div>
        );
    }

    const fileUrl = `/api/arsip/file/${file.id}`;
    const isPdf = file.tipe_file === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(file.tipe_file);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleReset = () => {
        setZoomLevel(100);
        setRotation(0);
    };

    const handlePrint = () => {
        const printWindow = window.open(fileUrl, '_blank');
        if (printWindow) {
            printWindow.focus();
            printWindow.print();
        }
    };

    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden ${
            isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
        }`}>
            {/* Toolbar Header */}
            <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-red-600/80 flex items-center justify-center text-white shrink-0">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate max-w-[280px]" title={file.nama_file_asli}>
                            {file.nama_file_asli}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Kategori: {file.kategori} | RM: {patient.no_rekam_medis}
                        </span>
                    </div>
                </div>

                {/* Control Tools */}
                <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                    {/* Zoom Out */}
                    <button
                        type="button"
                        onClick={handleZoomOut}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Perkecil (Zoom Out)"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[11px] font-mono font-semibold px-2 text-slate-300 min-w-[45px] text-center">
                        {zoomLevel}%
                    </span>

                    {/* Zoom In */}
                    <button
                        type="button"
                        onClick={handleZoomIn}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Perbesar (Zoom In)"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-4 bg-slate-700 mx-1"></div>

                    {/* Rotate */}
                    <button
                        type="button"
                        onClick={handleRotate}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Putar Dokumen (Rotate 90°)"
                    >
                        <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Reset Zoom & Rotate */}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Reset Tampilan"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-4 bg-slate-700 mx-1"></div>

                    {/* Print */}
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Cetak Dokumen"
                    >
                        <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Open External / Download */}
                    <a
                        href={`/api/arsip/download/${file.id}`}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Download Dokumen"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </a>

                    {/* Fullscreen Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isFullscreen ? 'bg-red-600 text-white' : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Toggle Fullscreen Preview"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Document Viewer Stage */}
            <div className="flex-1 bg-slate-100 overflow-auto p-4 flex items-center justify-center min-h-[460px] relative">
                {isPdf ? (
                    <div 
                        className="w-full h-full min-h-[480px] bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-200"
                        style={{
                            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                            transformOrigin: 'center center',
                        }}
                    >
                        {/* Native browser PDF viewer with streaming authorization */}
                        <iframe
                            src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                            title="PDF Document Preview"
                            className="w-full h-full min-h-[480px] border-0"
                        />
                    </div>
                ) : isImage ? (
                    <div className="max-w-full max-h-full flex items-center justify-center overflow-hidden">
                        <img
                            src={fileUrl}
                            alt={file.nama_file_asli}
                            className="rounded-lg shadow-lg object-contain transition-transform duration-200"
                            style={{
                                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                                maxHeight: isFullscreen ? '85vh' : '480px',
                                maxWidth: '100%',
                            }}
                        />
                    </div>
                ) : (
                    <div className="text-center p-8 bg-white rounded-xl shadow-xs">
                        <p className="text-sm font-semibold text-slate-700">Pratinjau langsung tidak tersedia untuk format ini.</p>
                        <a
                            href={`/api/arsip/download/${file.id}`}
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#BA1B1D] text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                            <Download className="w-4 h-4" />
                            <span>Unduh Berkas</span>
                        </a>
                    </div>
                )}
            </div>

            {/* Footer Information */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span>Diunggah oleh: <strong className="text-slate-700">{file.uploaded_by || 'Staff'}</strong></span>
                </div>
                <div>
                    <span>Kerahasiaan Medis Terlindungi (UU PDP & UU Kesehatan RI)</span>
                </div>
            </div>
        </div>
    );
}
