import { getLostLeads } from "./services/mondayService";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
    try {
        console.log("Fetching leads from Monday.com...");
        const leads = await getLostLeads();
        console.log(`Successfully fetched ${leads.length} leads:`);
        console.log(JSON.stringify(leads, null, 2));
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
