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
    avgAttempts: string;
    outcomeStats: Record<string, number>;
}

const PIPELINE_STAGES = [
    { id: "new_lead", label: "New Lead", color: "#3B82F6" },
    { id: "first_attempt", label: "1st Attempt", color: "#EAB308" },
    { id: "second_attempt", label: "2nd Attempt", color: "#F97316" },
    { id: "third_attempt", label: "3rd Attempt", color: "#EF4444" },
    { id: "call_received", label: "Not Answered", color: "#F43F5E" },
    { id: "interested", label: "Interested", color: "#10B981" },
    { id: "not_interested", label: "Not Inter.", color: "#64748B" },
    { id: "follow_up", label: "Follow Up", color: "#A855F7" },
    { id: "closed", label: "Booked", color: "#14B8A6" },
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
                <button onClick={fetchAnalytics} className="mt-4 text-brand-primary text-sm font-bold hover:underline font-outfit uppercase tracking-widest">Retry Connection</button>
            </div>
        );
    }

    const cards = [
        { label: "Gross Leads", value: data?.totalLeads ?? 0, trend: "+12%", color: "#3B82F6", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 3a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 6a2 2 0 11-4 0 2 2 0 014 0z" },
        { label: "Outbound Calls", value: data?.callsInPeriod ?? 0, trend: "+5%", color: "#F97316", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
        { label: "Talk Time (Avg)", value: data?.avgDuration ?? "0:00", trend: "+30s", color: "#A855F7", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { label: "Avg Attempts", value: data?.avgAttempts ?? "0", trend: "Target: 3", color: "#10B981", icon: "M16 8v8m-4-5v5m-4-2v2" },
    ];

    const outcomeLabels = {
        "Connected": { color: "bg-emerald-500", label: "Connected" },
        "No Answer": { color: "bg-amber-500", label: "No Answer" },
        "Busy": { color: "bg-orange-500", label: "Busy" },
        "Wrong Number": { color: "bg-red-500", label: "Wrong Number" }
    };

    return (
        <div className="flex flex-col h-full bg-surface-base overflow-hidden font-sans">
            {/* Top Toolbar - Power BI Style */}
            <div className="h-16 bg-surface-panel border-b border-border-subtle flex items-center justify-between px-6 shrink-0 z-10 shadow-sm transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-brand-primary rounded-full" />
                    <div>
                        <h2 className="text-lg font-black text-text-primary font-outfit tracking-tight uppercase leading-none">Intelligence Dashboard</h2>
                        <p className="text-[9px] text-text-secondary mt-1 font-bold uppercase tracking-[0.15em] opacity-60">Neural Sales Performance Ecosystem</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Filter Group */}
                    <div className="flex items-center bg-surface-base rounded-lg p-1 border border-border-subtle transition-colors">
                        <div className="flex items-center px-3 gap-2 border-r border-border-subtle">
                            <span className="text-[10px] font-black text-text-secondary uppercase opacity-60">Agent</span>
                            <select 
                                value={selectedAgent}
                                onChange={(e) => setSelectedAgent(e.target.value)}
                                className="bg-transparent text-[11px] font-bold text-text-primary focus:outline-none cursor-pointer min-w-[140px] appearance-none"
                            >
                                <option value="all" className="bg-surface-panel">All Representatives</option>
                                {data?.agentList.map(agent => (
                                    <option key={agent.id} value={agent.id} className="bg-surface-panel">{agent.email}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center px-3 gap-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase opacity-60">Period</span>
                            <select 
                                value={selectedRange}
                                onChange={(e) => setSelectedRange(e.target.value)}
                                className="bg-transparent text-[11px] font-bold text-text-primary focus:outline-none cursor-pointer appearance-none"
                            >
                                <option value="today" className="bg-surface-panel">Today</option>
                                <option value="week" className="bg-surface-panel">7 Days</option>
                                <option value="month" className="bg-surface-panel">30 Days</option>
                                <option value="all" className="bg-surface-panel">Lifetime</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={fetchAnalytics}
                        className="p-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-all shadow-md active:scale-95 flex items-center gap-2 px-4 border-none"
                    >
                        <svg className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Refresh</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* KPI Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((card, i) => (
                        <div key={i} className="bg-surface-panel rounded-xl p-5 border border-border-subtle shadow-sm hover:shadow-lg transition-all border-l-4 group" style={{ borderLeftColor: card.color }}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">{card.label}</span>
                                <div className={`p-2 rounded-lg bg-surface-base group-hover:scale-110 transition-transform`} style={{ color: card.color }}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={card.icon} /></svg>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-text-primary font-outfit tracking-tight">
                                    {isLoading ? "..." : card.value}
                                </span>
                                <span className={`text-[9px] font-bold ${card.trend.includes('Target') || card.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {card.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Outcome Breakdown Section */}
                <div className="bg-surface-panel rounded-xl border border-border-subtle p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-tight font-outfit">Call Outcome Distribution</h3>
                        <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">Frequency Matrix</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(outcomeLabels).map(([id, config]) => {
                            const count = data?.outcomeStats?.[id] ?? 0;
                            const total = Object.values(data?.outcomeStats ?? {}).reduce((a: number, b: number) => a + b, 0) || 1;
                            const pct = Math.round((Number(count) / Number(total)) * 100);
                            
                            return (
                                <div key={id} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{config.label}</span>
                                        <span className="text-sm font-black text-text-primary">{count}</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-base rounded-full overflow-hidden border border-border-subtle">
                                        <div 
                                            className={`h-full ${config.color} transition-all duration-1000`} 
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-bold text-text-secondary opacity-40">{pct}% Impact Score</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pipeline Board (Kanban Style) */}
                <div className="bg-surface-panel rounded-xl border border-border-subtle shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-base/30">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-text-primary uppercase tracking-tight font-outfit">Pipeline Funnel Board</h3>
                            <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-black border border-brand-primary/20">{data?.totalLeads ?? 0} Total</span>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-border-subtle" />)}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto p-4 flex gap-4 custom-scrollbar bg-surface-base/10">
                        {PIPELINE_STAGES.map((stage) => {
                            const count = data?.pipelineDistribution[stage.id] ?? 0;
                            const percentage = data?.totalLeads ? (count / data.totalLeads) * 100 : 0;
                            
                            return (
                                <div key={stage.id} className="w-[200px] shrink-0 flex flex-col gap-3 group">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full border shadow-sm" style={{ backgroundColor: stage.color, borderColor: 'rgba(255,255,255,0.1)' }} />
                                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest truncate max-w-[120px]">{stage.label}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-text-primary font-mono">{count}</span>
                                    </div>

                                    {/* Kanban Column Card */}
                                    <div className="flex-1 bg-surface-base rounded-2xl border border-border-subtle p-4 flex flex-col shadow-sm group-hover:border-brand-primary/30 transition-all hover:shadow-md cursor-default border-t-[6px]" style={{ borderTopColor: stage.color }}>
                                        <div className="flex-1 flex flex-col justify-center items-center text-center py-6">
                                            <div className="text-2xl font-black text-text-primary font-outfit mb-1">{count}</div>
                                            <div className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">{percentage.toFixed(0)}% SHARE</div>
                                        </div>
                                        <div className="pt-4 border-t border-border-subtle/20">
                                            <div className="h-2 w-full bg-surface-panel rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${isLoading ? 0 : Math.max(5, percentage)}%`, backgroundColor: stage.color }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
                    {/* Representative Listing */}
                    <div className="lg:col-span-4 bg-surface-panel rounded-xl p-6 border border-border-subtle shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-black text-text-primary uppercase tracking-tight font-outfit">Regional Sales Reps</h3>
                                <p className="text-[9px] text-text-secondary uppercase font-bold mt-1 tracking-widest opacity-60">Global Network Status</p>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        </div>

                        <div className="space-y-2 flex-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                            {(!data?.agentList || data.agentList.length === 0) ? (
                                <div className="h-32 flex flex-col items-center justify-center text-center opacity-30">
                                    <p className="text-[10px] font-black uppercase">Scanning directory...</p>
                                </div>
                            ) : (
                                data.agentList.map((agent) => (
                                    <div key={agent.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-base/50 border border-border-subtle hover:border-brand-primary/30 transition-all cursor-pointer group">
                                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-[10px] font-black text-brand-primary border border-brand-primary/20 group-hover:bg-brand-primary group-hover:text-white transition-all">
                                            {agent.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-text-primary truncate uppercase tracking-tighter">{agent.email}</p>
                                            <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest opacity-40">Verified Representative</p>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Data Signal Matrix */}
                    <div className="lg:col-span-8 bg-surface-panel rounded-xl p-6 border border-border-subtle shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-black text-text-primary uppercase tracking-tight font-outfit">Neural Signal Feed</h3>
                                <p className="text-[9px] text-text-secondary uppercase font-bold mt-1 tracking-widest opacity-60">XAI Telephonic Matrix </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                                </span>
                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Synchronizing</span>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            {(!data?.recentCalls || data.recentCalls.length === 0) ? (
                                <div className="h-64 flex flex-col items-center justify-center text-center opacity-30">
                                    <p className="text-lg font-black text-text-secondary uppercase font-outfit">Matrix Empty</p>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Initial signal pending</p>
                                </div>
                            ) : (
                                <div className="space-y-0 border border-border-subtle/30 rounded-xl overflow-hidden shadow-inner bg-surface-base/20">
                                    {data.recentCalls.map((call, idx) => (
                                        <div key={call.id} className={`p-4 flex items-center justify-between border-b last:border-0 border-border-subtle/10 bg-surface-panel/30 hover:bg-brand-primary/[0.03] transition-all group`}>
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-10 rounded-2xl bg-surface-base flex items-center justify-center border border-border-subtle shadow-sm group-hover:border-brand-primary/20 transition-colors">
                                                    <svg className="w-4 h-4 text-text-secondary group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-text-primary group-hover:text-brand-primary transition-colors uppercase tracking-tight truncate max-w-[200px]">{call.lead_name || "Unknown Identity"}</p>
                                                    <p className="text-[10px] text-text-secondary font-mono tracking-tighter mt-0.5 opacity-60">{call.phone}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-10 pr-4">
                                                <div className="hidden md:flex flex-col items-end">
                                                    <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">{call.agent_email?.split('@')[0] || "SYSTEM"}</span>
                                                    <span className="text-[8px] text-brand-primary font-black uppercase tracking-[0.2em] opacity-40">REP ID</span>
                                                </div>
                                                <div className="flex flex-col items-end w-24">
                                                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-current mb-1 shadow-sm ${getStatusStyle(call.status)}`}>
                                                        {call.status}
                                                    </span>
                                                    <span className="text-[7.5px] font-black text-text-secondary uppercase tracking-tighter opacity-40">{formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
