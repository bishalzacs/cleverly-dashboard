import { config } from "dotenv";
config({ path: ".env.local" });
import { mondayClient } from "./lib/mondayClient.ts";
import { gql } from "graphql-request";

async function getCount() {
  const query = gql`
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_count
      }
    }
  `;
  const data: any = await mondayClient.request(query, { boardId: [process.env.MONDAY_BOARD_ID] });
  console.log("BOARD COUNT:", data.boards[0].items_count);
}

getCount();
