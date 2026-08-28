import React, { useState } from 'react';
import { 
    Calendar, 
    Clock, 
    Building2, 
    Stethoscope, 
    FileText, 
    Activity, 
    Pill, 
    CheckCircle2, 
    ArrowLeft,
    Download,
    Eye,
    ShieldAlert,
    HeartPulse,
    ClipboardList,
    AlertCircle,
    User,
    CreditCard
} from 'lucide-react';

export default function PatientHistoryView({ patient, files = [], onBack, onOpenFile }) {
    if (!patient) return null;

    // Data riwayat kunjungan & rekam klinis medis (Integrasi SIMRS)
    const medicalHistory = [
        {
            id: 'VISIT-2026-001',
            tanggal: '12 Agustus 2026',
            jam: '09:30 WIB',
            jenis_kunjungan: 'Rawat Inap (Paviliun Anggrek 302)',
            dpjp: patient.dpjp || 'dr. Andi Pratama, Sp.PD',
            poli_unit: patient.poli_ruangan || 'Poli Penyakit Dalam',
            diagnosa_utama: 'Dispepsia Kronis + Hipertensi Grade I',
            diagnosa_sekunder: 'Gastritis Erosif, Anemia Ringan',
            tindakan_terapi: 'Injeksi Omeprazole 40mg IV / 12 jam, Infus Asering 20 tpm, Sukralfat Sirup 3x1 C, Diet Lambung II.',
            tanda_vital: {
                tensi: '135/85 mmHg',
                nadi: '78 x/menit',
                suhu: '36.6 °C',
                respirasi: '20 x/menit',
                spo2: '98%'
            },
            status: 'Selesai Pulang (Kondisi Membaik)',
            catatan_dokter: 'Pasien diizinkan pulang dengan obat rawat jalan. Kontrol ulang dijadwalkan tanggal 19 Agustus 2026.',
            berkas_terkait: files.filter(f => f.kategori === 'Resume Medis' || f.kategori === 'Laboratorium')
        },
        {
            id: 'VISIT-2026-002',
            tanggal: '19 Agustus 2026',
            jam: '10:15 WIB',
            jenis_kunjungan: 'Rawat Jalan (Kontrol Poliklinik)',
            dpjp: patient.dpjp || 'dr. Andi Pratama, Sp.PD',
            poli_unit: 'Poliklinik Penyakit Dalam (Sp.PD)',
            diagnosa_utama: 'Post Rawat Inap Dispepsia (Perbaikan Klinis)',
            diagnosa_sekunder: 'Hipertensi Terkontrol',
            tindakan_terapi: 'Lansoprazole 1x30mg (Pagi), Candesartan 1x8mg (Malam). Edukasi pantang makanan pedas/asam dan kurangi kopi.',
            tanda_vital: {
                tensi: '120/80 mmHg',
                nadi: '72 x/menit',
                suhu: '36.5 °C',
                respirasi: '18 x/menit',
                spo2: '99%'
            },
            status: 'Rawat Jalan Selesai',
            catatan_dokter: 'Nyeri ulu hati berkurang signifikan. Tekanan darah normal. Lanjutkan maintenance terapi oral 14 hari.',
            berkas_terkait: files.filter(f => f.kategori === 'Surat Kontrol' || f.kategori === 'Resep / Farmasi')
        },
        {
            id: 'VISIT-2026-003',
            tanggal: '02 Mei 2026',
            jam: '14:20 WIB',
            jenis_kunjungan: 'Instalasi Gawat Darurat (IGD)',
            dpjp: 'dr. Budi Hartono, Sp.B',
            poli_unit: 'IGD Cito RS Awal Bros',
            diagnosa_utama: 'Observasi Nyeri Abdomen Akut Epigastrium',
            diagnosa_sekunder: 'Susp. Kolik Bilier dd Ulkus Peptikum',
            tindakan_terapi: 'Injeksi Ketorolac 30mg IV, Ondansetron 4mg IV, USG Abdomen screening IGD.',
            tanda_vital: {
                tensi: '140/90 mmHg',
                nadi: '88 x/menit',
                suhu: '37.1 °C',
                respirasi: '22 x/menit',
                spo2: '97%'
            },
            status: 'Alih Rawat Poliklinik',
            catatan_dokter: 'Nyeri akut teratasi. Disarankan USG Abdomen lanjutan dan konsultasi spesialis penyakit dalam.',
            berkas_terkait: files.filter(f => f.kategori === 'Radiologi' || f.kategori === 'Lainnya')
        }
    ];

    const [activeVisitId, setActiveVisitId] = useState(medicalHistory[0].id);
    const selectedVisit = medicalHistory.find(v => v.id === activeVisitId) || medicalHistory[0];

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-xs">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-700 hover:text-[#BA1B1D] font-bold transition cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-500 font-medium">Riwayat Rekam Medis:</span>
                    <span className="font-extrabold text-[#BA1B1D] font-mono">
                        {patient.no_rekam_medis}
                    </span>
                    <span className="text-slate-400">({patient.nama_pasien})</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SIMRS Rekam Medis Terverifikasi</span>
                    </span>
                </div>
            </div>

            {/* Main Layout 2 Kolom: Timeline Kunjungan & Detail Klinis */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Kolom Kiri: Timeline Kunjungan Pasien (4 Cols) */}
                <div className="lg:col-span-4 space-y-3">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-red-400" />
                                <h3 className="text-xs font-bold uppercase tracking-wider">
                                    Daftar Riwayat Kunjungan
                                </h3>
                            </div>
                            <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-800 font-mono">
                                {medicalHistory.length} Episode
                            </span>
                        </div>

                        <div className="p-3 space-y-2.5 max-h-[620px] overflow-y-auto">
                            {medicalHistory.map((visit, index) => {
                                const isActive = visit.id === activeVisitId;
                                return (
                                    <div
                                        key={visit.id}
                                        onClick={() => setActiveVisitId(visit.id)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                                            isActive
                                                ? 'bg-red-50/50 border-[#BA1B1D] shadow-xs'
                                                : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                                        }`}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#BA1B1D] rounded-r"></div>
                                        )}

                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                <Calendar className="w-3.5 h-3.5 text-[#BA1B1D]" />
                                                <span>{visit.tanggal}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">{visit.jam}</span>
                                        </div>

                                        <p className="text-xs font-bold text-slate-900 line-clamp-1">
                                            {visit.jenis_kunjungan}
                                        </p>

                                        <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                                            <Stethoscope className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span className="truncate">{visit.dpjp}</span>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                            <span className="text-slate-500 font-medium truncate max-w-[170px]">
                                                {visit.diagnosa_utama}
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold shrink-0">
                                                {visit.status.split(' ')[0]}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Detail Klinis Rekam Medis (8 Cols) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        
                        {/* Header Episode Klinis */}
                        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-[#BA1B1D] text-white text-[10px] font-mono font-bold">
                                        {selectedVisit.id}
                                    </span>
                                    <h3 className="text-sm font-bold tracking-tight">
                                        {selectedVisit.jenis_kunjungan}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    Waktu Pelayanan: <strong>{selectedVisit.tanggal}</strong> pukul <strong>{selectedVisit.jam}</strong>
                                </p>
                            </div>

                            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-xl text-xs font-bold text-center sm:text-right">
                                {selectedVisit.status}
                            </span>
                        </div>

                        {/* Detail Klinis Body */}
                        <div className="p-5 sm:p-6 space-y-5">
                            
                            {/* Baris 1: Tanda-Tanda Vital (Vital Signs) */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                                    <HeartPulse className="w-4 h-4 text-[#BA1B1D]" />
                                    <span>Tanda-Tanda Vital (Pemeriksaan Fisik Awal)</span>
                                </h4>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Tekanan Darah</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedVisit.tanda_vital.tensi}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Denyut Nadi</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedVisit.tanda_vital.nadi}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Suhu Tubuh</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedVisit.tanda_vital.suhu}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Respirasi</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedVisit.tanda_vital.respirasi}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center col-span-2 sm:col-span-1">
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Saturasi SpO2</p>
                                        <p className="text-sm font-bold text-emerald-600 mt-0.5">{selectedVisit.tanda_vital.spo2}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Baris 2: Diagnosa Medis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-red-50/40 border border-red-200/80">
                                    <span className="text-[10px] font-bold text-[#BA1B1D] uppercase tracking-wider block mb-1">
                                        Diagnosa Utama (ICD-10)
                                    </span>
                                    <p className="text-sm font-extrabold text-slate-900">
                                        {selectedVisit.diagnosa_utama}
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Diagnosa Sekunder / Komorbiditas
                                    </span>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {selectedVisit.diagnosa_sekunder}
                                    </p>
                                </div>
                            </div>

                            {/* Baris 3: Tindakan & Terapi Obat */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Pill className="w-4 h-4 text-emerald-600" />
                                    <span>Tindakan Medis, Prosedur & Terapi Farmasi</span>
                                </h4>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono">
                                    {selectedVisit.tindakan_terapi}
                                </div>
                            </div>

                            {/* Baris 4: Catatan DPJP */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Activity className="w-4 h-4 text-blue-600" />
                                    <span>Instruksi & Catatan Perkembangan Pasien (CPPT / DPJP)</span>
                                </h4>
                                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
                                    {selectedVisit.catatan_dokter}
                                </div>
                            </div>

                            {/* Baris 5: Berkas Arsip Terlampir pada Episode Ini */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-[#BA1B1D]" />
                                    <span>Berkas Arsip Medis Terkait Episode Ini</span>
                                </h4>

                                {selectedVisit.berkas_terkait.length === 0 ? (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                                        Belum ada dokumen yang diunggah khusus untuk episode kunjungan ini.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedVisit.berkas_terkait.map((f) => (
                                            <div 
                                                key={f.id}
                                                className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-red-300 transition"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#BA1B1D] flex items-center justify-center shrink-0">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-xs font-bold text-slate-800 truncate">{f.nama_file_asli}</p>
                                                        <p className="text-[10px] text-slate-400">{f.kategori} • {f.tipe_file.toUpperCase()}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => onOpenFile(f)}
                                                    className="px-2.5 py-1 bg-slate-900 hover:bg-[#BA1B1D] text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    <span>Lihat</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
