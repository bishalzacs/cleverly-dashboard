import { config } from "dotenv";
config({ path: ".env.local" });
import { mondayClient } from "./lib/mondayClient";
import { gql } from "graphql-request";

async function run() {
  try {
    const BOARD_ID = process.env.MONDAY_BOARD_ID || "";
    // Let's use the LOST_ID just as a test
    const LOST_ID = process.env.MONDAY_LOST_GROUP_ID || "new_group62617__1";
    
    console.log("BOARD_ID:", BOARD_ID);
    console.log("LOST_ID:", LOST_ID);

    const firstQuery = gql`
      query($boardId: [ID!], $groupId: [String!]) {
        boards(ids: $boardId) {
          groups(ids: $groupId) {
            items_page(limit: 10) {
              cursor
              items {
                id name created_at
                column_values { id text value }
              }
            }
          }
        }
      }
    `;
    const data: any = await mondayClient.request(firstQuery, {
      boardId: [BOARD_ID],
      groupId: [LOST_ID]
    });
    console.log("Query Response items count:", data?.boards?.[0]?.groups?.[0]?.items_page?.items?.length);
    console.log("Data Response Summary:", JSON.stringify(data).substring(0, 200));

  } catch(e: any) {
    console.error("GraphQL Error:", e.response ? JSON.stringify(e.response, null, 2) : e.message);
  }
}
run();
