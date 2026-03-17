"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";

interface Agent {
    id: string;
    email: string;
}

interface AnalyticsData {
    totalLeads: number;
    callsInPeriod: number;
    answerRate: string;
    avgDuration: string;
    recentCalls: {
        id: string;
        lead_name: string | null;
        phone: string;
        status: string;
        duration_seconds: number;
        created_at: string;
        agent_email?: string;
    }[];
    pipelineDistribution: Record<string, number>;
    agentList: Agent[];
    filteredStats: {
        total: number;
        connected: number;
    };
}

const PIPELINE_STAGES = [
    { id: "new_lead", label: "New Lead", color: "bg-blue-500" },
    { id: "first_attempt", label: "1st Attempt", color: "bg-yellow-500" },
    { id: "second_attempt", label: "2nd Attempt", color: "bg-orange-500" },
    { id: "third_attempt", label: "3rd Attempt", color: "bg-red-500" },
    { id: "call_received", label: "Not Answered", color: "bg-rose-500" },
    { id: "interested", label: "Interested", color: "bg-emerald-500" },
    { id: "not_interested", label: "Not Interested", color: "bg-slate-500" },
    { id: "follow_up", label: "Follow Up", color: "bg-purple-500" },
    { id: "closed", label: "Booked", color: "bg-teal-500" },
];

