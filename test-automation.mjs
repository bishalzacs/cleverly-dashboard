import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTransition() {
    console.log("--- Testing Lead Stage Transition Automation ---");
    
    // 1. Find a lead in 'new_lead' stage
    const { data: lead, error: fetchError } = await supabase
        .from("leads")
        .select("id, pipeline_stage, call_attempts")
        .eq("pipeline_stage", "new_lead")
        .limit(1)
        .single();
    
    if (fetchError || !lead) {
        console.error("No lead in 'new_lead' stage found to test:", fetchError?.message);
        return;
    }
    
    console.log(`Initial State: Lead ${lead.id}, Stage: ${lead.pipeline_stage}, Attempts: ${lead.call_attempts}`);
    
    // 2. Call the RPC to log an interaction
    console.log("Calling increment_lead_calls RPC...");
    const { error: rpcError } = await supabase.rpc("increment_lead_calls", {
        target_lead_id: lead.id,
        connected: false,
        is_attempt: true
    });
    
    if (rpcError) {
        console.error("RPC Error:", rpcError.message);
        return;
    }
    
    // 3. Verify the change
    const { data: updatedLead } = await supabase
        .from("leads")
        .select("id, pipeline_stage, call_attempts")
        .eq("id", lead.id)
        .single();
    
    console.log(`Updated State: Lead ${updatedLead?.id}, Stage: ${updatedLead?.pipeline_stage}, Attempts: ${updatedLead?.call_attempts}`);
    
    if (updatedLead?.pipeline_stage === "first_attempt") {
        console.log("✅ SUCCESS: Lead moved to 'first_attempt' stage!");
    } else {
        console.log("❌ FAILURE: Lead stage did not change.");
    }
}

testTransition();
