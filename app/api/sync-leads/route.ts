import { NextResponse } from "next/server";
import { getLostLeads } from "@/services/mondayService";
import { createClient } from "@supabase/supabase-js";

export async function POST(_request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log("[Sync] Fetching leads from Monday.com...");
        const { leads, isComplete } = await getLostLeads();

        console.log(`[Sync] Monday.com returned ${leads.length} leads. Complete: ${isComplete}`);

        const syncStartTime = new Date().toISOString();
        
        // 1. Upsert in batches of 200
        const batchSize = 250;
        let upsertedCount = 0;
        
        for (let i = 0; i < leads.length; i += batchSize) {
            const batch = leads.slice(i, i + batchSize).map((lead) => ({
                id: lead.id,
                name: lead.name,
                phone: lead.phone,
                email: lead.email,
                status: lead.status,
                created_date: lead.createdDate ? new Date(lead.createdDate).toISOString() : null,
                monday_created_at: lead.monday_created_at ? new Date(lead.monday_created_at).toISOString() : null,
                owner: lead.owner || null,
                interested_in: lead.interested_in || null,
                notes: lead.notes || null,
                company: lead.company || null,
                sales_call_date: lead.sales_call_date || null,
                deal_value: lead.deal_value ?? null,
                plan_type: lead.plan_type || null,
                group_id: lead.group_id || null,
                updated_at: syncStartTime, // Mark this item as seen in this sync
            }));

            // Log if David is in this batch for debugging
            const hasDavid = batch.find(l => l.name.toLowerCase().includes("david d"));
            if (hasDavid) {
                console.log("⚡ FOUND David D'Angelo in current upsert batch!");
            }

            const { error } = await supabase
                .from("leads")
                .upsert(batch, {
                    onConflict: "id",
                });

            if (error) {
                console.error("[Sync] Upsert batch error:", error.message);
                throw new Error(error.message);
            }
            upsertedCount += batch.length;
            console.log(`[Sync] Upserted batch ${Math.ceil((i + batchSize) / batchSize)} (${upsertedCount}/${leads.length})`);
        }

        // 2. Tombstone: ONLY if the fetch was complete and matches safety criteria. 
        if (isComplete && leads.length > 0) {
            // Get current DB count for safety check
            const { count: currentDbCount } = await supabase
                .from("leads")
                .select("*", { count: "exact", head: true });

            const dbCountBefore = currentDbCount || 0;
            
            // Safety Rule: Only tombstone if we fetched at least 80% of the current DB size, 
            // or if the DB is very small (< 500) where risk is low.
            const isSafeToTombstone = leads.length > (dbCountBefore * 0.8) || dbCountBefore < 500;

            if (isSafeToTombstone) {
                console.log("[Sync] Exhaustive sync complete and verified. Removing ghost leads (not seen in this sync)...");
                const { error: deleteError } = await supabase
                    .from("leads")
                    .delete()
                    .lt("updated_at", syncStartTime);
                
                if (deleteError) {
                    console.warn("[Sync] Ghost deletion (timestamp-based) error:", deleteError.message);
                }
            } else {
                console.log(`[Sync] WARNING: Potential partial sync (${leads.length} fetched vs ${dbCountBefore} in DB). Skipping tombstone to protect data.`);
            }
        } else {
            console.log("[Sync] Partial sync (Newest First) or 0 leads fetched. Skipping tombstoning.");
        }

        // 3. Status Report
        const { count: dbCount } = await supabase.from("leads").select("*", { count: "exact", head: true });
        
        return NextResponse.json({
            success: true,
            isComplete,
            mondayCount: leads.length,
            dbCount,
            upsertedCount,
        });

    } catch (error: any) {
        console.error("[Sync] Fatal error during sync:", error.message);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to sync leads" },
            { status: 500 }
        );
    }
}
