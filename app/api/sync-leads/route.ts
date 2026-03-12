import { NextResponse } from "next/server";
import { getLostLeads } from "@/services/mondayService";
import { createClient } from "@supabase/supabase-js";

export async function POST(_request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const leads = await getLostLeads();

        if (!leads || leads.length === 0) {
            return NextResponse.json({ success: true, message: "No leads to sync", count: 0 });
        }

        const recordsToUpsert = leads.map((lead) => ({
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

        // Upsert in batches of 200 to avoid payload limits
        const batchSize = 200;
        for (let i = 0; i < recordsToUpsert.length; i += batchSize) {
            const batch = recordsToUpsert.slice(i, i + batchSize);
            const { error } = await supabase.from("leads").upsert(batch, { onConflict: "id" });
            if (error) {
                console.error("Supabase upsert error:", error);
                throw new Error(error.message);
            }
        }

        return NextResponse.json({ success: true, count: leads.length });
    } catch (error: any) {
        console.error("Sync Route Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to sync leads" },
            { status: 500 }
        );
    }
}
