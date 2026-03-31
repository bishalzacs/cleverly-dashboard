import { config } from "dotenv";
config({ path: ".env.local" });
import { GraphQLClient, gql } from 'graphql-request';

const mondayClient = new GraphQLClient("https://api.monday.com/v2", {
  headers: {
    Authorization: process.env.MONDAY_API_KEY,
    "API-Version": "2023-10",
  },
});

async function findCreatedCol() {
  const query = gql`
    query($boardId: [ID!]) {
      boards(ids: $boardId) {
        columns { id title type }
      }
    }
  `;
  try {
    const data = await mondayClient.request(query, { boardId: [process.env.MONDAY_BOARD_ID] });
    console.log("BOARD COLUMNS:");
    data.boards[0].columns.forEach(c => {
      console.log(`${c.id} | ${c.title} | ${c.type}`);
    });
  } catch (err) {
    console.error(err);
  }
}

findCreatedCol();
