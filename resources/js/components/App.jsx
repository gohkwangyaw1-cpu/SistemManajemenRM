import React, { useState, useEffect } from 'react';
import Header from './Header';
import PatientTableView from './PatientTableView';
import PatientInfoCard from './PatientInfoCard';
import FileListSection from './FileListSection';
import DocumentViewer from './DocumentViewer';
import UploadModal from './UploadModal';
import axios from 'axios';
import { AlertCircle, ArrowLeft, Users, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export default function App() {
    // Current Active View: 'table' (Tabel Utama Pasien) | 'detail' (Detail Pasien & Arsip Medis)
    const [currentView, setCurrentView] = useState('table');
    
    // Patient List Data
    const [patients, setPatients] = useState([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [tableSearchQuery, setTableSearchQuery] = useState('');
    const [selectedPoli, setSelectedPoli] = useState('');
    const [selectedAsuransi, setSelectedAsuransi] = useState('');

    // Detail Patient State
    const [selectedPatient, setSelectedPatient] = useState(null);
    
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

    // Load all patients on mount for main table
    useEffect(() => {
        fetchPatientsList();
    }, []);

    // Fetch patient list from SIMRS
    const fetchPatientsList = async () => {
        setIsLoadingPatients(true);
        try {
            const res = await axios.get('/api/pasien');
            setPatients(res.data.data || []);
        } catch (err) {
            console.error("Error fetching patients list:", err);
            setPatients([]);
        } finally {
            setIsLoadingPatients(false);
        }
    };

    // Handler saat tombol Action Detail Pasien diklik di tabel
    const handleOpenPatientDetail = (patient) => {
        setSelectedPatient(patient);
        setCurrentView('detail');
        fetchPatientFiles(patient.no_rekam_medis);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <Header onNavigateHome={() => setCurrentView('table')} />

            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed top-20 right-6 z-50 animate-bounce shadow-xl rounded-xl bg-slate-900 text-white px-5 py-3.5 flex items-center gap-3 border border-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-sm font-medium">{toastMessage.message}</p>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4">
                
                {/* ===================== VIEW 1: TABEL DATA PASIEN (DEFAULT) ===================== */}
                {currentView === 'table' && (
                    <PatientTableView 
                        patients={patients}
                        isLoading={isLoadingPatients}
                        onSelectPatient={handleOpenPatientDetail}
                        onRefresh={fetchPatientsList}
                        searchQuery={tableSearchQuery}
                        setSearchQuery={setTableSearchQuery}
                        selectedPoli={selectedPoli}
                        setSelectedPoli={setSelectedPoli}
                        selectedAsuransi={selectedAsuransi}
                        setSelectedAsuransi={setSelectedAsuransi}
                    />
                )}

                {/* ===================== VIEW 2: DETAIL PASIEN & ARSIP MEDIS ===================== */}
                {currentView === 'detail' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        
                        {/* Navigation Top Bar: Tombol Kembali & Breadcrumb */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-5 rounded-2xl border border-slate-200 shadow-xs">
                            <div className="flex items-center gap-2 text-xs">
                                <button
                                    onClick={() => {
                                        setCurrentView('table');
                                        fetchPatientsList();
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-[#BA1B1D] font-bold transition cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Kembali ke Tabel Pasien</span>
                                </button>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-500 font-medium">Detail Rekam Medis:</span>
                                <span className="font-extrabold text-[#BA1B1D] font-mono">
                                    {selectedPatient ? selectedPatient.no_rekam_medis : '-'}
                                </span>
                            </div>

                            {selectedPatient && (
                                <div className="text-xs text-slate-500">
                                    Pasien: <strong className="text-slate-900">{selectedPatient.nama_pasien}</strong>
                                </div>
                            )}
                        </div>

                        {/* Content Detail Pasien & Berkas */}
                        {selectedPatient && (
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
                    </div>
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
