"use client";

import { Lead } from "@/services/mondayService";
import { CallControls } from "./CallControls";
import { CallStatus } from "@/hooks/useTwilioDevice";

interface DialerPanelProps {
    activeLead: Lead | null;
    callStatus: CallStatus;
    callDuration: number;
    isMuted: boolean;
    onHangUp: () => void;
    onMuteToggle: () => void;
}

export const DialerPanel = ({
    activeLead,
    callStatus,
    callDuration,
    isMuted,
    onHangUp,
    onMuteToggle,
}: DialerPanelProps) => {

    const isCallActive = callStatus !== "idle" && callStatus !== "ended";

    return (
        <div className="flex-1 flex items-center justify-center p-8 bg-[#0B0B0B]">
            {activeLead ? (
                <div className="w-full max-w-lg">
                    <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-10 shadow-2xl relative overflow-hidden">

                        {/* Subtle glow effect when calling */}
                        {isCallActive && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-transparent animate-pulse" />
                        )}

                        <div className="text-center mb-8">
                            <div className="w-24 h-24 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full mx-auto mb-6 flex items-center justify-center text-4xl text-gray-400 font-light shadow-inner">
                                {activeLead.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">
                                {activeLead.name || "Unknown Lead"}
                            </h2>
                            <p className="text-gray-400 font-mono text-lg tracking-wide mb-1">
                                {activeLead.phone || "No phone number"}
                            </p>
                            <p className="text-gray-500 text-sm">
                                {activeLead.email || "No email address"}
                            </p>
                        </div>

                        <div className="border-t border-[#1F1F1F] pt-8">
                            {!isCallActive ? (
                                <div className="text-center text-gray-500 text-sm">
                                    Click the Call button on the lead card to initiate a dial.
                                </div>
                            ) : (
                                <CallControls
                                    callStatus={callStatus}
                                    callDuration={callDuration}
                                    isMuted={isMuted}
                                    onHangUp={onHangUp}
                                    onMuteToggle={onMuteToggle}
                                />
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-dashed border-[#2A2A2A] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-gray-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-2">No Lead Selected</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Select a lead from the list on the left to view details and initiate a call.
                    </p>
                </div>
            )}
        </div>
    );
};
