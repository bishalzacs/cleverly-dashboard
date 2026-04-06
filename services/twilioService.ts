import twilio from "twilio";
import { twilioClient } from "@/lib/twilioClient";

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

export interface TwilioMetrics {
  totalCalls: number;
  totalDurationMinutes: number;
  avgDurationSeconds: number;
  statusCounts: Record<string, number>;
}

/**
 * Fetch and aggregate Twilio Call metrics for a specific time range.
 * Defaults to current day if no range is provided.
 */
export async function getTwilioCallMetrics(range: "today" | "week" | "month" | "all" = "today"): Promise<TwilioMetrics | null> {
  try {
    const now = new Date();
    let startTime: Date;

    if (range === "today") {
      startTime = new Date(now.setHours(0, 0, 0, 0));
    } else if (range === "week") {
      startTime = new Date(now.setDate(now.getDate() - 7));
    } else if (range === "month") {
      startTime = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startTime = new Date(0); // Epoch
    }

    // Fetch call logs from Twilio
    // Note: This fetches records from the Twilio account associated with the client
    const calls = await twilioClient.calls.list({
      startTimeAfter: startTime,
      limit: 500, // Reasonable limit for dashboard performance
    });

    if (!calls || calls.length === 0) {
      return {
        totalCalls: 0,
        totalDurationMinutes: 0,
        avgDurationSeconds: 0,
        statusCounts: {},
      };
    }

    const totalCalls = calls.length;
    let totalDurationSeconds = 0;
    const statusCounts: Record<string, number> = {};

    calls.forEach((call) => {
      // Calculate total duration (duration is a string in seconds)
      totalDurationSeconds += parseInt(call.duration || "0", 10);

      // Track outcome/status counts (Title Case for dashboard consistency)
      const statusRaw = call.status || "Unknown";
      const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);
    const avgDurationSeconds = totalCalls > 0 ? Math.round(totalDurationSeconds / totalCalls) : 0;

    return {
      totalCalls,
      totalDurationMinutes,
      avgDurationSeconds,
      statusCounts,
    };
  } catch (error) {
    console.error("[TwilioService] Failed to fetch metrics:", error);
    return null;
  }
}
