"use client";

import { useState, useCallback, useEffect } from "react";
import { Lead } from "@/services/mondayService";
import { LeadCard } from "./LeadCard";
import { LeadEditModal } from "./LeadEditModal";
import { FilterBar, FilterState } from "./FilterBar";

const PIPELINE_STAGES = [
    { id: "new_lead", label: "New Lead", color: "#3B82F6", badge: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { id: "first_attempt", label: "1st Attempt", color: "#EAB308", badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    { id: "second_attempt", label: "2nd Attempt", color: "#F97316", badge: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    { id: "third_attempt", label: "3rd Attempt", color: "#EF4444", badge: "bg-red-500/10 text-red-500 border-red-500/20" },
    { id: "call_received", label: "Not Answered", color: "#F43F5E", badge: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
    { id: "interested", label: "Interested", color: "#10B981", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { id: "not_interested", label: "Not Interested", color: "#64748B", badge: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
    { id: "follow_up", label: "Follow Up", color: "#A855F7", badge: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { id: "closed", label: "Booked Meeting", color: "#14B8A6", badge: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
];

interface PipelineBoardProps {
    leads: Lead[];
    isCallActive: boolean;
    onCallLead: (lead: Lead) => void;
    onLeadsChange: () => void;
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    onSelectLead?: (lead: Lead) => void;
    activeLead?: Lead | null;
}

export const PipelineBoard = ({ leads, isCallActive, onCallLead, onLeadsChange, filters, onFiltersChange, onSelectLead, activeLead }: PipelineBoardProps) => {
    const [dragLeadId, setDragLeadId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [page, setPage] = useState(0);
    const leadsPerPage = 20;

    const validAllLeads = leads;
    const allNewLeads = validAllLeads.filter(l => !l.pipeline_stage || l.pipeline_stage === 'new_lead');
    const maxPage = Math.max(0, Math.ceil(allNewLeads.length / leadsPerPage) - 1);

    const computeLocalLeads = useCallback((allLeads: Lead[], currentPage: number) => {
        const valid = allLeads;
        const inProgress = valid.filter(l => l.pipeline_stage && l.pipeline_stage !== 'new_lead');
        const newLeads = valid.filter(l => !l.pipeline_stage || l.pipeline_stage === 'new_lead');
        const slicedNewLeads = newLeads.slice(currentPage * leadsPerPage, (currentPage + 1) * leadsPerPage);
        return [...slicedNewLeads, ...inProgress];
    }, [leadsPerPage]);

    const [localLeads, setLocalLeads] = useState<Lead[]>(() => computeLocalLeads(leads, 0));

    useEffect(() => {
        setLocalLeads(computeLocalLeads(leads, page));
    }, [leads, page, computeLocalLeads]);

    const getLeadsByStage = useCallback((stageId: string) => {
        return localLeads.filter((l) => (l.pipeline_stage || "new_lead") === stageId);
    }, [localLeads]);

    const handleDragStart = (e: React.DragEvent, lead: Lead) => {
        setDragLeadId(lead.id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverStage(stageId);
    };

    const handleDrop = async (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        if (!dragLeadId) return;

        const lead = localLeads.find(l => l.id === dragLeadId);
        if (!lead) return;

        // Manual drag and drop is unconstrained

        setLocalLeads((prev) => prev.map((l) => l.id === dragLeadId ? { ...l, pipeline_stage: stageId } : l));
        setDragLeadId(null);
        setDragOverStage(null);

        try {
            await fetch(`/api/leads/${dragLeadId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pipeline_stage: stageId }),
            });
            onLeadsChange();
        } catch (e) {
            console.error("Failed to update pipeline stage:", e);
            onLeadsChange(); // Revert visual drag failure
        }
    };

    const handleSaveLead = async (id: string, updates: Partial<Lead>) => {
        setLocalLeads((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
        await fetch(`/api/leads/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: updates.name, phone: updates.phone, email: updates.email }),
        });
        onLeadsChange();
    };

    const handleDeleteLead = async (id: string) => {
        setLocalLeads((prev) => prev.filter((l) => l.id !== id));
        await fetch(`/api/leads/${id}`, { method: "DELETE" });
        onLeadsChange();
    };

    return (
        <div className="h-full flex flex-col bg-surface-base">
            {/* Header */}
            <div className="h-20 border-b border-border-subtle flex items-center justify-between px-8 bg-surface-base/95 backdrop-blur-xl z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary tracking-tight font-outfit">Revenue Pipeline</h2>
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-60 mt-0.5">Workflow Control & Lead Velocity</p>
                    </div>
                    <div className="h-6 w-px bg-border-subtle mx-2" />
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        {localLeads.length} leads in funnel
                    </span>
                </div>
            </div>
            
            <div className="border-b border-border-subtle/50 bg-surface-base/80">
                <FilterBar leads={leads} filters={filters} onFiltersChange={onFiltersChange} />
            </div>

            {/* Kanban board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-surface-base">
                <div className="flex h-full gap-6 p-8 min-w-max">
                    {PIPELINE_STAGES.map((stage) => {
                        const stageLeads = getLeadsByStage(stage.id);
                        const isOver = dragOverStage === stage.id;

                        return (
                            <div
                                key={stage.id}
                                onDragOver={(e) => handleDragOver(e, stage.id)}
                                onDragLeave={() => setDragOverStage(null)}
                                onDrop={(e) => handleDrop(e, stage.id)}
                                className={`flex flex-col w-[300px] flex-shrink-0 bg-surface-panel rounded-2xl border transition-all duration-300 shadow-2xl h-full mb-4 ${isOver
                                    ? "border-brand-primary bg-surface-panel shadow-[0_0_40px_rgba(59,28,217,0.2)] scale-[1.02] z-10"
                                    : "border-border-subtle bg-surface-panel/60"
                                    }`}
                            >
                                {/* Column header */}
                                <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-zinc-950/20 rounded-t-2xl">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] transition-all" style={{ backgroundColor: stage.color, color: stage.color }} />
                                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider font-outfit">{stage.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border leading-none shadow-sm ${stage.badge}`}>
                                        {stage.id === "new_lead" ? allNewLeads.length : stageLeads.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[100px]">
                                    {stageLeads.length === 0 ? (
                                        <div className={`h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all duration-500 ${isOver ? "border-brand-primary text-brand-primary bg-brand-primary/5" : "border-border-subtle/20 text-text-secondary/20"}`}>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                                                {isOver ? "Release Intel" : "Signal Empty"}
                                            </p>
                                        </div>
                                    ) : (
                                        stageLeads.map((lead) => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                isActive={activeLead?.id === lead.id}
                                                onSelect={(l) => {
                                                    if (onSelectLead) onSelectLead(l);
                                                    setEditingLead(l);
                                                }}
                                                onCall={onCallLead}
                                                isCallingDisabled={isCallActive}
                                                onEdit={setEditingLead}
                                                draggable
                                                onDragStart={handleDragStart}
                                            />
                                        ))
                                    )}
                                </div>

                                {/* Pagination Dock for New Leads */}
                                {stage.id === "new_lead" && maxPage > 0 && (
                                    <div className="border-t border-border-subtle p-3 bg-surface-base/50 flex items-center justify-between gap-2 rounded-b-2xl">
                                        <button 
                                            onClick={() => setPage(p => Math.max(0, p - 1))}
                                            disabled={page === 0}
                                            className="px-3 py-1.5 text-xs font-bold bg-surface-panel hover:bg-surface-panel-hover border border-border-subtle rounded text-text-primary disabled:opacity-30 transition-all focus:outline-none"
                                        >
                                            &lt; Prev
                                        </button>
                                        <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">
                                            Pg {page + 1} / {maxPage + 1}
                                        </span>
                                        <button 
                                            onClick={() => setPage(p => Math.min(maxPage, p + 1))}
                                            disabled={page >= maxPage}
                                            className="px-3 py-1.5 text-xs font-bold bg-brand-primary hover:bg-brand-primary/80 border border-brand-primary/20 rounded text-black disabled:opacity-30 transition-all focus:outline-none shadow-sm"
                                        >
                                            Next &gt;
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {editingLead && (
                <LeadEditModal
                    lead={editingLead}
                    onClose={() => setEditingLead(null)}
                    onSave={handleSaveLead}
                    onDelete={handleDeleteLead}
                />
            )}
        </div>
    );
};
