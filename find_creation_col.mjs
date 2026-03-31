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
    const data = await mondayClient.request(query, { boardId: ["6942829967"] });
    console.log("MATCHING_COLUMNS:");
    data.boards[0].columns.forEach(c => {
      // Search for anything creation-related or title containing "date" or "created"
      if (c.type.includes("creation") || c.title.toLowerCase().includes("date") || c.title.toLowerCase().includes("created")) {
        console.log(`${c.id}|${c.title}|${c.type}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

findCreatedCol();
