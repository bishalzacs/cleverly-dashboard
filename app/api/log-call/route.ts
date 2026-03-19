import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const body = await request.json();
        const { lead_id, lead_name, phone, status, duration_seconds, agent_id, agent_email, outcome } = body;

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
            agent_id: agent_id || null,
            agent_email: agent_email || null,
            outcome: outcome || null,
        }).select().single();

        if (logError) throw new Error(logError.message);

        // 2. Update lead stats if lead_id is provided
        if (lead_id) {
            const updateProps: any = {
                last_call_at: new Date().toISOString(),
                // Increment call_attempts using sql fragment if possible, 
                // but since we are in a simple route, we'll fetch then update or use RPC if needed.
                // Supabase doesn't have a direct "increment" in JS client easily without raw SQL or RPC for specific columns 
                // UNLESS we use the .rpc('increment_call_attempts', { lead_id })
            };

            if (outcome === 'Connected') {
                updateProps.is_connected = true;
            }

            const { error: updateError } = await supabase.rpc('increment_lead_calls', { 
                target_lead_id: lead_id,
                connected: outcome === 'Connected',
                is_attempt: outcome !== 'Voicemail'
            });

            if (updateError) {
                console.error("Failed to update lead stats via RPC:", updateError);
                throw new Error("Lead update failed: " + updateError.message);
            }
        }

        return NextResponse.json({ success: true, data: callLog });
    } catch (error: any) {
        console.error("Log Call Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
