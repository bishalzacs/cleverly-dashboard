"use client";

import { Lead } from "@/services/mondayService";
import { subDays, subMonths, subYears, format, parseISO } from "date-fns";
import { useState, useRef, useEffect } from "react";

export interface FilterState {
    owner: string;
    from: string;
    to: string;
}

interface FilterBarProps {
    leads: Lead[];           // used to derive owner list
    filters: FilterState;
    onFiltersChange: (f: FilterState) => void;
}

export const FilterBar = ({ leads, filters, onFiltersChange }: FilterBarProps) => {
    const [isDateOpen, setIsDateOpen] = useState(false);
    const dateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
                setIsDateOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const owners = Array.from(
        new Set(leads.map((l) => l.owner).filter(Boolean) as string[])
    ).sort();

    const set = (key: keyof FilterState, value: string) =>
        onFiltersChange({ ...filters, [key]: value });

    const handlePresetChange = (preset: string) => {
        const today = new Date();
        const to = format(today, "yyyy-MM-dd");
        let from = "";

        switch (preset) {
            case "3days":
                from = format(subDays(today, 3), "yyyy-MM-dd");
                break;
            case "1month":
                from = format(subMonths(today, 1), "yyyy-MM-dd");
                break;
            case "6months":
                from = format(subMonths(today, 6), "yyyy-MM-dd");
                break;
            case "1year":
                from = format(subYears(today, 1), "yyyy-MM-dd");
                break;
            default:
                onFiltersChange({ ...filters, from: "", to: "" });
                return;
        }

        onFiltersChange({ ...filters, from, to });
    };

    let currentPreset = "";
    if (filters.from && filters.to) {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        if (filters.to === todayStr) {
            if (filters.from === format(subDays(new Date(), 3), "yyyy-MM-dd")) currentPreset = "3days";
            else if (filters.from === format(subMonths(new Date(), 1), "yyyy-MM-dd")) currentPreset = "1month";
            else if (filters.from === format(subMonths(new Date(), 6), "yyyy-MM-dd")) currentPreset = "6months";
            else if (filters.from === format(subYears(new Date(), 1), "yyyy-MM-dd")) currentPreset = "1year";
            else currentPreset = "custom";
        } else {
            currentPreset = "custom";
        }
    }

    const getDisplayDate = () => {
        if (!filters.from && !filters.to) return "All Time";
        if (currentPreset === "3days") return "Last 3 Days";
        if (currentPreset === "1month") return "Past Month";
        if (currentPreset === "6months") return "Last 6 Months";
        if (currentPreset === "1year") return "Last 1 Year";

        const formatStr = "MMM d, yyyy";
        try {
            const fromStr = filters.from ? format(parseISO(filters.from), formatStr) : "Start";
            const toStr = filters.to ? format(parseISO(filters.to), formatStr) : "End";
            return `${fromStr} - ${toStr}`;
        } catch (e) {
            return `${filters.from} - ${filters.to}`;
        }
    };

    const hasFilters = filters.owner || filters.from || filters.to;

    return (
        <div className="flex flex-wrap items-center gap-4 px-8 py-4 bg-zinc-950/20 backdrop-blur-sm relative z-40">
            {/* Owner filter */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-border-subtle rounded-xl hover:border-text-primary/10 transition-all cursor-pointer group shadow-inner">
                    <svg className="w-3.5 h-3.5 text-text-secondary opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <select
                        value={filters.owner}
                        onChange={(e) => set("owner", e.target.value)}
                        className="bg-transparent text-[11px] font-bold text-text-primary focus:outline-none min-w-[120px] cursor-pointer appearance-none uppercase tracking-widest"
                    >
                        <option value="" className="bg-zinc-900">All Representatives</option>
                        {owners.map((o) => (
                            <option key={o} value={o} className="bg-zinc-900">{o}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative" ref={dateRef}>
                <button
                    onClick={() => setIsDateOpen(!isDateOpen)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all shadow-inner group
                        ${isDateOpen ? "bg-zinc-900 border-text-primary/20 shadow-2xl" : "bg-zinc-900/50 border-border-subtle hover:border-text-primary/10"}`}
                >
                    <svg className="w-3.5 h-3.5 text-text-secondary opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[11px] font-bold text-text-primary uppercase tracking-widest">{getDisplayDate()}</span>
                    <svg className={`w-3 h-3 text-text-secondary transition-transform duration-500 ${isDateOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isDateOpen && (
                    <div className="absolute top-full left-0 mt-4 origin-top-left bg-zinc-900 border border-zinc-50/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-50 w-[300px] overflow-hidden animate-scale-in">
                        <div className="flex flex-col p-3 gap-1">
                            {[
                                { val: "", label: "All Time Range" },
                                { val: "3days", label: "Last 72 Hours" },
                                { val: "1month", label: "Last 30 Days" },
                                { val: "6months", label: "Past 6 Months" },
                                { val: "1year", label: "Past Fiscal Year" }
                            ].map((preset) => (
                                <button
                                    key={preset.val}
                                    onClick={() => { handlePresetChange(preset.val); setIsDateOpen(false); }}
                                    className={`px-4 py-3 text-[10px] text-left rounded-xl transition-all uppercase tracking-[0.15em] font-black
                                        ${(preset.val === "" && !filters.from && !filters.to) || currentPreset === preset.val
                                            ? "bg-text-primary text-zinc-950 shadow-xl"
                                            : "text-text-secondary hover:bg-zinc-50/5 hover:text-text-primary"
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-5 border-t border-zinc-50/5 bg-zinc-950/20">
                            <span className="text-[9px] uppercase font-black text-text-secondary tracking-[0.25em] mb-4 block opacity-30 italic">Precision Range Select</span>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] text-text-secondary font-black uppercase tracking-widest opacity-40 ml-1">From</label>
                                    <input
                                        type="date"
                                        value={filters.from}
                                        onChange={(e) => set("from", e.target.value)}
                                        className="bg-zinc-950 w-full border border-zinc-50/10 rounded-xl px-3 py-2.5 text-[10px] text-text-primary focus:outline-none focus:border-brand-primary transition-all shadow-inner font-bold font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] text-text-secondary font-black uppercase tracking-widest opacity-40 ml-1">To</label>
                                    <input
                                        type="date"
                                        value={filters.to}
                                        onChange={(e) => set("to", e.target.value)}
                                        className="bg-zinc-950 w-full border border-zinc-50/10 rounded-xl px-3 py-2.5 text-[10px] text-text-primary focus:outline-none focus:border-brand-primary transition-all shadow-inner font-bold font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sync Twilio Button */}
            <button
                onClick={async (e) => {
                    const btn = e.currentTarget;
                    const originalText = btn.innerHTML;
                    btn.innerText = "PULLING DATA...";
                    btn.classList.add("cursor-wait", "opacity-80");
                    try {
                        const res = await fetch("/api/sync-twilio");
                        const data = await res.json();
                        alert(`Twilio Synchronization Complete!\n\nNew Call Logs Created: ${data.totals?.newly_inserted_logs || 0}\nTotal Scanned: ${data.totals?.scanned_from_twilio || 0}`);
                        window.location.reload(); // Instantly refresh the cards so the user sees the stages update natively!
                    } catch(err) {
                        alert("Sync Failed: Check Network");
                    }
                    btn.innerHTML = originalText;
                    btn.classList.remove("cursor-wait", "opacity-80");
                }}
                className={`flex items-center gap-2 ${!hasFilters ? 'ml-auto' : ''} px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-indigo-500/5 active:scale-95`}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                SYNC TWILIO CALLS
            </button>

            {hasFilters && (
                <button
                    onClick={() => onFiltersChange({ owner: "", from: "", to: "" })}
                    className="flex items-center gap-2 ml-4 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5 active:scale-95"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Flush Filters
                </button>
            )}
        </div>
    );
};
