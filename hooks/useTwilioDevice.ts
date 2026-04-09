"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Device, Call } from "@twilio/voice-sdk";

import { createClient } from "@/utils/supabase/client";

export type DeviceStatus = "offline" | "connecting" | "ready" | "error";
export type CallStatus = "idle" | "connecting" | "ringing" | "connected" | "ended";

interface UseTwilioDeviceReturn {
    deviceStatus: DeviceStatus;
    callStatus: CallStatus;
    callDuration: number;
    error: string | null;
    makeCall: (phoneNumber: string, leadId?: string, leadName?: string) => Promise<void>;
    hangUp: () => void;
    toggleMute: () => void;
    isMuted: boolean;
    lastCallMeta: { phone: string; duration: number; leadId?: string; leadName?: string } | null;
    logCallWithOutcome: (outcome: string) => Promise<void>;
}

export const useTwilioDevice = (): UseTwilioDeviceReturn => {
    const supabase = createClient();
    
    // 1. Session & State
    const [sessionId] = useState(() => crypto.randomUUID());
    const [device, setDevice] = useState<Device | null>(null);
    const [activeCall, setActiveCall] = useState<Call | null>(null);

    const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>("offline");
    const [callStatus, setCallStatus] = useState<CallStatus>("idle");
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const callDurationRef = useRef<number>(0);
    const activeCallMetaRef = useRef<{ phone: string; leadId?: string; leadName?: string } | null>(null);

    // 2. Initialize Twilio Device (Unique per session/tab)
    useEffect(() => {
        let initializedDevice: Device;
        let isDestroyed = false;

        const initDevice = async () => {
            try {
                setDeviceStatus("connecting");
                
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserId(user.id);
                    setUserEmail(user.email || null);
                }

                const res = await fetch("/api/twilio/token", { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }) 
                });
                const data = await res.json();

                if (isDestroyed) return;

                if (!res.ok || !data.success || !data.token) {
                    throw new Error(data.error || "Failed to get Twilio token");
                }

                initializedDevice = new Device(data.token, {
                    codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
                });

                console.log("[TwilioDevice] Initialized with token. Registering...");

                initializedDevice.on("registered", () => {
                    console.log("[TwilioDevice] Status: REGISTERED (Ready)");
                    if (isDestroyed) return;
                    setDeviceStatus("ready");
                    setError(null);
                });

                initializedDevice.on("unregistered", () => {
                    console.log("[TwilioDevice] Status: UNREGISTERED");
                    if (isDestroyed) return;
                    setDeviceStatus("offline");
                });

                initializedDevice.on("error", (twilioError: any) => {
                    console.error("[TwilioDevice] SDK ERROR:", twilioError);
                    if (isDestroyed) return;
                    setDeviceStatus("error");
                    
                    // Twilio error codes are highly descriptive (e.g., 31201 is unauthorized)
                    const errorCode = twilioError?.code || "Unknown";
                    const errorMessage = twilioError?.message || "Dialer Error";
                    setError(`${errorMessage} (Error Code: ${errorCode})`);
                });

                initializedDevice.on("tokenWillExpire", () => {
                    console.log("[TwilioDevice] Token will expire soon. Refresh required.");
                    // In a more complex app, we'd re-fetch the token here.
                });

                initializedDevice.register();
                setDevice(initializedDevice);
            } catch (err: any) {
                console.error("[TwilioDevice] Initialization Failed:", err);
            }
        };

        initDevice();

        return () => {
            isDestroyed = true;
            if (initializedDevice) {
                initializedDevice.destroy();
            }
        };
    }, [sessionId]);

    const [lastCallMeta, setLastCallMeta] = useState<{ phone: string; duration: number; leadId?: string; leadName?: string } | null>(null);

    // Timer logic for active call
    useEffect(() => {
        if (callStatus === "connected") {
            callDurationRef.current = 0;
            setCallDuration(0); // Reset UI duration
            durationTimerRef.current = setInterval(() => {
                callDurationRef.current += 1;
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
            }
        }
        return () => {
            if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        };
    }, [callStatus]);

    const logCallWithOutcome = useCallback(async (outcome: string, notes?: string) => {
        if (!activeCallMetaRef.current) return;
        
        try {
            const { phone, leadId, leadName } = activeCallMetaRef.current;
            await fetch("/api/log-call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    phone, 
                    status: "completed", 
                    duration_seconds: callDurationRef.current, 
                    lead_id: leadId, 
                    lead_name: leadName,
                    agent_id: userId,
                    agent_email: userEmail,
                    outcome,
                    notes,
                    sessionId // Pass the session ID for backend validation
                }),
            });
            setLastCallMeta(null);
            activeCallMetaRef.current = null;
        } catch (e) {
            console.warn("Failed to log call:", e);
        }
    }, [userId, userEmail, sessionId]); // Added sessionId, removed lastCallMeta

    const makeCall = useCallback(
        async (phoneNumber: string, leadId?: string, leadName?: string) => {
            if (!device || deviceStatus !== "ready") {
                setError("Device is not ready");
                return;
            }

            try {
                setCallStatus("connecting");
                setLastCallMeta(null); // Clear previous
                activeCallMetaRef.current = { phone: phoneNumber, leadId, leadName };
                const params = { To: phoneNumber };

                // initiate call
                console.log(`[TwilioDevice] Initiating call to: ${phoneNumber}`);
                const call = await device.connect({ params });
                setActiveCall(call);

                call.on("accept", () => {
                    console.log("[TwilioDevice] Call Accepted");
                    setCallStatus("connected");
                    setIsMuted(false);
                });

                call.on("disconnect", () => {
                    console.log("[TwilioDevice] Call Disconnected");
                    const meta = activeCallMetaRef.current;
                    const dur = callDurationRef.current;
                    if (meta) {
                        setLastCallMeta({ ...meta, duration: dur });
                    }
                    setCallStatus("ended");
                    setActiveCall(null);
                    setIsMuted(false);
                    activeCallMetaRef.current = null;
                });

                call.on("cancel", () => {
                    setCallStatus("idle");
                    setActiveCall(null);
                    activeCallMetaRef.current = null;
                });

                call.on("reject", () => {
                    setCallStatus("idle");
                    setError("Call rejected");
                    setActiveCall(null);
                    activeCallMetaRef.current = null;
                });

                call.on("error", (err: any) => {
                    setCallStatus("idle");
                    setError(err.message || "Call error");
                    setActiveCall(null);
                    activeCallMetaRef.current = null;
                });

            } catch (err: any) {
                setCallStatus("idle");
                setError(err.message || "Failed to initiate call");
            }
        },
        [device, deviceStatus]
    );

    const hangUp = useCallback(() => {
        if (activeCall) {
            activeCall.disconnect();
        } else if (device) {
            device.disconnectAll();
        }
    }, [activeCall, device]);

    const toggleMute = useCallback(() => {
        if (activeCall) {
            const currentlyMuted = activeCall.isMuted();
            activeCall.mute(!currentlyMuted);
            setIsMuted(!currentlyMuted);
        }
    }, [activeCall]);

    return {
        deviceStatus,
        callStatus,
        callDuration,
        error,
        makeCall,
        hangUp,
        toggleMute,
        isMuted,
        lastCallMeta,
        logCallWithOutcome
    };
};
