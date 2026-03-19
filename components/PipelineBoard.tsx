"use client";

import { useState, useCallback } from "react";
import { Lead } from "@/services/mondayService";
import { LeadCard } from "./LeadCard";
import { LeadEditModal } from "./LeadEditModal";
import { FilterBar, FilterState } from "./FilterBar";

const PIPELINE_STAGES = [
    { id: "new_lead", label: "New Lead", color: "border-blue-500/40", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    { id: "first_attempt", label: "1st Attempt", color: "border-yellow-500/40", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", dot: "bg-yellow-400" },
    { id: "second_attempt", label: "2nd Attempt", color: "border-orange-500/40", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", dot: "bg-orange-400" },
    { id: "third_attempt", label: "3rd Attempt", color: "border-red-500/40", badge: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
    { id: "call_received", label: "Not Answered", color: "border-rose-500/40", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20", dot: "bg-rose-400" },
    { id: "interested", label: "Interested", color: "border-emerald-500/40", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    { id: "not_interested", label: "Not Interested", color: "border-slate-500/40", badge: "bg-slate-500/10 text-slate-400 border-slate-500/20", dot: "bg-slate-400" },
    { id: "follow_up", label: "Follow Up", color: "border-purple-500/40", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", dot: "bg-purple-400" },
    { id: "closed", label: "Booked Meeting", color: "border-teal-500/40", badge: "bg-teal-500/10 text-teal-400 border-teal-500/20", dot: "bg-teal-400" },
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
    const [localLeads, setLocalLeads] = useState<Lead[]>(leads);

    // Sync when parent leads change (e.g. after refresh)
    if (leads !== localLeads && leads.length !== localLeads.length) {
        setLocalLeads(leads);
    }

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

        // Enforce progression rules
        const attemptStages = ["first_attempt", "second_attempt", "third_attempt"];
        const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === (lead.pipeline_stage || "new_lead"));
        const targetIndex = PIPELINE_STAGES.findIndex(s => s.id === stageId);

        // Rule: Only allow moving to next attempt stages if 3 attempts completed or connected
        if (attemptStages.includes(stageId) && !lead.is_connected && (lead.call_attempts || 0) < 3) {
            // Check if they are trying to move FORWARD into or between attempt stages
            if (targetIndex > currentIndex) {
                alert(`Cannot move to next stage. Lead requires 3 call attempts (Currently: ${lead.call_attempts || 0})`);
                setDragLeadId(null);
                setDragOverStage(null);
                return;
            }
        }

        // Optimistic update
        setLocalLeads((prev) => prev.map((l) => l.id === dragLeadId ? { ...l, pipeline_stage: stageId } : l));
        setDragLeadId(null);
        setDragOverStage(null);

        // Persist to Supabase
        try {
            await fetch(`/api/leads/${dragLeadId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pipeline_stage: stageId }),
            });
        } catch (e) {
            console.error("Failed to update pipeline stage:", e);
        }
    };

    const handleSaveLead = async (id: string, updates: Partial<Lead>) => {
        setLocalLeads((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
        await fetch(`/api/leads/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: updates.name,
                phone: updates.phone,
                email: updates.email,
            }),
        });
        onLeadsChange();
    };

    const handleDeleteLead = async (id: string) => {
        setLocalLeads((prev) => prev.filter((l) => l.id !== id));
        await fetch(`/api/leads/${id}`, { method: "DELETE" });
        onLeadsChange();
    };

    return (
        <div className="h-full flex flex-col bg-surface-base animate-fade-in">
            {/* Header */}
            <div className="border-b border-border-subtle sticky top-0 bg-surface-base/80 backdrop-blur-md z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-text-primary font-outfit uppercase tracking-tight">Pipeline Control</h2>
                        <p className="text-[9px] text-text-secondary mt-1 font-bold uppercase tracking-widest opacity-60">Workflow Management & Lead Velocity</p>
                    </div>
                    <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                        {localLeads.length} leads in funnel
                    </span>
                </div>
                <FilterBar leads={leads} filters={filters} onFiltersChange={onFiltersChange} />
            </div>

            {/* Kanban board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-surface-base">
                <div className="flex h-full gap-4 p-6 min-w-max">
                    {PIPELINE_STAGES.map((stage) => {
                        const stageLeads = getLeadsByStage(stage.id);
                        const isOver = dragOverStage === stage.id;

                        return (
                            <div
                                key={stage.id}
                                onDragOver={(e) => handleDragOver(e, stage.id)}
                                onDragLeave={() => setDragOverStage(null)}
                                onDrop={(e) => handleDrop(e, stage.id)}
                                className={`flex flex-col w-[280px] flex-shrink-0 rounded-xl border transition-all duration-300 animate-scale-in ${isOver
                                    ? `${stage.color} bg-surface-panel shadow-2xl scale-[1.01] border-opacity-100`
                                    : "border-border-subtle bg-surface-panel/40 shadow-sm"
                                    }`}
                            >
                                {/* Column header */}
                                <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-panel sticky top-0 z-10 rounded-t-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${stage.dot}`} />
                                        <span className="text-xs font-black text-text-primary uppercase tracking-widest">{stage.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${stage.badge} shadow-sm`}>
                                        {stageLeads.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[100px]">
                                    {stageLeads.length === 0 ? (
                                        <div className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-[10px] uppercase tracking-widest font-black transition-all duration-500 ${isOver ? "border-brand-primary text-brand-primary bg-brand-primary/10 shadow-2xl" : "border-border-subtle text-text-secondary opacity-20"}`}>
                                            {isOver ? "Release to Drop" : "No Leads"}
                                        </div>
                                    ) : (
                                        stageLeads.map((lead) => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                isActive={activeLead?.id === lead.id}
                                                onSelect={onSelectLead || (() => { })}
                                                onCall={onCallLead}
                                                isCallingDisabled={isCallActive}
                                                onEdit={setEditingLead}
                                                draggable
                                                onDragStart={handleDragStart}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edit Modal */}
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
