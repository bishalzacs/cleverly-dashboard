"use client";

import { Lead } from "@/services/mondayService";
import { formatDistanceToNow } from "date-fns";

interface LeadCardProps {
    lead: Lead;
    isActive: boolean;
    onSelect: (lead: Lead) => void;
    onCall: (lead: Lead) => void;
    isCallingDisabled: boolean;
}

export const LeadCard = ({
    lead,
    isActive,
    onSelect,
    onCall,
    isCallingDisabled,
}: LeadCardProps) => {
    const formattedDate = lead.createdDate
        ? formatDistanceToNow(new Date(lead.createdDate), { addSuffix: true })
        : "Unknown date";

    return (
        <div
            onClick={() => onSelect(lead)}
            className={`p-5 mb-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between group
      ${isActive
                    ? "bg-[#1A1A1A] border-blue-500/50 shadow-[0_4px_20px_rgba(59,130,246,0.1)] relative"
                    : "bg-[#111111] border-[#1F1F1F] hover:border-[#2A2A2A] hover:bg-[#151515]"
                }`}
        >
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
            )}

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-white font-medium text-lg leading-tight mb-1">
                        {lead.name || "Unknown Lead"}
                    </h3>
                    <p className="text-gray-400 font-mono text-sm tracking-wide">
                        {lead.phone || "No phone"}
                    </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#1F1F1F] text-gray-400 border border-[#2A2A2A]">
                    {lead.status || "New"}
                </span>
            </div>

            <div className="flex flex-col space-y-1 mb-4 text-xs text-gray-500">
                <span className="truncate">{lead.email || "No email provided"}</span>
                <span>Added {formattedDate}</span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onCall(lead);
                }}
                disabled={isCallingDisabled || !lead.phone}
                className={`w-full py-2.5 rounded-md font-semibold text-sm transition-all flex items-center justify-center space-x-2
          ${isCallingDisabled || !lead.phone
                        ? "bg-[#1F1F1F] text-gray-600 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    }
        `}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                >
                    <path
                        fillRule="evenodd"
                        d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
                        clipRule="evenodd"
                    />
                </svg>
                <span>Call Now</span>
            </button>
        </div>
    );
};
