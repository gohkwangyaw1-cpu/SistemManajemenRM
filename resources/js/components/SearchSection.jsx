import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, ChevronRight, Hash } from 'lucide-react';
import axios from 'axios';

export default function SearchSection({ searchQuery, setSearchQuery, onSearch, onSelectPatient, isLoading }) {
    const [suggestions, setSuggestions] = useState([]);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    // Live suggestion debounce
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingSuggestions(true);
            try {
                const res = await axios.get(`/api/pasien/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setSuggestions(res.data.data || []);
                setShowDropdown(true);
            } catch (err) {
                console.error("Suggestion error:", err);
            } finally {
                setIsSearchingSuggestions(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close suggestion on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setShowDropdown(false);
        onSearch();
    };

    return (
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#BA1B1D]"></span>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-['Outfit']">
                        Pencarian Pasien Rekam Medis
                    </h2>
                </div>
                <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                    Cari berdasarkan No. RM, No. Registrasi, NIK, atau Nama
                </span>
            </div>

            <form onSubmit={handleFormSubmit} className="relative" ref={wrapperRef}>
                <div className="flex flex-col sm:flex-row gap-2.5">
                    
                    {/* Input Field with Icon */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            {isLoading || isSearchingSuggestions ? (
                                <Loader2 className="w-5 h-5 animate-spin text-[#BA1B1D]" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (suggestions.length > 0) setShowDropdown(true);
                            }}
                            placeholder="🔍 Masukkan No. RM (cth: RM001245) atau No. Registrasi / Nama..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#BA1B1D]/20 focus:border-[#BA1B1D] transition"
                        />
                    </div>

                    {/* Action Button RS Awal Bros Red */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-[#BA1B1D] hover:bg-[#9E1618] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition shadow-md shadow-red-900/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>MENCARI...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                <span>CARI DATA</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Autocomplete Dropdown List */}
                {showDropdown && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 sm:right-36 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden max-h-72 overflow-y-auto">
                        <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                            <span>Hasil Pencarian Cepat SIMRS</span>
                            <span>{suggestions.length} Ditemukan</span>
                        </div>
                        {suggestions.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                    setShowDropdown(false);
                                    onSelectPatient(p);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-red-50/50 flex items-center justify-between border-b border-slate-100 last:border-0 transition group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-red-100/60 flex items-center justify-center text-slate-600 group-hover:text-[#BA1B1D] transition">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800 group-hover:text-[#BA1B1D] transition">
                                            {p.nama_pasien}
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                            <span className="font-semibold text-slate-700">{p.no_rekam_medis}</span>
                                            <span>•</span>
                                            <span>Reg: {p.no_registrasi}</span>
                                            <span>•</span>
                                            <span>{p.dpjp}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                        {p.berkas_count || 0} berkas
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#BA1B1D]" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </form>
        </section>
    );
}
