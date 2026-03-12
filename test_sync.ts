import 'dotenv/config'; 
import { getLostLeads } from "./services/mondayService";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function run() {
    try {
        console.log("Fetching leads from Monday...");
        const leads = await getLostLeads();
        console.log(`Found ${leads.length} leads in target groups.`);
        
        if (!leads || leads.length === 0) {
            console.log("No leads to sync");
            return;
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
        }));

        const batchSize = 200;
        let upsertedCount = 0;
        for (let i = 0; i < recordsToUpsert.length; i += batchSize) {
            const batch = recordsToUpsert.slice(i, i + batchSize);
            const { error } = await supabase.from("leads").upsert(batch, { onConflict: "id" });
            if (error) {
                console.error("Supabase upsert error:", error);
                throw new Error(error.message);
            }
            upsertedCount += batch.length;
            console.log(`Upserted ${upsertedCount}/${recordsToUpsert.length}...`);
        }

        console.log("Sync Complete!");
    } catch (e: any) {
        console.error("Sync Failed. Writing to error.json");
        const fs = require('fs');
        fs.writeFileSync('error.json', JSON.stringify({ message: e.message, stack: e.stack }, null, 2));
    }
}

run();
