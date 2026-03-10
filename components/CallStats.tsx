"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsData {
    totalLeads: number;
    callsToday: number;
    answerRate: string;
    avgDuration: string;
    totalCalls: number;
    recentCalls: {
        id: string;
        lead_name: string | null;
        phone: string;
        status: string;
        duration_seconds: number;
        created_at: string;
    }[];
}

export const CallStats = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch("/api/analytics");
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            setData(json.data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
        // Refresh every 30 seconds
        const interval = setInterval(fetchAnalytics, 30000);
        return () => clearInterval(interval);
    }, [fetchAnalytics]);

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds === 0) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "connected": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "no_answer": return "bg-red-500/10 text-red-400 border-red-500/20";
            case "failed": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "connected": return "Answered";
            case "no_answer": return "No Answer";
            case "failed": return "Failed";
            default: return status;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-surface-base p-8 items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
                <p className="text-text-secondary mt-4 text-sm">Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full bg-surface-base p-8 items-center justify-center">
                <p className="text-red-400 text-sm">⚠ {error}</p>
                <button onClick={fetchAnalytics} className="mt-4 text-brand-accent text-xs hover:underline">Retry</button>
            </div>
        );
    }

    const stats = [
        { label: "Total Leads", value: data?.totalLeads ?? 0, color: "text-white" },
        { label: "Total Calls", value: data?.totalCalls ?? 0, color: "text-brand-accent" },
        { label: "Answer Rate", value: data?.answerRate ?? "—", color: "text-green-400" },
        { label: "Avg Duration", value: data?.avgDuration ?? "—", color: "text-purple-400" },
    ];

    return (
        <div className="flex flex-col h-full bg-surface-base p-8 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">Call Analytics</h2>
                    <p className="text-text-secondary mt-1 text-sm">Live performance metrics from your Supabase database.</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-panel border border-border-subtle hover:bg-white/5 text-text-secondary hover:text-white transition-all text-xs font-medium"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300">
                        <span className="text-sm font-semibold text-text-secondary tracking-wider uppercase mb-4">{stat.label}</span>
                        <span className={`text-4xl font-light tracking-tight ${stat.color}`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Calls Today banner */}
            <div className="glass-panel p-5 rounded-2xl border border-brand-accent/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                    <p className="text-white font-semibold text-lg">{data?.callsToday ?? 0} calls made today</p>
                    <p className="text-text-secondary text-sm">{data?.totalCalls ?? 0} total calls across all time</p>
                </div>
            </div>

            {/* Recent Calls */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-text-secondary tracking-wider uppercase mb-6">Recent Call Logs</h3>

                {(!data?.recentCalls || data.recentCalls.length === 0) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                        <svg className="w-10 h-10 text-text-secondary/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <p className="text-text-secondary text-sm font-medium">No calls logged yet</p>
                        <p className="text-text-secondary/60 text-xs mt-1">Make your first call from the Dialer tab — it will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
                        {data.recentCalls.map((call) => (
                            <div key={call.id} className="p-4 rounded-xl bg-surface-panel border border-border-subtle hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-medium text-white">{call.lead_name || "Unknown"}</p>
                                        <p className="text-xs text-text-secondary font-mono mt-0.5">{call.phone}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getStatusStyle(call.status)}`}>
                                        {getStatusLabel(call.status)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-text-secondary mt-3">
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {formatDuration(call.duration_seconds)}
                                    </span>
                                    <span>{formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
