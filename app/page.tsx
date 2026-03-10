"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { LeadList } from "@/components/LeadList";
import { DialerPanel } from "@/components/DialerPanel";
import { DirectDialer } from "@/components/DirectDialer";
import { CallStats } from "@/components/CallStats";
import { useLeads } from "@/hooks/useLeads";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { Lead } from "@/services/mondayService";

type DashboardTab = "leads" | "dialer" | "analysis";

export default function Dashboard() {
    const { leads, isLoading, error: leadsError, refreshLeads } = useLeads();
    const {
        deviceStatus,
        callStatus,
        callDuration,
        error: twilioError,
        makeCall,
        hangUp,
        toggleMute,
        isMuted,
    } = useTwilioDevice();

    const [activeTab, setActiveTab] = useState<DashboardTab>("leads");
    const [activeLead, setActiveLead] = useState<Lead | null>(null);

    const isCallActive =
        callStatus === "connecting" || callStatus === "ringing" || callStatus === "connected";

    const handleSelectLead = (lead: Lead) => {
        if (!isCallActive) {
            setActiveLead(lead);
        }
    };

    const handleCallLead = async (lead: Lead) => {
        setActiveLead(lead);
        if (!lead.phone) return;

        // Ensure dialer panel is visible when calling a lead
        if (activeTab !== "leads") {
            setActiveTab("leads");
        }

        await makeCall(lead.phone);
    };

    return (
        <div className="flex flex-col h-screen bg-surface-base text-text-primary overflow-hidden font-sans">
            <TopBar deviceStatus={deviceStatus} callStatus={callStatus} />

            {/* Main Workspace Area with Sidebar Navigation */}
            <div className="flex-1 flex overflow-hidden">
                {/* Slim Sidebar Navigation */}
                <nav className="w-20 bg-surface-panel border-r border-border-subtle flex flex-col items-center py-6 space-y-8 z-30 shadow-[5px_0_20px_rgba(0,0,0,0.3)]">
                    <button
                        onClick={() => setActiveTab("leads")}
                        className={`p-3 rounded-xl transition-all duration-300 relative group
                            ${activeTab === "leads" ? "bg-brand-accent/10 text-brand-accent shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "text-text-secondary hover:text-white hover:bg-white/5"}`}
                        title="Lost Leads"
                    >
                        {activeTab === "leads" && <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-accent rounded-r" />}
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </button>

                    <button
                        onClick={() => setActiveTab("dialer")}
                        className={`p-3 rounded-xl transition-all duration-300 relative group
                            ${activeTab === "dialer" ? "bg-brand-accent/10 text-brand-accent shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "text-text-secondary hover:text-white hover:bg-white/5"}`}
                        title="Direct Dialer"
                    >
                        {activeTab === "dialer" && <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-accent rounded-r" />}
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </button>

                    <button
                        onClick={() => setActiveTab("analysis")}
                        className={`p-3 rounded-xl transition-all duration-300 relative group
                            ${activeTab === "analysis" ? "bg-brand-accent/10 text-brand-accent shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "text-text-secondary hover:text-white hover:bg-white/5"}`}
                        title="Analytics"
                    >
                        {activeTab === "analysis" && <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-accent rounded-r" />}
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </button>
                </nav>

                {/* Main Content Area */}
                <main className="flex-1 right-content bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-panel/20 via-surface-base to-surface-base h-full relative overflow-hidden">
                    {activeTab === "leads" && (
                        <div className="flex h-full animate-in fade-in duration-300">
                            {/* Left Column: Leads List */}
                            <div className="w-[420px] flex-shrink-0 h-full">
                                <LeadList
                                    leads={leads}
                                    isLoading={isLoading}
                                    error={leadsError}
                                    activeLeadId={activeLead?.id || null}
                                    isCallActive={isCallActive}
                                    onSelectLead={handleSelectLead}
                                    onCallLead={handleCallLead}
                                    onRefresh={refreshLeads}
                                />
                            </div>

                            {/* Right Column: Original Dialer Interface for Lead */}
                            <div className="flex-1">
                                <DialerPanel
                                    activeLead={activeLead}
                                    callStatus={callStatus}
                                    callDuration={callDuration}
                                    isMuted={isMuted}
                                    onHangUp={hangUp}
                                    onMuteToggle={toggleMute}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "dialer" && (
                        <div className="flex h-full items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                            <DirectDialer
                                callStatus={callStatus}
                                callDuration={callDuration}
                                isMuted={isMuted}
                                onCall={makeCall}
                                onHangUp={hangUp}
                                onToggleMute={toggleMute}
                            />
                        </div>
                    )}

                    {activeTab === "analysis" && (
                        <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CallStats leads={leads} />
                        </div>
                    )}
                </main>
            </div>

            {/* Global Error Toasts */}
            {twilioError && (
                <div className="fixed bottom-6 right-6 glass-panel px-6 py-4 rounded-xl shadow-[0_4px_30px_rgba(239,68,68,0.3)] border border-red-500/30 z-50 animate-in slide-in-from-bottom-5">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="font-semibold text-red-50 text-sm tracking-wide">Dialer Error</p>
                            <p className="text-xs text-red-200 mt-0.5">{twilioError}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
