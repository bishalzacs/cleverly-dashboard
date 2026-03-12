import { GraphQLClient, gql } from "graphql-request";

const MONDAY_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYyNzIxNDQyMCwiYWFpIjoxMSwidWlkIjoxMDAxNzAwNjUsImlhZCI6IjIwMjYtMDMtMDFUMDY6NDc6MjAuMDAwWiIsInBlciI6Im1lOndyaXRlIiwiYWN0aWQiOjMxODIzMTIsInJnbiI6InVzZTEifQ.7QeL5FrqJtc3Tu7ODo7S1e8M_RFGW5tL8ixrbKPLNdU";

const mondayClient = new GraphQLClient("https://api.monday.com/v2", {
  headers: {
    Authorization: MONDAY_API_KEY,
    "API-Version": "2024-01",
  },
});

async function run() {
    const query = gql`
      query {
        boards(ids: [6942829967]) {
          groups(ids: ["new_group62617__1"]) {
            items_page(limit: 5) {
              items {
                id
                name
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

    try {
        const data: any = await mondayClient.request(query);
        const fs = require('fs');
        fs.writeFileSync('monday-dump.json', JSON.stringify(data.boards[0].groups[0].items_page.items, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
