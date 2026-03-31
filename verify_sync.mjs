import { config } from "dotenv";
config({ path: ".env.local" });

import { getLostLeads } from "./services/mondayService.ts";
import { createClient } from "@supabase/supabase-js";

async function verifySync() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log("Running getLostLeads from the terminal-processed service...");
  const { leads, isComplete } = await getLostLeads();
  console.log(`Leads found: ${leads.length}, Complete: ${isComplete}`);
  
  const david = leads.find(l => l.name.toLowerCase().includes("david d"));
  if (david) {
    console.log("✅ David D'Angelo was found in the parsed results.");
    
    const recordsToSync = leads.map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        email: l.email,
        status: l.status,
        monday_created_at: l.monday_created_at,
        group_id: l.group_id,
        updated_at: new Date().toISOString()
    }));

    console.log(`Upserting ${recordsToSync.length} leads...`);
    const { error } = await supabase.from('leads').upsert(recordsToSync);
    if (error) console.error("Upsert error:", error.message);
    else console.log("✅ Sync successful. David D'Angelo should be in the DB now.");
  } else {
    console.log("❌ David D'Angelo was NOT found in the parsed leads. Filtering issue?");
    
    // Debug: check why David was missing from the filtered list.
    // David should be in raw items. Let's see how many were fetched initially.
  }
}

verifySync();
