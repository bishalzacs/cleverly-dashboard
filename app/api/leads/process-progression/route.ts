import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Execute Atomic Progression RPC
        const { data: rpcResults, error: rpcError } = await supabase.rpc('process_lead_progressions');

        if (rpcError) {
            return NextResponse.json({ success: false, error: rpcError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: rpcResults });
    } catch (error: any) {
        console.error("Automated Progression Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
