import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config({ path: ".env.local" });

const vars = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_API_KEY",
    "TWILIO_API_SECRET",
    "TWILIO_TWIML_APP_SID",
    "TWILIO_PHONE_NUMBER",
    "NEXT_PUBLIC_APP_URL"
];

console.log("--- Twilio Configuration Check ---");

let missing = false;
vars.forEach(v => {
    const val = process.env[v];
    if (!val) {
        console.log(`❌ MISSING: ${v}`);
        missing = true;
    } else {
        // Redact most of it
        const redacted = val.length > 8 ? `${val.substring(0, 4)}...${val.substring(val.length - 4)}` : "****";
        console.log(`✅ PRESENT: ${v} (${redacted})`);
    }
});

if (missing) {
    console.log("\n⚠️  Some environment variables are missing. Calling will NOT work.");
} else {
    console.log("\n🚀 All required variables are present.");
}

console.log("\n--- TwiML App Check ---");
const twimlSid = process.env.TWILIO_TWIML_APP_SID;
if (twimlSid && twimlSid.startsWith("AP")) {
    console.log("✅ TWILIO_TWIML_APP_SID looks like a valid TwiML App SID.");
} else {
    console.log("❌ TWILIO_TWIML_APP_SID does not look like a valid App SID (should start with 'AP').");
}

const phone = process.env.TWILIO_PHONE_NUMBER;
if (phone && !phone.startsWith("+")) {
    console.log("⚠️  TWILIO_PHONE_NUMBER should ideally start with '+' followed by country code (E.164 format).");
}
