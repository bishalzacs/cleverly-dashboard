import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

# Must use Service Role key to bypass RLS for automations, fallback to Anon just in case
url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

supabase: Client = create_client(url, key)
