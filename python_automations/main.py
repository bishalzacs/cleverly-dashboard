import schedule
import time
from sync_leads import sync_leads
from process_progression import process_progression

def job_sync_leads():
    print("--- Running Lead Sync Task ---")
    sync_leads()

def job_process_progression():
    print("--- Running Process Progression Task ---")
    process_progression()

if __name__ == "__main__":
    print("Starting Cleverly Python Automation Worker...")
    
    # Run once on startup
    job_sync_leads()
    job_process_progression()

    # Schedule tasks
    # Sync leads from Monday.com every 10 minutes
    schedule.every(10).minutes.do(job_sync_leads)
    
    # Process progression rules every 5 minutes
    schedule.every(5).minutes.do(job_process_progression)

    print("Worker is now running. Press Ctrl+C to stop.")
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(1)
