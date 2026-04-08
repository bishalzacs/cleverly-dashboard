"use client";

import { Lead } from "@/services/mondayService";
import { formatDistanceToNow, format } from "date-fns";

interface LeadCardProps {
    lead: Lead;
    isActive: boolean;
    onSelect: (lead: Lead) => void;
    onCall: (lead: Lead) => void;
    isCallingDisabled: boolean;
    onEdit?: (lead: Lead) => void;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent, lead: Lead) => void;
}

export const LeadCard = ({
    lead, isActive, onSelect, onCall, isCallingDisabled, onEdit, draggable, onDragStart,
}: LeadCardProps) => {
    const targetDate = lead.monday_updated_at || lead.monday_created_at || lead.createdDate;
    const formattedDate = targetDate
        ? `Updated ${formatDistanceToNow(new Date(targetDate), { addSuffix: true })}`
        : "Unknown date";

    const callDateStr = lead.sales_call_date
        ? format(new Date(lead.sales_call_date), "MMM d, yyyy")
        : null;

    return (
        <div
            onClick={() => onSelect(lead)}
            draggable={draggable}
            onDragStart={onDragStart ? (e) => onDragStart(e, lead) : undefined}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden
                ${draggable ? "cursor-grab active:cursor-grabbing" : ""}
                ${isActive
                    ? "bg-surface-panel border-brand-primary shadow-[0_12px_40px_rgba(59,28,217,0.2)] z-10"
                    : "bg-surface-panel/60 border-border-subtle hover:border-text-primary/10 hover:bg-surface-panel hover:shadow-xl hover:shadow-black/40"
                }`}
        >
            {isActive && <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary shadow-[0_0_20px_rgba(59,28,217,0.8)] z-10" />}

            {/* Header row */}
            <div className="flex justify-between items-start mb-4">
                <div className="pr-2 flex-1 min-w-0">
                    <h3 className={`font-bold text-sm leading-tight tracking-tight mb-1 truncate font-outfit ${isActive ? "text-text-primary" : "text-text-primary/90"}`}>
                        {lead.name || "Unknown Lead"}
                    </h3>
                    {lead.company && (
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest truncate opacity-60 leading-none">{lead.company}</p>
                    )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
                            className="p-2 rounded-lg bg-surface-base/50 border border-border-subtle hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/20 transition-all opacity-0 group-hover:opacity-100"
                            title="Edit / Delete"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Status Badges Row */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {lead.status && (
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${isActive ? "bg-brand-primary/20 text-brand-primary border-brand-primary/30" : "bg-zinc-950/20 text-text-secondary border-border-subtle"}`}>
                        {lead.status}
                    </span>
                )}
                {lead.is_connected ? (
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Connected
                    </span>
                ) : (
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                        (lead.call_attempts || 0) >= 3 
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                        {Math.max(0, 3 - (lead.call_attempts || 0))} Attempts Left
                    </span>
                )}
            </div>

            {/* Meta row */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md bg-zinc-950/30 flex items-center justify-center border border-border-subtle/50">
                        <svg className="w-2.5 h-2.5 text-text-secondary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <span className="text-[11px] font-bold text-text-primary opacity-80 font-mono tracking-tight">{lead.phone || "No phone"}</span>
                </div>
                
                <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md bg-zinc-950/30 flex items-center justify-center border border-border-subtle/50">
                        <svg className="w-2.5 h-2.5 text-text-secondary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{formattedDate}</span>
                </div>

                {callDateStr && (
                    <div className="flex items-center gap-2.5 bg-brand-primary/5 py-1.5 px-2 rounded-lg border border-brand-primary/10">
                        <svg className="w-3 h-3 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Reserved: {callDateStr}</span>
                    </div>
                )}
            </div>

            {/* Notes snippet */}
            {lead.notes && (
                <div className="bg-zinc-950/20 rounded-xl px-3 py-2.5 mb-4 border border-border-subtle/30 group-hover:border-border-subtle/50 transition-colors">
                    <p className="text-[10px] text-text-secondary italic leading-relaxed line-clamp-2">
                        "{lead.notes}"
                    </p>
                </div>
            )}

            {/* Call button */}
            <button
                onClick={(e) => { e.stopPropagation(); onCall(lead); }}
                disabled={isCallingDisabled || !lead.phone}
                className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center space-x-2 border shadow-sm
                    ${isCallingDisabled || !lead.phone
                        ? "bg-zinc-900/50 text-text-secondary/20 border-border-subtle/30 cursor-not-allowed"
                        : "bg-surface-base border-border-subtle text-text-primary hover:border-text-primary/20 hover:bg-text-primary hover:text-surface-base active:scale-95"
                    }`}
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                </svg>
                <span>Initiate Intelligence</span>
            </button>
        </div>
    );
};
