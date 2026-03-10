import twilio from "twilio";

const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioApiKey = process.env.TWILIO_API_KEY || "";
const twilioApiSecret = process.env.TWILIO_API_SECRET || "";
const twilioTwimlAppSid = process.env.TWILIO_TWIML_APP_SID || "";

export const generateTwilioToken = (clientName?: string): string => {
    if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !twilioTwimlAppSid) {
        throw new Error("Missing required Twilio environment variables.");
    }

    const identity = clientName || "custom_lead_caller";

    // Create an access token which we will sign and return to the client
    const accessToken = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, {
        identity,
    });

    // Create a Voice grant and add it to the token
    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twilioTwimlAppSid,
        incomingAllow: true, // Optional: allow incoming calls
    });

    accessToken.addGrant(voiceGrant);

    // Return the signed token
    return accessToken.toJwt();
};
