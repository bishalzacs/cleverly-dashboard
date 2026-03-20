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
            case "connected": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "no_answer": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            case "failed": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        }
    };

    if (error) {
        return (
            <div className="flex flex-col h-full bg-surface-base p-10 items-center justify-center">
                <p className="text-rose-500 text-base font-bold">⚠ {error}</p>
                <button onClick={fetchAnalytics} className="mt-4 text-text-primary px-6 py-2 rounded-lg bg-surface-panel border border-border-subtle font-bold text-sm tracking-widest hover:bg-surface-base transition-colors uppercase">Retry Connection</button>
            </div>
        );
    }

    const cards = [
        { label: "Total Managed Leads", value: data?.totalLeads ?? 0, trend: "+12.5%", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 3a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 6a2 2 0 11-4 0 2 2 0 014 0z" },
        { label: "Outbound Interactions", value: data?.callsInPeriod ?? 0, trend: "+4.2%", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
        { label: "Average Session", value: data?.avgDuration ?? "0:00", trend: "+22s", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { label: "Contact Frequency", value: data?.avgAttempts ?? "0", trend: "0.8 avg", icon: "M16 8v8m-4-5v5m-4-2v2" },
    ];

    const outcomeLabels = {
        "Connected": { color: "bg-emerald-500", label: "Connected" },
        "No Answer": { color: "bg-rose-500", label: "No Answer" },
        "Busy": { color: "bg-amber-500", label: "Line Busy" },
        "Voicemail": { color: "bg-blue-500", label: "Voicemail" },
        "Wrong Number": { color: "bg-zinc-500", label: "Invalid #" }
    };

    return (
        <div className="flex flex-col h-full bg-surface-base overflow-hidden font-sans">
            {/* Header / Filter Bar */}
            <div className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-surface-base shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-text-primary tracking-tight">Performance Analytics</h1>
                    <div className="h-4 w-px bg-border-subtle" />
                    <p className="text-sm text-text-secondary font-medium">Real-time sales intelligence</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-surface-panel rounded-lg p-1 border border-border-subtle">
                        <select 
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-text-secondary hover:text-text-primary px-3 py-1.5 transition-colors focus:outline-none cursor-pointer min-w-[160px]"
                        >
                            <option value="all" className="bg-surface-panel">All Representatives</option>
                            {data?.agentList.map(agent => (
                                <option key={agent.id} value={agent.id} className="bg-surface-panel">{agent.email}</option>
                            ))}
                        </select>
                        <div className="w-px h-4 bg-border-subtle mx-1" />
                        <select 
                            value={selectedRange}
                            onChange={(e) => setSelectedRange(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-text-secondary hover:text-text-primary px-3 py-1.5 transition-colors focus:outline-none cursor-pointer"
                        >
                            <option value="today" className="bg-surface-panel">Today</option>
                            <option value="week" className="bg-surface-panel">7 Days</option>
                            <option value="month" className="bg-surface-panel">30 Days</option>
                            <option value="all" className="bg-surface-panel">Lifetime</option>
                        </select>
                    </div>

                    <button
                        onClick={fetchAnalytics}
                        className="flex items-center gap-2 h-9 px-4 rounded-lg bg-text-primary text-surface-base hover:opacity-90 transition-all font-bold text-sm"
                    >
                        <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => (
                        <div key={i} className="group relative bg-surface-panel rounded-2xl p-6 border border-border-subtle transition-all duration-300 hover:border-text-primary/10 hover:shadow-2xl hover:shadow-black/50">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-sm font-semibold text-text-secondary tracking-tight">{card.label}</span>
                                <div className="p-2 rounded-xl bg-surface-base text-text-primary transition-transform group-hover:scale-110">
                                    <svg className="w-5 h-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={card.icon} /></svg>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-bold text-text-primary tracking-tighter tabular-nums">
                                    {isLoading ? (
                                        <span className="w-16 h-8 bg-surface-panel-hover rounded block animate-pulse" />
                                    ) : card.value}
                                </span>
                                {!isLoading && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {card.trend}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Distribution Section */}
                    <div className="lg:col-span-12 xl:col-span-5 bg-surface-panel rounded-2xl border border-border-subtle p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-text-primary text-lg">Interaction Distribution</h3>
                        </div>
                        <div className="space-y-8">
                            {Object.entries(outcomeLabels).map(([id, config]) => {
                                const count = data?.outcomeStats?.[id] ?? 0;
                                const total = Object.values(data?.outcomeStats ?? {}).reduce((a: number, b: number) => Number(a) + Number(b), 0) || 1;
                                const pct = Math.round((Number(count) / Number(total)) * 100);
                                
                                return (
                                    <div key={id} className="group">
                                        <div className="flex justify-between items-end mb-2.5">
                                            <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">{config.label}</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-lg font-bold text-text-primary">{count}</span>
                                                <span className="text-xs font-semibold text-text-secondary opacity-50">{pct}%</span>
                                            </div>
                                        </div>
                                        <div className="h-3 w-full bg-surface-base rounded-full overflow-hidden p-[2px]">
                                            <div 
                                                className={`h-full ${config.color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,0,0,0.5)]`} 
                                                style={{ width: `${isLoading ? 0 : pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pipeline Visualizer (Kanban Style) */}
                    <div className="lg:col-span-12 xl:col-span-7 bg-surface-panel rounded-2xl border border-border-subtle shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="px-8 py-6 border-b border-border-subtle flex items-center justify-between bg-zinc-950/20">
                            <h3 className="font-bold text-text-primary text-lg">Conversion Pipeline</h3>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">Active Funnel</span>
                        </div>
                        
                        <div className="flex-1 overflow-x-auto p-6 flex gap-6 custom-scrollbar bg-surface-base/5">
                            {PIPELINE_STAGES.filter(s => ['new_lead', 'first_attempt', 'call_received', 'interested', 'closed'].includes(s.id)).map((stage) => {
                                const count = data?.pipelineDistribution[stage.id] ?? 0;
                                const percentage = data?.totalLeads ? (count / data.totalLeads) * 100 : 0;
                                
                                return (
                                    <div key={stage.id} className="w-[200px] shrink-0 flex flex-col group">
                                        <div className="bg-surface-base rounded-2xl border border-border-subtle p-6 flex flex-col shadow-sm group-hover:border-text-primary/20 transition-all h-full relative overflow-hidden">
                                            {/* Accent Line */}
                                            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: stage.color }} />
                                            
                                            <div className="mb-4">
                                                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{stage.label}</p>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="text-4xl font-bold text-text-primary tracking-tighter mb-1 font-outfit">{isLoading ? "..." : count}</div>
                                                <div className="text-[10px] font-bold text-text-secondary/60 uppercase tracking-widest leading-none">Records</div>
                                            </div>
                                            
                                            <div className="mt-6 pt-4 border-t border-border-subtle">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-[10px] font-bold text-text-secondary uppercase">Share</span>
                                                    <span className="text-[10px] font-black text-text-primary">{percentage.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-surface-panel rounded-full overflow-hidden">
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
                </div>

                {/* Bottom Row: Reps & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8">
                    {/* Representative Listing */}
                    <div className="lg:col-span-4 bg-surface-panel rounded-2xl border border-border-subtle p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-text-primary text-lg">Sales Representatives</h3>
                            <div className="flex gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                            </div>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[500px] pr-2">
                            {(!data?.agentList || data.agentList.length === 0) ? (
                                <div className="h-32 flex flex-col items-center justify-center text-center opacity-30">
                                    <p className="text-xs font-bold uppercase tracking-widest">No agents found</p>
                                </div>
                            ) : (
                                data.agentList.map((agent) => (
                                    <div key={agent.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-base border border-border-subtle hover:border-text-primary/10 hover:shadow-lg transition-all cursor-pointer group">
                                        <div className="w-10 h-10 rounded-xl bg-surface-panel flex items-center justify-center text-sm font-bold text-text-primary border border-border-subtle group-hover:bg-text-primary group-hover:text-surface-base transition-all">
                                            {agent.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-text-primary truncate">{agent.email}</p>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-50">Active Performance</p>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Data Signal Matrix */}
                    <div className="lg:col-span-8 bg-surface-panel rounded-2xl border border-border-subtle p-8 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-text-primary text-lg">Real-time Activity Feed</h3>
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">System Signals</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[500px]">
                            {(!data?.recentCalls || data.recentCalls.length === 0) ? (
                                <div className="h-64 flex flex-col items-center justify-center text-center opacity-20">
                                    <p className="text-xl font-bold text-text-secondary uppercase">No Recent Activity</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border-subtle/50">
                                    {data.recentCalls.map((call) => (
                                        <div key={call.id} className="py-5 flex items-center justify-between group">
                                            <div className="flex items-center gap-5 flex-1">
                                                <div className="w-11 h-11 rounded-2xl bg-surface-base flex items-center justify-center border border-border-subtle group-hover:border-text-primary/10 transition-colors shadow-sm">
                                                    <svg className="w-5 h-5 text-text-secondary opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-text-primary group-hover:text-text-primary transition-colors truncate">{call.lead_name || "Unknown Identity"}</p>
                                                    <p className="text-xs font-medium text-text-secondary opacity-60 mt-0.5">{call.phone}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-12 text-right">
                                                <div className="hidden md:block">
                                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-40 mb-1">Representative</p>
                                                    <p className="text-xs font-bold text-text-primary">{call.agent_email?.split('@')[0] || "SYSTEM"}</p>
                                                </div>
                                                <div className="w-32">
                                                    <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border ${getStatusStyle(call.status)}`}>
                                                        {call.status}
                                                    </span>
                                                    <p className="text-[10px] font-bold text-text-secondary opacity-40">{formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}</p>
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
