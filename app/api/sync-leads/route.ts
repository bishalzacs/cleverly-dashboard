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

        if (!leads || leads.length === 0) {
            console.log("[Sync] No leads returned from Monday.com.");
            return NextResponse.json({ success: true, message: "No leads to sync", mondayCount: 0, dbCount: 0 });
        }

        console.log(`[Sync] Monday.com returned ${leads.length} leads. Complete: ${isComplete}`);

        // 1. Upsert in batches of 200
        const batchSize = 200;
        let upsertedCount = 0;
        const validMondayIds = leads.map((l) => l.id);

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
                updated_at: new Date().toISOString(),
            }));

            const { error } = await supabase
                .from("leads")
                .upsert(batch, {
                    onConflict: "id",
                    ignoreDuplicates: false,
                });

            if (error) {
                console.error("[Sync] Upsert batch error:", error.message);
                throw new Error(error.message);
            }
            upsertedCount += batch.length;
            console.log(`[Sync] Upserted batch ${Math.ceil((i + batchSize) / batchSize)} (${upsertedCount}/${leads.length})`);
        }

        // 2. Tombstone: ONLY if the fetch was complete. 
        //    If it was a partial sync (fast polling), we don't know what's deleted, so we skip this.
        if (isComplete) {
            console.log("[Sync] Exhaustive sync complete. Checking for ghost leads...");
            const { data: ghostLeads, error: ghostError } = await supabase
                .from("leads")
                .select("id")
                .not("id", "in", `(${validMondayIds.join(",")})`);

            if (ghostError) {
                console.warn("[Sync] Could not fetch ghost leads:", ghostError.message);
            } else if (ghostLeads && ghostLeads.length > 0) {
                const ghostIds = ghostLeads.map((g: any) => g.id);
                console.log(`[Sync] Removing ${ghostIds.length} ghost leads no longer in Monday...`);
                const { error: deleteError } = await supabase.from("leads").delete().in("id", ghostIds);
                if (deleteError) console.warn("[Sync] Ghost deletion error:", deleteError.message);
            }
        } else {
            console.log("[Sync] Partial sync (Newest First). Skipping tombstoning to protect existing data.");
        }

        // 3. Count validation & Latest Timestamp
        const { count: dbCount } = await supabase.from("leads").select("*", { count: "exact", head: true });
        
        // Fetch newest lead to verify updated_at freshness
        const { data: latestLeads } = await supabase
            .from("leads")
            .select("name, updated_at")
            .order("updated_at", { ascending: false })
            .limit(1);
            
        console.log(`[Sync] Final DB count: ${dbCount} | Monday count: ${leads.length}`);
        if (latestLeads && latestLeads.length > 0) {
            console.log(`[Sync] ⚡ Latest lead updated: ${latestLeads[0].name} at ${latestLeads[0].updated_at}`);
        }

        return NextResponse.json({
            success: true,
            isComplete,
            mondayCount: leads.length,
            dbCount,
            upsertedCount,
        });

    } catch (error: any) {
        console.error("[Sync] Fatal error:", error.message);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to sync leads" },
            { status: 500 }
        );
    }
}
