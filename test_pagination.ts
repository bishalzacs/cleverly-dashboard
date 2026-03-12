import { GraphQLClient, gql } from "graphql-request";

const MONDAY_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYyNzIxNDQyMCwiYWFpIjoxMSwidWlkIjoxMDAxNzAwNjUsImlhZCI6IjIwMjYtMDMtMDFUMDY6NDc6MjAuMDAwWiIsInBlciI6Im1lOndyaXRlIiwiYWN0aWQiOjMxODIzMTIsInJnbiI6InVzZTEifQ.7QeL5FrqJtc3Tu7ODo7S1e8M_RFGW5tL8ixrbKPLNdU";
const mondayClient = new GraphQLClient("https://api.monday.com/v2", {
  headers: { Authorization: MONDAY_API_KEY, "API-Version": "2024-01" },
});

async function run() {
    const targetGroupIds = ["new_group62617__1", "new_group64021__1", "new_group54376__1"];
    const allItems: any[] = [];
    
    for (const groupId of targetGroupIds) {
        console.log(`Paginating group: ${groupId}`);
        let cursor: string | null = null;
        do {
            const query = cursor ? gql`
                query($cursor: String!) {
                    next_items_page(limit: 500, cursor: $cursor) {
                        cursor
                        items { id name }
                    }
                }
            ` : gql`
                query($boardId: [ID!], $groupId: [String!]) {
                    boards(ids: $boardId) {
                        groups(ids: $groupId) {
                            items_page(limit: 500) {
                                cursor
                                items { id name }
                            }
                        }
                    }
                }
            `;
            const vars = cursor ? { cursor } : { boardId: ["6942829967"], groupId: [groupId] };
            const data: any = await mondayClient.request(query, vars);
            
            let page;
            if (cursor) {
                page = data.next_items_page;
            } else {
                page = data.boards[0]?.groups[0]?.items_page;
            }
            
            const items = page?.items || [];
            allItems.push(...items);
            cursor = page?.cursor || null;
            console.log(`Fetched ${items.length} items. Has next: ${!!cursor}`);
        } while (cursor);
    }
    console.log(`Finished fetching. Total items: ${allItems.length}`);
}

run();
