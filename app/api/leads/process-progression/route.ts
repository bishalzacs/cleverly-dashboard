import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const results = {
            movedToSecond: 0,
            movedToThird: 0,
            errors: [] as string[]
        };

        // 1. Process 1st Attempt -> 2nd Attempt (3 days wait)
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        const { data: leadsToSecond, error: error1 } = await supabase
            .from("leads")
            .select("id")
            .eq("pipeline_stage", "first_attempt")
            .eq("is_connected", false)
            .gte("call_attempts", 3)
            .lte("last_call_at", threeDaysAgo);

        if (error1) results.errors.push(`Error fetching 1st attempt leads: ${error1.message}`);
        
        if (leadsToSecond && leadsToSecond.length > 0) {
            const ids = leadsToSecond.map(l => l.id);
            const { error: updateError } = await supabase
                .from("leads")
                .update({ 
                    pipeline_stage: "second_attempt", 
                    call_attempts: 0,
                    updated_at: new Date().toISOString()
                })
                .in("id", ids);
            
            if (updateError) results.errors.push(`Error updating leads to 2nd attempt: ${updateError.message}`);
            else results.movedToSecond = ids.length;
        }

        // 2. Process 2nd Attempt -> 3rd Attempt (5 days wait)
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
        const { data: leadsToThird, error: error2 } = await supabase
            .from("leads")
            .select("id")
            .eq("pipeline_stage", "second_attempt")
            .eq("is_connected", false)
            .gte("call_attempts", 3)
            .lte("last_call_at", fiveDaysAgo);

        if (error2) results.errors.push(`Error fetching 2nd attempt leads: ${error2.message}`);

        if (leadsToThird && leadsToThird.length > 0) {
            const ids = leadsToThird.map(l => l.id);
            const { error: updateError } = await supabase
                .from("leads")
                .update({ 
                    pipeline_stage: "third_attempt", 
                    call_attempts: 0,
                    updated_at: new Date().toISOString()
                })
                .in("id", ids);

            if (updateError) results.errors.push(`Error updating leads to 3rd attempt: ${updateError.message}`);
            else results.movedToThird = ids.length;
        }

        return NextResponse.json({ success: true, data: results });
    } catch (error: any) {
        console.error("Automated Progression Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
