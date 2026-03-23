# Cleverly Python Automations

This folder contains the production-grade Python backend workers for Cleverly's Automations.
It replaces the Next.js API route cron jobs, providing a much higher stability for long-running synchronization tasks, removing Vercel/Next.js timeout limits.

## Setup

1. Make sure Python 3.10+ is installed.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure the root `.env` file exists and contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MONDAY_API_TOKEN`
   - `MONDAY_BOARD_ID`
   - `MONDAY_LOST_GROUP_ID` (optional)
   - `MONDAY_NOSHOW_GROUP_ID` (optional)
   - `MONDAY_CANCEL_GROUP_ID` (optional)

## Running the Worker

To start the continuous background worker:

```bash
python main.py
```

It will immediately run a Lead Sync and Progression Processing task, and then it will loop:
- **Lead Sync**: Every 10 minutes
- **Progression processing**: Every 5 minutes
