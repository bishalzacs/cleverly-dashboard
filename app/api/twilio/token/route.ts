import { NextResponse } from "next/server";
import { generateTwilioToken } from "@/services/twilioService";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Verify session ID against database lock
        const { data: profile } = await supabase
            .from('profiles')
            .select('active_dialer_session_id')
            .eq('id', user.id)
            .single();

        if (profile?.active_dialer_session_id !== sessionId) {
            return NextResponse.json({ 
                success: false, 
                error: "This session is no longer active. Another tab has taken control of the dialer." 
            }, { status: 403 });
        }

        // Use user email or ID as identity to prevent conflicts between different users
        const identity = user.email || user.id;
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
