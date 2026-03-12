import { createClient } from "@supabase/supabase-js";
import 'dotenv/config'; // Make sure to load .env.local

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function run() {
    try {
        const { data, error } = await supabase
            .from("leads")
            .select("id, name, owner, status")
            .limit(10);
            
        if (error) {
            console.error("Supabase Error:", error);
            return;
        }

        console.log("Supabase Data Sample:");
        console.table(data);
    } catch (e) {
        console.error(e);
    }
}

run();
