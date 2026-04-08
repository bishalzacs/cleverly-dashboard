require('dotenv').config({ path: '.env.local' });
const { GraphQLClient, gql } = require('graphql-request');
const { createClient } = require('@supabase/supabase-js');

const MONDAY_API_KEY = process.env.MONDAY_API_KEY;
const BOARD_ID = process.env.MONDAY_BOARD_ID;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const mondayClient = new GraphQLClient("https://api.monday.com/v2", {
  headers: {
    Authorization: MONDAY_API_KEY,
    "API-Version": "2023-10",
  },
});

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runStandaloneSync() {
  console.log("--- Starting Standalone Sync ---");
  
  const query = gql`
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 50, query_params: {order_by: [{column_id: "last_updated__1", direction: desc}]}) {
          items {
            id name created_at updated_at
            group { id }
            column_values { id text value }
          }
        }
      }
    }
  `;

  try {
    const data = await mondayClient.request(query, { boardId: [BOARD_ID] });
    const items = data.boards[0].items_page.items;
    console.log(`Fetched ${items.length} items from Monday (DESC sorted).`);

    const mapped = items.map(item => ({
      id: item.id,
      name: item.name,
      phone: item.column_values.find(cv => cv.id === "phone__1")?.text || "",
      email: item.column_values.find(cv => cv.id === "email__1")?.text || "",
      status: item.column_values.find(cv => cv.id === "status__1" || cv.id.includes("color"))?.text || "",
      monday_created_at: item.created_at,
      monday_updated_at: item.updated_at,
      group_id: item.group.id,
      updated_at: new Date().toISOString()
    })).filter(l => l.phone);

    console.log(`Filtered to ${mapped.length} leads with phone numbers.`);
    
    const david = mapped.find(l => l.name.toLowerCase().includes("david d"));
    if (david) {
      console.log("⚡ David D'Angelo is in the sync list!");
    } else {
      console.log("❌ David D'Angelo NOT in top 50. Sorting or filtering issue.");
    }

    const { error } = await supabase.from('leads').upsert(mapped);
    if (error) {
      console.error("Supabase error:", error.message);
    } else {
      console.log("✅ Sync complete. Top leads are now in Supabase.");
    }

  } catch (err) {
    console.error("Fatal error:", err);
  }
}

runStandaloneSync();
