"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { LeadList } from "@/components/LeadList";
import { DialerPanel } from "@/components/DialerPanel";
import { useLeads } from "@/hooks/useLeads";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { Lead } from "@/services/mondayService";

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
        await makeCall(lead.phone);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0B0B0B] text-[#EAEAEA] overflow-hidden font-sans">
            {/* Top Navigation */}
            <TopBar deviceStatus={deviceStatus} callStatus={callStatus} />

            {/* Main Dashboard Area */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Column: Leads List */}
                <div className="w-[400px] flex-shrink-0 h-full">
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

                {/* Right Column: Dialer Interface */}
                <DialerPanel
                    activeLead={activeLead}
                    callStatus={callStatus}
                    callDuration={callDuration}
                    isMuted={isMuted}
                    onHangUp={hangUp}
                    onMuteToggle={toggleMute}
                />
            </main>

            {/* Global Error Toasts */}
            {twilioError && (
                <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-lg shadow-[0_4px_30px_rgba(239,68,68,0.2)] z-50 animate-in slide-in-from-bottom-5">
                    <p className="font-semibold">Dialer Error</p>
                    <p className="text-sm opacity-90">{twilioError}</p>
                </div>
            )}
        </div>
    );
}
