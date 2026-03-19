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

        // 1. Pipeline Stage Distribution (Using RPC for performance)
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
        
        // 3. Aggregate Stats
        const connectedCalls = allCalls.filter((c: any) => c.status === "connected");
        const totalDuration = connectedCalls.reduce((sum: number, c: any) => sum + (c.duration_seconds || 0), 0);
        const avgDurationSeconds = connectedCalls.length > 0 ? Math.round(totalDuration / connectedCalls.length) : 0;
        const avgDuration = `${Math.floor(avgDurationSeconds / 60)}:${String(avgDurationSeconds % 60).padStart(2, "0")}`;
        const answerRate = allCalls.length > 0 ? ((connectedCalls.length / allCalls.length) * 100).toFixed(1) + "%" : "0%";

        // 4. Fetch unique agents (Using RPC for performance)
        const { data: agentList } = await supabase.rpc("get_active_agents");

        // 5. Total Leads Count
        const { count: totalLeads } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true });

        // Helper function for duration formatting
        const formatDuration = (seconds: number) => {
            if (seconds === 0) return "—";
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
        };

        // 4. Get Outcome Distribution
        const { data: outcomes, error: outcomeError } = await callQuery
            .select("outcome");
        
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

        // 5. Get Lead Stats (for attempts)
        const { data: leadStats, error: leadStatsError } = await supabase
            .from("leads")
            .select("call_attempts, is_connected");

        const totalAttempts = leadStats?.reduce((sum, l) => sum + (l.call_attempts || 0), 0) || 0;
        const avgAttempts = leadStats?.length ? (totalAttempts / leadStats.length).toFixed(1) : "0";

        // Prepare variables for the new return structure
        const leadsCount = totalLeads;
        const callsCount = allCalls.length;
        const connectedCount = connectedCalls.length;
        const recentCalls = allCalls.slice(0, 20);
        const pipelineMap = pipelineDistribution;
        const agents = agentList;

        return NextResponse.json({
            success: true,
            data: {
                totalLeads: leadsCount || 0,
                callsInPeriod: callsCount || 0,
                answerRate: callsCount ? (Math.round((connectedCount / callsCount) * 100)) + "%" : "0%",
                avgDuration: formatDuration(avgDurationSeconds), // Use avgDurationSeconds here
                recentCalls: recentCalls || [],
                pipelineDistribution: pipelineMap,
                agentList: agents || [],
                filteredStats: {
                    total: callsCount || 0,
                    connected: connectedCount || 0
                },
                outcomeStats,
                avgAttempts
            }
        });
    } catch (error: any) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
