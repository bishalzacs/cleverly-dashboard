import { NextResponse } from "next/server";
import { generateTwilioToken } from "@/services/twilioService";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Use user email or ID as identity to prevent conflicts between different users
        const identity = user.email || user.id;
        
        // Optionally append a random string if you want to support multiple tabs for the SAME user
        // But typically for voice, you want one identity per user.
        const token = generateTwilioToken(identity);

        return NextResponse.json({ success: true, token });
    } catch (error: any) {
        console.error("Twilio Token Route Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to generate token" },
            { status: 500 }
        );
    }
}
