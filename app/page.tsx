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
    const { deviceStatus, callStatus, callDuration, error: twilioError, makeCall, hangUp, toggleMute, isMuted } = useTwilioDevice();

    const [activeTab, setActiveTab] = useState<DashboardTab>("leads");
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [showDialerPanel, setShowDialerPanel] = useState(false);

    const isCallActive = callStatus === "connecting" || callStatus === "ringing" || callStatus === "connected";

    const handleSelectLead = (lead: Lead) => {
        if (!isCallActive) { setActiveLead(lead); setShowDialerPanel(true); }
    };

    const handleCallLead = async (lead: Lead) => {
        setActiveLead(lead);
        setShowDialerPanel(true);
        if (!lead.phone) return;
        await makeCall(lead.phone, lead.id, lead.name);
    };

    const navItems = [
        {
            id: "leads" as DashboardTab, label: "Leads",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        },
        {
            id: "dialer" as DashboardTab, label: "Dialer",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
        },
        {
            id: "analysis" as DashboardTab, label: "Analytics",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        },
    ];

    const switchTab = (tab: DashboardTab) => { setActiveTab(tab); setShowDialerPanel(false); };

    return (
        <div className="flex flex-col h-[100dvh] bg-surface-base text-text-primary overflow-hidden font-sans">
            <TopBar deviceStatus={deviceStatus} callStatus={callStatus} />

            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Sidebar */}
                <nav className="hidden md:flex w-20 bg-surface-panel border-r border-border-subtle flex-col items-center py-6 space-y-8 z-30 shadow-[5px_0_20px_rgba(0,0,0,0.3)]">
                    {navItems.map((item) => (
                        <button key={item.id} onClick={() => switchTab(item.id)}
                            className={`p-3 rounded-xl transition-all duration-300 relative ${activeTab === item.id ? "bg-brand-accent/10 text-brand-accent shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "text-text-secondary hover:text-white hover:bg-white/5"}`}
                            title={item.label}>
                            {activeTab === item.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-accent rounded-r" />}
                            {item.icon}
                        </button>
                    ))}
                </nav>

                {/* Main Content */}
                <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-panel/20 via-surface-base to-surface-base h-full relative overflow-hidden">

                    {activeTab === "leads" && (
                        <div className="flex flex-col md:flex-row h-full animate-in fade-in duration-300">
                            {/* Lead List */}
                            <div className={`${showDialerPanel ? "hidden md:flex" : "flex"} flex-col w-full md:w-[380px] lg:w-[420px] flex-shrink-0 h-full`}>
                                <LeadList leads={leads} isLoading={isLoading} error={leadsError}
                                    activeLeadId={activeLead?.id || null} isCallActive={isCallActive}
                                    onSelectLead={handleSelectLead} onCallLead={handleCallLead} onRefresh={refreshLeads} />
                            </div>

                            {/* Dialer Panel */}
                            <div className={`${showDialerPanel ? "flex" : "hidden md:flex"} flex-col flex-1 h-full`}>
                                <div className="md:hidden flex items-center px-4 pt-4">
                                    <button onClick={() => setShowDialerPanel(false)}
                                        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        Back to Leads
                                    </button>
                                </div>
                                <DialerPanel activeLead={activeLead} callStatus={callStatus} callDuration={callDuration}
                                    isMuted={isMuted} onHangUp={hangUp} onMuteToggle={toggleMute} />
                            </div>
                        </div>
                    )}

                    {activeTab === "dialer" && (
                        <div className="flex h-full items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
                            <DirectDialer callStatus={callStatus} callDuration={callDuration} isMuted={isMuted}
                                onCall={makeCall} onHangUp={hangUp} onToggleMute={toggleMute} />
                        </div>
                    )}

                    {activeTab === "analysis" && (
                        <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CallStats />
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden flex items-center border-t border-border-subtle bg-surface-panel z-50">
                {navItems.map((item) => (
                    <button key={item.id} onClick={() => switchTab(item.id)}
                        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 relative ${activeTab === item.id ? "text-brand-accent" : "text-text-secondary"}`}>
                        {item.icon}
                        <span className="text-[10px] font-semibold tracking-wider uppercase">{item.label}</span>
                        {activeTab === item.id && <div className="absolute bottom-0 w-8 h-0.5 bg-brand-accent rounded-t" />}
                    </button>
                ))}
            </nav>

            {/* Error Toast */}
            {twilioError && (
                <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 glass-panel px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-[0_4px_30px_rgba(239,68,68,0.3)] border border-red-500/30 z-50 animate-in slide-in-from-bottom-5 max-w-xs">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="font-semibold text-red-50 text-sm">Dialer Error</p>
                            <p className="text-xs text-red-200 mt-0.5">{twilioError}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
