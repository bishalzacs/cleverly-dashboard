"use client";

import { useMemo } from "react";
import { Lead } from "@/services/mondayService";

interface CallStatsProps {
    leads: Lead[];
}

export const CallStats = ({ leads }: CallStatsProps) => {
    // Generate some mock stats based on the leads data to make it look active
    const stats = useMemo(() => {
        const totalLeads = leads.length;
        // Mock data logic just for the aesthetic
        const totalCallsToday = 142;
        const answerRate = "34.5%";
        const avgDuration = "2:14";

        return { totalLeads, totalCallsToday, answerRate, avgDuration };
    }, [leads]);

    const recentCalls = [
        { id: 1, name: "Alice Johnson", number: "+1 (555) 123-4567", status: "Answered", duration: "4:20", time: "10 mins ago" },
        { id: 2, name: "Bob Smith", number: "+1 (555) 987-6543", status: "No Answer", duration: "0:00", time: "25 mins ago" },
        { id: 3, name: "Charlie Davis", number: "+1 (555) 456-7890", status: "Voicemail", duration: "0:30", time: "1 hour ago" },
        { id: 4, name: "Diana Prince", number: "+1 (555) 321-0987", status: "Answered", duration: "1:15", time: "2 hours ago" },
    ];

    return (
        <div className="flex flex-col h-full bg-surface-base p-8 space-y-8 overflow-y-auto custom-scrollbar">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Call Analytics Overview</h2>
                <p className="text-text-secondary mt-1 text-sm">Real-time performance metrics and call history.</p>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Leads", value: stats.totalLeads, color: "text-white" },
                    { label: "Calls Today", value: stats.totalCallsToday, color: "text-brand-accent" },
                    { label: "Answer Rate", value: stats.answerRate, color: "text-green-400" },
                    { label: "Avg Duration", value: stats.avgDuration, color: "text-purple-400" },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300">
                        <span className="text-sm font-semibold text-text-secondary tracking-wider uppercase mb-4">{stat.label}</span>
                        <span className={`text-4xl font-light tracking-tight ${stat.color}`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                {/* Chart Area Mockup */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="text-sm font-semibold text-text-secondary tracking-wider uppercase mb-6 flex items-center justify-between">
                        <span>Activity Volume</span>
                        <span className="text-xs bg-white/5 py-1 px-3 rounded-full border border-white/5 text-white">Today</span>
                    </h3>
                    <div className="flex-1 flex items-end space-x-2 h-48 mt-auto border-b border-border-subtle pb-4">
                        {[40, 70, 45, 90, 65, 85, 120, 60, 40, 80, 110, 50].map((height, i) => (
                            <div key={i} className="flex-1 bg-surface-panel hover:bg-brand-accent/40 rounded-t-sm transition-all duration-300 cursor-pointer relative group" style={{ height: `${height}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-panel shadow-lg border border-border-subtle rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {height}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 text-[10px] text-text-secondary uppercase tracking-widest font-semibold">
                        <span>8 AM</span>
                        <span>12 PM</span>
                        <span>4 PM</span>
                        <span>8 PM</span>
                    </div>
                </div>

                {/* Recent Calls List */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col">
                    <h3 className="text-sm font-semibold text-text-secondary tracking-wider uppercase mb-6 flex items-center justify-between">
                        <span>Recent Logs</span>
                        <button className="text-brand-accent hover:text-white transition-colors text-xs font-medium">View All</button>
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {recentCalls.map((call) => (
                            <div key={call.id} className="p-4 rounded-xl bg-surface-panel border border-border-subtle hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-medium text-white">{call.name}</p>
                                        <p className="text-xs text-text-secondary font-mono mt-0.5">{call.number}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${call.status === "Answered" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                            call.status === "Voicemail" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}>
                                        {call.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-text-secondary mt-3">
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {call.duration}
                                    </span>
                                    <span>{call.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
