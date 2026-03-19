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
        const leads = await getLostLeads();

        if (!leads || leads.length === 0) {
            console.log("[Sync] No leads returned from Monday.com.");
            return NextResponse.json({ success: true, message: "No leads to sync", mondayCount: 0, dbCount: 0 });
        }

        console.log(`[Sync] Monday.com returned ${leads.length} leads.`);

        // 1. Upsert in batches of 200
        //    Key: we do NOT touch pipeline_stage, call_attempts, last_call_at, is_connected
        //    These are managed by call tracking — syncing Monday should never overwrite them.
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

        // 2. Tombstone: delete leads no longer in any of the 3 allowed Monday groups
        //    This prevents "ghost leads" from accumulating in the DB
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

        // 3. Count validation
        const { count: dbCount } = await supabase.from("leads").select("*", { count: "exact", head: true });
        console.log(`[Sync] Final DB count: ${dbCount} | Monday count: ${leads.length}`);

        return NextResponse.json({
            success: true,
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
