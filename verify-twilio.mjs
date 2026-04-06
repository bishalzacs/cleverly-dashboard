import { twilioClient } from "./lib/twilioClient.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyTwilioData() {
    console.log("--- Verifying Twilio Call Logs ---");
    try {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        
        console.log(`Searching for calls since: ${startOfToday.toISOString()}`);
        
        const calls = await twilioClient.calls.list({
            startTimeAfter: startOfToday,
            limit: 20
        });
        
        console.log(`Found ${calls.length} calls today.`);
        
        calls.forEach(c => {
            console.log(`- SID: ${c.sid}, Status: ${c.status}, Duration: ${c.duration}s, From: ${c.from}, To: ${c.to}`);
        });

    } catch (error) {
        console.error("Error fetching Twilio data:", error);
    }
}

verifyTwilioData();