export const CallStats = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filters
    const [selectedAgent, setSelectedAgent] = useState<string>("all");
    const [selectedRange, setSelectedRange] = useState<string>("today");

    const fetchAnalytics = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (selectedAgent !== "all") params.append("agent_id", selectedAgent);
            if (selectedRange !== "all") params.append("range", selectedRange);

            const res = await fetch(`/api/analytics?${params.toString()}`);
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            setData(json.data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [selectedAgent, selectedRange]);

    useEffect(() => {
        fetchAnalytics();
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
        { label: "Calls Period", value: data?.callsInPeriod ?? 0, color: "text-brand-accent", icon: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /> },
        { label: "Answer Rate", value: data?.answerRate ?? "—", color: "text-green-400", icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        { label: "Avg Duration", value: data?.avgDuration ?? "—", color: "text-purple-400", icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    ];

    return (
        <div className="flex flex-col h-full bg-surface-base p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar animate-fade-in">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-text-primary font-outfit uppercase">Intelligence Deck</h2>
                    <p className="text-[9px] text-text-secondary mt-1 font-black uppercase tracking-[0.2em] opacity-50">Enterprise Neural Analytics & Pipeline Health</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Agent Filter */}
                    <div className="relative">
                        <select 
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="appearance-none bg-surface-panel border border-border-subtle rounded-lg px-4 py-2 pr-10 text-[10px] font-bold uppercase tracking-widest text-text-primary focus:outline-none focus:border-brand-primary transition-all cursor-pointer shadow-lg hover:bg-surface-panel-hover"
                        >
                            <option value="all">All Representatives</option>
                            {data?.agentList.map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.email}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* Range Filter */}
                    <div className="relative">
                        <select 
                            value={selectedRange}
                            onChange={(e) => setSelectedRange(e.target.value)}
                            className="appearance-none bg-surface-panel border border-border-subtle rounded-lg px-4 py-2 pr-10 text-[10px] font-bold uppercase tracking-widest text-text-primary focus:outline-none focus:border-brand-primary transition-all cursor-pointer shadow-lg hover:bg-surface-panel-hover"
                        >
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="all">Lifetime</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <button
                        onClick={fetchAnalytics}
                        className="p-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-lg active:scale-95"
                        title="Sync Data"
                    >
                        <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface-panel p-5 rounded-xl border border-border-subtle shadow-xl hover:-translate-y-1 transition-all duration-500 group animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-black text-text-secondary tracking-[0.2em] uppercase opacity-50">{stat.label}</span>
                            <div className={`w-8 h-8 rounded-lg bg-surface-base flex items-center justify-center text-text-secondary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-inner`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{stat.icon}</svg>
                            </div>
                        </div>
                        <div className={`text-2xl font-black tracking-tight ${stat.color} font-outfit`}>
                            {isLoading ? "..." : stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pipeline Stage Distribution - Mass Data Visualization */}
            <div className="bg-surface-panel rounded-xl p-6 border border-border-subtle shadow-xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-black text-text-primary font-outfit uppercase tracking-tight">Pipeline Distribution</h3>
                        <p className="text-[9px] text-text-secondary mt-1 font-bold uppercase tracking-widest opacity-50">Volume breakdown by neural stage</p>
                    </div>
                    <div className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20 uppercase tracking-widest">
                        {data?.totalLeads ?? 0} Total Leads
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                    {PIPELINE_STAGES.map((stage, idx) => {
                        const count = data?.pipelineDistribution[stage.id] ?? 0;
                        const percentage = data?.totalLeads ? (count / data.totalLeads) * 100 : 0;
                        
                        return (
                            <div key={stage.id} className="group" style={{ animationDelay: `${0.5 + idx * 0.05}s` }}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{stage.label}</span>
                                    <span className="text-[10px] font-black text-text-secondary font-mono">{count}</span>
                                </div>
                                <div className="h-2 w-full bg-surface-base rounded-full overflow-hidden border border-border-subtle shadow-inner">
                                    <div 
                                        className={`h-full ${stage.color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                                        style={{ width: `${isLoading ? 0 : percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
                {/* Rep Leaderboard / Performance */}
                <div className="lg:col-span-1 bg-surface-panel rounded-xl p-6 border border-border-subtle shadow-xl flex flex-col animate-scale-in" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center justify-between mb-6 border-b border-border-subtle pb-4">
                        <h3 className="text-lg font-black text-text-primary font-outfit uppercase tracking-tight">Active Reps</h3>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {data?.agentList.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-30">
                                <p className="text-[10px] font-black uppercase tracking-widest">No active signals</p>
                            </div>
                        ) : (
                            data?.agentList.map((agent, idx) => (
                                <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-base/50 border border-border-subtle hover:border-brand-primary/30 transition-all cursor-pointer group">
                                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-[10px] font-black text-brand-primary border border-brand-primary/20 group-hover:bg-brand-primary group-hover:text-white transition-all">
                                        {agent.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-text-primary truncate uppercase tracking-tighter">{agent.email}</p>
                                        <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest opacity-50">Active Performance</p>
                                    </div>
                                    <svg className="w-3 h-3 text-text-secondary opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity Logs */}
                <div className="lg:col-span-2 bg-surface-panel rounded-xl p-6 border border-border-subtle shadow-xl flex flex-col animate-scale-in" style={{ animationDelay: '0.6s' }}>
                    <div className="flex items-center justify-between mb-6 border-b border-border-subtle pb-4">
                        <h3 className="text-lg font-black text-text-primary font-outfit uppercase tracking-tight">Recent Signals</h3>
                        <span className="text-[9px] font-black px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-full uppercase tracking-[0.2em]">Real-time</span>
                    </div>

                    {(!data?.recentCalls || data.recentCalls.length === 0) ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 grayscale opacity-40">
                            <p className="text-lg font-bold text-text-primary uppercase font-outfit">No Activity Logged</p>
                            <p className="text-text-secondary text-[10px] mt-1 font-bold uppercase tracking-widest opacity-50">Calls will appear here instantly</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {data.recentCalls.map((call, idx) => (
                                <div key={call.id} className="p-4 rounded-xl bg-surface-base border border-border-subtle hover:border-brand-primary/40 transition-all group shadow-inner animate-fade-in-up" style={{ animationDelay: `${0.7 + idx * 0.05}s` }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm font-black text-text-primary group-hover:text-brand-primary transition-colors uppercase tracking-tight">{call.lead_name || "Unknown Link"}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-text-secondary font-mono">{call.phone}</span>
                                                <span className="text-[8px] text-brand-primary font-black uppercase tracking-widest px-1.5 py-0.5 bg-brand-primary/5 rounded border border-brand-primary/10">{call.agent_email || "System"}</span>
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.2em] border shadow-sm ${getStatusStyle(call.status)}`}>
                                            {call.status === "connected" ? "Success" : call.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] text-text-secondary mt-3 pt-2 border-t border-border-subtle/30 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-brand-accent animate-pulse" />
                                            {formatDuration(call.duration_seconds)} Duration
                                        </span>
                                        <span className="opacity-60">{formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}</span>
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
