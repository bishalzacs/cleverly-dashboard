import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// STRICT MAPPING AS REQUESTED
const GROUP_MAP: Record<string, string> = {
    "new_group62617__1": "Lost",
    "new_group64021__1": "No-Show",
    "new_group54376__1": "Cancel"
};

export async function GET(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { searchParams } = new URL(request.url);
        const owner = searchParams.get("owner") || "";
        const from = searchParams.get("from") || "";
        const to = searchParams.get("to") || "";

        let allLeads: any[] = [];
        let totalCount = 0;
        let currentOffset = 0;
        const FETCH_SIZE = 1000; // Supabase safe payload chunking
        let hasMore = true;

        // STEP 1: REMOVE LIMIT - Loop until ALL matching rows are fetched
        while (hasMore) {
            let query = supabase
                .from("leads")
                .select("*", { count: "exact" })
                .order("updated_at", { ascending: false }) // STEP 5: ORDERING
                .range(currentOffset, currentOffset + FETCH_SIZE - 1);

            // We do NOT use query.in("group_id", ALLOWED_GROUP_IDS) here. 
            // We want ALL leads, regardless of their group.
            
            if (owner) query = query.eq("owner", owner);
            if (from) query = query.gte("monday_created_at", from + "T00:00:00Z");
            if (to) query = query.lte("monday_created_at", to + "T23:59:59Z");

            const { data, error, count } = await query;

            if (error) {
                console.error("[Leads API] Supabase select error:", error);
                throw new Error(error.message);
            }

            if (count !== null && totalCount === 0) totalCount = count;

            if (data && data.length > 0) {
                allLeads.push(...data);
                currentOffset += FETCH_SIZE;
                // If we got exactly FETCH_SIZE rows, there might be more
                if (data.length < FETCH_SIZE) hasMore = false;
            } else {
                hasMore = false; // No more rows
            }
        }

        // STEP 2 & 3: FIX GROUP MAPPING AND RETURN STRICT DATA
        const mapped = allLeads.map((row: any) => ({
            id: row.id,
            name: row.name,
            phone: row.phone,
            group_id: row.group_id,
            // DO NOT fallback to "Lost", strict mapping -> "Other"
            group_name: GROUP_MAP[row.group_id] || "Other",
            updated_at: row.updated_at,
            
            // Standard frontend required fields
            email: row.email,
            status: row.status,
            createdDate: row.created_date,
            pipeline_stage: row.pipeline_stage,
            owner: row.owner,
            interested_in: row.interested_in,
            notes: row.notes,
            company: row.company,
            sales_call_date: row.sales_call_date,
            deal_value: row.deal_value,
            plan_type: row.plan_type,
            monday_created_at: row.monday_created_at,
            is_in_active_pool: row.is_in_active_pool,
            call_attempts: row.call_attempts,
            last_call_at: row.last_call_at,
            is_connected: row.is_connected,
        }));

        return NextResponse.json({ success: true, data: mapped, count: totalCount });
    } catch (error: any) {
        console.error("[Leads API] Fatal error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch leads" },
            { status: 500 }
        );
    }
}
