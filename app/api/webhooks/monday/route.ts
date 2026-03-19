import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Agent 4: Monday.com Webhook Handler
 * 
 * Receives real-time events from Monday.com for:
 * - New item created
 * - Item column value changed
 * - Item moved to another group
 * - Item deleted
 *
 * To register this webhook in Monday.com:
 * 1. Go to Board > Integrations > Webhooks
 * 2. Add webhook URL: https://your-domain.com/api/webhooks/monday
 * 3. Select events: create_pulse, change_column_value, move_item_to_group, delete_pulse
 * 4. Optionally set a signing secret and verify it here
 */

const ALLOWED_GROUP_IDS = new Set([
    process.env.MONDAY_LOST_GROUP_ID,
    process.env.MONDAY_NOSHOW_GROUP_ID,
    process.env.MONDAY_CANCEL_GROUP_ID,
].filter(Boolean) as string[]);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Monday.com challenge verification (required on first registration)
        if (body.challenge) {
            console.log("[Monday Webhook] Received challenge:", body.challenge);
            return NextResponse.json({ challenge: body.challenge });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const event = body.event;
        if (!event) {
            console.warn("[Monday Webhook] No event in payload.");
            return NextResponse.json({ success: true });
        }

        const itemId = String(event.pulseId || event.itemId || "");
        const eventType = event.type as string;
        console.log(`[Monday Webhook] Event: ${eventType} | Item: ${itemId}`);

        // 1. Item Deleted → remove from DB
        if (eventType === "delete_pulse") {
            const { error } = await supabase.from("leads").delete().eq("id", itemId);
            if (error) console.error("[Monday Webhook] Delete error:", error.message);
            else console.log(`[Monday Webhook] Deleted lead ${itemId}`);
            return NextResponse.json({ success: true, action: "deleted", id: itemId });
        }

        // 2. Item Moved → check if new group is still allowed
        if (eventType === "move_item_to_group") {
            const destGroupId = event.destGroupId as string;
            if (!ALLOWED_GROUP_IDS.has(destGroupId)) {
                // Lead moved out of allowed groups — archive it
                const { error } = await supabase.from("leads").delete().eq("id", itemId);
                if (error) console.error("[Monday Webhook] Archive (delete) error:", error.message);
                console.log(`[Monday Webhook] Removed lead ${itemId} (moved to non-allowed group ${destGroupId})`);
                return NextResponse.json({ success: true, action: "archived", id: itemId });
            } else {
                // Update group_id to reflect the move
                const { error } = await supabase.from("leads").update({ group_id: destGroupId }).eq("id", itemId);
                if (error) console.error("[Monday Webhook] Group update error:", error.message);
                console.log(`[Monday Webhook] Updated group for lead ${itemId} → ${destGroupId}`);
                return NextResponse.json({ success: true, action: "group_updated", id: itemId });
            }
        }

        // 3. New Item Created or Column Changed → trigger a targeted re-fetch for this item
        if (eventType === "create_pulse" || eventType === "change_column_value") {
            // TODO: Fetch this single item from Monday API and upsert into DB
            // For now, log it so the team knows a manual sync may be needed
            console.log(`[Monday Webhook] Item ${itemId} created/changed — trigger sync if needed.`);
            return NextResponse.json({ success: true, action: "ack", id: itemId });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[Monday Webhook] Fatal error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
