import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const body = await request.json();
        const { lead_id, lead_name, phone, status, duration_seconds, agent_id, agent_email } = body;

        if (!phone || !status) {
            return NextResponse.json({ success: false, error: "phone and status are required" }, { status: 400 });
        }

        const { data, error } = await supabase.from("call_logs").insert({
            lead_id: lead_id || null,
            lead_name: lead_name || null,
            phone,
            status,
            duration_seconds: duration_seconds || 0,
            agent_id: agent_id || null,
            agent_email: agent_email || null,
        }).select().single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Log Call Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
