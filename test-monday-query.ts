import { config } from "dotenv";
config({ path: ".env.local" });

async function run() {
  try {
    const BOARD_ID = process.env.MONDAY_BOARD_ID || "";
    const NOSHOW_ID = process.env.MONDAY_NOSHOW_GROUP_ID || "new_group64021__1";

    console.log("BOARD_ID:", BOARD_ID, "| NOSHOW_ID:", NOSHOW_ID);

    const query = `
      query {
        boards(ids: [${BOARD_ID}]) {
          groups(ids: ["${NOSHOW_ID}"]) {
            items_page(limit: 50) {
              items {
                id name created_at
                column_values { id text }
              }
            }
          }
        }
      }
    `;

    const res = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": process.env.MONDAY_API_KEY || ""
        },
        body: JSON.stringify({ query })
    });
    
    const data = await res.json();
    const items = data?.data?.boards?.[0]?.groups?.[0]?.items_page?.items || [];
    console.log("Fetched NO-SHOW items:", items.length);

    const fs = require('fs');
    fs.writeFileSync('test-out.json', JSON.stringify(items, null, 2));
    console.log("Wrote to test-out.json");

  } catch(e: any) {
    console.error("Error:", e.message);
  }
}
run();
