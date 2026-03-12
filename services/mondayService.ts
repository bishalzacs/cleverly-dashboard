import { mondayClient } from "@/lib/mondayClient";
import { gql } from "graphql-request";

const BOARD_ID = process.env.MONDAY_BOARD_ID || "";
const LOST_GROUP_ID = process.env.MONDAY_LOST_GROUP_ID || "";
const NOSHOW_GROUP_ID = process.env.MONDAY_NOSHOW_GROUP_ID || "";
const CANCEL_GROUP_ID = process.env.MONDAY_CANCEL_GROUP_ID || "";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  createdDate: string;
  pipeline_stage?: string;
  // Enhanced fields
  owner?: string;
  interested_in?: string;
  notes?: string;
  company?: string;
  sales_call_date?: string;
  deal_value?: number;
  plan_type?: string;
  monday_created_at?: string;
}

export const getLostLeads = async (): Promise<Lead[]> => {
  const targetGroupIds = [LOST_GROUP_ID, NOSHOW_GROUP_ID, CANCEL_GROUP_ID].filter(Boolean);

  if (!BOARD_ID || targetGroupIds.length === 0) {
    throw new Error("Missing MONDAY_BOARD_ID or Monday Group IDs");
  }

  const query = gql`
    query getLostLeads($boardId: [ID!], $groupIds: [String!]) {
      boards(ids: $boardId) {
        groups(ids: $groupIds) {
          items_page(limit: 500) {
            cursor
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

  const variables = { boardId: [BOARD_ID], groupIds: targetGroupIds };

  try {
    const allItems: any[] = [];

    // Paginate through all Monday.com pages
    let cursor: string | null = null;

    do {
      const paginatedQuery = cursor
        ? gql`
          query getLostLeadsCursor($boardId: [ID!], $groupIds: [String!], $cursor: String!) {
            boards(ids: $boardId) {
              groups(ids: $groupIds) {
                items_page(limit: 500, cursor: $cursor) {
                  cursor
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
        `
        : query;

      const pageVars = cursor ? { ...variables, cursor } : variables;
      const data: any = await mondayClient.request(paginatedQuery, pageVars);
      // Handle pagination array since we might have multiple groups returned
      const groups = data.boards[0]?.groups || [];
      let foundCursor = null;

      groups.forEach((group: any) => {
        const page = group.items_page;
        const items = page?.items || [];
        allItems.push(...items);
        if (page?.cursor) {
          foundCursor = page.cursor;
        }
      });
      
      cursor = foundCursor;
    } while (cursor);

    const leads: Lead[] = allItems.map((item: any) => {
      const getColumnText = (exactId: string) => {
        const col = item.column_values.find((c: any) => c.id === exactId);
        return col?.text || "";
      };

      const getColumnValue = (exactId: string) => {
        const col = item.column_values.find((c: any) => c.id === exactId);
        return col?.value || null;
      };

      // Parse owner from people column - it appears in getColumnText instead of the raw JSON value
      let ownerName = getColumnText("person");
      if (!ownerName) {
        try {
            const ownerVal = getColumnValue("person");
            if (ownerVal) {
              const parsed = JSON.parse(ownerVal);
              const persons = parsed?.personsAndTeams || [];
              ownerName = persons.map((p: any) => p.name).join(", ");
            }
        } catch { /* ignored */ }
      }

      // Parse date columns: {"date":"2025-03-01","changed_at":"..."}
      const parseDateCol = (id: string): string => {
        try {
          const val = getColumnValue(id);
          if (!val) return "";
          const parsed = JSON.parse(val);
          return parsed?.date || "";
        } catch { return ""; }
      };

      // Parse deal value
      let dealValue: number | undefined;
      try {
        const dv = getColumnValue("numbers__1");
        if (dv) dealValue = parseFloat(JSON.parse(dv));
      } catch { /* ignored */ }

      return {
        id: item.id,
        name: item.name,
        phone: getColumnText("phone__1"),
        email: getColumnText("email__1"),
        status: getColumnText("color_mks814yp") || getColumnText("status__1"),
        createdDate: item.created_at,
        monday_created_at: item.created_at,
        owner: ownerName,
        interested_in: getColumnText("interested_in__1"),
        notes: getColumnText("notes__1"),
        company: getColumnText("text7__1"),
        sales_call_date: parseDateCol("date4"),
        deal_value: dealValue,
        plan_type: getColumnText("status4__1"),
      };
    }).filter((lead: Lead) => lead.phone && lead.phone.trim() !== "");

    return leads;
  } catch (error) {
    console.error("Error fetching Monday leads:", error);
    throw new Error("Failed to fetch leads from Monday.com");
  }
};
