import { NextResponse } from "next/server";
import { generateTwilioToken } from "@/services/twilioService";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Check Firebase token
        const cookieHeader = request.headers.get("cookie") || "";
        const hasFirebaseToken = cookieHeader.includes("firebase-auth-token=");

        if (!user && !hasFirebaseToken) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (!sessionId) {
            return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 });
        }

        // Assign a unique identity PER SESSION (Tab)
        const baseIdentity = user?.email || user?.id || "firebase_agent";
        const identity = `${baseIdentity}_${sessionId.slice(0, 8)}`; // Use short session suffix
        
        const token = generateTwilioToken(identity);

        return NextResponse.json({ success: true, token });
    } catch (error: any) {
        console.error("Twilio Token Route Error:", error);
        return NextResponse.json(
            { success: false, error: "Initialization failed. Please refresh." },
            { status: 500 }
        );
    }
}
