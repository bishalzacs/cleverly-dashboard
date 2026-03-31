import { config } from "dotenv";
config({ path: ".env.local" });
import { mondayClient } from "./lib/mondayClient.ts";
import { gql } from "graphql-request";

async function checkCols() {
  const query = gql`
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        columns { id title type }
      }
    }
  `;
  const data: any = await mondayClient.request(query, { boardId: [process.env.MONDAY_BOARD_ID] });
  console.log("BOARD COLUMNS:");
  data.boards[0].columns.forEach((c: any) => {
    console.log(`- ${c.id}: ${c.title} (${c.type})`);
  });
}

checkCols();
