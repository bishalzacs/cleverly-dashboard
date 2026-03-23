"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface DialerRecentCallsListProps {
    onCall: (phone: string, leadId?: string, leadName?: string) => void;
}

export const DialerRecentCallsList = ({ onCall }: DialerRecentCallsListProps) => {
    const [recentCalls, setRecentCalls] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRecent = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const emailId = user?.email || user?.id; // Allow fallback identifier

            let query = supabase.from("call_logs").select("*").order("created_at", { ascending: false }).limit(15);
            
            // If they are not admin, maybe restrict to their calls? We can just fetch globally for now if agent_email is heavily used
            if (emailId) {
                 query = query.eq("agent_email", emailId);
            }
            // Actually it's better to fetch their specific calls if possible, but the old query matched all or agentId.
            // We'll fetch the last 15 calls globally or specific to the agent if we have their session ID logged but email is safer.
            
            const { data } = await query;
            setRecentCalls(data || []);
            setIsLoading(false);
        };
        fetchRecent();
    }, []);

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " · " + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (recentCalls.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-full p-6 text-center space-y-3 opacity-50">
                <svg className="w-8 h-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <p className="text-sm text-text-secondary">No recent calls found</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border-subtle/30">
            {recentCalls.map((call) => (
                <div key={call.id} className="p-4 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onCall(call.phone, call.lead_id, call.lead_name)}>
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center space-x-2">
                             <div className={`w-2 h-2 rounded-full ${call.status === "completed" || call.status === "connected" ? "bg-emerald-500" : call.status === "failed" || call.status === "no-answer" ? "bg-rose-500" : "bg-zinc-500"}`} />
                             <span className="font-semibold text-white text-sm">{call.lead_name || call.phone || "Unknown"}</span>
                        </div>
                        <span className="text-[10px] text-text-secondary">{formatTimestamp(call.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center pl-4">
                        <span className="text-xs text-text-secondary font-mono">{call.phone}</span>
                        {call.duration_seconds > 0 && <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-text-secondary">{Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s</span>}
                    </div>
                    {call.outcome && (
                         <div className="pl-4 mt-2">
                             <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-brand-primary/10 text-brand-primary">{call.outcome}</span>
                         </div>
                    )}
                </div>
            ))}
        </div>
    );
};
