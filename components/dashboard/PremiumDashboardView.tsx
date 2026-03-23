"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";

const PIPELINE_STAGES = [
    { id: "new_lead", label: "New Lead", color: "#3B82F6" },
    { id: "first_attempt", label: "1st Attempt", color: "#EAB308" },
    { id: "second_attempt", label: "2nd Attempt", color: "#F97316" },
    { id: "third_attempt", label: "3rd Attempt", color: "#EF4444" },
    { id: "call_received", label: "Not Answered", color: "#F43F5E" },
    { id: "interested", label: "Interested", color: "#10B981" },
    { id: "closed", label: "Booked", color: "#14B8A6" },
];

export const PremiumDashboardView = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
      try {
          setIsLoading(true);
          const res = await fetch(`/api/analytics?range=week`);
          const json = await res.json();
          if (json.success) setData(json.data);
      } catch (e) {
          console.error("Failed to fetch analytics", e);
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
      fetchAnalytics();
  }, [fetchAnalytics]);

  const getStatusColor = (status: string) => {
    switch (status) {
        case "connected": return "#10B981";
        case "no_answer": return "#F43F5E";
        case "failed": return "#F59E0B";
        default: return "#3B82F6";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 h-full overflow-y-auto custom-scrollbar animate-fade-in slide-in-from-bottom-4">
      
      {/* Top Section: Hero Stat & Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Total Leads Card */}
        <div className="md:col-span-4 bg-[#111116] rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover-float">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-all duration-700"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <span className="text-text-secondary text-sm font-medium">Total Managed Leads</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-text-secondary bg-white/5 px-3 py-1 rounded-full border border-white/5">This Week</span>
            </div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                {isLoading ? "..." : (data?.totalLeads?.toLocaleString() || "0")}
            </h1>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-text-secondary">Avg Session:</span>
              <span className="text-[#10B981] flex items-center bg-[#10B981]/10 px-2 py-0.5 rounded text-xs font-semibold">
                {isLoading ? "..." : (data?.avgDuration || "0:00")}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                <div>
                   <span className="text-[10px] uppercase tracking-widest text-text-secondary block mb-1">Calls</span>
                   <span className="text-sm font-bold text-white">{isLoading ? "..." : data?.callsInPeriod}</span>
                </div>
                <div>
                   <span className="text-[10px] uppercase tracking-widest text-text-secondary block mb-1">Attempts/Lead</span>
                   <span className="text-sm font-bold text-white">{isLoading ? "..." : data?.avgAttempts}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Pipeline Distribution Scroll */}
        <div className="md:col-span-8 bg-[#111116] rounded-2xl p-6 border border-white/5 flex flex-col hover-float">
          <div className="flex justify-between items-center mb-6">
            <span className="text-text-secondary text-sm font-medium">Pipeline Distribution</span>
            <div className="flex space-x-2">
              <button className="text-xs text-white bg-white/5 px-4 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-colors">Manage Full Pipeline</button>
            </div>
          </div>
          
          {/* Pipeline Cards Row */}
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar flex-1 items-stretch">
            {PIPELINE_STAGES.map((stage) => {
                const count = data?.pipelineDistribution?.[stage.id] ?? 0;
                const percentage = data?.totalLeads ? Math.round((count / data.totalLeads) * 100) : 0;
                
                return (
                    <div key={stage.id} className="min-w-[140px] bg-[#1A1A22] rounded-xl p-4 border border-white/5 flex flex-col justify-between group cursor-pointer hover:bg-[#20202A] transition-colors relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl transition-all opacity-20 group-hover:opacity-40" style={{ backgroundColor: stage.color }}></div>
                        <div className="mb-4 relative z-10">
                            <p className="text-2xl font-semibold text-white tracking-tight">{isLoading ? "-" : count}</p>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-[10px] font-medium" style={{ color: stage.color }}>{percentage}% of leads</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-end relative z-10 w-full">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary w-full truncate">{stage.label}</span>
                        </div>
                    </div>
                )
            })}
          </div>
        </div>
      </div>

      {/* Middle Section: System Performance Chart */}
      <div className="bg-[#111116] rounded-2xl p-6 border border-white/5 hover-float cursor-default">
        <div className="flex justify-between items-center mb-8">
            <span className="text-text-secondary text-sm font-medium">Weekly Call Volume</span>
            <div className="flex space-x-2">
                {['1D', '1W', '1M', '6M', '1Y'].map(time => (
                    <button key={time} className={`w-10 h-10 rounded-full text-xs font-medium transition-all ${time === '1W' ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(0,102,255,0.4)]' : 'bg-transparent text-text-secondary border border-white/10 hover:text-white hover:bg-white/5'}`}>
                        {time}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Call Volume SVG Chart styled precisely to match Crypto Reference */}
        <div className="h-64 w-full relative group">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                {/* Defs for gradients */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0066FF" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#0066FF" stopOpacity="0.0"></stop>
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0066FF"></stop>
                        <stop offset="50%" stopColor="#4D94FF"></stop>
                        <stop offset="100%" stopColor="#0066FF"></stop>
                    </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <path d="M0,40 L1000,40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                <path d="M0,80 L1000,80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                <path d="M0,120 L1000,120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                <path d="M0,160 L1000,160" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                
                {/* Area Fill */}
                <path d="M0,50 C100,50 150,120 200,120 C250,120 300,90 350,90 C400,90 420,110 450,110 C500,110 520,70 580,70 C650,70 700,50 780,50 C850,50 900,100 950,100 L1000,120 L1000,200 L0,200 Z" fill="url(#chartGradient)" />
                
                {/* Line */}
                <path d="M0,50 C100,50 150,120 200,120 C250,120 300,90 350,90 C400,90 420,110 450,110 C500,110 520,70 580,70 C650,70 700,50 780,50 C850,50 900,100 950,100 L1000,120" fill="none" stroke="url(#lineGradient)" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(0,102,255,0.5)]" />
                
                {/* Tooltip dot */}
                <circle cx="450" cy="110" r="5" fill="#0066FF" className="drop-shadow-[0_0_10px_rgba(0,102,255,1)] opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Vertical dash line for tooltip */}
                <path d="M450,110 L450,200" stroke="#0066FF" strokeWidth="1" strokeDasharray="4 4" className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </svg>

            {/* CSS Tooltip positioned absolutely for visual match */}
            <div className="absolute top-[10%] left-[45%] -translate-x-1/2 -translate-y-[120%] bg-[#1A1A22] border border-white/10 rounded-xl p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20 w-48 pointer-events-none">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest">Peak Volume</span>
                    <span className="text-[10px] text-text-secondary tracking-widest">...</span>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-white text-lg font-bold tracking-tight">{isLoading ? "-" : "248"} Calls</span>
                    <span className="bg-[#10B981]/10 text-[#10B981] text-[10px] px-1.5 py-0.5 rounded flex items-center">
                        <svg className="w-2.5 h-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        12%
                    </span>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#1A1A22]"></div>
            </div>

            {/* Y axis labels mapped for calls instead of stock price */}
            <div className="absolute left-0 top-0 h-[200px] flex flex-col justify-between text-[9px] text-text-secondary py-1 pointer-events-none">
                <span>500</span>
                <span>375</span>
                <span>250</span>
                <span>125</span>
                <span>0</span>
            </div>

            {/* X axis labels for week days */}
            <div className="flex justify-between w-[95%] mx-auto mt-4 text-[9px] text-text-secondary px-2 uppercase tracking-widest">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
            </div>
        </div>
      </div>

      {/* Bottom Section: Recent Interactions & Agent Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Interaction Log Table */}
        <div className="lg:col-span-8 bg-[#111116] rounded-2xl p-6 border border-white/5 hover-float">
            <div className="flex justify-between items-center mb-6">
                <span className="text-text-secondary text-sm font-medium">Recent Interactions</span>
                <div className="flex space-x-1 bg-[#1A1A22] border border-white/5 p-1 rounded-full">
                    {['All', 'Connected', 'Missed'].map(filter => (
                        <button key={filter} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === 'All' ? 'bg-brand-primary text-white shadow-md' : 'text-text-secondary hover:text-white'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar min-h-[250px]">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-white/5 text-xs text-text-secondary pb-4 uppercase tracking-wider">
                            <th className="pb-4 font-normal">Contact</th>
                            <th className="pb-4 font-normal">Dialed Number</th>
                            <th className="pb-4 font-normal">Status</th>
                            <th className="pb-4 font-normal">Sales Rep</th>
                            <th className="pb-4 font-normal">Time <span className="opacity-50 text-[10px]">↓</span></th>
                            <th className="pb-4 font-normal text-right">Waveform</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {isLoading ? (
                           <tr><td colSpan={6} className="text-center py-10 text-text-secondary">Loading activity feed...</td></tr>
                        ) : data?.recentCalls?.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-text-secondary">No recent calls to display.</td></tr>
                        ) : (
                            data?.recentCalls?.slice(0, 5).map((call: any, idx: number) => {
                                const color = getStatusColor(call.status);
                                const isConnected = call.status === 'connected';
                                
                                return (
                                <tr key={call.id || idx} className="border-b border-white/5 group transition-colors hover:bg-white/5">
                                    <td className="py-4 flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs text-text-secondary">
                                            {call.lead_name ? call.lead_name.charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <span className="font-semibold text-white max-w-[150px] truncate">{call.lead_name || "Unknown"}</span>
                                    </td>
                                    <td className="py-4 text-white opacity-80 text-xs">{call.phone}</td>
                                    <td className="py-4">
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color: color }}>
                                            {call.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-text-secondary text-xs truncate max-w-[100px]">{call.agent_email?.split('@')[0] || "System"}</td>
                                    <td className="py-4 text-text-secondary text-xs">{formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}</td>
                                    <td className="py-4 text-right">
                                        {/* Generating dynamic looking neon sparklines based on call outcome */}
                                        <svg className="w-12 h-4 inline-block drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]" viewBox="0 0 50 20" preserveAspectRatio="none">
                                            {isConnected ? (
                                                <>
                                                 <path d="M0,15 Q10,20 20,10 T40,5 L50,0" fill="none" stroke={color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
                                                 <circle cx="50" cy="0" r="2" fill={color} />
                                                </>
                                            ) : (
                                                <>
                                                 <path d="M0,5 Q10,0 20,10 T40,15 L50,20" fill="none" stroke={color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
                                                 <circle cx="50" cy="20" r="2" fill={color} />
                                                </>
                                            )}
                                        </svg>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Rep Leaderboard (Replacing Watchlist) */}
        <div className="lg:col-span-4 bg-[#111116] rounded-2xl p-6 border border-white/5 hover-float">
            <div className="flex justify-between items-center mb-6">
                <span className="text-text-secondary text-sm font-medium">Rep Leaderboard</span>
            </div>
            {/* Filter Pills */}
            <div className="flex space-x-1 mb-6">
                {['Activity', 'Bookings'].map(filter => (
                    <button key={filter} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${filter === 'Activity' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-transparent border-white/10 text-text-secondary hover:text-white hover:bg-white/5'}`}>
                        {filter}
                    </button>
                ))}
            </div>

            <div className="flex flex-col space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-4 text-text-secondary text-xs">Loading agents...</div>
                ) : !data?.agentList?.length ? (
                    <div className="text-center py-4 text-text-secondary text-xs">No active reps found.</div>
                ) : (
                    data.agentList.map((agent: any, i: number) => (
                        <div key={agent.id} className="flex justify-between items-center group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center space-x-3 w-3/4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-text-secondary group-hover:bg-brand-primary/20 transition-colors group-hover:text-brand-primary">
                                    {agent.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-white truncate">{agent.email.split('@')[0]}</span>
                                    <span className="text-[10px] text-text-secondary truncate">{agent.email}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold text-white">#{i + 1}</span>
                                {/* Mocking an activity trend percent for visualization layout matching */}
                                <span className="text-[10px] text-[#10B981] font-medium">Live</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>

    </div>
  );
};
