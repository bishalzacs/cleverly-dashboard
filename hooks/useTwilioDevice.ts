"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Device, Call } from "@twilio/voice-sdk";

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
}

export const useTwilioDevice = (): UseTwilioDeviceReturn => {
    const [device, setDevice] = useState<Device | null>(null);
    const [activeCall, setActiveCall] = useState<Call | null>(null);

    const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>("offline");
    const [callStatus, setCallStatus] = useState<CallStatus>("idle");
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const callDurationRef = useRef<number>(0);
    const activeCallMetaRef = useRef<{ phone: string; leadId?: string; leadName?: string } | null>(null);

    // Initialize Twilio Device on mount
    useEffect(() => {
        let initializedDevice: Device;

        const initDevice = async () => {
            try {
                setDeviceStatus("connecting");
                const res = await fetch("/api/twilio/token", { method: "POST" });
                const data = await res.json();

                if (!res.ok || !data.success || !data.token) {
                    throw new Error(data.error || "Failed to get Twilio token");
                }

                initializedDevice = new Device(data.token, {
                    codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
                });

                initializedDevice.on("registered", () => {
                    console.log("Twilio Device successfully registered.");
                    setDeviceStatus("ready");
                    setError(null);
                });

                initializedDevice.on("unregistered", () => {
                    console.log("Twilio Device unregistered.");
                    setDeviceStatus("offline");
                });

                initializedDevice.on("error", (twilioError: any) => {
                    console.error("Twilio Device Error:", twilioError);
                    setDeviceStatus("error");
                    // Sometimes twilioError is an object with {code, message}
                    setError(twilioError?.message || JSON.stringify(twilioError) || "Unknown Twilio Error");
                });

                // Register the device
                initializedDevice.register();
                setDevice(initializedDevice);
            } catch (err: any) {
                setDeviceStatus("error");
                setError(err.message);
            }
        };

        initDevice();

        return () => {
            if (initializedDevice) {
                initializedDevice.destroy();
            }
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
            }
        };
    }, []);

    // Timer logic for active call
    useEffect(() => {
        if (callStatus === "connected") {
            callDurationRef.current = 0;
            durationTimerRef.current = setInterval(() => {
                callDurationRef.current += 1;
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
            }
            if (callStatus === "idle" || callStatus === "ended") {
                setCallDuration(0);
            }
        }
        return () => {
            if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        };
    }, [callStatus]);

    const logCall = useCallback(async (phone: string, status: string, durationSeconds: number, leadId?: string, leadName?: string) => {
        try {
            await fetch("/api/log-call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, status, duration_seconds: durationSeconds, lead_id: leadId, lead_name: leadName }),
            });
        } catch (e) {
            console.warn("Failed to log call:", e);
        }
    }, []);

    const makeCall = useCallback(
        async (phoneNumber: string, leadId?: string, leadName?: string) => {
            if (!device || deviceStatus !== "ready") {
                setError("Device is not ready");
                return;
            }

            try {
                setCallStatus("connecting");
                activeCallMetaRef.current = { phone: phoneNumber, leadId, leadName };
                const params = { To: phoneNumber };

                // initiate call
                const call = await device.connect({ params });
                setActiveCall(call);

                call.on("accept", () => {
                    setCallStatus("connected");
                    setIsMuted(false);
                });

                call.on("disconnect", () => {
                    const meta = activeCallMetaRef.current;
                    const dur = callDurationRef.current;
                    if (meta) logCall(meta.phone, "connected", dur, meta.leadId, meta.leadName);
                    setCallStatus("ended");
                    setActiveCall(null);
                    setIsMuted(false);
                    activeCallMetaRef.current = null;
                    setTimeout(() => setCallStatus("idle"), 3000);
                });

                call.on("cancel", () => {
                    const meta = activeCallMetaRef.current;
                    if (meta) logCall(meta.phone, "no_answer", 0, meta.leadId, meta.leadName);
                    setCallStatus("ended");
                    setActiveCall(null);
                    activeCallMetaRef.current = null;
                    setTimeout(() => setCallStatus("idle"), 3000);
                });

                call.on("reject", () => {
                    const meta = activeCallMetaRef.current;
                    if (meta) logCall(meta.phone, "no_answer", 0, meta.leadId, meta.leadName);
                    setCallStatus("ended");
                    setError("Call rejected");
                    setActiveCall(null);
                    activeCallMetaRef.current = null;
                    setTimeout(() => setCallStatus("idle"), 3000);
                });

                call.on("error", (err: any) => {
                    const meta = activeCallMetaRef.current;
                    if (meta) logCall(meta.phone, "failed", 0, meta.leadId, meta.leadName);
                    setCallStatus("ended");
                    setError(err.message || "Call error");
                    setActiveCall(null);
                    activeCallMetaRef.current = null;
                    setTimeout(() => setCallStatus("idle"), 3000);
                });

            } catch (err: any) {
                setCallStatus("ended");
                setError(err.message || "Failed to initiate call");
            }
        },
        [device, deviceStatus, logCall]
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
    };
};
