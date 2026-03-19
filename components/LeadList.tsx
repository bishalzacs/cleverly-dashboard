"use client";

import { useState } from "react";
import { Lead } from "@/services/mondayService";
import { LeadCard } from "./LeadCard";
import { LeadEditModal } from "./LeadEditModal";
import { subDays, subMonths, subYears, isAfter, parseISO } from "date-fns";

interface LeadListProps {
    leads: Lead[];
    isLoading: boolean;
    error: string | null;
    activeLeadId: string | null;
    isCallActive: boolean;
    onSelectLead: (lead: Lead) => void;
    onCallLead: (lead: Lead) => void;
    onRefresh: () => void;
}

export const LeadList = ({ leads, isLoading, error, activeLeadId, isCallActive, onSelectLead, onCallLead, onRefresh }: LeadListProps) => {
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [localLeads, setLocalLeads] = useState<Lead[]>(leads);

    if (leads !== localLeads && leads.length !== localLeads.length) setLocalLeads(leads);

    const handleSaveLead = async (id: string, updates: Partial<Lead>) => {
        setLocalLeads((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
        await fetch(`/api/leads/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: updates.name, phone: updates.phone, email: updates.email }),
        });
        onRefresh();
    };

    const handleDeleteLead = async (id: string) => {
        setLocalLeads((prev) => prev.filter((l) => l.id !== id));
        await fetch(`/api/leads/${id}`, { method: "DELETE" });
    };

    const baseLeads = localLeads.length > 0 ? localLeads : leads;

    const owners = Array.from(new Set(baseLeads.map((l) => l.owner).filter(Boolean) as string[])).sort();

    const groups = ["New Leads", "Lost", "No-Show", "Cancel"] as const;
    const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
    const [columnOwner, setColumnOwner] = useState<Record<string, string>>({});
    const [columnDate, setColumnDate] = useState<Record<string, string>>({});

    const getGroupLeads = (group: typeof groups[number]) => {
        let filtered = baseLeads.filter(lead => {
            if (group === "New Leads") return lead.is_in_active_pool === true;
            
            if (lead.group_name) return lead.group_name === group;
            // fallback
            const s = (lead.status || "").toLowerCase();
            if (group === "Lost") return s.includes("lost");
            if (group === "No-Show") return s.includes("no show") || s.includes("no-show");
            if (group === "Cancel") return s.includes("cancel");
            return true;
        });

        const ownerStr = columnOwner[group];
        if (ownerStr) {
            filtered = filtered.filter(lead => lead.owner === ownerStr);
        }

        const datePreset = columnDate[group];
        if (datePreset && datePreset !== "all") {
            const today = new Date();
            let limitDate: Date | null = null;
            if (datePreset === "3days") limitDate = subDays(today, 3);
            else if (datePreset === "1month") limitDate = subMonths(today, 1);
            else if (datePreset === "6months") limitDate = subMonths(today, 6);
            else if (datePreset === "1year") limitDate = subYears(today, 1);

            if (limitDate) {
                filtered = filtered.filter(lead => {
                    if (!lead.createdDate) return false;
                    try {
                        const cur = parseISO(lead.createdDate);
                        return isAfter(cur, limitDate!);
                    } catch { return false; }
                });
            }
        }

        const searchStr = columnSearch[group]?.toLowerCase();
        if (searchStr) {
            filtered = filtered.filter(lead => 
                (lead.name || "").toLowerCase().includes(searchStr) ||
                (lead.company || "").toLowerCase().includes(searchStr) ||
                (lead.phone || "").toLowerCase().includes(searchStr) ||
                (lead.email || "").toLowerCase().includes(searchStr)
            );
        }
        
        return filtered;
    };

    return (
        <div className="flex flex-col h-full bg-surface-base border-r border-border-subtle shadow-[10px_0_30px_rgba(0,0,0,0.4)] z-20 relative overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-border-subtle flex flex-col gap-3 sticky top-0 bg-surface-base/80 backdrop-blur-md z-10 shrink-0">
                <div className="flex justify-between items-center w-full">
                    <h2 className="text-sm font-black tracking-tight text-text-primary flex items-center gap-2 font-outfit uppercase">
                        Leads
                        <span className="bg-brand-primary/10 text-brand-primary text-[9px] px-2 py-0.5 rounded-full border border-brand-primary/20 font-black shadow-sm">
                            {baseLeads.length} Total
                        </span>
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                const btn = document.getElementById("sync-btn");
                                if (btn) btn.classList.add("animate-pulse");
                                try { await fetch("/api/sync-leads", { method: "POST" }); onRefresh(); }
                                catch (e) { console.error(e); }
                                finally { if (btn) btn.classList.remove("animate-pulse"); }
                            }}
                            id="sync-btn"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent/20 text-brand-accent transition-all text-xs font-semibold uppercase tracking-wider"
                            title="Sync from Monday.com"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                            Sync
                        </button>
                        <button onClick={onRefresh} disabled={isLoading}
                            className="p-2.5 rounded-xl bg-surface-panel border border-border-subtle hover:bg-surface-panel-hover text-text-secondary hover:text-text-primary transition-all shadow-sm"
                        >
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-primary" : ""}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="m-4 p-4 rounded-xl glass-panel text-red-400 text-sm border border-red-500/20 shrink-0">
                    <div className="flex items-center space-x-2 font-medium mb-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span>Fetch Error</span>
                    </div>
                    <span className="text-xs opacity-80">{error}</span>
                </div>
            )}

            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-surface-base">
                <div className="flex h-full gap-4 p-4 min-w-max">
                    {groups.map((group) => {
                        const groupLeads = getGroupLeads(group);
                        return (
                            <div key={group} className="flex flex-col w-[320px] md:w-[350px] flex-shrink-0 rounded-2xl border border-border-subtle bg-surface-panel shadow-2xl overflow-hidden h-full mb-4 animate-scale-in">
                                <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-surface-panel sticky top-0 z-10">
                                    <span className="text-xs font-black text-text-primary tracking-wide uppercase">{group}</span>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary shadow-sm">
                                        {groupLeads.length}
                                    </span>
                                </div>
                                <div className="p-2 border-b border-border-subtle bg-surface-base/50 flex flex-col gap-2">
                                     <div className="relative">
                                        <svg className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input 
                                            type="text" 
                                            placeholder={`Search ${group}...`}
                                            value={columnSearch[group] || ""}
                                            onChange={(e) => setColumnSearch({...columnSearch, [group]: e.target.value})}
                                            className="w-full bg-surface-base border border-border-subtle rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary placeholder-text-secondary focus:outline-none focus:border-brand-primary/50 transition-all font-sans shadow-inner"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={columnOwner[group] || ""}
                                            onChange={(e) => setColumnOwner({...columnOwner, [group]: e.target.value})}
                                            className="flex-1 bg-surface-base border border-border-subtle rounded-xl px-2 py-2 text-xs text-text-secondary hover:text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all cursor-pointer shadow-inner"
                                        >
                                            <option value="" className="bg-surface-panel text-text-primary">All Reps</option>
                                            {owners.map(o => <option key={o} value={o} className="bg-surface-panel text-text-primary">{o}</option>)}
                                        </select>
                                         <select
                                            value={columnDate[group] || "all"}
                                            onChange={(e) => setColumnDate({...columnDate, [group]: e.target.value})}
                                            className="flex-1 bg-surface-base border border-border-subtle rounded-xl px-2 py-2 text-xs text-text-secondary hover:text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all cursor-pointer shadow-inner"
                                        >
                                            <option value="all" className="bg-surface-panel text-text-primary">All Time</option>
                                            <option value="3days" className="bg-surface-panel text-text-primary">Last 3 Days</option>
                                            <option value="1month" className="bg-surface-panel text-text-primary">Past Month</option>
                                            <option value="6months" className="bg-surface-panel text-text-primary">Last 6 Months</option>
                                            <option value="1year" className="bg-surface-panel text-text-primary">Last 1 Year</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                    {isLoading && baseLeads.length === 0 ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((i) => <div key={i} className="h-[140px] rounded-xl bg-surface-panel border border-border-subtle animate-pulse" />)}
                                        </div>
                                    ) : groupLeads.length === 0 ? (
                                        <div className="h-32 flex flex-col items-center justify-center text-text-secondary border-2 border-dashed border-border-subtle rounded-xl m-2 opacity-50">
                                            <span className="text-xs font-medium">Empty List</span>
                                        </div>
                                    ) : (
                                        groupLeads.map((lead) => (
                                            <LeadCard key={lead.id} lead={lead} isActive={activeLeadId === lead.id}
                                                onSelect={onSelectLead} onCall={onCallLead}
                                                isCallingDisabled={isCallActive} onEdit={setEditingLead} />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {editingLead && (
                <LeadEditModal lead={editingLead} onClose={() => setEditingLead(null)}
                    onSave={handleSaveLead} onDelete={handleDeleteLead} />
            )}
        </div>
    );
};
