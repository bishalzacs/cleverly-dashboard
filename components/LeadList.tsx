"use client";

import { Lead } from "@/services/mondayService";
import { LeadCard } from "./LeadCard";

interface LeadListProps {
    leads: Lead[];
    isLoading: boolean;
    error: string | null;
    activeLeadId: string | null;
    isCallActive: boolean;
    onSelectLead: (lead: Lead) => void;
    onCallLead: (lead: Lead) => void;
    onRefresh: () => void;
}

export const LeadList = ({
    leads,
    isLoading,
    error,
    activeLeadId,
    isCallActive,
    onSelectLead,
    onCallLead,
    onRefresh,
}: LeadListProps) => {
    return (
        <div className="flex flex-col h-full bg-[#0B0B0B] border-r border-[#1F1F1F]">
            <div className="p-6 border-b border-[#1F1F1F] flex justify-between items-center sticky top-0 bg-[#0B0B0B]/80 backdrop-blur-md z-10">
                <div>
                    <h2 className="text-lg font-semibold text-white">Lost Leads</h2>
                    <p className="text-sm text-gray-500 mt-1">{leads.length} available to call</p>
                </div>

                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-2 rounded-md hover:bg-[#1F1F1F] text-gray-400 hover:text-white transition-colors"
                    title="Refresh Leads"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`w-5 h-5 ${isLoading ? "animate-spin text-blue-500" : ""}`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                        />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {error ? (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </div>
                ) : isLoading && leads.length === 0 ? (
                    // Skeleton Loader
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-[180px] rounded-lg bg-[#111111] border border-[#1F1F1F] animate-pulse"
                            ></div>
                        ))}
                    </div>
                ) : leads.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>No leads found in the generic group.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {leads.map((lead) => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                isActive={activeLeadId === lead.id}
                                onSelect={onSelectLead}
                                onCall={onCallLead}
                                isCallingDisabled={isCallActive}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
