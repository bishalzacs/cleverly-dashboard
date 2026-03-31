import { config } from "dotenv";
config({ path: ".env.local" });

import { mondayClient } from "./lib/mondayClient.ts";
import { gql } from "graphql-request";
import { createClient } from "@supabase/supabase-js";

async function forceSync() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const query = gql`
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 50, query_params: {order_by: [{column_id: "last_updated__1", direction: desc}]}) {
          items {
            id name created_at
            group { id }
            column_values { id text value }
          }
        }
      }
    }
  `;
  
  const data: any = await mondayClient.request(query, { boardId: [process.env.MONDAY_BOARD_ID] });
  const items = data.boards[0].items_page.items;
  
  const david = items.find((i: any) => i.name.toLowerCase().includes("david d"));
  if (!david) {
    console.log("David not in top 50.");
    return;
  }

  const lead = {
    id: david.id,
    name: david.name,
    phone: david.column_values.find((cv: any) => cv.id === "phone__1")?.text || "",
    monday_created_at: david.created_at,
    group_id: david.group.id,
    updated_at: new Date().toISOString()
  };

  console.log("Manually adding David D'Angelo...");
  const { error } = await supabase.from("leads").upsert([lead]);
  if (error) console.error("Error:", error.message);
  else console.log("✅ David D'Angelo is now in the database.");
}

forceSync();
