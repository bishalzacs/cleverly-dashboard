import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { lead_id, lead_name, phone, status, duration_seconds, agent_id, agent_email, outcome, sessionId } = body;

        if (!phone || !status) {
            return NextResponse.json({ success: false, error: "phone and status are required" }, { status: 400 });
        }

        // 1. Insert call log
        const { data: callLog, error: logError } = await supabase.from("call_logs").insert({
            lead_id: lead_id || null,
            lead_name: lead_name || null,
            phone,
            status,
            duration_seconds: duration_seconds || 0,
            agent_id: user.id, // Use real user ID from auth
            agent_email: user.email,
            outcome: outcome || null,
        }).select().single();

        if (logError) throw new Error(logError.message);

        // 2. Update lead stats if lead_id is provided
        if (lead_id) {
            const { error: updateError } = await supabase.rpc('increment_lead_calls', { 
                target_lead_id: lead_id,
                connected: outcome === 'Connected',
                is_attempt: outcome !== 'Voicemail'
            });

            if (updateError) {
                console.error("Failed to update lead stats via RPC:", updateError);
            }
        }

        return NextResponse.json({ success: true, data: callLog });
    } catch (error: any) {
        console.error("Log Call Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
