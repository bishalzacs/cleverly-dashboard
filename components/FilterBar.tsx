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

    // Derive unique non-empty owners from current lead set
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
                onFiltersChange({ ...filters, from: "", to: "" }); // handles "custom" or clear
                return;
        }

        onFiltersChange({ ...filters, from, to });
    };

    // Determine current preset based on dates
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
        if (!filters.from && !filters.to) return "Date: All Time";
        if (currentPreset === "3days") return "Last 3 Days";
        if (currentPreset === "1month") return "Past Month";
        if (currentPreset === "6months") return "Last 6 Months";
        if (currentPreset === "1year") return "Last 1 Year";

        // Format custom date
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
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border-subtle bg-surface-panel/40 relative z-40">
            {/* Owner filter */}
            <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <select
                    value={filters.owner}
                    onChange={(e) => set("owner", e.target.value)}
                    className="bg-surface-panel border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-accent/50 transition-all min-w-[130px] shadow-sm cursor-pointer hover:border-text-secondary/30"
                >
                    <option value="">All Reps</option>
                    {owners.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative" ref={dateRef}>
                <button
                    onClick={() => setIsDateOpen(!isDateOpen)}
                    className="flex items-center justify-between gap-2 bg-surface-panel border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-white hover:border-brand-accent/50 transition-all min-w-[160px] shadow-sm"
                >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <svg className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium truncate max-w-[180px]">{getDisplayDate()}</span>
                    </div>
                    <svg className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-300 flex-shrink-0 ${isDateOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isDateOpen && (
                    <div className="absolute top-full left-0 mt-2 origin-top-left bg-surface-panel border border-border-subtle rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 w-[280px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Presets List */}
                        <div className="flex flex-col p-1.5 border-b border-border-subtle">
                            {[
                                { val: "", label: "All Time" },
                                { val: "3days", label: "Last 3 Days" },
                                { val: "1month", label: "Past Month" },
                                { val: "6months", label: "Last 6 Months" },
                                { val: "1year", label: "Last 1 Year" }
                            ].map((preset) => (
                                <button
                                    key={preset.val}
                                    onClick={() => { handlePresetChange(preset.val); setIsDateOpen(false); }}
                                    className={`px-3 py-2 text-xs text-left rounded-md transition-colors ${
                                        (preset.val === "" && !filters.from && !filters.to) || currentPreset === preset.val
                                            ? "bg-brand-accent/10 text-brand-accent font-medium shadow-[inset_0_0_10px_rgba(0,240,255,0.05)]"
                                            : "text-text-secondary hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Date Range */}
                        <div className="p-3 bg-surface-base/50">
                            <span className="text-[10px] uppercase font-bold text-text-secondary/70 tracking-widest mb-2 block">Custom Range</span>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col flex-1 gap-1">
                                    <label className="text-[10px] text-text-secondary">From</label>
                                    <input
                                        type="date"
                                        value={filters.from}
                                        onChange={(e) => set("from", e.target.value)}
                                        className="bg-surface-panel w-full border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-accent/50 transition-all shadow-inner custom-calendar-icon"
                                    />
                                </div>
                                <div className="flex flex-col flex-1 gap-1">
                                    <label className="text-[10px] text-text-secondary">To</label>
                                    <input
                                        type="date"
                                        value={filters.to}
                                        onChange={(e) => set("to", e.target.value)}
                                        className="bg-surface-panel w-full border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-accent/50 transition-all shadow-inner custom-calendar-icon"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Clear button */}
            {hasFilters && (
                <button
                    onClick={() => onFiltersChange({ owner: "", from: "", to: "" })}
                    className="flex items-center gap-1.5 ml-auto px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Clear Filters
                </button>
            )}

            {/* Active filter count badge */}
            {hasFilters && (
                <span className="hidden md:inline-flex items-center justify-center ml-2 text-[10px] text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2 
py-0.5 rounded-full font-semibold shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                    Active
                </span>
            )}
            
            {/* Inline styles for custom calendar picker invert */}
            <style jsx>{`
                .custom-calendar-icon::-webkit-calendar-picker-indicator {
                    filter: invert(1) opacity(0.5);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .custom-calendar-icon::-webkit-calendar-picker-indicator:hover {
                    filter: invert(1) opacity(1) drop-shadow(0 0 3px rgba(0, 240, 255, 0.4));
                }
            `}</style>
        </div>
    );
};

