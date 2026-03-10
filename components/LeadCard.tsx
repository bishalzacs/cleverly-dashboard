"use client";

import { Lead } from "@/services/mondayService";
import { formatDistanceToNow } from "date-fns";

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

    return (
        <div
            onClick={() => onSelect(lead)}
            draggable={draggable}
            onDragStart={onDragStart ? (e) => onDragStart(e, lead) : undefined}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden
                ${draggable ? "cursor-grab active:cursor-grabbing" : ""}
                ${isActive
                    ? "bg-surface-panel-hover border-brand-accent/40 shadow-[0_0_30px_rgba(0,240,255,0.05)]"
                    : "bg-surface-panel border-border-subtle hover:border-white/20 hover:bg-surface-panel-hover hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
                }`}
        >
            {isActive && <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent shadow-[0_0_20px_rgba(0,240,255,0.8)] z-10" />}

            <div className="flex justify-between items-start mb-3">
                <div className="pr-3 flex-1 min-w-0">
                    <h3 className={`font-semibold text-base leading-tight tracking-tight mb-1 transition-colors truncate ${isActive ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                        {lead.name || "Unknown Lead"}
                    </h3>
                    <p className="text-text-secondary font-mono text-xs tracking-wider flex items-center gap-1.5">
                        <svg className="w-3 h-3 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {lead.phone || "No phone"}
                    </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-md border ${isActive ? "bg-brand-accent/10 text-brand-accent border-brand-accent/20" : "bg-white/5 text-text-secondary border-white/5"}`}>
                        {lead.status || "New"}
                    </span>
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
                            className="p-1 rounded-md hover:bg-white/10 text-text-secondary hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit / Delete"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col space-y-1 mb-4 text-[11px] text-text-secondary font-medium">
                <span className="truncate flex items-center gap-1.5">
                    <svg className="w-3 h-3 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {lead.email || "No email"}
                </span>
                <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {formattedDate}
                </span>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onCall(lead); }}
                disabled={isCallingDisabled || !lead.phone}
                className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 border
                    ${isCallingDisabled || !lead.phone
                        ? "bg-white/5 text-text-secondary border-transparent cursor-not-allowed"
                        : "bg-surface-panel border-border-subtle text-white hover:border-brand-accent/50 hover:text-brand-accent hover:bg-brand-accent/5 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] focus:ring-2 focus:ring-brand-accent/50 focus:outline-none"
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                </svg>
                <span>Call Now</span>
            </button>
        </div>
    );
};
