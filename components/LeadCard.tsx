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
    const formattedDate = lead.createdDate
        ? formatDistanceToNow(new Date(lead.createdDate), { addSuffix: true })
        : "Unknown date";

    const callDateStr = lead.sales_call_date
        ? format(new Date(lead.sales_call_date), "MMM d, yyyy")
        : null;

    return (
        <div
            onClick={() => onSelect(lead)}
            draggable={draggable}
            onDragStart={onDragStart ? (e) => onDragStart(e, lead) : undefined}
            className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden hover-float
                ${draggable ? "cursor-grab active:cursor-grabbing" : ""}
                ${isActive
                    ? "bg-brand-primary/10 border-brand-primary/50 shadow-[0_6px_24px_rgba(59,28,217,0.15)]"
                    : "bg-surface-base border-border-subtle hover:border-brand-primary/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                }`}
        >
            {isActive && <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary shadow-[0_0_20px_rgba(59,28,217,0.8)] z-10" />}

            {/* Header row */}
            <div className="flex justify-between items-start mb-2">
                <div className="pr-2 flex-1 min-w-0">
                    <h3 className={`font-black text-xs leading-tight tracking-tight mb-0.5 truncate ${isActive ? "text-brand-primary" : "text-text-primary"}`}>
                        {lead.name || "Unknown Lead"}
                    </h3>
                    {lead.company && (
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider truncate opacity-80">{lead.company}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                    {lead.status && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${isActive ? "bg-brand-primary/20 text-brand-primary border-brand-primary/30" : "bg-surface-panel text-text-secondary border-border-subtle"}`}>
                            {lead.status}
                        </span>
                    )}
                    {/* Call Attempts Badge */}
                    {lead.is_connected ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                            Connected
                        </span>
                    ) : (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${
                            (lead.call_attempts || 0) >= 3 
                                ? "bg-red-500/10 text-red-500 border-red-500/20" 
                                : "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                        }`}>
                            {Math.max(0, 3 - (lead.call_attempts || 0))} Left
                        </span>
                    )}
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
                            className="p-1.5 rounded-lg hover:bg-brand-primary/10 text-text-secondary hover:text-brand-primary transition-all opacity-0 group-hover:opacity-100"
                            title="Edit / Delete"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Meta row */}
            <div className="space-y-1.5 mb-3 text-[11px] text-text-secondary font-bold">
                <div className="flex items-center gap-1.5 truncate">
                    <svg className="w-3 h-3 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span className="font-mono tracking-wider">{lead.phone || "No phone"}</span>
                </div>
                {lead.owner && (
                    <div className="flex items-center gap-1.5 truncate">
                        <svg className="w-3 h-3 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="text-brand-primary font-black opacity-80">{lead.owner}</span>
                    </div>
                )}
                {lead.interested_in && (
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        <span className="truncate italic text-text-secondary opacity-70">{lead.interested_in}</span>
                    </div>
                )}
                {callDateStr && (
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-brand-accent font-black tracking-widest uppercase text-[9px] opacity-90">Reserved: {callDateStr}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{formattedDate}</span>
                </div>
            </div>

            {/* Notes snippet */}
            {lead.notes && (
                <p className="text-[10px] text-text-secondary italic bg-surface-base/50 rounded-xl px-2.5 py-2 mb-3 line-clamp-2 border border-border-subtle/50">
                    {lead.notes}
                </p>
            )}

            {/* Call button */}
            <button
                onClick={(e) => { e.stopPropagation(); onCall(lead); }}
                disabled={isCallingDisabled || !lead.phone}
                className={`w-full py-2 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center space-x-2 border
                    ${isCallingDisabled || !lead.phone
                        ? "bg-surface-panel/50 text-text-secondary/20 border-border-subtle/30 cursor-not-allowed"
                        : "bg-surface-base border-border-subtle text-text-primary hover:border-brand-primary/60 hover:text-brand-primary hover:bg-brand-primary/10 hover:shadow-xl shadow-sm group-hover:border-brand-primary/30 active:scale-95"
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                </svg>
                <span>Connect Lead</span>
            </button>
        </div>
    );
};
