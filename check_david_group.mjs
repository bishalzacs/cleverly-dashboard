import { config } from "dotenv";
config({ path: ".env.local" });
import { mondayClient } from "./lib/mondayClient.ts";
import { gql } from "graphql-request";

async function findDavid() {
  const query = gql`
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 100, query_params: {order_by: [{column_id: "last_updated__1", direction: desc}]}) {
          items {
            id
            name
            created_at
            group { id title }
            column_values {
              id
              text
              value
            }
          }
        }
      }
    }
  `;
  
  try {
    const data: any = await mondayClient.request(query, { boardId: [process.env.MONDAY_BOARD_ID] });
    const items = data.boards[0].items_page.items;
    
    console.log("Searching for David D'Angelo in top 100 DESC items...");
    const david = items.find((i: any) => i.name.toLowerCase().includes("david d"));
    
    if (david) {
      console.log("Found David D'Angelo!");
      console.log("Group ID:", david.group.id);
      console.log("Group Title:", david.group.title);
      console.log("Created At:", david.created_at);
      console.log("Columns:", JSON.stringify(david.column_values.filter((cv: any) => cv.id.includes("phone")), null, 2));
    } else {
      console.log("David D'Angelo not found in top 100 DESC items.");
      // Check first few items to see what the actual order is
      console.log("Top 5 items in current sort:");
      items.slice(0, 5).forEach((i: any) => console.log(`- ${i.name} (${i.created_at})`));
    }
  } catch (err) {
    console.error("Error searching Monday:", err);
  }
}

findDavid();
