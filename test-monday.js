require("dotenv").config({ path: ".env.local" });
const fs = require('fs');

const MONDAY_API_KEY = process.env.MONDAY_API_KEY || "";
const MONDAY_API_URL = "https://api.monday.com/v2";
const BOARD_ID = process.env.MONDAY_BOARD_ID || "";
const LOST_GROUP_ID = process.env.MONDAY_LOST_GROUP_ID || "";

async function test() {
    const query = `
    query getLostLeads($boardId: [ID!], $groupId: String!) {
      boards(ids: $boardId) {
        groups(ids: [$groupId]) {
          items_page(limit: 1) {
            items {
              id
              name
              created_at
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    }
  `;

    const variables = {
        boardId: [BOARD_ID],
        groupId: LOST_GROUP_ID,
    };

    try {
        const response = await fetch(MONDAY_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: MONDAY_API_KEY,
                "API-Version": "2023-10",
            },
            body: JSON.stringify({ query, variables }),
        });

        const data = await response.json();
        const items = data.data.boards[0]?.groups[0]?.items_page?.items || [];
        fs.writeFileSync('monday-sample.json', JSON.stringify(items[0], null, 2));
        console.log("Saved to monday-sample.json");
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
