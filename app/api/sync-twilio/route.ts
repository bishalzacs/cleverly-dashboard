import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

const twilioClient = twilio(
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

function extract10Digits(phone: string): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 10) return digits.slice(-10);
    return null;
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const days = parseInt(url.searchParams.get("days") || "7"); // Default 7 days
        const limitCount = parseInt(url.searchParams.get("limit") || "1000");
        const startTimeAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log(`[Twilio Sync] Fetching calls since ${startTimeAfter.toISOString()}`);
        
        let calls = [];
        try {
            calls = await twilioClient.calls.list({
                startTimeAfter,
                limit: limitCount,
            });
        } catch(e) {
            console.error("[Twilio Sync] Twilio SDK fetch error:", e);
            throw new Error("Failed connecting to Twilio API.");
        }

        if (calls.length === 0) {
            return NextResponse.json({ message: "No API calls found to sync in this period.", processed: 0 });
        }

        // 1. Fetch All Leads for Quick Memory Mapping
        const { data: allLeads, error: leadsError } = await supabase
            .from('leads')
            .select('id, phone, call_attempts');
            
        if (leadsError) throw leadsError;

        const leadPhoneMap = new Map();
        for (const lead of allLeads) {
            const normalized = extract10Digits(lead.phone);
            if (normalized) {
                leadPhoneMap.set(normalized, lead);
            }
        }

        // 2. Fetch Existing Logs to Prevent Duplication Iterations
        const { data: existingLogs } = await supabase
            .from("call_logs")
            .select("twilio_sid")
            .not("twilio_sid", "is", null);
            
        const storedSids = new Set(existingLogs?.map(l => l.twilio_sid) || []);

        let skippedNoMatch = 0;
        let skippedAlreadyExists = 0;
        let insertedLogs = 0;

        // 3. Process the Twilio Payload
        for (const call of calls) {
            if (storedSids.has(call.sid)) {
                skippedAlreadyExists++;
                continue;
            }

            const targetPhone = extract10Digits(call.to); 
            if (!targetPhone) continue;

            const matchedLead = leadPhoneMap.get(targetPhone);
            if (!matchedLead) {
                skippedNoMatch++;
                continue;
            }

            const durationSec = parseInt(call.duration || "0");
            const isCompleted = call.status === 'completed';

            // CREATE NEW SUPABASE LOG
            const { error: logError } = await supabase.from("call_logs").insert({
                twilio_sid: call.sid,
                lead_id: matchedLead.id,
                phone: call.to,
                duration_seconds: durationSec,
                outcome: isCompleted ? (durationSec > 10 ? 'answered' : 'no_answer') : 'no_answer',
                status: isCompleted ? 'Completed' : 'Missed',
                created_at: call.dateCreated.toISOString()
            });

            if (logError) {
                console.error(`[Twilio Sync] Failed to insert log for ${call.to}:`, logError.message);
                continue;
            }

            // INCREMENT LEAD
            const currentAttempts = matchedLead.call_attempts || 0;
            const nextStage = currentAttempts === 0 ? "first_attempt" : 
                              currentAttempts === 1 ? "second_attempt" : 
                              currentAttempts === 2 ? "third_attempt" : "new_lead";

            await supabase
                .from("leads")
                .update({ 
                    call_attempts: currentAttempts + 1,
                    last_contacted_date: new Date().toISOString(),
                    pipeline_stage: nextStage
                })
                .eq("id", matchedLead.id);

            // Update local memory map to prevent double-counting if they were called twice natively in the same burst
            matchedLead.call_attempts = currentAttempts + 1;
            insertedLogs++;
        }

        return NextResponse.json({
            message: "Synchronization completed flawlessly.",
            totals: {
                scanned_from_twilio: calls.length,
                newly_inserted_logs: insertedLogs,
                skipped_no_lead_match: skippedNoMatch,
                skipped_already_exists: skippedAlreadyExists
            }
        });
        
    } catch (e: any) {
        console.error("[Twilio Sync] FATAL ERROR:", e);
        return NextResponse.json({ error: e.message || "Unknown Engine Failure" }, { status: 500 });
    }
}
