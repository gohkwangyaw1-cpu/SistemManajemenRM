import React, { useState } from 'react';
import { 
    Search, 
    Filter, 
    User, 
    FileText, 
    ChevronRight, 
    Eye, 
    Calendar, 
    CreditCard, 
    Building2, 
    Stethoscope, 
    RefreshCw,
    Users,
    FolderKanban,
    ChevronLeft,
    ArrowUpDown,
    CheckCircle2
} from 'lucide-react';

export default function PatientTableView({ 
    patients = [], 
    isLoading = false, 
    onSelectPatient, 
    onRefresh,
    searchQuery,
    setSearchQuery,
    selectedPoli,
    setSelectedPoli,
    selectedAsuransi,
    setSelectedAsuransi
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filter list
    const filteredPatients = patients.filter(p => {
        const matchesQuery = !searchQuery || (
            p.nama_pasien?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.no_rekam_medis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.no_registrasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.dpjp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.nik?.includes(searchQuery)
        );

        const matchesPoli = !selectedPoli || p.poli_ruangan?.toLowerCase().includes(selectedPoli.toLowerCase());
        const matchesAsuransi = !selectedAsuransi || p.jenis_asuransi?.toLowerCase().includes(selectedAsuransi.toLowerCase());

        return matchesQuery && matchesPoli && matchesAsuransi;
    });

    // Pagination
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
    const paginatedPatients = filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // List unik untuk opsi filter dropdown
    const poliOptions = Array.from(new Set(patients.map(p => p.poli_ruangan).filter(Boolean)));
    const asuransiOptions = Array.from(new Set(patients.map(p => p.jenis_asuransi).filter(Boolean)));

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const calculateAge = (birthDateStr) => {
        if (!birthDateStr) return '';
        const birthDate = new Date(birthDateStr);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return `(${age} th)`;
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Top Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#BA1B1D]">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Pasien Terdaftar</p>
                        <p className="text-xl font-bold text-slate-900 font-['Outfit']">{patients.length} <span className="text-xs font-normal text-slate-400">Pasien</span></p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Arsip Digital</p>
                        <p className="text-xl font-bold text-slate-900 font-['Outfit']">
                            {patients.reduce((acc, curr) => acc + (curr.berkas_count || 0), 0)} <span className="text-xs font-normal text-slate-400">Dokumen</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Unit Poliklinik & Rawat</p>
                        <p className="text-xl font-bold text-slate-900 font-['Outfit']">{poliOptions.length || 5} <span className="text-xs font-normal text-slate-400">Layanan</span></p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                
                {/* Search Box */}
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Cari No. RM, Registrasi, Nama Pasien, NIK..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#BA1B1D]/20 focus:border-[#BA1B1D] transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Dropdown Filters */}
                <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap justify-end">
                    
                    {/* Filter Poli */}
                    <select
                        value={selectedPoli}
                        onChange={(e) => {
                            setSelectedPoli(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#BA1B1D] cursor-pointer"
                    >
                        <option value="">Semua Poliklinik / Ruangan</option>
                        {poliOptions.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    {/* Filter Asuransi */}
                    <select
                        value={selectedAsuransi}
                        onChange={(e) => {
                            setSelectedAsuransi(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#BA1B1D] cursor-pointer"
                    >
                        <option value="">Semua Penjamin / Asuransi</option>
                        {asuransiOptions.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>

                    {/* Tombol Refresh */}
                    <button
                        onClick={onRefresh}
                        title="Segarkan Data"
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#BA1B1D]' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                
                {/* Table Header Accent */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-['Outfit']">
                            TABEL DATA REKAM MEDIS PASIEN (SIMRS)
                        </h3>
                    </div>
                    <span className="text-[11px] text-slate-300">
                        Menampilkan <strong>{paginatedPatients.length}</strong> dari <strong>{filteredPatients.length}</strong> data pasien
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">No. Rekam Medis</th>
                                <th className="py-3 px-4">Nama Pasien</th>
                                <th className="py-3 px-4">Tgl Lahir / Usia</th>
                                <th className="py-3 px-4">DPJP</th>
                                <th className="py-3 px-4">Poli / Ruangan</th>
                                <th className="py-3 px-4">Penjamin</th>
                                <th className="py-3 px-4 text-center">Arsip Digital</th>
                                <th className="py-3 px-4 text-center w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="9" className="py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-7 h-7 border-2 border-[#BA1B1D] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-xs font-semibold">Memuat data pasien dari database SIMRS...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-12 text-center text-slate-500">
                                        <p className="text-sm font-semibold">Tidak ada data pasien yang sesuai kriteria pencarian.</p>
                                        <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian lain atau kosongkan filter.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPatients.map((patient, index) => (
                                    <tr 
                                        key={patient.id || patient.no_rekam_medis}
                                        className="hover:bg-slate-50/70 transition-colors"
                                    >
                                        {/* No */}
                                        <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>

                                        {/* No RM */}
                                        <td className="py-3.5 px-4">
                                            <div className="font-extrabold text-[#BA1B1D] font-mono tracking-tight text-xs">
                                                {patient.no_rekam_medis}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                Reg: {patient.no_registrasi || '-'}
                                            </div>
                                        </td>

                                        {/* Nama Pasien */}
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-900 group-hover:text-[#BA1B1D] transition-colors flex items-center gap-1.5">
                                                {patient.nama_pasien}
                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                                    patient.jenis_kelamin === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                                                }`}>
                                                    {patient.jenis_kelamin === 'L' ? 'L' : 'P'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                NIK: {patient.nik || '-'}
                                            </div>
                                        </td>

                                        {/* Tgl Lahir */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-700">
                                                {formatDate(patient.tanggal_lahir)}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {calculateAge(patient.tanggal_lahir)}
                                            </div>
                                        </td>

                                        {/* DPJP */}
                                        <td className="py-3.5 px-4">
                                            <div className="font-medium text-slate-800 flex items-center gap-1">
                                                <Stethoscope className="w-3 h-3 text-[#BA1B1D] shrink-0" />
                                                <span className="truncate max-w-[150px]">{patient.dpjp || '-'}</span>
                                            </div>
                                        </td>

                                        {/* Poli / Ruangan */}
                                        <td className="py-3.5 px-4">
                                            <span className="font-medium text-slate-700 truncate block max-w-[160px]">
                                                {patient.poli_ruangan || '-'}
                                            </span>
                                        </td>

                                        {/* Penjamin */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                                (patient.jenis_asuransi || '').includes('BPJS')
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                                                    : 'bg-amber-50 text-amber-900 border border-amber-200/80'
                                            }`}>
                                                {patient.jenis_asuransi || 'Umum'}
                                            </span>
                                        </td>

                                        {/* Jumlah Arsip Berkas */}
                                        <td className="py-3.5 px-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                (patient.berkas_count || 0) > 0
                                                    ? 'bg-red-50 text-[#BA1B1D] border border-red-200'
                                                    : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                <FileText className="w-3 h-3" />
                                                {patient.berkas_count || 0} Berkas
                                            </span>
                                        </td>

                                        {/* Action Button */}
                                        <td className="py-3.5 px-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onSelectPatient(patient)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-[#BA1B1D] active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer group/btn"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Detail</span>
                                                <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <p>
                        Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total <strong>{filteredPatients.length}</strong> pasien)
                    </p>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-semibold"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Sebelumnya</span>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg font-bold transition text-xs ${
                                    currentPage === page
                                        ? 'bg-[#BA1B1D] text-white shadow-xs'
                                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-semibold"
                        >
                            <span>Berikutnya</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
