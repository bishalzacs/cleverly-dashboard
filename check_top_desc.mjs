import { config } from "dotenv";
config({ path: ".env.local" });
import { mondayClient } from "./lib/mondayClient.ts";
import { gql } from "graphql-request";

async function checkTop() {
  const query = gql`
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 20, query_params: {order_by: [{column_id: "last_updated__1", direction: desc}]}) {
          items {
            id name created_at
            column_values { id text }
          }
        }
      }
    }
  `;
  const data: any = await mondayClient.request(query, { boardId: [process.env.MONDAY_BOARD_ID] });
  console.log("TOP 20 DESC by last_updated__1:");
  data.boards[0].items_page.items.forEach((i: any) => {
    const updatedCol = i.column_values.find((cv: any) => cv.id === "last_updated__1")?.text;
    console.log(`- ${i.name} (ID: ${i.id}) | Created: ${i.created_at} | UpdatedCol: ${updatedCol}`);
  });
}

checkTop();
