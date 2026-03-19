import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "5000");
        const page = parseInt(searchParams.get("page") || "1");
        const offset = (page - 1) * limit;
        const owner = searchParams.get("owner") || "";
        const from = searchParams.get("from") || "";
        const to = searchParams.get("to") || "";

        let query = supabase
            .from("leads")
            .select("*", { count: "exact" })
            .order("created_date", { ascending: false })
            .range(offset, offset + limit - 1);

        if (owner) query = query.eq("owner", owner);
        if (from) query = query.gte("created_date", from + " 00:00:00");
        if (to) query = query.lte("created_date", to + " 23:59:59");

        const { data: leads, error, count } = await query;

        if (error) {
            console.error("Supabase select error:", error);
            throw new Error(error.message);
        }

        // Map Supabase snake_case back to Lead interface (camelCase where needed)
        const mapped = (leads || []).map((row: any) => {
            let groupName = "Lost";
            if (row.group_id === "new_group64021__1") groupName = "No-Show";
            else if (row.group_id === "new_group54376__1") groupName = "Cancel";

            return {
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
                group_name: groupName,
                call_attempts: row.call_attempts,
                last_call_at: row.last_call_at,
                is_connected: row.is_connected,
            };
        });

        return NextResponse.json({ success: true, data: mapped, count });
    } catch (error: any) {
        console.error("Fetch Leads API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch leads" },
            { status: 500 }
        );
    }
}
