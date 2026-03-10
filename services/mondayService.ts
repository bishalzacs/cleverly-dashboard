import { mondayClient } from "@/lib/mondayClient";
import { gql } from "graphql-request";

const BOARD_ID = process.env.MONDAY_BOARD_ID || "";
const LOST_GROUP_ID = process.env.MONDAY_LOST_GROUP_ID || "";

export interface Lead {
  id: string;
  name: string; // Lead Name
  phone: string; // Phone Number
  email: string; // Email
  status: string; // Status
  createdDate: string; // Created Date
}

export const getLostLeads = async (): Promise<Lead[]> => {
  if (!BOARD_ID || !LOST_GROUP_ID) {
    throw new Error("Missing MONDAY_BOARD_ID or MONDAY_LOST_GROUP_ID");
  }

  // GraphQL query to fetch items from the specific board and group
  const query = gql`
    query getLostLeads($boardId: [ID!], $groupId: String!) {
      boards(ids: $boardId) {
        groups(ids: [$groupId]) {
          items_page {
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
    const data: any = await mondayClient.request(query, variables);

    // Parse the Monday response to match the requested fields
    const items = data.boards[0]?.groups[0]?.items_page?.items || [];

    const leads: Lead[] = items.map((item: any) => {
      // Find specific column values by exact ID from sample data
      const getColumnText = (exactId: string) => {
        const col = item.column_values.find((c: any) => c.id === exactId);
        return col ? col.text : "";
      };

      return {
        id: item.id,
        name: item.name,
        phone: getColumnText("phone__1"),
        email: getColumnText("email__1"),
        status: getColumnText("status__1"), // Re-Schedule, Gold etc.
        createdDate: item.created_at,
      };
    });

    return leads;
  } catch (error) {
    console.error("Error fetching Monday leads:", error);
    throw new Error("Failed to fetch leads from Monday.com");
  }
};
