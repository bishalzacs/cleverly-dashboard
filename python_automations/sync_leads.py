from datetime import datetime, timezone
from monday_client import get_lost_leads
from supabase_client import supabase

def sync_leads():
    try:
        # Start time of sync in ISO format for the leads 'updated_at' column
        sync_start_time = datetime.now(timezone.utc).isoformat()
        
        print(f"[Sync] Starting sync cycle at {sync_start_time}...")
        print("[Sync] Fetching leads from Monday.com...")
        leads = get_lost_leads()

        if not leads:
            print("[Sync] No leads returned from Monday.com. Aborting to protect existing data.")
            return

        print(f"[Sync] Monday.com returned {len(leads)} valid leads (with phones).")

        # 1. Upsert in batches of 200
        batch_size = 200
        upserted_count = 0
        
        for i in range(0, len(leads), batch_size):
            batch = leads[i:i+batch_size]
            
            # Map batch to include the current sync's timestamp
            # This allows us to track which records were updated in this specific run
            enriched_batch = []
            for l in batch:
                l["updated_at"] = sync_start_time
                enriched_batch.append(l)
            
            # Upsert into supabase
            supabase.table("leads").upsert(enriched_batch).execute()
            upserted_count += len(enriched_batch)
            print(f"[Sync] Upserted batch {i//batch_size + 1} ({upserted_count}/{len(leads)})")

        # 2. Tombstone ghost leads (Safer method)
        # We only delete if the sync was presumably healthy (fetched a reasonable amount of data)
        # Safety Threshold: If we fetched less than 1,000 leads but the DB has 5,000+, 
        # it's likely a partial fetch and we should NOT tombstone.
        
        # Get existing DB count
        res_count = supabase.table("leads").select("id", count="exact").limit(1).execute()
        current_db_count = res_count.count or 0
        
        # Determine if we should perform tombstoning
        # Rule: Only tombstone if we fetched at least 80% of the current DB size, 
        # or if the DB is small enough (< 500) that a full wipe is less risky.
        should_tombstone = len(leads) > (current_db_count * 0.8) or current_db_count < 500
        
        if should_tombstone:
            print("[Sync] Sync verified as healthy. Removing ghost leads (not seen in this sync)...")
            
            # Delete records where updated_at is older than our sync_start_time
            # This is much faster and safer than 'NOT IN (massive list)'
            res_del = supabase.table("leads").delete().lt("updated_at", sync_start_time).execute()
            deleted_count = len(res_del.data) if res_del.data else 0
            print(f"[Sync] Removed {deleted_count} ghost leads.")
        else:
            print(f"[Sync] WARNING: Partial sync detected ({len(leads)} fetched vs {current_db_count} in DB). Skipping tombstone to protect data.")
            
        # 3. Final count
        res = supabase.table("leads").select("id", count="exact").limit(1).execute()
        final_db_count = res.count
        
        print(f"[Sync] Complete. Final DB count: {final_db_count} | Monday count: {len(leads)}")

    except Exception as e:
        print(f"[Sync] Fatal error: {str(e)}")

if __name__ == "__main__":
    sync_leads()
