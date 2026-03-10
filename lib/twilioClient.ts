import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;

// We use the account SID and auth token/API Key to initialize the client
// but for token generation, we'll generally use Twilio's AccessToken utility
export const twilioClient = twilio(apiKey, apiSecret, {
    accountSid,
});
