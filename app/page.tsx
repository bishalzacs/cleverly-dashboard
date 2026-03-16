"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { LeadList } from "@/components/LeadList";
import { DialerPanel } from "@/components/DialerPanel";
import { DirectDialer } from "@/components/DirectDialer";
import { CallStats } from "@/components/CallStats";
import { PipelineBoard } from "@/components/PipelineBoard";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { useLeads } from "@/hooks/useLeads";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { Lead } from "@/services/mondayService";

type DashboardTab = "leads" | "pipeline" | "dialer" | "analysis";

export default function Dashboard() {
    const [filters, setFilters] = useState<FilterState>({ owner: "", from: "", to: "" });
    const { leads, isLoading, error: leadsError, refreshLeads } = useLeads(filters);
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

    const switchTab = (tab: DashboardTab) => { setActiveTab(tab); setShowDialerPanel(false); };

    const navItems = [
        {
            id: "leads" as DashboardTab, label: "Leads",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        },
        {
            id: "pipeline" as DashboardTab, label: "Pipeline",
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
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

    return (
        <div className="flex flex-col h-[100dvh] bg-surface-base text-text-primary overflow-hidden font-sans">
            <TopBar deviceStatus={deviceStatus} callStatus={callStatus} />

            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Sidebar */}
                <nav className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-6 space-y-6 z-30 shadow-[5px_0_20px_rgba(0,0,0,0.02)] flex-shrink-0">
                    {navItems.map((item) => (
                        <button key={item.id} onClick={() => switchTab(item.id)}
                            className={`p-3 rounded-xl transition-all duration-300 relative ${activeTab === item.id ? "bg-brand-primary/10 text-brand-primary shadow-[0_4px_12px_rgba(59,28,217,0.1)]" : "text-slate-400 hover:text-brand-primary hover:bg-slate-50"}`}
                            title={item.label}>
                            {activeTab === item.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-primary rounded-r" />}
                            {item.icon}
                        </button>
                    ))}
                </nav>

                {/* Main Content */}
                <main className="flex-1 bg-[#F8FAFC] h-full relative overflow-hidden">

                    {/* ── LEADS TAB ── */}
                    {activeTab === "leads" && (
                        <div className="flex flex-col h-full animate-in fade-in duration-300">
                            {/* Filter bar shared across leads + dialer panel */}
                            <FilterBar leads={leads} filters={filters} onFiltersChange={setFilters} />

                            <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
                                {/* Lead List */}
                                <div className={`flex flex-col flex-1 h-full min-w-0 overflow-hidden`}>
                                    <LeadList leads={leads} isLoading={isLoading} error={leadsError}
                                        activeLeadId={activeLead?.id || null} isCallActive={isCallActive}
                                        onSelectLead={handleSelectLead} onCallLead={handleCallLead} onRefresh={refreshLeads} />
                                </div>
                                {/* Dialer Panel */}
                                <div className={`${showDialerPanel ? "flex" : "hidden"} flex-col w-full md:w-[400px] lg:w-[460px] flex-shrink-0 h-full border-l border-slate-200 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-20 animate-in slide-in-from-right-4 duration-300`}>
                                    <div className="flex items-center px-4 pt-4 pb-2 border-b border-slate-100">
                                        <button onClick={() => setShowDialerPanel(false)} className="flex items-center gap-2 text-slate-500 hover:text-brand-primary text-sm transition-colors font-medium">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            Close Dialer
                                        </button>
                                    </div>
                                    <DialerPanel activeLead={activeLead} callStatus={callStatus} callDuration={callDuration}
                                        isMuted={isMuted} onHangUp={hangUp} onMuteToggle={toggleMute} onCall={handleCallLead} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PIPELINE TAB ── */}
                    {activeTab === "pipeline" && (
                        <div className="h-full animate-in fade-in duration-300">
                            <PipelineBoard leads={leads} isCallActive={isCallActive}
                                onCallLead={handleCallLead} onLeadsChange={refreshLeads}
                                filters={filters} onFiltersChange={setFilters} />
                        </div>
                    )}

                    {/* ── DIALER TAB ── */}
                    {activeTab === "dialer" && (
                        <div className="flex h-full items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
                            <DirectDialer callStatus={callStatus} callDuration={callDuration} isMuted={isMuted}
                                onCall={makeCall} onHangUp={hangUp} onToggleMute={toggleMute} />
                        </div>
                    )}

                    {/* ── ANALYTICS TAB ── */}
                    {activeTab === "analysis" && (
                        <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CallStats />
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden flex items-center border-t border-slate-200 bg-white z-50">
                {navItems.map((item) => (
                    <button key={item.id} onClick={() => switchTab(item.id)}
                        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 relative ${activeTab === item.id ? "text-brand-primary" : "text-slate-400"}`}>
                        {item.icon}
                        <span className="text-[10px] font-semibold tracking-wider uppercase">{item.label}</span>
                        {activeTab === item.id && <div className="absolute bottom-0 w-8 h-0.5 bg-brand-primary rounded-t" />}
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
