import { NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const to = formData.get("To") as string;
        const callerId = process.env.TWILIO_PHONE_NUMBER!;

        const twiml = new VoiceResponse();

        if (to) {
            // Outbound call to a phone number
            const dial = twiml.dial({ callerId });

            // If it's a phone number (starts with +), dial directly
            if (to.startsWith("+") || to.startsWith("1") || /^\d/.test(to)) {
                dial.number({}, to);
            } else {
                // Otherwise treat as a Twilio client name
                dial.client({}, to);
            }
        } else {
            twiml.say("No destination number provided.");
        }

        return new NextResponse(twiml.toString(), {
            status: 200,
            headers: { "Content-Type": "text/xml" },
        });
    } catch (error: any) {
        console.error("TwiML Voice Route Error:", error);
        const twiml = new (twilio.twiml.VoiceResponse)();
        twiml.say("An error occurred. Please try again.");
        return new NextResponse(twiml.toString(), {
            status: 200,
            headers: { "Content-Type": "text/xml" },
        });
    }
}

// Twilio may also send GET requests for status callbacks
export async function GET() {
    const twiml = new (twilio.twiml.VoiceResponse)();
    twiml.say("Hello from Cleverly.");
    return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { "Content-Type": "text/xml" },
    });
}
