"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PremiumDashboardView } from "@/components/dashboard/PremiumDashboardView";
import { LeadList } from "@/components/LeadList";
import { DialerPanel } from "@/components/DialerPanel";
import { DirectDialer } from "@/components/DirectDialer";
import { CallStats } from "@/components/CallStats";
import { PipelineBoard } from "@/components/PipelineBoard";
import { FilterBar, FilterState } from "@/components/FilterBar";
import { useLeads } from "@/hooks/useLeads";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { DialerRecentCallsList } from "@/components/DialerRecentCallsList";
import { Lead } from "@/services/mondayService";
import { createClient } from "@/utils/supabase/client";

type DashboardTab = "dashboard" | "leads" | "pipeline" | "dialer" | "analysis";

export default function Dashboard() {
    const [filters, setFilters] = useState<FilterState>({ owner: "", from: "", to: "" });
    const { leads, isLoading, error: leadsError, refreshLeads } = useLeads(filters);
    const { deviceStatus, callStatus, callDuration, error: twilioError, makeCall, hangUp, toggleMute, isMuted, lastCallMeta, logCallWithOutcome } = useTwilioDevice();

    const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [showDialerPanel, setShowDialerPanel] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // If you use profiles for real names, you can fetch here. For now, fallback to email prefix.
                const name = user.email?.split('@')[0] || "User";
                setUserName(name.charAt(0).toUpperCase() + name.slice(1));
            }
        };
        fetchUser();
    }, []);

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

    return (
        <div className="flex h-[100dvh] bg-[#030308] text-white overflow-hidden font-sans">
            {/* Left Sidebar */}
            <div className="hidden md:block h-full">
                <DashboardSidebar activeTab={activeTab} onTabChange={switchTab} userName={userName} />
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <DashboardHeader deviceStatus={deviceStatus} callStatus={callStatus} />

                {/* Main Content Pane */}
                <main className="flex-1 overflow-hidden relative">

                    {/* ── NEW PREMIUM DASHBOARD ── */}
                    {activeTab === "dashboard" && (
                        <PremiumDashboardView />
                    )}

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
                                {/* Dialer Panel Container */}
                                <div className={`${showDialerPanel ? "flex" : "hidden"} flex-col w-full md:w-[450px] lg:w-[500px] flex-shrink-0 h-full border-l border-border-subtle bg-surface-panel shadow-[-20px_0_60px_rgba(0,0,0,0.6)] z-20 animate-in slide-in-from-right-8 duration-500`}>
                                    <div className="flex items-center px-6 pt-6 pb-4 border-b border-border-subtle bg-surface-base/50">
                                        <button onClick={() => setShowDialerPanel(false)} className="flex items-center gap-3 text-text-secondary hover:text-brand-primary text-[10px] font-black uppercase tracking-widest transition-all group">
                                            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                            Collapse Intel
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        <DialerPanel 
                                            activeLead={activeLead} 
                                            callStatus={callStatus} 
                                            callDuration={callDuration}
                                            isMuted={isMuted} 
                                            onHangUp={hangUp} 
                                            onMuteToggle={toggleMute} 
                                            onCall={handleCallLead}
                                            lastCallMeta={lastCallMeta}
                                            onLogOutcome={logCallWithOutcome}
                                            onClose={() => setActiveLead(null)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PIPELINE TAB ── */}
                    {activeTab === "pipeline" && (
                        <div className="h-full animate-in fade-in duration-300">
                            <PipelineBoard 
                                leads={leads} 
                                isCallActive={isCallActive}
                                onCallLead={handleCallLead} 
                                onLeadsChange={refreshLeads}
                                filters={filters} 
                                onFiltersChange={setFilters} 
                                activeLead={activeLead}
                                onSelectLead={setActiveLead}
                            />
                        </div>
                    )}

                    {/* ── DIALER TAB ── */}
                    {activeTab === "dialer" && (
                        <div className="flex h-[calc(100vh-80px)] w-full max-w-6xl mx-auto p-4 md:p-8 space-x-0 md:space-x-8 animate-in fade-in zoom-in-95 duration-500">
                            {/* Left Side: The Actual Dialer */}
                            <div className="flex-1 flex justify-center items-center">
                                <DirectDialer callStatus={callStatus} callDuration={callDuration} isMuted={isMuted}
                                    onCall={makeCall} onHangUp={hangUp} onToggleMute={toggleMute} />
                            </div>

                            {/* Right Side: Recent Calls */}
                            <div className="hidden md:flex w-[350px] flex-col bg-surface-panel border border-border-subtle rounded-3xl shadow-xl overflow-hidden h-[600px] my-auto">
                                <div className="p-5 border-b border-border-subtle bg-surface-panel-hover">
                                    <h3 className="font-bold text-lg text-white font-outfit">Recent Calls</h3>
                                    <p className="text-xs text-text-secondary">Your latest interactions</p>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                    <DialerRecentCallsList onCall={makeCall} />
                                </div>
                            </div>
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

            {/* Mobile Navigation Placeholder (Optional: Add mobile drawer if needed later) */}
            <div className="md:hidden flex h-16 bg-[#111116] border-t border-white/5 items-center justify-around z-50 px-2 shrink-0">
                {["dashboard", "leads", "pipeline", "dialer", "analysis"].map((tab) => (
                    <button key={tab} onClick={() => switchTab(tab as DashboardTab)} className={`flex-1 flex flex-col items-center justify-center p-2 uppercase text-[9px] font-bold tracking-widest transition-colors ${activeTab === tab ? "text-brand-primary" : "text-text-secondary"}`}>
                        {tab.substring(0,3)}
                    </button>
                ))}
            </div>


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
