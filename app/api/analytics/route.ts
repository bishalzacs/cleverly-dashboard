import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get("agent_id");
        const range = searchParams.get("range") || "today"; // today, week, month, all

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Calculate time ranges
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        
        let startDate: string | null = null;
        if (range === "today") startDate = startOfToday;
        else if (range === "week") startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        else if (range === "month") startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Pipeline Stage Distribution
        const { data: pipelineStats } = await supabase.rpc("get_pipeline_stats");
        const pipelineDistribution: Record<string, number> = {};
        pipelineStats?.forEach((item: { stage: string; count: number }) => {
            pipelineDistribution[item.stage] = item.count;
        });

        // 2. Filtered Call Logs
        let callQuery = supabase.from("call_logs").select("*");
        if (agentId) callQuery = callQuery.eq("agent_id", agentId);
        if (startDate) callQuery = callQuery.gte("created_at", startDate);
        
        const { data: calls } = await callQuery.order("created_at", { ascending: false });
        const allCalls = calls || [];
        
        // 2.b Unrestricted Recent Calls for the interactions UI table
        let recentCallsQuery = supabase.from("call_logs").select("*")
            .order("created_at", { ascending: false })
            .limit(20);
        if (agentId) recentCallsQuery = recentCallsQuery.eq("agent_id", agentId);
        
        const { data: recentCallsData } = await recentCallsQuery;
        const recentCalls = recentCallsData || [];
        
        // 3. Aggregate Stats
        const connectedCalls = allCalls.filter((c: any) => c.status === "connected");
        const totalDuration = connectedCalls.reduce((sum: number, c: any) => sum + (c.duration_seconds || 0), 0);
        const avgDurationSeconds = connectedCalls.length > 0 ? Math.round(totalDuration / connectedCalls.length) : 0;
        
        const formatDuration = (seconds: number) => {
            if (seconds === 0) return "—";
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
        };

        const avgDuration = formatDuration(avgDurationSeconds);
        const answerRate = allCalls.length > 0 ? ((connectedCalls.length / allCalls.length) * 100).toFixed(1) + "%" : "0%";

        // Generate Chart Data dynamically based on historical buckets
        const chartDataMap: Record<string, number> = {};
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Pre-fill last 7 days for 'week' chart so chart has all 7 visual points even if 0 calls
        if (range === "week") {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                chartDataMap[daysOfWeek[d.getDay()]] = 0;
            }
        }

        allCalls.forEach((call: any) => {
            const d = new Date(call.created_at);
            let key = "";
            if (range === "today") {
                key = d.getHours() + ":00";
            } else if (range === "week") {
                key = daysOfWeek[d.getDay()];
            } else if (range === "month") {
                key = d.getDate().toString(); 
            } else {
                key = d.toLocaleString('default', { month: 'short' });
            }
            chartDataMap[key] = (chartDataMap[key] || 0) + 1;
        });

        const chartData = Object.keys(chartDataMap).map(k => ({
            label: k,
            value: chartDataMap[k]
        }));

        // 4. Fetch unique agents
        const { data: agentList } = await supabase.rpc("get_active_agents");

        // 5. Total Leads Count
        const { count: totalLeads } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true });

        // 6. Get Outcome Distribution
        const { data: outcomes } = await callQuery.select("outcome");
        
        const outcomeStats = {
            "Connected": 0,
            "No Answer": 0,
            "Busy": 0,
            "Wrong Number": 0
        } as Record<string, number>;

        if (outcomes) {
            outcomes.forEach(log => {
                if (log.outcome && outcomeStats[log.outcome] !== undefined) {
                    outcomeStats[log.outcome]++;
                }
            });
        }

        // 7. Get Lead Stats (for attempts)
        const { data: leadStats } = await supabase
            .from("leads")
            .select("call_attempts, is_connected");

        const totalAttempts = leadStats?.reduce((sum, l) => sum + (l.call_attempts || 0), 0) || 0;
        const avgAttempts = leadStats?.length ? (totalAttempts / leadStats.length).toFixed(1) : "0";

        return NextResponse.json({
            success: true,
            data: {
                totalLeads: totalLeads || 0,
                callsInPeriod: allCalls.length || 0,
                answerRate,
                avgDuration,
                recentCalls: recentCalls,
                pipelineDistribution,
                agentList: agentList || [],
                filteredStats: {
                    total: allCalls.length || 0,
                    connected: connectedCalls.length || 0
                },
                outcomeStats,
                avgAttempts,
                chartData
            }
        });
    } catch (error: any) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
