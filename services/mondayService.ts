import { mondayClient } from "@/lib/mondayClient";
import { gql } from "graphql-request";

// Configuration is read at module level but defaults are provided
const BOARD_ID = process.env.MONDAY_BOARD_ID || "";

const PAGE_SIZE = 500; // Monday.com max per page
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  createdDate: string;
  pipeline_stage?: string;
  owner?: string;
  interested_in?: string;
  notes?: string;
  company?: string;
  sales_call_date?: string;
  deal_value?: number;
  plan_type?: string;
  monday_created_at?: string;
  group_id?: string;
  group_name?: "Lost" | "No-Show" | "Cancel";
  call_attempts?: number;
  last_call_at?: string;
  is_connected?: boolean;
  is_in_active_pool?: boolean;
}

async function retryRequest<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.warn(`[Monday] Request failed (attempt ${attempt}/${retries}), retrying in ${RETRY_DELAY_MS}ms...`, err?.message);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
    }
  }
  throw new Error("Exhausted retries");
}

/**
 * Fetch ALL items from a single Monday.com group using cursor-based pagination.
 * Handles unlimited items by following the cursor until it's null.
 */
async function fetchAllItemsFromGroup(groupId: string): Promise<any[]> {
  const allItems: any[] = [];
  let cursor: string | null = null;
  let page = 0;

  do {
    page++;
    const data: any = await retryRequest(async () => {
      if (cursor) {
        const nextQuery = gql`
          query($cursor: String!) {
            next_items_page(limit: ${PAGE_SIZE}, cursor: $cursor) {
              cursor
              items {
                id name created_at
                column_values { id text value }
              }
            }
          }
        `;
        return mondayClient.request(nextQuery, { cursor });
      } else {
        const firstQuery = gql`
          query($boardId: [ID!], $groupId: [String!]) {
            boards(ids: $boardId) {
              groups(ids: $groupId) {
                items_page(limit: ${PAGE_SIZE}) {
                  cursor
                  items {
                    id name created_at
                    column_values { id text value }
                  }
                }
              }
            }
          }
        `;
        return mondayClient.request(firstQuery, { boardId: [BOARD_ID], groupId: [groupId] });
      }
    });

    let pageData;
    if (cursor) {
      pageData = data.next_items_page;
    } else {
      pageData = data?.boards?.[0]?.groups?.[0]?.items_page;
    }

    const items: any[] = pageData?.items || [];
    console.log(`[Monday] Group ${groupId} — page ${page}: fetched ${items.length} items`);

    const tagged = items.map((item: any) => ({ ...item, group_id: groupId }));
    allItems.push(...tagged);

    cursor = pageData?.cursor || null;
  } while (cursor);

  console.log(`[Monday] Group ${groupId} — TOTAL fetched: ${allItems.length}`);
  return allItems;
}

/**
 * Main export: Fetch ALL leads from the 3 allowed groups.
 * Guarantees full pagination, retry logic, and group restriction.
 */
export const getLostLeads = async (): Promise<Lead[]> => {
  // Get group IDs from env at request time with hardcoded fallbacks for the user's specific board
  const LOST_ID = process.env.MONDAY_LOST_GROUP_ID || "new_group62617__1";
  const NOSHOW_ID = process.env.MONDAY_NOSHOW_GROUP_ID || "new_group64021__1";
  const CANCEL_ID = process.env.MONDAY_CANCEL_GROUP_ID || "new_group54376__1";
  const ALLOWED_GROUPS = [LOST_ID, NOSHOW_ID, CANCEL_ID].filter(Boolean);

  if (!BOARD_ID || ALLOWED_GROUPS.length === 0) {
    throw new Error("[Monday] Missing MONDAY_BOARD_ID or group environment variables");
  }

  console.log(`[Monday] Starting full sync. Board: ${BOARD_ID}, Groups: ${ALLOWED_GROUPS.join(", ")}`);

  const allItems: any[] = [];

  for (const groupId of ALLOWED_GROUPS) {
    const items = await fetchAllItemsFromGroup(groupId);
    allItems.push(...items);
  }

  console.log(`[Monday] Grand total fetched from all groups: ${allItems.length}`);

  const leads: Lead[] = allItems.map((item: any) => {
    const getColumnText = (id: string) =>
      item.column_values?.find((c: any) => c.id === id)?.text || "";
    const getColumnValue = (id: string) =>
      item.column_values?.find((c: any) => c.id === id)?.value || null;

    // Owner: try text first, then JSON parse
    let ownerName = getColumnText("person");
    if (!ownerName) {
      try {
        const val = getColumnValue("person");
        if (val) {
          const parsed = JSON.parse(val);
          ownerName = (parsed?.personsAndTeams || []).map((p: any) => p.name).join(", ");
        }
      } catch { /* ignored */ }
    }

    const parseDateCol = (id: string): string => {
      try {
        const val = getColumnValue(id);
        return val ? JSON.parse(val)?.date || "" : "";
      } catch { return ""; }
    };

    let dealValue: number | undefined;
    try {
      const dv = getColumnValue("numbers__1");
      if (dv) dealValue = parseFloat(JSON.parse(dv));
    } catch { /* ignored */ }

    let groupName: "Lost" | "No-Show" | "Cancel" = "Lost";
    if (item.group_id === NOSHOW_ID) groupName = "No-Show";
    else if (item.group_id === CANCEL_ID) groupName = "Cancel";

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
      group_id: item.group_id,
      group_name: groupName,
    };
  });

  const withPhone = (leads as any[]).filter((l) => l.phone && l.phone.trim() !== "");
  const withoutPhone = (leads as any[]).filter((l) => !l.phone || l.phone.trim() === "");

  console.log(`[Monday] Leads with phone: ${withPhone.length}`);
  console.log(`[Monday] Leads without phone: ${withoutPhone.length} (Skipping these to prevent dialer errors)`);

  return withPhone;
};
