import { GraphQLClient } from "graphql-request";

const MONDAY_API_KEY = process.env.MONDAY_API_KEY || "";
const MONDAY_API_URL = "https://api.monday.com/v2";

export const mondayClient = new GraphQLClient(MONDAY_API_URL, {
  headers: {
    Authorization: MONDAY_API_KEY,
    "API-Version": "2023-10",
  },
});
