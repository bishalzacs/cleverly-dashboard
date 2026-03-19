import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Constants used as fallback if env vars missing
const DEFAULT_GROUPS = ["Lost", "No-Show", "Cancel"];

export async function GET(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get("limit") || "5000"), 5000);
        const page = parseInt(searchParams.get("page") || "1");
        const offset = (page - 1) * limit;
        const owner = searchParams.get("owner") || "";
        const from = searchParams.get("from") || "";
        const to = searchParams.get("to") || "";

        // Get group IDs from env at request time
        // Get group IDs from env at request time with hardcoded fallbacks for the user's specific board
        const LOST_ID = process.env.MONDAY_LOST_GROUP_ID || "new_group62617__1";
        const NOSHOW_ID = process.env.MONDAY_NOSHOW_GROUP_ID || "new_group64021__1";
        const CANCEL_ID = process.env.MONDAY_CANCEL_GROUP_ID || "new_group54376__1";

        const ALLOWED_GROUP_IDS = [LOST_ID, NOSHOW_ID, CANCEL_ID].filter(Boolean);
        const GROUP_NAME_MAP: Record<string, string> = {};
        if (LOST_ID) GROUP_NAME_MAP[LOST_ID] = "Lost";
        if (NOSHOW_ID) GROUP_NAME_MAP[NOSHOW_ID] = "No-Show";
        if (CANCEL_ID) GROUP_NAME_MAP[CANCEL_ID] = "Cancel";

        console.log("[Leads API] Using group IDs:", { LOST_ID, NOSHOW_ID, CANCEL_ID });

        // ORDER BY monday_created_at DESC — newest leads appear first
        let query = supabase
            .from("leads")
            .select("*", { count: "exact" })
            .order("monday_created_at", { ascending: false })
            .order("created_date", { ascending: false }) // fallback sort
            .range(offset, offset + limit - 1);

        // Restrict to only the 3 allowed Monday groups at DB level
        if (ALLOWED_GROUP_IDS.length > 0) {
            query = query.in("group_id", ALLOWED_GROUP_IDS);
        }

        if (owner) query = query.eq("owner", owner);
        if (from) query = query.gte("monday_created_at", from + "T00:00:00Z");
        if (to) query = query.lte("monday_created_at", to + "T23:59:59Z");

        const { data: leads, error, count } = await query;

        if (error) {
            console.error("[Leads API] Supabase select error:", error);
            throw new Error(error.message);
        }

        const mapped = (leads || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            phone: row.phone,
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
            group_id: row.group_id,
            group_name: GROUP_NAME_MAP[row.group_id] || row.group_name || "Lost",
            call_attempts: row.call_attempts,
            last_call_at: row.last_call_at,
            is_connected: row.is_connected,
        }));

        return NextResponse.json({ success: true, data: mapped, count });
    } catch (error: any) {
        console.error("[Leads API] Fatal error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch leads" },
            { status: 500 }
        );
    }
}
