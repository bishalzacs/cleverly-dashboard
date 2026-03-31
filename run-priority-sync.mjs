import { config } from "dotenv";
config({ path: ".env.local" });
import { getLostLeads } from "./services/mondayService.js";
import { createClient } from "@supabase/supabase-js";

async function runPrioritySync() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("[PrioritySync] Starting Lead Rebuild (New-to-Old)...");
  
  try {
    const { leads, isComplete } = await getLostLeads();
    console.log(`[PrioritySync] Received ${leads.length} leads. Complete: ${isComplete}`);

    const syncStartTime = new Date().toISOString();
    const batchSize = 100; // Smaller batches for better logging
    let totalUpserted = 0;

    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize).map((lead) => ({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        status: lead.status,
        created_date: lead.monday_created_at ? new Date(lead.monday_created_at).toISOString() : null,
        monday_created_at: lead.monday_created_at ? new Date(lead.monday_created_at).toISOString() : null,
        owner: lead.owner || null,
        interested_in: lead.interested_in || null,
        notes: lead.notes || null,
        company: lead.company || null,
        sales_call_date: lead.sales_call_date || null,
        deal_value: lead.deal_value ?? null,
        plan_type: lead.plan_type || null,
        group_id: lead.group_id || null,
        updated_at: syncStartTime,
      }));

      const { error } = await supabase.from("leads").upsert(batch, { onConflict: "id" });
      if (error) {
        console.error(`[PrioritySync] ERROR at batch ${i}:`, error.message);
        throw error;
      }
      
      totalUpserted += batch.length;
      process.stdout.write(`\rUpserted: ${totalUpserted}/${leads.length} (${Math.round((totalUpserted/leads.length)*100)}%)`);

      // Special check for David
      const david = batch.find(l => l.name.toLowerCase().includes("david d"));
      if (david) {
        console.log(`\n✨ TARGET FOUND: David D'Angelo (ID: ${david.id}) successfully upserted to DB.`);
      }
    }

    console.log(`\n[PrioritySync] Sync complete. Total database leads: ${totalUpserted}`);
    
  } catch (err) {
    console.error("\n[PrioritySync] Sync FATAL:", err);
  }
}

runPrioritySync();
