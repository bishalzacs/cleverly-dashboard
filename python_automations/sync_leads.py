from monday_client import get_lost_leads
from supabase_client import supabase

def sync_leads():
    try:
        print("[Sync] Fetching leads from Monday.com...")
        leads = get_lost_leads()

        if not leads:
            print("[Sync] No leads returned from Monday.com.")
            return

        print(f"[Sync] Monday.com returned {len(leads)} valid leads (with phones).")

        # 1. Upsert in batches of 200
        batch_size = 200
        upserted_count = 0
        valid_monday_ids = [str(l["id"]) for l in leads]

        for i in range(0, len(leads), batch_size):
            batch = leads[i:i+batch_size]
            
            # Upsert into supabase
            res = supabase.table("leads").upsert(batch).execute()
            upserted_count += len(batch)
            print(f"[Sync] Upserted batch {i//batch_size + 1} ({upserted_count}/{len(leads)})")

        # 2. Tombstone ghost leads
        print("[Sync] Checking for ghost leads removed from Monday.com groups...")
        
        # Paginate to get all ids from DB to compare, or just delete where id not in valid_monday_ids
        # Since supabase python client doesn't support 'not in' with a massive list easily without HTTP 414 URI Too Long,
        # we fetch all IDs from DB safely.
        has_more = True
        offset = 0
        db_ids = []
        
        while has_more:
            res = supabase.table("leads").select("id").range(offset, offset + 999).execute()
            db_ids.extend([str(item["id"]) for item in res.data])
            if len(res.data) < 1000:
                has_more = False
            offset += 1000
            
        ghost_ids = list(set(db_ids) - set(valid_monday_ids))
        
        if ghost_ids:
            print(f"[Sync] Removing {len(ghost_ids)} ghost leads...")
            # Delete in chunks to avoid URL length limits
            for i in range(0, len(ghost_ids), 100):
                chunk = ghost_ids[i:i+100]
                supabase.table("leads").delete().in_("id", chunk).execute()
        else:
            print("[Sync] No ghost leads to remove.")
            
        # 3. Final count
        res = supabase.table("leads").select("id", count="exact").limit(1).execute()
        db_count = res.count
        
        print(f"[Sync] Complete. Final DB count: {db_count} | Monday count: {len(leads)}")

    except Exception as e:
        print(f"[Sync] Fatal error: {str(e)}")

if __name__ == "__main__":
    sync_leads()
