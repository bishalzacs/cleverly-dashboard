import { getTwilioCallMetrics } from "./services/twilioService.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verify() {
    console.log("--- DEBUG: Twilio Metrics Report ---");
    try {
        const stats = await getTwilioCallMetrics("today");
        if (stats) {
            console.log("SUCCESS: Received stats from Twilio.");
            console.log("Total Calls:", stats.totalCalls);
            console.log("Total Duration (min):", stats.totalDurationMinutes);
            console.log("Avg Duration (sec):", stats.avgDurationSeconds);
            console.log("Status Breakdown:", JSON.stringify(stats.statusCounts, null, 2));
        } else {
            console.log("FAILURE: Twilio service returned null.");
        }
    } catch (e) {
        console.error("Error running test:", e);
    }
}

verify();
