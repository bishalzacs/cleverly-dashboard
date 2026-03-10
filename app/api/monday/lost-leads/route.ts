import { NextResponse } from "next/server";
import { getLostLeads } from "@/services/mondayService";

export async function GET() {
    try {
        const leads = await getLostLeads();
        return NextResponse.json({ success: true, leads });
    } catch (error: any) {
        console.error("Monday Route Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch leads" },
            { status: 500 }
        );
    }
}
