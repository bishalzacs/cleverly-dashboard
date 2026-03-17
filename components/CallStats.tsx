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
            case "connected": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
            case "no_answer": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
            case "failed": return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
            default: return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
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
            <div className="flex flex-col h-full bg-surface-base p-10 items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                <p className="text-text-secondary mt-4 text-base font-medium">Loading your stats...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full bg-surface-base p-10 items-center justify-center">
                <p className="text-red-500 text-base font-bold">⚠ {error}</p>
                <button onClick={fetchAnalytics} className="mt-4 text-brand-primary text-sm font-bold hover:underline">Retry Refresh</button>
            </div>
        );
    }

    const stats = [
        { label: "Total Leads", value: data?.totalLeads ?? 0, color: "text-brand-primary", icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
        { label: "Total Calls", value: data?.totalCalls ?? 0, color: "text-brand-accent", icon: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /> },
        { label: "Answer Rate", value: data?.answerRate ?? "—", color: "text-green-600 dark:text-green-400", icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        { label: "Avg Duration", value: data?.avgDuration ?? "—", color: "text-purple-600 dark:text-purple-400", icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    ];

    return (
        <div className="flex flex-col h-full bg-surface-base p-6 md:p-10 space-y-10 overflow-y-auto custom-scrollbar animate-fade-in">
            {/* Header Section */}
            <div className="flex items-center justify-between pb-8 border-b border-border-subtle">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-text-primary font-outfit uppercase">Intelligence Deck</h2>
                    <p className="text-[10px] text-text-secondary mt-2 font-black uppercase tracking-[0.2em] opacity-50">Real-time pipeline performance & neural activity</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-panel border border-border-subtle hover:bg-surface-panel-hover text-text-primary transition-all text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Synchronize
                </button>
            </div>

            {/* GHL-Style BIG Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface-panel p-10 rounded-[2.5rem] border border-border-subtle shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-500 group animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[10px] font-black text-text-secondary tracking-[0.2em] uppercase opacity-50">{stat.label}</span>
                            <div className={`w-12 h-12 rounded-2xl bg-surface-base flex items-center justify-center text-text-secondary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-inner`}>
                                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{stat.icon}</svg>
                            </div>
                        </div>
                        <div className={`text-6xl font-black tracking-tighter ${stat.color} font-outfit group-hover:scale-105 transition-transform origin-left duration-500`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Secondary Feature Card */}
                <div className="lg:col-span-1 bg-brand-primary rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-brand-primary/40 relative overflow-hidden group animate-scale-in" style={{ animationDelay: '0.4s' }}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/30 transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full -ml-24 -mb-24 blur-3xl" />
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <h3 className="text-3xl font-black font-outfit uppercase tracking-tight">Daily Volume</h3>
                        <p className="text-white/70 mt-3 text-sm font-bold tracking-widest uppercase opacity-80">Processed Pipeline Flow</p>
                    </div>
                    <div className="mt-12 relative z-10">
                        <div className="text-8xl font-black font-outfit tracking-tighter leading-none group-hover:scale-110 transition-transform duration-700 origin-left">{data?.callsToday ?? 0}</div>
                        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40 mt-4 block">Calls Today</span>
                    </div>
                </div>

                {/* Recent Activity Logs */}
                <div className="lg:col-span-2 bg-surface-panel rounded-[2.5rem] p-10 border border-border-subtle shadow-2xl flex flex-col animate-scale-in" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black text-text-primary font-outfit uppercase tracking-tight">Neural Activity Log</h3>
                        <span className="text-[10px] font-black px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-full uppercase tracking-[0.2em] animate-pulse">Live Signal</span>
                    </div>

                    {(!data?.recentCalls || data.recentCalls.length === 0) ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 grayscale opacity-40">
                            <svg className="w-16 h-16 text-text-secondary mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <p className="text-xl font-bold text-text-primary uppercase font-outfit">No Traffic Detected</p>
                            <p className="text-text-secondary text-base mt-2 font-medium">Calls will appear here instantly once initiated.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                            {data.recentCalls.map((call, idx) => (
                                <div key={call.id} className="p-6 rounded-3xl bg-surface-base border border-border-subtle hover:border-brand-primary/40 transition-all group shadow-inner hover:shadow-2xl animate-fade-in-up" style={{ animationDelay: `${0.6 + idx * 0.05}s` }}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-lg font-bold text-text-primary group-hover:text-brand-primary transition-colors">{call.lead_name || "Unknown Lead"}</p>
                                            <p className="text-sm text-text-secondary font-mono tracking-tight mt-0.5">{call.phone}</p>
                                        </div>
                                        <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-sm ${getStatusStyle(call.status)}`}>
                                            {getStatusLabel(call.status)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-text-secondary mt-5 pt-3 border-t border-border-subtle/50 font-medium">
                                        <span className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" />
                                            {formatDuration(call.duration_seconds)} Talk Time
                                        </span>
                                        <span className="opacity-80">{formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
