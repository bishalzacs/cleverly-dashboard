from supabase_client import supabase

def process_progression():
    try:
        print("[Progression] Triggering 'process_lead_progressions' RPC...")
        
        # RPC call
        res = supabase.rpc("process_lead_progressions", {}).execute()
        
        print("[Progression] Success:", res.data)
    except Exception as e:
        print(f"[Progression] Fatal error: {str(e)}")

if __name__ == "__main__":
    process_progression()
