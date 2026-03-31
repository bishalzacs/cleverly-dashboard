import { config } from "dotenv";
config({ path: ".env.local" });

import { GraphQLClient, gql } from "graphql-request";
import { createClient } from "@supabase/supabase-js";

const MONDAY_API_KEY = process.env.MONDAY_API_KEY;
const BOARD_ID = process.env.MONDAY_BOARD_ID;
const PAGE_SIZE = 500;

const mondayClient = new GraphQLClient("https://api.monday.com/v2", {
  headers: {
    Authorization: MONDAY_API_KEY,
    "API-Version": "2023-10",
  },
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function syncAndCheck() {
  console.log("Fetching Page 1 sorted by newest first...");
  const firstQuery = gql`
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
  
  const data = await mondayClient.request(firstQuery, { boardId: [BOARD_ID] });
  const items = data.boards[0].items_page.items;
  
  console.log(`Fetched ${items.length} items.`);
  
  const david = items.find(i => i.name.toLowerCase().includes("david d"));
  if (!david) {
    console.error("❌ David D'Angelo NOT FOUND in top 50 sorted items.");
    return;
  }

  console.log("✅ David found. ID:", david.id);
  
  // Mapping logic to match the DB
  const leadToUpsert = {
    id: david.id,
    name: david.name,
    phone: david.column_values.find(cv => cv.id === "phone__1")?.text,
    monday_created_at: david.created_at,
    group_id: david.group.id,
    updated_at: new Date().toISOString()
  };

  console.log("Manually upserting David...");
  const { error } = await supabase.from("leads").upsert([leadToUpsert]);
  
  if (error) {
    console.error("Upsert failed:", error);
  } else {
    console.log("✅ Successfully upserted David D'Angelo.");
    
    // Verify he can be found via SQL now
    const { data: dbCheck } = await supabase.from("leads").select("*").eq("id", david.id);
    console.log("DB Check Result:", dbCheck);
  }
}

syncAndCheck();
