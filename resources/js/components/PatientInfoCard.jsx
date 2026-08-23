import React from 'react';
import { User, Calendar, Stethoscope, Shield, CreditCard, Building2, MapPin, Phone } from 'lucide-react';

export default function PatientInfoCard({ patient }) {
    if (!patient) return null;

    // Calculate age
    const calculateAge = (birthDateStr) => {
        if (!birthDateStr) return '-';
        const birthDate = new Date(birthDateStr);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const age = calculateAge(patient.tanggal_lahir);

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
            {/* Header Title with RS Awal Bros Crimson Accent */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-['Outfit']">
                        INFORMASI PASIEN (Data Terintegrasi SIMRS)
                    </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Status: Pasien Aktif</span>
                </div>
            </div>

            {/* Content Details Grid */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white">
                
                {/* Column 1: Nama & No RM */}
                <div className="space-y-3">
                    <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Nama Pasien
                        </span>
                        <p className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                            {patient.nama_pasien}
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                        </p>
                    </div>

                    <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            No. Rekam Medis
                        </span>
                        <p className="text-sm font-extrabold text-[#BA1B1D] font-mono tracking-tight mt-0.5">
                            {patient.no_rekam_medis}
                        </p>
                    </div>
                </div>

                {/* Column 2: No Registrasi & Tanggal Lahir */}
                <div className="space-y-3">
                    <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            No. Registrasi Kunjungan
                        </span>
                        <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                            {patient.no_registrasi || '-'}
                        </p>
                    </div>

                    <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Tgl Lahir / Usia
                        </span>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                            {formatDate(patient.tanggal_lahir)} <span className="text-slate-500 font-normal">({age} Th)</span>
                        </p>
                    </div>
                </div>

                {/* Column 3: DPJP & Penjamin */}
                <div className="space-y-3">
                    <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            DPJP (Dokter Penanggung Jawab)
                        </span>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                            <Stethoscope className="w-4 h-4 text-[#BA1B1D] shrink-0" />
                            <span className="truncate">{patient.dpjp || '-'}</span>
                        </p>
                    </div>

                    <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Jenis Penjamin / Asuransi
                        </span>
                        <div className="mt-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                (patient.jenis_asuransi || '').includes('BPJS')
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                            }`}>
                                <CreditCard className="w-3.5 h-3.5" />
                                {patient.jenis_asuransi || 'Umum'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Column 4: Poli / Ruangan & Alamat */}
                <div className="space-y-3">
                    <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Poli / Ruangan Perawatan
                        </span>
                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate">{patient.poli_ruangan || '-'}</span>
                        </p>
                    </div>

                    <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Domisili
                        </span>
                        <p className="text-xs font-medium text-slate-600 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{patient.alamat || 'Pekanbaru, Riau'}</span>
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}
