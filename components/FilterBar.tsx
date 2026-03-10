"use client";

import { Lead } from "@/services/mondayService";

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
    // Derive unique non-empty owners from current lead set
    const owners = Array.from(
        new Set(leads.map((l) => l.owner).filter(Boolean) as string[])
    ).sort();

    const set = (key: keyof FilterState, value: string) =>
        onFiltersChange({ ...filters, [key]: value });

    const hasFilters = filters.owner || filters.from || filters.to;

    return (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border-subtle bg-surface-panel/40">
            {/* Owner filter */}
            <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <select
                    value={filters.owner}
                    onChange={(e) => set("owner", e.target.value)}
                    className="bg-surface-panel border border-border-subtle rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-accent/50 transition-all min-w-[130px]"
                >
                    <option value="">All Reps</option>
                    {owners.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                    type="date"
                    value={filters.from}
                    onChange={(e) => set("from", e.target.value)}
                    className="bg-surface-panel border border-border-subtle rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-accent/50 transition-all"
                    placeholder="From"
                />
                <span className="text-text-secondary text-xs">→</span>
                <input
                    type="date"
                    value={filters.to}
                    onChange={(e) => set("to", e.target.value)}
                    className="bg-surface-panel border border-border-subtle rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-accent/50 transition-all"
                    placeholder="To"
                />
            </div>

            {/* Clear button */}
            {hasFilters && (
                <button
                    onClick={() => onFiltersChange({ owner: "", from: "", to: "" })}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Clear
                </button>
            )}

            {/* Active filter count badge */}
            {hasFilters && (
                <span className="text-[10px] text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded-full font-semibold">
                    Filtered
                </span>
            )}
        </div>
    );
};
