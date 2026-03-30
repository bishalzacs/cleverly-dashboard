import { config } from "dotenv";
config({ path: ".env.local" });

import { GraphQLClient } from "graphql-request";

const MONDAY_API_KEY = process.env.MONDAY_API_KEY || "";
const MONDAY_API_URL = "https://api.monday.com/v2";

async function run() {
  const client = new GraphQLClient(MONDAY_API_URL, {
    headers: {
      Authorization: MONDAY_API_KEY,
      "API-Version": "2023-10",
    },
  });

  try {
    const data = await client.request(`
      query { boards(limit: 1) { id name } }
    `);
    console.log("2023-10 Response:", data);
  } catch(e: any) {
    console.log("2023-10 Error:", e.message);
  }

  const client2 = new GraphQLClient(MONDAY_API_URL, {
    headers: {
      Authorization: MONDAY_API_KEY,
      "API-Version": "2024-01",
    },
  });

  try {
    const data2 = await client2.request(`
      query { boards(limit: 1) { id name } }
    `);
    console.log("2024-01 Response:", data2);
  } catch(e: any) {
    console.log("2024-01 Error:", e.message);
  }
}
run();
