import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Run all queries in parallel
        const [
            totalLeadsResult,
            callsTodayResult,
            recentCallsResult,
            allCallsResult,
        ] = await Promise.all([
            // Total leads in DB
            supabase.from("leads").select("*", { count: "exact", head: true }),
            // Calls made today
            supabase.from("call_logs").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
            // Recent 20 calls with details
            supabase.from("call_logs").select("*").order("created_at", { ascending: false }).limit(20),
            // All calls for answering rate calc
            supabase.from("call_logs").select("status, duration_seconds"),
        ]);

        const totalLeads = totalLeadsResult.count ?? 0;
        const callsToday = callsTodayResult.count ?? 0;

        const allCalls = allCallsResult.data ?? [];
        const connectedCalls = allCalls.filter((c) => c.status === "connected");
        const totalDuration = connectedCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
        const avgDurationSeconds = connectedCalls.length > 0 ? Math.round(totalDuration / connectedCalls.length) : 0;
        const avgDuration = `${Math.floor(avgDurationSeconds / 60)}:${String(avgDurationSeconds % 60).padStart(2, "0")}`;
        const answerRate = allCalls.length > 0 ? ((connectedCalls.length / allCalls.length) * 100).toFixed(1) + "%" : "0%";

        return NextResponse.json({
            success: true,
            data: {
                totalLeads,
                callsToday,
                answerRate,
                avgDuration: avgDuration === "0:00" ? "—" : avgDuration,
                recentCalls: recentCallsResult.data ?? [],
                totalCalls: allCalls.length,
            },
        });
    } catch (error: any) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
