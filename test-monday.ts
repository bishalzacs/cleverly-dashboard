import { config } from "dotenv";
config({ path: ".env.local" });
import { getLostLeads } from "./services/mondayService";

async function run() {
  try {
    console.log("Fetching leads...");
    const leads = await getLostLeads();
    console.log("Leads fetched:", leads.length);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
