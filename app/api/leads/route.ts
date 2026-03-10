import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Simple pagination
        const limit = parseInt(searchParams.get("limit") || "50");
        const page = parseInt(searchParams.get("page") || "1");
        const offset = (page - 1) * limit;

        // Fetch leads from Supabase directly
        const { data: leads, error, count } = await supabase
            .from("leads")
            .select("*", { count: "exact" })
            .order("created_date", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Supabase select error:", error);
            throw new Error(error.message);
        }

        return NextResponse.json({ success: true, data: leads, count });
    } catch (error: any) {
        console.error("Fetch Leads API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch leads" },
            { status: 500 }
        );
    }
}
