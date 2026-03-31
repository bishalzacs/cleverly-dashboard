import 'dotenv/config'; 
import { getLostLeads } from "./services/mondayService";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sync() {
    console.log("Fetching leads from Monday...");
    const { leads } = await getLostLeads();
    console.log(`Fetched ${leads.length} leads. Upserting into Supabase...`);

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
        group_id: lead.group_id || null, // <--- Add this!
    }));

    const batchSize = 200;
    for (let i = 0; i < recordsToUpsert.length; i += batchSize) {
        const batch = recordsToUpsert.slice(i, i + batchSize);
        const { error } = await supabase.from("leads").upsert(batch, { onConflict: "id" });
        if (error) {
            console.error("Supabase upsert error:", error);
        } else {
            console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}`);
        }
    }
    console.log("Done!");
}

sync();
