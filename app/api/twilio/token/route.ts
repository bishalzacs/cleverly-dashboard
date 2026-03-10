import { NextResponse } from "next/server";
import { generateTwilioToken } from "@/services/twilioService";

export async function POST(request: Request) {
    try {
        // Optionally parse a client name from the request body
        let clientName = "dashboard_user";
        try {
            const body = await request.json();
            if (body.clientName) clientName = body.clientName;
        } catch (e) {
            // Ignore JSON parse errors if body is empty
        }

        const token = generateTwilioToken(clientName);

        return NextResponse.json({ success: true, token });
    } catch (error: any) {
        console.error("Twilio Token Route Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to generate token" },
            { status: 500 }
        );
    }
}
