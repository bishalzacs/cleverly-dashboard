import { config } from "dotenv";
config({ path: ".env.local" });
import { getLostLeads } from "./services/mondayService";

async function run() {
  try {
    console.log("Fetching leads...");
    const leads = await getLostLeads();
    console.log("Leads fetched (with phone):", leads.length);
    
    const targets = ["David D'Angelo", "Andrew", "Dr. CJohnson", "Anne Louisa Makoha"];
    
    leads.forEach(l => {
      if(targets.includes(l.name) || l.name.includes("David") || l.name.includes("Andrew")) {
        console.log(`Found parsed lead: ${l.name} | Phone: ${l.phone} | Created: ${l.monday_created_at} | SalesDate: ${l.sales_call_date}`);
      }
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
