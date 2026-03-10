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
    onFiltersChange: (f: FilterState) => void;
}

export const PipelineBoard = ({ leads, isCallActive, onCallLead, onLeadsChange, filters, onFiltersChange }: PipelineBoardProps) => {
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
        <div className="h-full flex flex-col bg-surface-base">
            {/* Header */}
            <div className="border-b border-border-subtle sticky top-0 glass z-10">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Pipeline</h2>
                        <p className="text-xs text-text-secondary mt-0.5">Drag leads between stages to track progress</p>
                    </div>
                    <span className="text-xs text-text-secondary bg-surface-panel border border-border-subtle px-3 py-1 rounded-full">
                        {localLeads.length} leads
                    </span>
                </div>
                <FilterBar leads={leads} filters={filters} onFiltersChange={onFiltersChange} />
            </div>

            {/* Kanban board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
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
                                className={`flex flex-col w-64 flex-shrink-0 rounded-2xl border transition-all duration-200 ${isOver
                                    ? `${stage.color} bg-white/5 shadow-lg scale-[1.01]`
                                    : "border-border-subtle bg-surface-panel/40"
                                    }`}
                            >
                                {/* Column header */}
                                <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                                        <span className="text-sm font-semibold text-white">{stage.label}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${stage.badge}`}>
                                        {stageLeads.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[100px]">
                                    {stageLeads.length === 0 ? (
                                        <div className={`h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-xs text-text-secondary transition-colors ${isOver ? "border-brand-accent/40 text-brand-accent" : "border-border-subtle"}`}>
                                            {isOver ? "Drop here" : "Empty"}
                                        </div>
                                    ) : (
                                        stageLeads.map((lead) => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                isActive={false}
                                                onSelect={() => { }}
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
