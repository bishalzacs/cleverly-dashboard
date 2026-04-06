import os
import time
import requests
import json
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")

MONDAY_API_KEY = os.getenv("MONDAY_API_KEY", "")
BOARD_ID = os.getenv("MONDAY_BOARD_ID", "")
LOST_ID = os.getenv("MONDAY_LOST_GROUP_ID", "new_group62617__1")
NOSHOW_ID = os.getenv("MONDAY_NOSHOW_GROUP_ID", "new_group64021__1")
CANCEL_ID = os.getenv("MONDAY_CANCEL_GROUP_ID", "new_group54376__1")

PAGE_SIZE = 500
MAX_RETRIES = 3
RETRY_DELAY_SEC = 1.5

HEADERS = {
    "Authorization": MONDAY_API_KEY,
    "API-Version": "2023-10",
    "Content-Type": "application/json"
}

def execute_query(query, variables=None, retries=MAX_RETRIES):
    for attempt in range(1, retries + 1):
        try:
            res = requests.post(
                "https://api.monday.com/v2",
                headers=HEADERS,
                json={"query": query, "variables": variables or {}}
            )
            res.raise_for_status()
            data = res.json()
            if "errors" in data:
                raise Exception(f"GraphQL Errors: {data['errors']}")
            return data["data"]
        except Exception as e:
            if attempt == retries:
                raise Exception(f"Exhausted retries: {str(e)}")
            print(f"[Monday] Request failed (attempt {attempt}/{retries}), retrying...", str(e))
            time.sleep(RETRY_DELAY_SEC * attempt)

def fetch_all_items_from_group(group_id):
    all_items = []
    cursor = None
    page = 0

    while True:
        page += 1
        if cursor:
            query = """
            query($cursor: String!) {
              next_items_page(limit: %d, cursor: $cursor) {
                cursor
                items {
                  id name created_at
                  column_values { id text value }
                }
              }
            }
            """ % PAGE_SIZE
            data = execute_query(query, {"cursor": cursor})
            page_data = data.get("next_items_page")
        else:
            query = """
            query($boardId: [ID!], $groupId: [String!]) {
              boards(ids: $boardId) {
                groups(ids: $groupId) {
                  items_page(limit: %d) {
                    cursor
                    items {
                      id name created_at
                      column_values { id text value }
                    }
                  }
                }
              }
            }
            """ % PAGE_SIZE
            data = execute_query(query, {"boardId": [BOARD_ID], "groupId": [group_id]})
            try:
                page_data = data["boards"][0]["groups"][0]["items_page"]
            except (KeyError, IndexError, TypeError):
                page_data = None

        if not page_data:
            break

        items = page_data.get("items", [])
        print(f"[Monday] Group {group_id} — page {page}: fetched {len(items)} items")

        for item in items:
            item["group_id"] = group_id
            all_items.append(item)

        cursor = page_data.get("cursor")
        if not cursor:
            break

    print(f"[Monday] Group {group_id} — TOTAL fetched: {len(all_items)}")
    return all_items

def get_lost_leads():
    allowed_groups = [g for g in [LOST_ID, NOSHOW_ID, CANCEL_ID] if g]
    if not BOARD_ID or not allowed_groups:
        raise Exception("[Monday] Missing MONDAY_BOARD_ID or group env variables")

    print(f"[Monday] Starting full sync. Board: {BOARD_ID}, Groups: {', '.join(allowed_groups)}")
    
    all_items = []
    for group_id in allowed_groups:
        items = fetch_all_items_from_group(group_id)
        all_items.extend(items)

    print(f"[Monday] Grand total fetched from all groups: {len(all_items)}")

    leads = []
    for item in all_items:
        def get_col_text(col_id):
            for c in item.get("column_values", []):
                if c["id"] == col_id:
                    return c.get("text", "")
            return ""

        def get_col_val(col_id):
            for c in item.get("column_values", []):
                if c["id"] == col_id:
                    return c.get("value")
            return None

        # Resolve owner
        owner_name = get_col_text("person")
        if not owner_name:
            val = get_col_val("person")
            if val:
                try:
                    parsed = json.loads(val)
                    owners = [p.get("name", "") for p in parsed.get("personsAndTeams", [])]
                    owner_name = ", ".join(owners)
                except:
                    pass
        
        # Resolve Date
        sales_call_date = ""
        date_val = get_col_val("date4")
        if date_val:
            try:
                sales_call_date = json.loads(date_val).get("date", "")
            except:
                pass

        # Resolve deal value
        deal_value = None
        dv_val = get_col_val("numbers__1")
        if dv_val:
            try:
                deal_value = float(json.loads(dv_val))
            except:
                pass

        group_name = "Lost"
        if item.get("group_id") == NOSHOW_ID:
            group_name = "No-Show"
        elif item.get("group_id") == CANCEL_ID:
            group_name = "Cancel"

        status_text = get_col_text("color_mks814yp")
        if not status_text:
            status_text = get_col_text("status__1")

        leads.append({
            "id": item.get("id"),
            "name": item.get("name"),
            "phone": get_col_text("phone__1"),
            "email": get_col_text("email__1"),
            "status": status_text,
            "createdDate": item.get("created_at"),
            "monday_created_at": item.get("created_at"),
            "owner": owner_name,
            "interested_in": get_col_text("interested_in__1"),
            "notes": get_col_text("notes__1"),
            "company": get_col_text("text7__1"),
            "sales_call_date": sales_call_date,
            "deal_value": deal_value,
            "plan_type": get_col_text("status4__1"),
            "group_id": item.get("group_id"),
            "group_name": group_name
        })

    # Filter out those without phones
    with_phone = [l for l in leads if l.get("phone") and l["phone"].strip()]
    without_phone = [l for l in leads if not l.get("phone") or not l["phone"].strip()]

    print(f"[Monday] Leads with phone: {len(with_phone)}")
    print(f"[Monday] Leads without phone: {len(without_phone)} (Skipping to prevent dialer errors)")

    return with_phone
