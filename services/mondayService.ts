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
 * Fetch items from the board, prioritized by most recently updated.
 * Returns both the items and a flag indicating if the search was exhaustive.
 */
async function fetchBoardItemsSorted(): Promise<{ items: any[], isComplete: boolean }> {
  const allItems: any[] = [];
  let cursor: string | null = null;
  let pagesFetched = 0;
  const MAX_PAGES = 30; // 500 * 30 = 15,000 items. Ensures full board coverage for 4,600+ items.
  let isComplete = false;

  do {
    pagesFetched++;
    const data: any = await retryRequest(async () => {
      if (cursor) {
        const nextQuery = gql`
          query($cursor: String!) {
            next_items_page(limit: ${PAGE_SIZE}, cursor: $cursor) {
              cursor
              items {
                id name created_at
                group { id }
                column_values { id text value }
              }
            }
          }
        `;
        return mondayClient.request(nextQuery, { cursor });
      } else {
        const firstQuery = gql`
          query($boardId: [ID!]) {
            boards(ids: $boardId) {
              items_page(
                limit: ${PAGE_SIZE}, 
                query_params: { 
                  order_by: [{ column_id: "last_updated__1", direction: desc }] 
                }
              ) {
                cursor
                items {
                  id name created_at
                  group { id }
                  column_values { id text value }
                }
              }
            }
          }
        `;
        return mondayClient.request(firstQuery, { boardId: [BOARD_ID] });
      }
    });

    const pageData: any = cursor ? data.next_items_page : data?.boards?.[0]?.items_page;
    const items: any[] = pageData?.items || [];
    
    // VERIFICATION LOG: Specifically look for D'Angelo in the first few batches
    if (pagesFetched <= 3) {
      const match = items.find(i => i.name.toLowerCase().includes("d'angelo"));
      if (match) {
        console.log(`[Monday] SUCCESS: Found '${match.name}' (ID: ${match.id}) in Page ${pagesFetched}`);
      }
    }

    console.log(`[Monday] Page ${pagesFetched}: fetched ${items.length} items (Newest First)`);
    allItems.push(...items);

    cursor = pageData?.cursor || null;
    
    if (!cursor) {
      isComplete = true;
      break;
    }

    if (pagesFetched >= MAX_PAGES) break;

  } while (cursor);

  return { items: allItems, isComplete };
}

/**
 * Main export: Fetch ALL leads from the 3 allowed groups.
 * Optimized: Sorts by updated_at DESC to ensure latest leads appear immediately.
 */
export const getLostLeads = async (): Promise<{ leads: Lead[], isComplete: boolean }> => {
  const LOST_ID = process.env.MONDAY_LOST_GROUP_ID || "new_group62617__1";
  const NOSHOW_ID = process.env.MONDAY_NOSHOW_GROUP_ID || "new_group64021__1";
  const CANCEL_ID = process.env.MONDAY_CANCEL_GROUP_ID || "new_group54376__1";
  const ALLOWED_GROUPS = [LOST_ID, NOSHOW_ID, CANCEL_ID].filter(Boolean);

  if (!BOARD_ID) {
    throw new Error("[Monday] Missing MONDAY_BOARD_ID environment variable");
  }

  console.log(`[Monday] Starting Sorted Sync. Board: ${BOARD_ID}, Target Groups: ${ALLOWED_GROUPS.length}`);

  const { items: rawItems, isComplete } = await fetchBoardItemsSorted();
  
  const filteredItems = rawItems.filter(item => ALLOWED_GROUPS.includes(item.group?.id));
  
  console.log(`[Monday] Board items: ${rawItems.length}, in target groups: ${filteredItems.length}, Complete: ${isComplete}`);

  const leads: Lead[] = filteredItems.map((item: any) => {
    const getColumnText = (id: string) =>
      item.column_values?.find((c: any) => c.id === id)?.text || "";
    const getColumnValue = (id: string) =>
      item.column_values?.find((c: any) => c.id === id)?.value || null;

    let ownerName = getColumnText("person");
    if (!ownerName) {
      try {
        const val = getColumnValue("person");
        if (val) {
          const parsed = JSON.parse(val);
          ownerName = (parsed?.personsAndTeams || []).map((p: any) => p.name || `User ${p.id}`).join(", ");
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
    if (item.group?.id === NOSHOW_ID) groupName = "No-Show";
    else if (item.group?.id === CANCEL_ID) groupName = "Cancel";

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
      group_id: item.group?.id,
      group_name: groupName,
    };
  });

  const withPhone = (leads as any[]).filter((l) => l.phone && l.phone.trim() !== "");
  console.log(`[Monday] Final parsed leads with phone: ${withPhone.length}`);

  return { leads: withPhone, isComplete };
};


