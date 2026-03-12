"use client";

import { useState, useMemo } from "react";
import { Lead } from "@/services/mondayService";
import { LeadCard } from "./LeadCard";
import { LeadEditModal } from "./LeadEditModal";

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
    const [activeSection, setActiveSection] = useState<"Lost" | "No-Show" | "Cancel">("Lost");

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

    const displayLeads = useMemo(() => {
        return baseLeads.filter(lead => {
            const s = (lead.status || "").toLowerCase();
            if (activeSection === "Lost") return s.includes("lost");
            if (activeSection === "No-Show") return s.includes("no show") || s.includes("no-show");
            if (activeSection === "Cancel") return s.includes("cancel");
            return true;
        });
    }, [baseLeads, activeSection]);

    return (
        <div className="flex flex-col h-full bg-surface-base border-r border-border-subtle shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20 relative">
            <div className="p-5 border-b border-border-subtle flex flex-col gap-4 sticky top-0 glass z-10">
                <div className="flex justify-between items-center w-full">
                    <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                        Leads
                        <span className="bg-brand-accent/10 text-brand-accent text-xs px-2 py-0.5 rounded-full border border-brand-accent/20">
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
                        className="p-2 rounded-lg bg-surface-panel border border-border-subtle hover:bg-white/5 text-text-secondary hover:text-white transition-all"
                    >
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-accent" : ""}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 bg-surface-panel p-1 rounded-lg border border-border-subtle">
                {(["Lost", "No-Show", "Cancel"] as const).map(section => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activeSection === section 
                            ? "bg-surface-base text-brand-accent shadow-sm border border-border-subtle" 
                            : "text-text-secondary hover:text-white"}`}
                    >
                        {section}
                    </button>
                ))}
            </div>
        </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                {error ? (
                    <div className="p-4 rounded-xl glass-panel text-red-400 text-sm border border-red-500/20">
                        <div className="flex items-center space-x-2 font-medium mb-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span>Fetch Error</span>
                        </div>
                        <span className="text-xs opacity-80">{error}</span>
                    </div>
                ) : isLoading && displayLeads.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-[140px] rounded-xl bg-surface-panel border border-border-subtle animate-pulse" />)}
                    </div>
                ) : displayLeads.length === 0 ? (
                    <div className="text-center py-20 text-text-secondary flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-surface-panel border border-border-subtle flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        </div>
                        <p className="font-medium">No leads found.</p>
                        <p className="text-xs opacity-60 mt-1">Press Sync to fetch from Monday.com</p>
                    </div>
                ) : (
                    displayLeads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} isActive={activeLeadId === lead.id}
                            onSelect={onSelectLead} onCall={onCallLead}
                            isCallingDisabled={isCallActive} onEdit={setEditingLead} />
                    ))
                )}
            </div>

            {editingLead && (
                <LeadEditModal lead={editingLead} onClose={() => setEditingLead(null)}
                    onSave={handleSaveLead} onDelete={handleDeleteLead} />
            )}
        </div>
    );
};
