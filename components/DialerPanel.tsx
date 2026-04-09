"use client";
import { useState } from "react";
import { Lead } from "@/services/mondayService";
import { CallControls } from "./CallControls";
import { CallStatus } from "@/hooks/useTwilioDevice";
import { format } from "date-fns";

interface DialerPanelProps {
    activeLead: Lead | null;
    callStatus: CallStatus;
    callDuration: number;
    isMuted: boolean;
    onHangUp: () => void;
    onMuteToggle: () => void;
    onCall?: (lead: Lead) => void;
    onClose?: () => void;
    lastCallMeta?: { phone: string; duration: number; leadId?: string; leadName?: string } | null;
    onLogOutcome?: (outcome: string) => void;
    error?: string | null;
}

const OUTCOMES = [
    { id: "Connected", label: "Connected", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white" },
    { id: "No Answer", label: "No Answer", color: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white" },
    { id: "Busy", label: "Busy", color: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white" },
    { id: "Voicemail", label: "Voicemail", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500 hover:text-white" },
    { id: "Wrong Number", label: "Wrong Number", color: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white" },
];

const InfoRow = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value?: string | number | null; accent?: boolean }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-3 group">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 transition-colors ${accent ? "bg-brand-primary/10 text-brand-primary" : "bg-surface-panel text-text-secondary group-hover:bg-surface-panel-hover group-hover:text-text-primary"}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-0.5 opacity-70">{label}</p>
                <p className={`text-sm font-black break-words ${accent ? "text-brand-primary underline decoration-brand-primary/30 underline-offset-4" : "text-text-primary"}`}>{value}</p>
            </div>
        </div>
    );
};

export const DialerPanel = ({ activeLead, callStatus, callDuration, isMuted, onHangUp, onMuteToggle, onCall, lastCallMeta, onLogOutcome, onClose, error }: DialerPanelProps) => {
    const [isLogging, setIsLogging] = useState(false);
    const isCallActive = callStatus !== "idle" && callStatus !== "ended";
    const showOutcomeSelection = callStatus === "ended" && lastCallMeta && onLogOutcome;

    if (!activeLead) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-surface-base animate-fade-in">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-dashed border-border-subtle flex items-center justify-center bg-surface-panel/50">
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-text-secondary opacity-30">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-text-secondary opacity-40 mb-2 font-outfit uppercase tracking-tighter">Select a Lead</h2>
                    <p className="text-text-secondary opacity-30 text-sm max-w-xs mx-auto font-medium">Click any lead card to view full details and make a call.</p>
                </div>
            </div>
        );
    }

    const initials = activeLead.name
        ? activeLead.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    const callDateStr = activeLead.sales_call_date
        ? format(new Date(activeLead.sales_call_date), "MMMM d, yyyy")
        : null;

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-base animate-fade-in">

            {/* Error Alert */}
            {error && (
                <div className="mx-6 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Dialer Error</h4>
                        <p className="text-sm text-red-200/80 font-medium leading-tight">{error}</p>
                    </div>
                </div>
            )}

            {/* Active call banner */}
            {isCallActive && (
                <div className="flex-shrink-0 border-b border-border-subtle bg-surface-panel/50 px-6 py-4">
                    <CallControls
                        callStatus={callStatus}
                        callDuration={callDuration}
                        isMuted={isMuted}
                        onHangUp={onHangUp}
                        onMuteToggle={onMuteToggle}
                    />
                </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* Hero section */}
                <div className="relative overflow-hidden px-8 py-12 border-b border-border-subtle">
                    {/* Background gradient orb */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-brand-primary/5 blur-2xl pointer-events-none" />

                    <div className="relative flex items-center gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative animate-scale-in">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-primary/30 to-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-4xl font-black text-brand-primary shadow-[0_12px_40px_rgba(59,28,217,0.25)]">
                                {initials}
                            </div>
                            {isCallActive && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-surface-base animate-pulse" />
                            )}
                        </div>

                        {onClose && (
                            <button 
                                onClick={onClose}
                                className="absolute top-8 right-8 p-3 rounded-xl bg-surface-panel/50 border border-border-subtle text-text-secondary hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 shadow-sm group"
                                title="Close Panel"
                            >
                                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        {/* Name & status */}
                        <div className="flex-1 min-w-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <h2 className="text-3xl font-black text-text-primary tracking-tight truncate font-outfit uppercase">{activeLead.name || "Unknown Lead"}</h2>
                            {activeLead.company && (
                                <p className="text-text-secondary font-black text-xs uppercase tracking-widest mt-1.5 truncate opacity-70">{activeLead.company}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {activeLead.status && (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 uppercase tracking-wider">
                                        {activeLead.status}
                                    </span>
                                )}
                                {activeLead.plan_type && (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                                        {activeLead.plan_type}
                                    </span>
                                )}
                                {activeLead.deal_value && (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        ${Number(activeLead.deal_value).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info grid */}
                <div className="p-6 space-y-4">

                    {/* Contact section */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-4 flex items-center gap-4 opacity-50">
                            <div className="h-px flex-1 bg-border-subtle" />
                            Contact Details
                            <div className="h-px flex-1 bg-border-subtle" />
                        </h3>
                        <div className="space-y-3">
                            <InfoRow
                                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                                label="Phone" value={activeLead.phone} accent
                            />
                            <InfoRow
                                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                label="Email" value={activeLead.email}
                            />
                            {activeLead.owner && (
                                <InfoRow
                                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                    label="Owner / Sales Rep" value={activeLead.owner}
                                />
                            )}
                        </div>
                    </div>

                    {/* Sales section */}
                    {(activeLead.interested_in || callDateStr || activeLead.deal_value) && (
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-4 flex items-center gap-4 opacity-50">
                                <div className="h-px flex-1 bg-border-subtle" />
                                Sales Data
                                <div className="h-px flex-1 bg-border-subtle" />
                            </h3>
                            <div className="space-y-3">
                                {activeLead.interested_in && (
                                    <InfoRow
                                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                                        label="Interested In" value={activeLead.interested_in}
                                    />
                                )}
                                {callDateStr && (
                                    <InfoRow
                                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                        label="Sales Call Date" value={callDateStr}
                                    />
                                )}
                                {activeLead.deal_value && (
                                    <InfoRow
                                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                        label="Deal Value" value={`$${Number(activeLead.deal_value).toLocaleString()}`}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes section */}
                    {activeLead.notes && (
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-4 flex items-center gap-4 opacity-50">
                                <div className="h-px flex-1 bg-border-subtle" />
                                Custom Notes
                                <div className="h-px flex-1 bg-border-subtle" />
                            </h3>
                            <div className="bg-surface-panel/40 border border-border-subtle rounded-2xl p-6 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap italic font-medium shadow-inner">
                                {activeLead.notes}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Outcome Selection Overlay */}
            {showOutcomeSelection && (
                <div className="flex-shrink-0 p-8 border-t border-border-subtle bg-surface-panel/90 backdrop-blur-xl animate-in slide-in-from-bottom-5">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-6 text-center">Select Call Outcome</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {OUTCOMES.map((outcome) => (
                                <button
                                    key={outcome.id}
                                    disabled={isLogging}
                                    onClick={async () => {
                                        if (onLogOutcome) {
                                            setIsLogging(true);
                                            await onLogOutcome(outcome.id);
                                            setIsLogging(false);
                                        }
                                    }}
                                    className={`p-4 rounded-2xl border transition-all duration-300 font-black uppercase tracking-widest text-[10px] shadow-sm hover:shadow-xl ${isLogging ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95"} ${outcome.color}`}
                                >
                                    {isLogging ? "Logging..." : outcome.label}
                                </button>
                            ))}
                        </div>
                </div>
            )}

            {/* Call button (when not active) */}
            {!isCallActive && !showOutcomeSelection && onCall && activeLead.phone && (
                <div className="flex-shrink-0 p-8 border-t border-border-subtle bg-surface-base">
                    {activeLead.is_connected ? (
                        <div className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.1em] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center gap-4 opacity-80 cursor-default shadow-inner">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            Lead Connected
                        </div>
                    ) : (
                        <button
                            onClick={() => onCall(activeLead)}
                            className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.1em] bg-brand-primary text-white hover:bg-brand-primary/90 hover:shadow-[0_20px_40px_rgba(59,28,217,0.4)] hover:-translate-y-1 transition-all duration-500 flex items-center justify-center gap-4 group active:scale-[0.96] shadow-xl"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:rotate-12 transition-transform duration-500">
                                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                            </svg>
                            Call {activeLead.name?.split(" ")[0] || "Now"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
