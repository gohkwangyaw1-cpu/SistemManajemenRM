import React, { useState, useEffect } from 'react';
import Header from './Header';
import SearchSection from './SearchSection';
import PatientInfoCard from './PatientInfoCard';
import FileListSection from './FileListSection';
import DocumentViewer from './DocumentViewer';
import UploadModal from './UploadModal';
import axios from 'axios';
import { AlertCircle, UserCheck, Inbox, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
    // Current Active Patient
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchState, setSearchState] = useState('initial'); // 'initial' | 'found' | 'not_found' | 'loading'
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // File List
    const [files, setFiles] = useState([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Modal
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Auto show notification toast
    const showToast = (message, type = 'success') => {
        setToastMessage({ message, type });
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
    };

    // Quick search on mount or load sample patient
    useEffect(() => {
        // Load default patient RM001245 for instant smooth demonstration
        handleSearchPatient('RM001245');
    }, []);

    // Search patient handler
    const handleSearchPatient = async (query) => {
        const term = query !== undefined ? query.trim() : searchQuery.trim();
        if (!term) return;

        setSearchState('loading');
        setErrorMessage('');
        setSelectedFile(null);

        try {
            const res = await axios.get(`/api/pasien/search?q=${encodeURIComponent(term)}`);
            const results = res.data.data;

            if (results && results.length > 0) {
                // Exact or best match
                const matched = results.find(p => 
                    p.no_rekam_medis.toLowerCase() === term.toLowerCase() ||
                    p.no_registrasi.toLowerCase() === term.toLowerCase()
                ) || results[0];

                setSelectedPatient(matched);
                setSearchState('found');
                fetchPatientFiles(matched.no_rekam_medis);
            } else {
                setSelectedPatient(null);
                setFiles([]);
                setSearchState('not_found');
                setErrorMessage(`No. Rekam Medis atau No. Registrasi "${term}" tidak ditemukan di database SIMRS.`);
            }
        } catch (err) {
            console.error(err);
            setSelectedPatient(null);
            setFiles([]);
            setSearchState('not_found');
            setErrorMessage('Terjadi kendala saat menghubungkan ke database SIMRS.');
        }
    };

    // Fetch archive files for selected patient
    const fetchPatientFiles = async (noRm, autoSelectLatest = true) => {
        setIsLoadingFiles(true);
        try {
            const res = await axios.get(`/api/arsip/${noRm}`);
            const list = res.data.data || [];
            setFiles(list);
            
            if (list.length > 0) {
                if (autoSelectLatest || !selectedFile) {
                    setSelectedFile(list[0]);
                } else {
                    // Refresh current selected file if still exists
                    const exists = list.find(f => f.id === selectedFile.id);
                    setSelectedFile(exists || list[0]);
                }
            } else {
                setSelectedFile(null);
            }
        } catch (err) {
            console.error("Error fetching files:", err);
            setFiles([]);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    // Delete file handler
    const handleDeleteFile = async (fileId, fileName) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus berkas "${fileName}" dari arsip?`)) {
            return;
        }

        try {
            await axios.delete(`/api/arsip/${fileId}`);
            showToast(`Berkas "${fileName}" berhasil dihapus.`);
            if (selectedFile && selectedFile.id === fileId) {
                setSelectedFile(null);
            }
            if (selectedPatient) {
                fetchPatientFiles(selectedPatient.no_rekam_medis, false);
            }
        } catch (err) {
            console.error("Error deleting file:", err);
            alert("Gagal menghapus berkas. Silakan coba lagi.");
        }
    };

    // Upload success callback
    const handleUploadSuccess = (newFile) => {
        showToast(`Berkas "${newFile.nama_file_asli}" berhasil diunggah.`);
        if (selectedPatient) {
            fetchPatientFiles(selectedPatient.no_rekam_medis, true);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#BA1B1D]/10 selection:text-[#BA1B1D]">
            {/* 1. Header RS Awal Bros */}
            <Header />

            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed top-20 right-6 z-50 animate-bounce shadow-xl rounded-xl bg-slate-900 text-white px-5 py-3.5 flex items-center gap-3 border border-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-sm font-medium">{toastMessage.message}</p>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4">
                
                {/* 2. Pencarian Pasien */}
                <SearchSection 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onSearch={() => handleSearchPatient()}
                    onSelectPatient={(p) => {
                        setSearchQuery(p.no_rekam_medis);
                        setSelectedPatient(p);
                        setSearchState('found');
                        fetchPatientFiles(p.no_rekam_medis);
                    }}
                    isLoading={searchState === 'loading'}
                />

                {/* State 3: Data Tidak Ditemukan Alert */}
                {searchState === 'not_found' && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-800 shadow-sm flex items-start gap-3.5 transition-all">
                        <AlertCircle className="w-6 h-6 text-[#BA1B1D] shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-[#8F1012]">Data Pasien Tidak Ditemukan</h4>
                            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
                            <p className="text-xs text-rose-600 mt-1 font-medium">Tips: Periksa kembali pengetikan No. RM (contoh: RM001245) atau cari dengan nama pasien (contoh: Budi Santoso).</p>
                        </div>
                    </div>
                )}

                {/* State 1: State Awal (Belum cari / kosong) */}
                {searchState === 'initial' && (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/70 backdrop-blur-sm p-12 text-center shadow-xs my-4">
                        <div className="w-16 h-16 bg-red-50 text-[#BA1B1D] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">Sistem Arsip Elektronik Rekam Medis Siap Digunakan</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
                            Silakan masukkan <span className="font-semibold text-slate-700">No. Rekam Medis</span>, <span className="font-semibold text-slate-700">No. Registrasi</span>, atau <span className="font-semibold text-slate-700">Nama Pasien</span> pada kolom pencarian di atas.
                        </p>
                    </div>
                )}

                {/* State 2: Pasien Ditemukan */}
                {searchState === 'found' && selectedPatient && (
                    <>
                        {/* 3. Panel Informasi Pasien (Data SIMRS) */}
                        <PatientInfoCard patient={selectedPatient} />

                        {/* 4. Dua Kolom: Daftar Berkas Rekam Medis & Document Previewer */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[580px] pb-6">
                            
                            {/* Kolom Kiri: Daftar Berkas (5 cols) */}
                            <div className="lg:col-span-5 flex flex-col">
                                <FileListSection 
                                    patient={selectedPatient}
                                    files={files}
                                    isLoading={isLoadingFiles}
                                    selectedFile={selectedFile}
                                    onSelectFile={(file) => setSelectedFile(file)}
                                    onDeleteFile={handleDeleteFile}
                                    onOpenUpload={() => setIsUploadOpen(true)}
                                />
                            </div>

                            {/* Kolom Kanan: Previewer Dokumen (7 cols) */}
                            <div className="lg:col-span-7 flex flex-col">
                                <DocumentViewer 
                                    file={selectedFile}
                                    patient={selectedPatient}
                                />
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Modal Upload Berkas */}
            {isUploadOpen && selectedPatient && (
                <UploadModal 
                    patient={selectedPatient}
                    onClose={() => setIsUploadOpen(false)}
                    onSuccess={(newFile) => {
                        setIsUploadOpen(false);
                        handleUploadSuccess(newFile);
                    }}
                />
            )}

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-500">
                <p>© 2026 <strong>RS Awal Bros</strong> — Sistem Informasi Manajemen Rekam Medis & Arsip Digital Terpadu. All rights reserved.</p>
            </footer>
        </div>
    );
}
