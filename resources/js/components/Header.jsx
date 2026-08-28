import React from 'react';
import { Hospital, User, Clock, ShieldCheck, Activity } from 'lucide-react';

export default function Header({ onNavigateHome }) {
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                
                {/* Brand & Logo RS Awal Bros */}
                <div 
                    onClick={onNavigateHome}
                    className="flex items-center gap-3.5 cursor-pointer select-none group"
                    title="Kembali ke Tabel Pasien"
                >
                    {/* Emblem RS Awal Bros Theme */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#BA1B1D] to-[#E63946] flex items-center justify-center text-white shadow-md shadow-red-900/10 group-hover:scale-105 transition-transform">
                        <Hospital className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-lg tracking-tight text-[#BA1B1D] font-['Outfit'] group-hover:text-[#9E1618] transition-colors">
                                RS AWAL BROS
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100/70 text-[#BA1B1D] uppercase tracking-wider">
                                SIMRS e-Arsip
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 tracking-wide">
                            SISTEM ARSIP ELEKTRONIK REKAM MEDIS
                        </p>
                    </div>
                </div>

                {/* Right side: Status & Staff Info */}
                <div className="flex items-center gap-5">
                    {/* Database Status Indicator */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>SIMRS Live Connected</span>
                    </div>

                    {/* Officer / Staff Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold shadow-xs">
                            <User className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                                <span>Staff01</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500">Unit Rekam Medis</span>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}
