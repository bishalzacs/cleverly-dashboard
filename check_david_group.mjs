import { config } from "dotenv";
config({ path: ".env.local" });

import { GraphQLClient, gql } from "graphql-request";

const MONDAY_API_KEY = process.env.MONDAY_API_KEY;
const BOARD_ID = process.env.MONDAY_BOARD_ID;

const mondayClient = new GraphQLClient("https://api.monday.com/v2", {
  headers: {
    Authorization: MONDAY_API_KEY,
    "API-Version": "2023-10",
  },
});

async function findDavidFull() {
  const query = gql`
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 100, query_params: {order_by: [{column_id: "last_updated__1", direction: desc}]}) {
          items {
            id name 
            group { id title }
            column_values { id text value }
          }
        }
      }
    }
  `;
  
  const data = await mondayClient.request(query, { boardId: [BOARD_ID] });
  const items = data.boards[0].items_page.items;
  const david = items.find(i => i.name.toLowerCase().includes("david d"));
  
  if (david) {
    console.log("Found David D'Angelo.");
    console.log("Group ID:", david.group.id);
    console.log("Group Title:", david.group.title);
    console.log("Columns:", JSON.stringify(david.column_values.filter(cv => cv.id.includes("phone")), null, 2));
  } else {
    console.log("David D'Angelo not in top 100 DESC items.");
  }
}

findDavidFull();
